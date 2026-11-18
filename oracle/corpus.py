"""Build the checked-in scenario corpus for a tax year.

    oracle/.venv/bin/python oracle/corpus.py --year 2025

Writes oracle/corpus/y<year>.json: random returns plus threshold-targeted
returns (boundaries.py). The run reads the corpus file instead of
regenerating, so results don't shift when the generator or Python's random
module changes. Rebuild only when you mean to change the test set, and
review the diff.

One scenario per line keeps diffs readable; income is stored sparsely.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from boundaries import boundary_scenarios  # noqa: E402
from scenarios import Scenario, random_scenarios, sparse  # noqa: E402

CORPUS_DIR = Path(__file__).resolve().parent / "corpus"
# Only 2025 is checked in for now. The runner and generator also take
# 2020-2024 (`run.py --year 2024 --random 500`), but those years are unverified.
YEARS = (2025,)
DEFAULT_RANDOM = 1000


def corpus_path(year: int) -> Path:
    return CORPUS_DIR / f"y{year}.json"


def build(year: int, n_random: int = DEFAULT_RANDOM) -> dict[str, Any]:
    scenarios = boundary_scenarios(year) + random_scenarios(n_random, seed=year, year=year)
    return {
        "year": year,
        "generator": {"random": n_random, "seed": year, "boundaries": True},
        "scenarios": [sparse(s) for s in scenarios],
    }


def write(corpus: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    head = {k: v for k, v in corpus.items() if k != "scenarios"}
    lines = [json.dumps(s, separators=(",", ":")) for s in corpus["scenarios"]]
    body = ",\n".join(lines)
    text = json.dumps(head)[:-1] + ', "scenarios": [\n' + body + "\n]}\n"
    path.write_text(text)


def load(year: int) -> list[Scenario]:
    data = json.loads(corpus_path(year).read_text())
    if data["year"] != year:
        raise ValueError(f"{corpus_path(year)} is for {data['year']}, not {year}")
    return data["scenarios"]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--year", type=int, action="append", help="year to build (repeatable; default all)")
    ap.add_argument("--random", type=int, default=DEFAULT_RANDOM, help="random returns per year")
    args = ap.parse_args()
    for year in args.year or YEARS:
        c = build(year, args.random)
        write(c, corpus_path(year))
        print(f"{corpus_path(year).relative_to(Path.cwd()) if corpus_path(year).is_relative_to(Path.cwd()) else corpus_path(year)}: {len(c['scenarios'])} returns")


if __name__ == "__main__":
    main()
