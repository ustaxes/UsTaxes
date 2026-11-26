# Oracle differential test (Y2025)

This harness checks UsTaxes' 2025 federal calculations against two independent
open-source tax engines:

- [PolicyEngine-US](https://github.com/PolicyEngine/policyengine-us)
- [PSL Tax-Calculator](https://github.com/PSLmodels/Tax-Calculator)

It computes a fixed set of 2025 returns in all three engines. A UsTaxes
value is flagged only when **both oracles agree with each other** and
UsTaxes differs from them. When the two oracles disagree, that field isn't
judged, so a bug in one oracle can't produce a false finding.

Known UsTaxes bugs are listed in `known_issues.py`. A run passes when every
disagreement is explained by one of them, so it can gate CI
(`.github/workflows/oracle.yml`) while those bugs are being fixed.

## Setup

```sh
uv venv --python 3.12 oracle/.venv
uv pip install --python oracle/.venv/bin/python -r oracle/requirements.txt
```

`npm install` must already have been run, because the UsTaxes side runs
through `ts-node`. `requirements.txt` locks every package, not only the two
engines. To change an engine version, edit `requirements.in` and regenerate
the lock with the command at the top of that file.

## Run

```sh
oracle/.venv/bin/python oracle/run.py
```

This runs the checked-in 2025 corpus and writes `oracle/out/report.md` and
`oracle/out/results-2025.json`. It takes about two minutes. The exit status
is 1 if any disagreement is unexplained.

The report starts with the UsTaxes branch and commit, the engine versions,
and the Python and Node versions. Then come:

- a summary: matching returns, known-issue returns, unexplained returns;
- a known-issues table with a count per issue. An issue that matched no
  return is flagged _matched nothing — fixed?_. Delete fixed entries; with
  `--strict`, a stale entry also fails the run.
- each unexplained group, keyed by the **first** field that differs in
  dependency order (SE tax → taxable SS → AGI → deductions → taxable income →
  tax → credits), with a few returns **shrunk** to a minimal example. A
  return is shrunk only while it keeps the same first field _and_ stays
  unexplained, so it can't shrink into a known bug.

Options:

- `--examples N` sets how many unexplained returns to shrink per group
  (default 3; `0` skips shrinking).
- `--strict` also fails on known issues that matched nothing.
- `--random N --seed S` uses N fresh random returns instead of the corpus,
  for exploring beyond the fixed set.
- `--ustaxes-root PATH` tests a different checkout or worktree, such as an
  open PR branch, without merging this harness into it. The checkout needs a
  `node_modules`, which can be a symlink to this repo's:

  ```sh
  git worktree add /tmp/wt some-branch
  ln -s "$PWD/node_modules" /tmp/wt/node_modules
  oracle/.venv/bin/python oracle/run.py --ustaxes-root /tmp/wt --out /tmp/wt-report
  ```

## The corpus

`corpus/y2025.json` holds 1,264 returns, one per line:

- **264 threshold returns** (`b2025-…`), from `boundaries.py`. Each targets a
  point where a rule changes and sits at that point and $1 either side:
  every ordinary bracket, the $100,000 Tax Table edge, the 0%/15% capital
  gain breakpoints, NIIT and Additional Medicare thresholds, the capital
  loss limit, Social Security base amounts, EITC phase-in end, phase-out
  start and end and the investment income limit (0–3 children, single and
  joint), CTC phase-out, the $2,500 ACTC earned-income floor, the Social
  Security wage base, the senior deduction phase-out, and age edges (64/65,
  and 24/25 and 64/65 for childless EITC). Threshold values are read from
  PolicyEngine's parameters. A wrong parameter there would only move a test
  point off the exact edge; it can't produce a false finding.
- **1,000 random returns** (`r2025-…`, seed 2025) for broad coverage.

The run reads this file rather than regenerating it, so results don't shift
when the generator or Python's `random` changes. Two runs on the same
commit produce identical `results-2025.json`. Rebuild it only to change the
test set on purpose, and review the diff:

```sh
oracle/.venv/bin/python oracle/corpus.py --year 2025
```

## Files

| File                | Role                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `scenarios.py`      | Engine-neutral scenario format, random generator, shrinker       |
| `boundaries.py`     | Threshold-targeted scenarios                                     |
| `corpus.py`         | Builds and loads the checked-in corpus                           |
| `corpus/y2025.json` | The corpus                                                       |
| `ustaxes_runner.ts` | Scenario → `Information` → `F1040`, then reads the lines         |
| `engines.py`        | Batched adapters for UsTaxes, PolicyEngine-US and Tax-Calculator |
| `compare.py`        | Field list, rounding, tolerances, consensus and root-cause logic |
| `known_issues.py`   | Known UsTaxes bugs that a run tolerates                          |
| `run.py`            | Command-line entry point, report and exit status                 |

## What is compared

| Field                   | UsTaxes source                                       |
| ----------------------- | ---------------------------------------------------- |
| `se_tax`                | Schedule SE line 12                                  |
| `taxable_ss`            | 1040 line 6b                                         |
| `agi`                   | 1040 line 11                                         |
| `standard_deduction`    | 1040 line 12e                                        |
| `senior_deduction`      | 1040 line 13b (Schedule 1-A)                         |
| `qbid`                  | 1040 line 13a                                        |
| `taxable_income`        | 1040 line 15                                         |
| `regular_tax`           | 1040 line 16                                         |
| `amt`                   | Form 6251 line 11                                    |
| `nonrefundable_ctc_odc` | 1040 line 19                                         |
| `eitc`                  | 1040 line 27a                                        |
| `actc`                  | 1040 line 28                                         |
| `additional_medicare`   | Form 8959 line 18                                    |
| `niit`                  | Form 8960 line 17                                    |
| `net_income_tax`        | line 24 − SE tax − Additional Medicare − EITC − ACTC |

### Tolerances

Every value is rounded to whole dollars, as the form shows it (halves away
from zero). Most fields must then agree within **$1**. Two places get **$12**, because the
IRS uses lookup tables there while both oracles use exact formulas:

- regular tax (and the credits capped by it) whenever any part comes from the
  Tax Table: taxable income under $100,000, or an ordinary-income portion
  under $100,000 on the Qualified Dividends and Capital Gain Tax Worksheet;
- EITC, which is always read from the EIC Table.

`net_income_tax` allows $25 because it can carry both table offsets at once.

## Scope

A scenario includes only facts that all three engines represent the same way:

- filing status S, MFJ, HOH or MFS. MFS always means "lived apart from the
  spouse all year", because Tax-Calculator can't represent the
  lived-together case. The MFS spouse given to UsTaxes is under 65.
- age and blindness for the filer and spouse;
- dependents who are all qualifying children who lived with the filer all
  year;
- W-2 wages, Schedule C net profit, interest, ordinary and qualified dividends,
  capital gain distributions, net short- and long-term gains (losses
  allowed), fully taxable pensions, unemployment and Social Security;
- the standard deduction only, with no payments or withholding.

PolicyEngine's take-up flags are pinned: EITC claimed, no Marketplace
coverage (so no premium tax credit). Tax-Calculator's random EITC and ACTC
take-up is turned off.

The runner and generator also accept 2020–2024 (`--year 2024 --random 500`).
Those years have no input for self-employment or unemployment, so the
generator leaves both out. Older years aren't verified yet and have no
corpus or known-issues entries.

To widen the scope (itemized deductions, tips and overtime, education
credits, and so on), add the input to `scenarios.py` and to all three
adapters. Then confirm on a few hand-checked returns that the oracles agree
with each other before trusting UsTaxes findings in the new area.

### Why the IRS ATS scenarios aren't used

The 2025 Form 1040 MeF Assurance Testing System scenarios contain source
documents and a 1040 that is only partly filled in. They exercise the e-file
schema and business rules and don't provide computed totals. They're useful
as realistic inputs, but not as an answer key.
