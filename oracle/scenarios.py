"""Engine-neutral return scenarios.

A scenario is a plain JSON-serialisable dict that every engine adapter
(UsTaxes, PolicyEngine-US, Tax-Calculator) translates into its own input
format. Only facts all three engines model are included, so a disagreement
points at a computation difference rather than an input-mapping gap.

Shape:
  {
    "id": "r00042",
    "filingStatus": "S" | "MFJ" | "MFS" | "HOH",
    "primary": {"age": int, "blind": bool},
    "spouse": {"age": int, "blind": bool} | None,   # MFJ only
    "dependents": [{"age": int, "student": bool}],  # all qualifying children
    "income": {
      "wagesPrimary", "wagesSpouse",                 # W-2 box 1
      "sePrimary", "seSpouse",                       # Schedule C net profit
      "interest",                                    # 1099-INT
      "ordinaryDividends", "qualifiedDividends",     # 1099-DIV 1a / 1b
      "capGainDistributions",                        # 1099-DIV 2a
      "shortTermGain", "longTermGain",               # 1099-B net (may be < 0)
      "taxablePension",                              # 1099-R, fully taxable
      "unemployment",                                # 1099-G
      "ssPrimary", "ssSpouse"                        # SSA-1099 box 5
    }
  }

Deliberate scope limits (each would need more adapter work to compare fairly):
  * standard deduction only — no itemized inputs are generated;
  * dependents are all the filer's qualifying children who lived with them
    all year (ages 0-18, or 19-23 full-time students);
  * no withholding or estimated payments — we compare liability, not refund;
  * no tips/overtime/car-loan Schedule 1-A inputs (Tax-Calculator 6.8 does
    not model them per-return the same way).

Income keys a year's UsTaxes forms cannot take (see UNSUPPORTED_BEFORE_2025)
are never generated for that year: UsTaxes would silently drop them and every
such return would look like a bug.

The checked-in corpus stores income sparsely (zero amounts omitted); call
`normalize` before handing a scenario to an engine.
"""

from __future__ import annotations

import copy
import random
from typing import Any

Scenario = dict[str, Any]

INCOME_KEYS = [
    "wagesPrimary",
    "wagesSpouse",
    "sePrimary",
    "seSpouse",
    "interest",
    "ordinaryDividends",
    "qualifiedDividends",
    "capGainDistributions",
    "shortTermGain",
    "longTermGain",
    "taxablePension",
    "unemployment",
    "ssPrimary",
    "ssSpouse",
]


# Inputs the Y2020-Y2024 forms have no way to accept: Information has no
# selfEmployedIncome or otherIncome (unemployment) there.
UNSUPPORTED_BEFORE_2025 = {"sePrimary", "seSpouse", "unemployment"}


def supported_income(year: int) -> list[str]:
    if year >= 2025:
        return list(INCOME_KEYS)
    return [k for k in INCOME_KEYS if k not in UNSUPPORTED_BEFORE_2025]


def empty_income() -> dict[str, int]:
    return {k: 0 for k in INCOME_KEYS}


def normalize(s: Scenario) -> Scenario:
    """Fill omitted income keys with 0 (the corpus stores income sparsely)."""
    out = copy.deepcopy(s)
    out["income"] = {**empty_income(), **s.get("income", {})}
    out.setdefault("spouse", None)
    out.setdefault("dependents", [])
    return out


def sparse(s: Scenario) -> Scenario:
    """Drop zero income amounts, for compact storage."""
    out = {"id": s["id"], **{k: copy.deepcopy(v) for k, v in s.items() if k != "id"}}
    out["income"] = {k: v for k, v in s["income"].items() if v}
    return out


def _amount(rng: random.Random, lo: int, hi: int) -> int:
    """Log-uniform whole-dollar amount, so small and large values both appear."""
    import math

    return int(round(math.exp(rng.uniform(math.log(lo), math.log(hi)))))


def _person(rng: random.Random) -> dict[str, Any]:
    # Over-sample the ages around 65 that drive the additional standard
    # deduction and the Schedule 1-A senior deduction.
    age = rng.choice([rng.randint(19, 85), rng.randint(62, 68)])
    return {"age": age, "blind": rng.random() < 0.03}


def random_scenario(rng: random.Random, sid: str, year: int = 2025) -> Scenario:
    fs = rng.choices(["S", "MFJ", "HOH", "MFS"], weights=[35, 35, 22, 8])[0]
    primary = _person(rng)
    spouse = _person(rng) if fs == "MFJ" else None

    if fs == "HOH":
        n_deps = rng.choices([1, 2, 3, 4], weights=[45, 35, 15, 5])[0]
    elif fs == "MFS":
        n_deps = 0
    else:
        n_deps = rng.choices([0, 1, 2, 3, 4], weights=[50, 20, 18, 8, 4])[0]
    dependents = []
    for _ in range(n_deps):
        age = rng.randint(0, 23)
        dependents.append({"age": age, "student": age >= 19})
    # A child cannot be older than (parent age - 12); keep scenarios plausible.
    dependents = [d for d in dependents if d["age"] <= primary["age"] - 12]
    if fs == "HOH" and not dependents:
        dependents = [{"age": rng.randint(0, 16), "student": False}]

    inc = empty_income()
    # Income profile: low earners exercise EIC/ACTC, high earners exercise
    # NIIT / Additional Medicare / AMT / phaseouts.
    scale = rng.choices([20_000, 60_000, 150_000, 400_000], weights=[35, 30, 22, 13])[0]

    if rng.random() < 0.85:
        inc["wagesPrimary"] = _amount(rng, 500, scale * 2)
    if spouse and rng.random() < 0.6:
        inc["wagesSpouse"] = _amount(rng, 500, scale * 1.5)
    if rng.random() < 0.18:
        inc["sePrimary"] = _amount(rng, 500, scale)
    if spouse and rng.random() < 0.08:
        inc["seSpouse"] = _amount(rng, 500, scale)
    if rng.random() < 0.45:
        inc["interest"] = _amount(rng, 1, scale / 5)
    if rng.random() < 0.35:
        inc["ordinaryDividends"] = _amount(rng, 1, scale / 3)
        inc["qualifiedDividends"] = int(inc["ordinaryDividends"] * rng.choice([0, 0.5, 0.9, 1]))
    if rng.random() < 0.12:
        inc["capGainDistributions"] = _amount(rng, 1, scale / 10)
    if rng.random() < 0.15:
        inc["shortTermGain"] = rng.choice([1, -1]) * _amount(rng, 10, scale / 2)
    if rng.random() < 0.25:
        inc["longTermGain"] = rng.choice([1, 1, -1]) * _amount(rng, 10, scale)
    older = primary["age"] >= 55 or (spouse is not None and spouse["age"] >= 55)
    if older and rng.random() < 0.45:
        inc["taxablePension"] = _amount(rng, 1_000, scale / 2)
    if rng.random() < 0.05:
        inc["unemployment"] = _amount(rng, 500, 20_000)
    if primary["age"] >= 62 and rng.random() < 0.7:
        inc["ssPrimary"] = _amount(rng, 5_000, 45_000)
    if spouse and spouse["age"] >= 62 and rng.random() < 0.6:
        inc["ssSpouse"] = _amount(rng, 3_000, 40_000)

    for k in set(INCOME_KEYS) - set(supported_income(year)):
        inc[k] = 0

    return {
        "id": sid,
        "filingStatus": fs,
        "primary": primary,
        "spouse": spouse,
        "dependents": dependents,
        "income": inc,
    }


def random_scenarios(n: int, seed: int, year: int = 2025) -> list[Scenario]:
    rng = random.Random(seed)
    return [random_scenario(rng, f"r{seed}-{i:05d}", year) for i in range(n)]


def shrink_candidates(s: Scenario) -> list[Scenario]:
    """Simpler variants of `s` for minimising a failing case.

    Each candidate removes one thing (an income item, a dependent, the
    spouse's income, blindness) or halves one amount toward a round number.
    """
    out: list[Scenario] = []

    def variant(tag: str) -> Scenario:
        c = copy.deepcopy(s)
        c["id"] = f"{s['id']}~{tag}"
        return c

    for k in INCOME_KEYS:
        v = s["income"][k]
        if v == 0:
            continue
        c = variant(f"no-{k}")
        c["income"][k] = 0
        if k == "ordinaryDividends":
            c["income"]["qualifiedDividends"] = 0
        out.append(c)
        rounded = int(round(v, -3)) if abs(v) >= 1000 else int(round(v, -1))
        if rounded != v and rounded != 0:
            c = variant(f"round-{k}")
            c["income"][k] = rounded
            if k == "ordinaryDividends":
                c["income"]["qualifiedDividends"] = min(c["income"]["qualifiedDividends"], rounded)
            if k == "qualifiedDividends":
                c["income"][k] = min(rounded, s["income"]["ordinaryDividends"])
            out.append(c)
    for i in range(len(s["dependents"])):
        if s["filingStatus"] == "HOH" and len(s["dependents"]) == 1:
            continue
        c = variant(f"no-dep{i}")
        del c["dependents"][i]
        out.append(c)
    for who in ["primary", "spouse"]:
        p = s.get(who)
        if p and p["blind"]:
            c = variant(f"{who}-sighted")
            c[who]["blind"] = False
            out.append(c)
    return out
