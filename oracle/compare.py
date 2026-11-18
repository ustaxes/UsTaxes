"""Compare UsTaxes against the oracle consensus, field by field."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

# Fields in dependency order: the first field that disagrees on a return is
# treated as the root cause, since later fields usually inherit the error.
FIELDS = [
    "se_tax",
    "taxable_ss",
    "agi",
    "standard_deduction",
    "senior_deduction",
    "qbid",
    "taxable_income",
    "regular_tax",
    "amt",
    "nonrefundable_ctc_odc",
    # EITC before ACTC: Schedule 8812 Part II-B compares Social Security
    # tax withheld against the EITC, so a wrong EITC shows up in ACTC too.
    "eitc",
    "actc",
    "additional_medicare",
    "niit",
    "net_income_tax",
]

# The IRS Tax Table (taxable income under $100,000) and EIC Table are
# computed at the midpoint of $50 bands (or narrower at the bottom); both
# oracles use the exact formulas instead. A $25 offset at the top 2025
# table rate (24%) is $6; the EIC phase-in rate tops out at 45%, or $11.25.
# These tolerances absorb that, and nothing more.
BASE_TOL = 2.0
TABLE_TOL = 12.0


def uses_tax_table(scenario: dict[str, Any], taxable_income: float) -> bool:
    """Whether any part of the regular tax comes from the Tax Table.

    True when taxable income is under $100,000, and also when the Qualified
    Dividends and Capital Gain Tax Worksheet taxes an ordinary-income portion
    under $100,000 (its line 22 uses the Tax Table too).
    """
    if taxable_income < 100_000:
        return True
    inc = scenario["income"]
    preferential = max(
        0,
        inc["qualifiedDividends"]
        + inc["capGainDistributions"]
        + max(0, inc["longTermGain"] + min(0, inc["shortTermGain"])),
    )
    return preferential > 0 and taxable_income - preferential < 100_000


def tolerance(field: str, table: bool) -> float:
    if field == "eitc":
        return TABLE_TOL
    if field in ("regular_tax", "nonrefundable_ctc_odc", "actc") and table:
        return TABLE_TOL
    if field == "net_income_tax":
        # Can stack a tax-table offset and an EIC-table offset.
        return 2 * TABLE_TOL + BASE_TOL
    return BASE_TOL


@dataclass
class FieldResult:
    field: str
    ustaxes: Optional[float]
    pe: Optional[float]
    tc: Optional[float]
    consensus: Optional[float]  # None when the oracles disagree
    tol: float

    @property
    def oracles_disagree(self) -> bool:
        return self.consensus is None

    @property
    def mismatch(self) -> bool:
        return (
            self.consensus is not None
            and self.ustaxes is not None
            and abs(self.ustaxes - self.consensus) > self.tol
        )


@dataclass
class ScenarioResult:
    scenario: dict[str, Any]
    error: Optional[str]
    fields: list[FieldResult]

    @property
    def root(self) -> Optional[str]:
        if self.error:
            return "ERROR"
        for f in self.fields:
            if f.mismatch:
                return f.field
        return None


def compare(
    scenario: dict[str, Any],
    u: dict[str, Any],
    pe: dict[str, Any],
    tc: dict[str, Any],
) -> ScenarioResult:
    if "error" in u:
        return ScenarioResult(scenario, u["error"], [])
    # PolicyEngine sometimes imputes credits outside our scope; if so its
    # bottom line is not comparable, so lean on Tax-Calculator alone there.
    pe_extra = abs(pe.get("_other_refundable", 0)) > 1
    # Tolerances key off taxable income, which both oracles agree on in
    # almost every case; take Tax-Calculator's when they do not.
    table = uses_tax_table(scenario, tc["taxable_income"])
    results = []
    for f in FIELDS:
        tol = tolerance(f, table)
        uv = u.get(f)
        pv = None if (pe_extra and f == "net_income_tax") else pe.get(f)
        tv = tc.get(f)
        if pv is None:
            cons = tv
        elif abs(pv - tv) <= tol:
            cons = (pv + tv) / 2
        else:
            cons = None
        results.append(FieldResult(f, uv, pv, tv, cons, tol))
    return ScenarioResult(scenario, None, results)
