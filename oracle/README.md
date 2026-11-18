# Oracle differential test (Y2025)

This harness checks UsTaxes' 2025 federal calculations against two independent
open-source tax engines:

- [PolicyEngine-US](https://github.com/PolicyEngine/policyengine-us)
- [PSL Tax-Calculator](https://github.com/PSLmodels/Tax-Calculator)

It generates random returns and computes each one in all three engines. A
UsTaxes value is flagged only when **both oracles agree with each other** and
UsTaxes differs from them. When the two oracles disagree, that field isn't
judged, so a bug in one oracle can't produce a false finding.

## Setup

```sh
uv venv --python 3.12 oracle/.venv
uv pip install --python oracle/.venv/bin/python -r oracle/requirements.txt
```

`npm install` must already have been run, because the UsTaxes side runs
through `ts-node`.

## Run

```sh
oracle/.venv/bin/python oracle/run.py --n 1000 --seed 1
```

This writes `oracle/out/report.md` and `oracle/out/results.json`. A
1,000-return run, including shrinking, takes about two minutes.

The report groups disagreeing returns by the **first** field that differs, in
dependency order (SE tax → taxable SS → AGI → deductions → taxable income →
tax → credits). A few returns from each group are then **shrunk**: income
items, dependents and so on are removed or rounded for as long as the same
first field still disagrees. What's left is usually a two- or three-input
return that points straight at the bug.

Options:

- `--examples N` sets how many returns to shrink per group (default 3; `0`
  skips shrinking).
- `--ustaxes-root PATH` tests a different checkout or worktree, such as an
  open PR branch, without merging this harness into it. The checkout needs a
  `node_modules`, which can be a symlink to this repo's:

  ```sh
  git worktree add /tmp/wt some-branch
  ln -s "$PWD/node_modules" /tmp/wt/node_modules
  oracle/.venv/bin/python oracle/run.py --ustaxes-root /tmp/wt --out /tmp/wt-report
  ```

## Files

| File                | Role                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `scenarios.py`      | Engine-neutral scenario format, random generator, shrinker       |
| `ustaxes_runner.ts` | Scenario → `Information` → Y2025 `F1040`, then reads the lines   |
| `engines.py`        | Batched adapters for UsTaxes, PolicyEngine-US and Tax-Calculator |
| `compare.py`        | Field list, tolerances, consensus and root-cause logic           |
| `run.py`            | Command-line entry point and report writer                       |

## What is compared

| Field                   | UsTaxes source                                       |
| ----------------------- | ---------------------------------------------------- |
| `se_tax`                | Schedule 2 line 4                                    |
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
| `additional_medicare`   | Schedule 2 line 11                                   |
| `niit`                  | Schedule 2 line 12                                   |
| `net_income_tax`        | line 24 − SE tax − Additional Medicare − EITC − ACTC |

### Tolerances

Most fields must agree within **$2**. Two places get **$12**, because the
IRS uses lookup tables there while both oracles use exact formulas:

- regular tax (and the credits capped by it) whenever any part comes from the
  Tax Table: taxable income under $100,000, or an ordinary-income portion
  under $100,000 on the Qualified Dividends and Capital Gain Tax Worksheet;
- EITC, which is always read from the EIC Table.

`net_income_tax` allows $26 because it can carry both table offsets at once.

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

To widen the scope (itemized deductions, tips and overtime, education
credits, and so on), add the input to `scenarios.py` and to all three
adapters. Then confirm on a few hand-checked returns that the oracles agree
with each other before trusting UsTaxes findings in the new area.

### Why the IRS ATS scenarios aren't used

The 2025 Form 1040 MeF Assurance Testing System scenarios contain source
documents and a 1040 that is only partly filled in. They exercise the e-file
schema and business rules and don't provide computed totals. They're useful
as realistic inputs, but not as an answer key.
