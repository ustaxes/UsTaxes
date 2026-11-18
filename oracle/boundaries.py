"""Scenarios placed exactly at the thresholds where tax rules change.

Random log-uniform amounts almost never land on a phase-out start or a
bracket edge, but off-by-one and wrong-constant bugs live there. Each target
below produces returns at the threshold and $1 either side.

Threshold values come from PolicyEngine-US's parameter tree for the year.
That is safe even though PolicyEngine is also an oracle: a wrong parameter
there only moves a test point off the exact edge; the verdict still comes
from comparing both oracles against UsTaxes.
"""

from __future__ import annotations

from typing import Any, Callable, Iterator

from scenarios import Scenario, empty_income, supported_income

PE_STATUS = {"S": "SINGLE", "MFJ": "JOINT", "MFS": "SEPARATE", "HOH": "HEAD_OF_HOUSEHOLD"}
OFFSETS = (-1, 0, 1)

# Enhanced deduction for seniors (OBBBA §70103, IRC §151(d)(5)(C)), 2025-2028.
# Not read from PolicyEngine because its parameter tree stores only the rate.
SENIOR_START = {"S": 75_000, "HOH": 75_000, "MFJ": 150_000}
SENIOR_AMOUNT = 6_000
SENIOR_RATE = 0.06


class Params:
    """The handful of PolicyEngine parameters the targets need."""

    def __init__(self, year: int) -> None:
        from policyengine_us import CountryTaxBenefitSystem

        root = CountryTaxBenefitSystem().parameters(f"{year}-01-01").gov.irs
        self.year = year
        self.irs = root

    def std(self, fs: str) -> float:
        return float(self.irs.deductions.standard.amount[PE_STATUS[fs]])

    def brackets(self, fs: str) -> list[float]:
        t = self.irs.income.bracket.thresholds
        return [float(t[str(i)][PE_STATUS[fs]]) for i in range(1, 7)]

    def cg_breaks(self, fs: str) -> list[float]:
        t = self.irs.capital_gains.thresholds
        return [float(t[str(i)][PE_STATUS[fs]]) for i in (1, 2)]

    def eitc(self, kids: int, joint: bool) -> dict[str, float]:
        e = self.irs.credits.eitc
        max_ = float(e.max.calc(kids))
        start = float(e.phase_out.start.calc(kids))
        if joint:
            start += float(e.phase_out.joint_bonus.calc(kids))
        return {
            "phase_in_end": max_ / float(e.phase_in_rate.calc(kids)),
            "phase_out_start": start,
            "phase_out_end": start + max_ / float(e.phase_out.rate.calc(kids)),
            "investment_limit": float(e.phase_out.max_investment_income),
        }

    def ctc_phase_out(self, fs: str) -> float:
        return float(self.irs.credits.ctc.phase_out.threshold[PE_STATUS[fs]])

    def niit(self, fs: str) -> float:
        return float(self.irs.investment.net_investment_income_tax.threshold[PE_STATUS[fs]])

    def addl_medicare(self, fs: str) -> float:
        return float(self.irs.payroll.medicare.additional.exclusion[PE_STATUS[fs]])

    def ss_base(self, fs: str) -> tuple[float, float]:
        t = self.irs.social_security.taxability.threshold
        return float(t.base.main[PE_STATUS[fs]]), float(t.adjusted_base.main[PE_STATUS[fs]])

    def wage_base(self) -> float:
        return float(self.irs.payroll.social_security.cap)


def _scenario(
    fs: str,
    age: int = 40,
    spouse_age: int | None = None,
    kids: int = 0,
    **income: float,
) -> Scenario:
    inc = empty_income()
    for k, v in income.items():
        inc[k] = int(round(v))
    if fs == "MFJ" and spouse_age is None:
        spouse_age = age
    return {
        "filingStatus": fs,
        "primary": {"age": age, "blind": False},
        "spouse": {"age": spouse_age, "blind": False} if fs == "MFJ" else None,
        "dependents": [{"age": 5 + 2 * i, "student": False} for i in range(kids)],
        "income": inc,
    }


Target = tuple[str, Callable[[float], Scenario], float]


def _targets(p: Params) -> Iterator[Target]:
    """(name, build(amount), threshold) triples."""
    y = p.year
    for fs, kids in (("S", 0), ("MFJ", 0), ("MFS", 0), ("HOH", 1)):
        std = p.std(fs)
        # Ordinary brackets, the $100,000 Tax Table edge, and the 0%/15%
        # capital gain breakpoints, all on taxable income.
        edges = [(f"bracket{i + 1}", b) for i, b in enumerate(p.brackets(fs))]
        edges.append(("tax-table-edge", 100_000))
        for name, ti in edges:
            yield (
                f"{fs}/{name}",
                lambda x, fs=fs, kids=kids, std=std: _scenario(fs, kids=kids, wagesPrimary=x + std),
                ti,
            )
        for i, ti in enumerate(p.cg_breaks(fs)):
            yield (
                f"{fs}/cg-break{i + 1}",
                lambda x, fs=fs, kids=kids, std=std: _scenario(
                    fs, kids=kids, wagesPrimary=x + std - 20_000, longTermGain=20_000
                ),
                ti,
            )
        # NIIT on modified AGI, with $50,000 of interest so NII is not binding.
        yield (
            f"{fs}/niit",
            lambda x, fs=fs, kids=kids: _scenario(fs, kids=kids, wagesPrimary=x - 50_000, interest=50_000),
            p.niit(fs),
        )
        # Additional Medicare Tax on wages; MFJ splits wages to test combining.
        if fs == "MFJ":
            yield (
                "MFJ/addl-medicare",
                lambda x: _scenario("MFJ", wagesPrimary=x - 100_000, wagesSpouse=100_000),
                p.addl_medicare(fs),
            )
        else:
            yield (
                f"{fs}/addl-medicare",
                lambda x, fs=fs, kids=kids: _scenario(fs, kids=kids, wagesPrimary=x),
                p.addl_medicare(fs),
            )
        # Capital loss limit ($3,000; $1,500 MFS).
        limit = 1_500 if fs == "MFS" else 3_000
        yield (
            f"{fs}/capital-loss-limit",
            lambda x, fs=fs, kids=kids: _scenario(fs, kids=kids, wagesPrimary=40_000, shortTermGain=-x),
            limit,
        )

    # Social Security taxability: provisional income = other income + half
    # of benefits, at the base and adjusted base amounts.
    for fs in ("S", "MFJ"):
        base, adjusted = p.ss_base(fs)
        for name, t in (("ss-base", base), ("ss-adjusted-base", adjusted)):
            yield (
                f"{fs}/{name}",
                lambda x, fs=fs: _scenario(fs, age=67, taxablePension=x - 10_000, ssPrimary=20_000),
                t,
            )

    # EITC: end of phase-in, start and end of phase-out, by family size;
    # plus the investment income limit.
    for kids in range(4):
        for fs in ("S" if kids == 0 else "HOH", "MFJ"):
            e = p.eitc(kids, fs == "MFJ")
            for name in ("phase_in_end", "phase_out_start", "phase_out_end"):
                yield (
                    f"{fs}/eitc-{kids}kids-{name}",
                    lambda x, fs=fs, kids=kids: _scenario(fs, age=30, kids=kids, wagesPrimary=x),
                    e[name],
                )
    lim = p.eitc(1, False)["investment_limit"]
    yield (
        "HOH/eitc-investment-limit",
        lambda x: _scenario("HOH", age=30, kids=1, wagesPrimary=10_000, interest=x),
        lim,
    )

    # CTC phase-out start (AGI) and the $2,500 refundable-CTC earned income
    # floor, with 1 and 3 children (3+ opens Schedule 8812 Part II-B).
    for fs in ("HOH", "MFJ"):
        yield (
            f"{fs}/ctc-phase-out",
            lambda x, fs=fs: _scenario(fs, kids=2, wagesPrimary=x),
            p.ctc_phase_out(fs),
        )
    for kids in (1, 3):
        yield (
            f"HOH/actc-earned-floor-{kids}kids",
            lambda x, kids=kids: _scenario("HOH", age=30, kids=kids, wagesPrimary=x),
            2_500,
        )

    # Social Security wage base, with self-employment income on top (2025+:
    # earlier years cannot take SE income).
    if "sePrimary" in supported_income(y):
        yield (
            "S/ss-wage-base-with-se",
            lambda x: _scenario("S", wagesPrimary=x, sePrimary=10_000),
            p.wage_base(),
        )

    # Enhanced deduction for seniors: phase-out start and full phase-out.
    if 2025 <= y <= 2028:
        for fs in ("S", "MFJ"):
            start = SENIOR_START[fs]
            end = start + SENIOR_AMOUNT / SENIOR_RATE
            for name, t in (("senior-phase-out-start", start), ("senior-phase-out-end", end)):
                yield (
                    f"{fs}/{name}",
                    lambda x, fs=fs: _scenario(fs, age=67, spouse_age=67, wagesPrimary=x),
                    t,
                )

    # Age edges: additional standard deduction and (2025+) the senior
    # deduction at 64 vs 65; childless EITC at 24/25 and 64/65.
    for age in (64, 65):
        yield (f"S/age-{age}", lambda _x, age=age: _scenario("S", age=age, wagesPrimary=30_000), 0)
    for age in (24, 25, 64, 65):
        yield (
            f"S/eitc-childless-age-{age}",
            lambda _x, age=age: _scenario("S", age=age, wagesPrimary=5_000),
            0,
        )


def boundary_scenarios(year: int) -> list[Scenario]:
    p = Params(year)
    out: list[Scenario] = []
    seen: set[str] = set()
    for name, build, threshold in _targets(p):
        offsets = (0,) if threshold == 0 else OFFSETS
        for off in offsets:
            s = build(threshold + off)
            if any(v < 0 for k, v in s["income"].items() if k not in ("shortTermGain", "longTermGain")):
                continue
            tag = name if threshold == 0 else f"{name}{off:+d}"
            if tag in seen:
                continue
            seen.add(tag)
            s["id"] = f"b{year}-{tag}"
            out.append(s)
    return out


def describe_targets(year: int) -> list[dict[str, Any]]:
    """Target names and thresholds, for the report and for debugging."""
    return [{"name": n, "threshold": t} for n, _b, t in _targets(Params(year))]
