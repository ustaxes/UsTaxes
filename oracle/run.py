"""Differential test: UsTaxes vs PolicyEngine-US and Tax-Calculator.

    oracle/.venv/bin/python oracle/run.py                  # 2025 corpus
    oracle/.venv/bin/python oracle/run.py --random 500 --seed 3

Computes every return in the year's checked-in corpus (oracle/corpus/) in
all three engines and writes oracle/out/report.md plus raw JSON.

Each UsTaxes disagreement is attributed to the first field it shows up on
and then either explained by an entry in known_issues.py or reported as
unexplained. A few unexplained returns per field are shrunk to a minimal
return that still disagrees.

Exit status: 1 if any return is unexplained (or, with --strict, if a known
issue matched nothing and may be fixed), else 0.
"""

from __future__ import annotations

import argparse
import json
import platform
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from importlib.metadata import version
from pathlib import Path
from typing import Any, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent))

from compare import FIELDS, ScenarioResult, compare  # noqa: E402
from corpus import YEARS, corpus_path, load  # noqa: E402
from engines import REPO_ROOT, run_policyengine, run_taxcalc, run_ustaxes  # noqa: E402
from known_issues import KNOWN_ISSUES, KnownIssue, explain  # noqa: E402
from scenarios import Scenario, normalize, random_scenarios, shrink_candidates  # noqa: E402

ORDER = ["ERROR"] + FIELDS


@dataclass
class Config:
    root: Path
    out: Path
    examples: int


@dataclass
class YearRun:
    year: int
    source: str
    results: dict[str, ScenarioResult]
    known: dict[str, list[ScenarioResult]] = field(default_factory=lambda: defaultdict(list))
    unexplained: list[ScenarioResult] = field(default_factory=list)
    shrunk: dict[str, list[ScenarioResult]] = field(default_factory=lambda: defaultdict(list))

    @property
    def clean(self) -> int:
        return sum(1 for r in self.results.values() if r.root is None)

    def stale(self) -> list[KnownIssue]:
        return [i for i in KNOWN_ISSUES if self.year in i.years and not self.known.get(i.id)]


def evaluate(cfg: Config, year: int, scenarios: list[Scenario], tag: str) -> dict[str, ScenarioResult]:
    scenarios = [normalize(s) for s in scenarios]
    print(f"[{year} {tag}] {len(scenarios)} returns: UsTaxes…", flush=True)
    u = run_ustaxes(year, scenarios, cfg.out / "work", cfg.root)
    print(f"[{year} {tag}] PolicyEngine…", flush=True)
    pe = run_policyengine(year, scenarios)
    print(f"[{year} {tag}] Tax-Calculator…", flush=True)
    tc = run_taxcalc(year, scenarios)
    return {s["id"]: compare(s, u[s["id"]], pe[s["id"]], tc[s["id"]]) for s in scenarios}


def shrink(cfg: Config, year: int, failing: list[ScenarioResult], max_rounds: int = 25) -> list[ScenarioResult]:
    """Simplify each return while it stays unexplained with the same root.

    Requiring "still unexplained" stops a return from shrinking into a known
    bug and losing the new one it was reported for.
    """
    current = {r.scenario["id"]: r for r in failing}
    for rnd in range(max_rounds):
        cands = [(key, c) for key, r in current.items() for c in shrink_candidates(r.scenario)]
        if not cands:
            break
        results = evaluate(cfg, year, [c for _, c in cands], f"shrink {rnd + 1}")
        progressed = False
        for key, r in list(current.items()):
            for k2, c in cands:
                cr = results[c["id"]]
                if k2 == key and cr.root == r.root and explain(year, cr) is None:
                    current[key] = cr
                    progressed = True
                    break
        if not progressed:
            break
    return list(current.values())


def run_year(cfg: Config, year: int, scenarios: list[Scenario], source: str) -> YearRun:
    yr = YearRun(year, source, evaluate(cfg, year, scenarios, "main"))
    for r in yr.results.values():
        if r.root is None:
            continue
        issue = explain(year, r)
        if issue:
            yr.known[issue.id].append(r)
        else:
            yr.unexplained.append(r)
    by_root: dict[str, list[ScenarioResult]] = defaultdict(list)
    for r in yr.unexplained:
        by_root[r.root].append(r)
    picks = [r for rs in by_root.values() for r in rs[: cfg.examples]]
    for r in shrink(cfg, year, picks) if picks else []:
        yr.shrunk[r.root].append(r)
    return yr


# --------------------------------------------------------------------------
# Report
# --------------------------------------------------------------------------


def _git(root: Path, *args: str) -> str:
    try:
        return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        return "unknown"


def _node_version() -> str:
    try:
        return subprocess.run(["node", "--version"], capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        return "unknown"


def versions(cfg: Config) -> dict[str, str]:
    return {
        "UsTaxes": f"{_git(cfg.root, 'rev-parse', '--abbrev-ref', 'HEAD')} @ {_git(cfg.root, 'log', '-1', '--format=%h %s')}",
        "policyengine-us": version("policyengine-us"),
        "taxcalc": version("taxcalc"),
        "python": platform.python_version(),
        "node": _node_version(),
    }


def fmt(v: Any) -> str:
    return "—" if v is None else f"{v:,.0f}"


def describe(s: Scenario) -> str:
    parts = [s["filingStatus"], f"primary age {s['primary']['age']}"]
    if s["primary"]["blind"]:
        parts.append("primary blind")
    if s["spouse"]:
        parts.append(f"spouse age {s['spouse']['age']}" + (" blind" if s["spouse"]["blind"] else ""))
    if s["dependents"]:
        deps = ", ".join(f"{d['age']}{' (student)' if d['student'] else ''}" for d in s["dependents"])
        parts.append(f"dependents aged {deps}")
    inc = ", ".join(f"{k}={v:,}" for k, v in s["income"].items() if v)
    return "; ".join(parts) + (f"; {inc}" if inc else "; no income")


def _field_table(r: ScenarioResult) -> list[str]:
    out = ["| Field | UsTaxes | PolicyEngine | Tax-Calculator |", "|---|---:|---:|---:|"]
    for f in r.fields:
        if f.mismatch or f.oracles_disagree:
            mark = " ⚠" if f.mismatch else " (oracles differ)"
            out.append(f"| `{f.field}`{mark} | {fmt(f.ustaxes)} | {fmt(f.pe)} | {fmt(f.tc)} |")
    return out


def render(cfg: Config, runs: list[YearRun]) -> str:
    v = versions(cfg)
    lines = ["# UsTaxes oracle report", "", "| | |", "|---|---|"]
    lines += [f"| {k} | `{val}` |" for k, val in v.items()]
    lines += [
        "",
        "## Summary",
        "",
        "| Year | Source | Returns | Match | Known issues | **Unexplained** |",
        "|---|---|---:|---:|---:|---:|",
    ]
    for yr in runs:
        known = sum(len(x) for x in yr.known.values())
        lines.append(
            f"| {yr.year} | {yr.source} | {len(yr.results)} | {yr.clean} | {known} | **{len(yr.unexplained)}** |"
        )

    lines += ["", "## Known issues", "", "| Issue | Year | Returns | Tracking |", "|---|---|---:|---|"]
    for yr in runs:
        for issue in KNOWN_ISSUES:
            n = len(yr.known.get(issue.id, []))
            if yr.year in issue.years:
                flag = "" if n else " ⚠ matched nothing — fixed?"
                lines.append(f"| `{issue.id}`{flag} | {yr.year} | {n} | {issue.tracking} |")

    for yr in runs:
        lines += ["", f"## {yr.year}", ""]
        if not yr.unexplained:
            lines += ["No unexplained disagreements."]
            continue
        by_root: dict[str, int] = defaultdict(int)
        for r in yr.unexplained:
            by_root[r.root] += 1
        lines += ["Unexplained returns by first differing field:", "", "| Field | Returns |", "|---|---:|"]
        for root in sorted(by_root, key=ORDER.index):
            lines.append(f"| `{root}` | {by_root[root]} |")
        errors: dict[str, int] = defaultdict(int)
        for r in yr.unexplained:
            if r.error:
                errors[r.error] += 1
        if errors:
            lines += ["", "UsTaxes errors:", ""]
            lines += [f"- {c} × `{e}`" for e, c in sorted(errors.items(), key=lambda x: -x[1])]
        lines += ["", "### Minimal examples", ""]
        for root in sorted(yr.shrunk, key=ORDER.index):
            for r in yr.shrunk[root]:
                lines += [f"**`{root}`** — `{r.scenario['id']}`: {describe(r.scenario)}", ""]
                lines += [f"Error: `{r.error}`"] if r.error else _field_table(r)
                lines.append("")
    return "\n".join(lines) + "\n"


def write_raw(cfg: Config, yr: YearRun) -> None:
    raw = {}
    for sid, r in yr.results.items():
        issue = explain(yr.year, r)
        raw[sid] = {
            "scenario": r.scenario,
            "root": r.root,
            "known_issue": issue.id if issue else None,
            "error": r.error,
            "fields": {f.field: {"ustaxes": f.ustaxes, "pe": f.pe, "tc": f.tc} for f in r.fields},
        }
    (cfg.out / f"results-{yr.year}.json").write_text(json.dumps(raw, indent=1, default=float))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--year", type=int, action="append", help="tax year (repeatable; default 2025)")
    ap.add_argument("--random", type=int, metavar="N", help="use N fresh random returns instead of the corpus")
    ap.add_argument("--seed", type=int, default=1, help="seed for --random")
    ap.add_argument("--examples", type=int, default=3, help="unexplained returns to shrink per field (0 = skip)")
    ap.add_argument("--strict", action="store_true", help="also fail when a known issue matched nothing")
    ap.add_argument(
        "--ustaxes-root",
        type=Path,
        default=REPO_ROOT,
        help="UsTaxes checkout/worktree to test (default: this repo). Needs node_modules.",
    )
    ap.add_argument("--out", type=Path, default=REPO_ROOT / "oracle" / "out", help="report directory")
    args = ap.parse_args()

    cfg = Config(root=args.ustaxes_root.resolve(), out=args.out.resolve(), examples=args.examples)
    cfg.out.mkdir(parents=True, exist_ok=True)
    years = args.year or list(YEARS)

    runs = []
    for year in years:
        if args.random or year not in YEARS:
            if not args.random:
                ap.error(f"no corpus for {year}; pass --random N")
            scenarios, source = random_scenarios(args.random, args.seed, year), f"random seed {args.seed}"
        else:
            scenarios, source = load(year), str(corpus_path(year).relative_to(REPO_ROOT))
        yr = run_year(cfg, year, scenarios, source)
        write_raw(cfg, yr)
        runs.append(yr)

    report = cfg.out / "report.md"
    report.write_text(render(cfg, runs))

    unexplained = sum(len(yr.unexplained) for yr in runs)
    stale = [(yr.year, i.id) for yr in runs for i in yr.stale()]
    print(f"wrote {report}")
    print(f"unexplained: {unexplained}" + (f"; known issues that matched nothing: {stale}" if stale else ""))
    failed: Optional[str] = None
    if unexplained:
        failed = "unexplained disagreements"
    elif args.strict and stale:
        failed = "known issues that may be fixed"
    if failed:
        print(f"FAIL: {failed}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
