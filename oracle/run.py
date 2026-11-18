"""Differential test: UsTaxes Y2025 vs PolicyEngine-US and Tax-Calculator.

    oracle/.venv/bin/python oracle/run.py --n 1000 --seed 1

Generates random returns, computes them in all three engines, and writes
oracle/out/report.md (plus raw JSON) grouping every UsTaxes disagreement
by the first line it shows up on. A few examples per group are shrunk to a
minimal return that still disagrees, which is usually enough to spot the bug.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from compare import FIELDS, ScenarioResult, compare  # noqa: E402
from engines import run_policyengine, run_taxcalc, run_ustaxes  # noqa: E402
from scenarios import Scenario, random_scenarios, shrink_candidates  # noqa: E402

OUT = Path(__file__).resolve().parent / "out"


USTAXES_ROOT = Path(__file__).resolve().parent.parent


def evaluate(scenarios: list[Scenario], tag: str) -> dict[str, ScenarioResult]:
    print(f"[{tag}] {len(scenarios)} returns: UsTaxes…", flush=True)
    u = run_ustaxes(scenarios, OUT / "work", USTAXES_ROOT)
    print(f"[{tag}] PolicyEngine…", flush=True)
    pe = run_policyengine(scenarios)
    print(f"[{tag}] Tax-Calculator…", flush=True)
    tc = run_taxcalc(scenarios)
    return {s["id"]: compare(s, u[s["id"]], pe[s["id"]], tc[s["id"]]) for s in scenarios}


def shrink(failing: list[ScenarioResult], max_rounds: int = 25) -> list[ScenarioResult]:
    """Greedily simplify each failing return while it keeps the same root cause."""
    current = {r.scenario["id"]: r for r in failing}
    for rnd in range(max_rounds):
        cands: list[tuple[str, Scenario]] = []
        for key, r in current.items():
            cands += [(key, c) for c in shrink_candidates(r.scenario)]
        if not cands:
            break
        results = evaluate([c for _, c in cands], f"shrink {rnd + 1}")
        progressed = False
        for key, r in list(current.items()):
            for k2, c in cands:
                if k2 != key:
                    continue
                cr = results[c["id"]]
                if cr.root == r.root:
                    current[key] = cr
                    progressed = True
                    break
        if not progressed:
            break
    return list(current.values())


def _git_head(root: Path) -> str:
    import subprocess

    try:
        return subprocess.run(
            ["git", "log", "-1", "--format=%h %s"], cwd=root, capture_output=True, text=True, check=True
        ).stdout.strip()
    except Exception:
        return "unknown"


def fmt(v: Any) -> str:
    if v is None:
        return "—"
    return f"{v:,.2f}"


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


def render(results: dict[str, ScenarioResult], shrunk: dict[str, list[ScenarioResult]], args) -> str:
    total = len(results)
    by_root: dict[str, list[ScenarioResult]] = defaultdict(list)
    for r in results.values():
        if r.root:
            by_root[r.root].append(r)
    clean = total - sum(len(v) for v in by_root.values())

    field_mismatch = defaultdict(int)
    field_disagree = defaultdict(int)
    for r in results.values():
        for f in r.fields:
            field_mismatch[f.field] += f.mismatch
            field_disagree[f.field] += f.oracles_disagree

    lines = [
        "# UsTaxes Y2025 oracle report",
        "",
        f"UsTaxes checkout: `{USTAXES_ROOT}` "
        f"(`{_git_head(USTAXES_ROOT)}`).",
        "",
        f"{total} random returns (seed {args.seed}). "
        f"**{clean}** match both oracles on every field; "
        f"**{total - clean}** have at least one UsTaxes disagreement.",
        "",
        "## Returns by first disagreeing field",
        "",
        "The first field (in dependency order) where UsTaxes differs from the "
        "oracle consensus. Later fields usually inherit the same error.",
        "",
        "| First disagreeing field | Returns |",
        "|---|---:|",
    ]
    order = ["ERROR"] + FIELDS
    for root in sorted(by_root, key=order.index):
        lines.append(f"| `{root}` | {len(by_root[root])} |")
    lines += [
        "",
        "## Per-field counts",
        "",
        "*UsTaxes differs* counts every return where that field is off. "
        "*Oracles disagree* counts returns where PolicyEngine and "
        "Tax-Calculator differ from each other, so that field was not judged.",
        "",
        "| Field | UsTaxes differs | Oracles disagree |",
        "|---|---:|---:|",
    ]
    for f in FIELDS:
        lines.append(f"| `{f}` | {field_mismatch[f]} | {field_disagree[f]} |")

    if "ERROR" in by_root:
        lines += ["", "## UsTaxes errors", ""]
        errs = defaultdict(int)
        for r in by_root["ERROR"]:
            errs[r.error] += 1
        for e, c in sorted(errs.items(), key=lambda x: -x[1]):
            lines.append(f"- {c} × `{e}`")

    lines += ["", "## Minimal examples", ""]
    for root in sorted(shrunk, key=order.index):
        lines += [f"### `{root}`", ""]
        for r in shrunk[root]:
            lines += [f"**{r.scenario['id']}**: {describe(r.scenario)}", ""]
            if r.error:
                lines += [f"Error: `{r.error}`", ""]
                continue
            lines += ["| Field | UsTaxes | PolicyEngine | Tax-Calculator |", "|---|---:|---:|---:|"]
            for f in r.fields:
                if f.mismatch or f.oracles_disagree:
                    mark = " ⚠" if f.mismatch else " (oracles differ)"
                    lines.append(f"| `{f.field}`{mark} | {fmt(f.ustaxes)} | {fmt(f.pe)} | {fmt(f.tc)} |")
            lines.append("")
    return "\n".join(lines) + "\n"


def main() -> None:
    global USTAXES_ROOT, OUT
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--n", type=int, default=500, help="number of random returns")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--examples", type=int, default=3, help="examples to shrink per root cause (0 = skip)")
    ap.add_argument(
        "--ustaxes-root",
        type=Path,
        help="UsTaxes checkout/worktree to test (default: this repo). Needs node_modules.",
    )
    ap.add_argument("--out", type=Path, default=OUT, help="report directory (default: oracle/out)")
    args = ap.parse_args()

    if args.ustaxes_root:
        USTAXES_ROOT = args.ustaxes_root.resolve()
    OUT = args.out.resolve()

    OUT.mkdir(parents=True, exist_ok=True)
    scenarios = random_scenarios(args.n, args.seed)
    results = evaluate(scenarios, "main")

    by_root: dict[str, list[ScenarioResult]] = defaultdict(list)
    for r in results.values():
        if r.root:
            by_root[r.root].append(r)
    picks = [r for rs in by_root.values() for r in rs[: args.examples]]
    shrunk_list = shrink(picks) if picks and args.examples else picks
    shrunk: dict[str, list[ScenarioResult]] = defaultdict(list)
    for r in shrunk_list:
        shrunk[r.root].append(r)

    (OUT / "report.md").write_text(render(results, shrunk, args))
    raw = {
        sid: {
            "scenario": r.scenario,
            "root": r.root,
            "error": r.error,
            "fields": {f.field: {"ustaxes": f.ustaxes, "pe": f.pe, "tc": f.tc} for f in r.fields},
        }
        for sid, r in results.items()
    }
    (OUT / "results.json").write_text(json.dumps(raw, indent=1, default=float))
    print(f"wrote {OUT / 'report.md'}")


if __name__ == "__main__":
    main()
