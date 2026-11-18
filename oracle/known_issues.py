"""UsTaxes bugs the oracle already knows about.

A run fails only on disagreements that no entry here explains, so the
harness can gate CI while these are being fixed. Each entry says which years
and first-differing fields it covers, and a predicate on the return that
recognises it.

When a fix lands, delete its entry: the run reports any entry that matched
no return as possibly fixed, and `--strict` fails on it.

Caveat: a return is attributed to the first field that differs. If a return
hits a known bug and a new one further down, the new one is hidden until the
known one is fixed. Keep predicates narrow so that window stays small.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from compare import ScenarioResult
from scenarios import Scenario

ALL_YEARS = (2020, 2021, 2022, 2023, 2024, 2025)


@dataclass(frozen=True)
class KnownIssue:
    id: str
    summary: str
    tracking: str  # branch, PR or "untracked"
    years: tuple[int, ...]
    # First-differing fields this issue can explain; None means any field.
    roots: Optional[tuple[str, ...]]
    applies: Callable[[Scenario, ScenarioResult], bool]


def _consensus(r: ScenarioResult, field: str) -> Optional[float]:
    for f in r.fields:
        if f.field == field:
            return f.consensus
    return None


def _has_se(s: Scenario) -> bool:
    return s["income"]["sePrimary"] > 0 or s["income"]["seSpouse"] > 0


def _ages(s: Scenario) -> list[int]:
    return [s["primary"]["age"]] + ([s["spouse"]["age"]] if s["spouse"] else [])


def _eitc_gap(r: ScenarioResult) -> Optional[float]:
    """UsTaxes EITC minus the oracle consensus."""
    for f in r.fields:
        if f.field == "eitc" and f.consensus is not None and f.ustaxes is not None:
            return f.ustaxes - f.consensus
    return None


def _investment_income(s: Scenario) -> int:
    i = s["income"]
    gains = i["capGainDistributions"] + i["longTermGain"] + i["shortTermGain"]
    return i["interest"] + i["ordinaryDividends"] + max(0, gains)


# Rev. Proc. 2024-40 §3.07 (2025).
EITC_INVESTMENT_LIMIT = {2025: 11_950}
EIC_STACK = "fix/y2025-eic -> fix/y2025-eic-self-employment (#2659 and below)"


KNOWN_ISSUES: list[KnownIssue] = [
    KnownIssue(
        id="schedule-c-not-on-return",
        summary="F1040.scheduleC is declared but never instantiated, so Schedule C "
        "profit gets no SE tax and is left out of AGI, QBI and EITC earned income.",
        tracking="fix/y2025-qbi-schedule-c (parked on this)",
        years=(2025,),
        roots=None,
        applies=lambda s, r: _has_se(s),
    ),
    KnownIssue(
        id="senior-deduction-mfs",
        summary="Schedule 1-A allows the enhanced deduction for seniors on MFS returns; "
        "a married filer must file jointly to claim it.",
        tracking="untracked",
        years=(2025,),
        roots=("senior_deduction",),
        applies=lambda s, r: s["filingStatus"] == "MFS" and s["primary"]["age"] >= 65,
    ),
    KnownIssue(
        id="negative-agi-clamped",
        summary="Form 1040 line 11 is clamped at 0, but AGI can be negative.",
        tracking="untracked",
        years=(2025,),
        roots=("agi",),
        applies=lambda s, r: (_consensus(r, "agi") or 0) < 0,
    ),
    KnownIssue(
        id="ss-provisional-income-omits-unemployment",
        summary="The Social Security Benefits Worksheet leaves Schedule 1 income "
        "(unemployment) out of provisional income.",
        tracking="untracked",
        years=(2025,),
        roots=("taxable_ss",),
        applies=lambda s, r: s["income"]["unemployment"] > 0,
    ),
    KnownIssue(
        id="eitc-childless-age-test",
        summary="Filers with no qualifying child get the EITC outside the 25-64 age range.",
        tracking="untracked (still present on fix/y2025-eic-self-employment)",
        years=(2025,),
        roots=("eitc",),
        applies=lambda s, r: not s["dependents"] and all(a < 25 or a > 64 for a in _ages(s)),
    ),
    # The next three are all fixed on the open EIC stack (checked by running
    # the 2025 corpus with --ustaxes-root on fix/y2025-eic-self-employment).
    KnownIssue(
        id="eitc-not-from-table",
        summary="EITC is interpolated instead of read from the EIC Table, so it is "
        "off by up to ~$60.",
        tracking=EIC_STACK,
        years=(2025,),
        roots=("eitc",),
        applies=lambda s, r: _eitc_gap(r) is not None
        and abs(_eitc_gap(r)) <= 60
        and (_consensus(r, "eitc") or 0) > 0,
    ),
    KnownIssue(
        id="eitc-investment-income-limit",
        summary="The EITC investment income limit is not applied.",
        tracking=EIC_STACK,
        years=(2025,),
        roots=("eitc",),
        applies=lambda s, r: _consensus(r, "eitc") == 0
        and _investment_income(s) > EITC_INVESTMENT_LIMIT[2025],
    ),
    KnownIssue(
        id="eitc-understated",
        summary="EITC is too low; mostly households with an 18-year-old, who is still "
        "a qualifying child (under 19 at year end).",
        tracking=EIC_STACK,
        years=(2025,),
        roots=("eitc",),
        applies=lambda s, r: (_eitc_gap(r) or 0) < -60,
    ),
]


def explain(year: int, r: ScenarioResult) -> Optional[KnownIssue]:
    root = r.root
    if root is None or root == "ERROR":
        return None
    for issue in KNOWN_ISSUES:
        if year not in issue.years:
            continue
        if issue.roots is not None and root not in issue.roots:
            continue
        if issue.applies(r.scenario, r):
            return issue
    return None
