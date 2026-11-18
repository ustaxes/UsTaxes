"""Oracle engine adapters: PolicyEngine-US and PSL Tax-Calculator.

Each `run_*` function takes a list of scenarios (see scenarios.py) and
returns {scenario_id: {field: value}} using the same field names as
ustaxes_runner.ts. Both engines are batched: one simulation covers every
scenario, which is far faster than one simulation per return.
"""

from __future__ import annotations

import json
import os
import subprocess
import warnings
from pathlib import Path
from typing import Any

import numpy as np

from scenarios import Scenario

YEAR = 2025
REPO_ROOT = Path(__file__).resolve().parent.parent
warnings.filterwarnings("ignore")


def _filers(s: Scenario) -> int:
    return 2 if s["filingStatus"] == "MFJ" else 1


# --------------------------------------------------------------------------
# UsTaxes (subprocess into ts-node)
# --------------------------------------------------------------------------


def run_ustaxes(
    scenarios: list[Scenario], workdir: Path, root: Path = REPO_ROOT
) -> dict[str, dict[str, Any]]:
    """Run scenarios through the UsTaxes checkout at `root`.

    `root` may be any checkout or worktree (it needs node_modules, which can
    be a symlink to this repo's); the runner script always comes from here.
    """
    workdir.mkdir(parents=True, exist_ok=True)
    inp = workdir / "ustaxes_in.json"
    out = workdir / "ustaxes_out.json"
    inp.write_text(json.dumps(scenarios))
    env = {
        **os.environ,
        "TS_NODE_TRANSPILE_ONLY": "true",
        # Resolve `ustaxes/*` imports against the target checkout's src/.
        "TS_NODE_PROJECT": str(root / "tsconfig.json"),
    }
    subprocess.run(
        [
            "npx",
            "ts-node",
            "-r",
            "tsconfig-paths/register",
            str(Path(__file__).resolve().parent / "ustaxes_runner.ts"),
            str(inp),
            str(out),
        ],
        cwd=root,
        check=True,
        env=env,
    )
    return json.loads(out.read_text())


# --------------------------------------------------------------------------
# PolicyEngine-US
# --------------------------------------------------------------------------

PE_FILING_STATUS = {
    "S": "SINGLE",
    "MFJ": "JOINT",
    "MFS": "SEPARATE",
    "HOH": "HEAD_OF_HOUSEHOLD",
}


def _pe_situation(scenarios: list[Scenario]) -> tuple[dict[str, Any], list[str]]:
    Y = str(YEAR)
    people: dict[str, Any] = {}
    groups: dict[str, dict[str, Any]] = {
        "tax_units": {},
        "families": {},
        "spm_units": {},
        "households": {},
        "marital_units": {},
    }
    order: list[str] = []
    for k, s in enumerate(scenarios):
        inc = s["income"]
        head = f"p{k}_head"
        members = [head]
        people[head] = {
            "age": {Y: s["primary"]["age"]},
            "is_blind": {Y: s["primary"]["blind"]},
            "employment_income": {Y: inc["wagesPrimary"]},
            "self_employment_income": {Y: inc["sePrimary"]},
            "taxable_interest_income": {Y: inc["interest"]},
            "qualified_dividend_income": {Y: inc["qualifiedDividends"]},
            "non_qualified_dividend_income": {
                Y: inc["ordinaryDividends"] - inc["qualifiedDividends"]
            },
            "short_term_capital_gains": {Y: inc["shortTermGain"]},
            # Capital gain distributions are long-term (Schedule D line 13).
            "long_term_capital_gains": {Y: inc["longTermGain"] + inc["capGainDistributions"]},
            "taxable_pension_income": {Y: inc["taxablePension"]},
            "unemployment_compensation": {Y: inc["unemployment"]},
            "social_security_retirement": {Y: inc["ssPrimary"]},
        }
        marital = [[head]]
        if s["spouse"]:
            sp = f"p{k}_spouse"
            members.append(sp)
            people[sp] = {
                "age": {Y: s["spouse"]["age"]},
                "is_blind": {Y: s["spouse"]["blind"]},
                "employment_income": {Y: inc["wagesSpouse"]},
                "self_employment_income": {Y: inc["seSpouse"]},
                "social_security_retirement": {Y: inc["ssSpouse"]},
            }
            marital = [[head, sp]]
        for i, d in enumerate(s["dependents"]):
            dep = f"p{k}_dep{i}"
            members.append(dep)
            marital.append([dep])
            people[dep] = {
                "age": {Y: d["age"]},
                "is_full_time_student": {Y: d["student"]},
                "is_tax_unit_dependent": {Y: True},
            }
        groups["tax_units"][f"tu{k}"] = {
            "members": members,
            "filing_status": {Y: PE_FILING_STATUS[s["filingStatus"]]},
            # MFS scenarios lived apart from the spouse all year.
            "cohabitating_spouses": {Y: False},
        }
        groups["families"][f"fam{k}"] = {"members": members}
        groups["spm_units"][f"spm{k}"] = {"members": members}
        # Texas: no state income tax, so PolicyEngine never itemizes state tax.
        groups["households"][f"hh{k}"] = {"members": members, "state_code": {Y: "TX"}}
        for j, m in enumerate(marital):
            groups["marital_units"][f"mu{k}_{j}"] = {"members": m}
        order.append(s["id"])
    return {"people": people, **groups}, order


def run_policyengine(scenarios: list[Scenario]) -> dict[str, dict[str, Any]]:
    from policyengine_us import Simulation

    situation, order = _pe_situation(scenarios)
    sim = Simulation(situation=situation)

    def tu(var: str) -> np.ndarray:
        return np.asarray(sim.calculate(var, YEAR), dtype=float)

    v = {
        name: tu(name)
        for name in [
            "tax_unit_taxable_social_security",
            "adjusted_gross_income",
            "standard_deduction",
            "qualified_business_income_deduction",
            "additional_senior_deduction",
            "taxable_income",
            "income_tax_main_rates",
            "capital_gains_tax",
            "alternative_minimum_tax",
            "income_tax_capped_non_refundable_credits",
            "additional_medicare_tax",
            "net_investment_income_tax",
            "eitc",
            "refundable_ctc",
            "income_tax",
            "income_tax_refundable_credits",
        ]
    }
    # Self-employment tax is a person-level variable; sum it to tax units.
    se_tax = sim.map_result(
        np.asarray(sim.calculate("self_employment_tax", YEAR), dtype=float),
        "person",
        "tax_unit",
    )

    out: dict[str, dict[str, Any]] = {}
    for k, sid in enumerate(order):
        out[sid] = {
            "taxable_ss": v["tax_unit_taxable_social_security"][k],
            "agi": v["adjusted_gross_income"][k],
            "standard_deduction": v["standard_deduction"][k],
            "qbid": v["qualified_business_income_deduction"][k],
            "senior_deduction": v["additional_senior_deduction"][k],
            "taxable_income": v["taxable_income"][k],
            "regular_tax": v["income_tax_main_rates"][k] + v["capital_gains_tax"][k],
            "amt": v["alternative_minimum_tax"][k],
            # Only CTC/ODC are in scope, so the capped total is line 19.
            "nonrefundable_ctc_odc": v["income_tax_capped_non_refundable_credits"][k],
            "se_tax": se_tax[k],
            "additional_medicare": v["additional_medicare_tax"][k],
            "niit": v["net_investment_income_tax"][k],
            "eitc": v["eitc"][k],
            "actc": v["refundable_ctc"][k],
            "net_income_tax": v["income_tax"][k],
            # Sanity: refundable credits beyond EITC + ACTC mean PolicyEngine
            # imputed something (e.g. a premium tax credit) out of scope.
            "_other_refundable": v["income_tax_refundable_credits"][k]
            - v["eitc"][k]
            - v["refundable_ctc"][k],
        }
    return out


# --------------------------------------------------------------------------
# PSL Tax-Calculator
# --------------------------------------------------------------------------

TC_MARS = {"S": 1, "MFJ": 2, "MFS": 3, "HOH": 4}


def _tc_row(k: int, s: Scenario) -> dict[str, Any]:
    inc = s["income"]
    deps = s["dependents"]
    ages = [d["age"] for d in deps]
    eic_kids = [d for d in deps if d["age"] < 19 or (d["student"] and d["age"] < 24)]
    wages = inc["wagesPrimary"] + inc["wagesSpouse"]
    se = inc["sePrimary"] + inc["seSpouse"]
    pension = inc["taxablePension"]
    filer_ages = [s["primary"]["age"]] + ([s["spouse"]["age"]] if s["spouse"] else [])
    return dict(
        RECID=k + 1,
        FLPDYR=YEAR,
        s006=1.0,
        MARS=TC_MARS[s["filingStatus"]],
        XTOT=_filers(s) + len(deps),
        age_head=s["primary"]["age"],
        age_spouse=s["spouse"]["age"] if s["spouse"] else 0,
        blind_head=int(s["primary"]["blind"]),
        blind_spouse=int(bool(s["spouse"] and s["spouse"]["blind"])),
        e00200=wages,
        e00200p=inc["wagesPrimary"],
        e00200s=inc["wagesSpouse"],
        e00900=se,
        e00900p=inc["sePrimary"],
        e00900s=inc["seSpouse"],
        e00300=inc["interest"],
        e00600=inc["ordinaryDividends"],
        e00650=inc["qualifiedDividends"],
        p22250=inc["shortTermGain"],
        p23250=inc["longTermGain"] + inc["capGainDistributions"],
        e01500=pension,
        e01700=pension,
        e02300=inc["unemployment"],
        e02400=inc["ssPrimary"] + inc["ssSpouse"],
        n24=sum(1 for a in ages if a < 17),
        nu18=sum(1 for a in ages + filer_ages if a < 18),
        n1820=sum(1 for a in ages + filer_ages if 18 <= a <= 20),
        n21=sum(1 for a in ages + filer_ages if a >= 21),
        nu06=sum(1 for a in ages if a < 6),
        nu13=sum(1 for a in ages if a < 13),
        EIC=min(3, len(eic_kids)),
        elderly_dependents=0,
    )


def run_taxcalc(scenarios: list[Scenario]) -> dict[str, dict[str, Any]]:
    import pandas as pd
    import taxcalc as tc

    df = pd.DataFrame([_tc_row(k, s) for k, s in enumerate(scenarios)])
    rec = tc.Records(data=df, start_year=YEAR, gfactors=None, weights=None, adjust_ratios=None)
    policy = tc.Policy()
    # Tax-Calculator models partial EITC/ACTC take-up stochastically by
    # default. A return preparer computes the credit for everyone eligible.
    policy.implement_reform(
        {
            "eitc_claim_prob_scale": {YEAR: 9e99},
            "actc_claim_prob_scale": {YEAR: 9e99},
        }
    )
    calc = tc.Calculator(policy=policy, records=rec, verbose=False)
    calc.calc_all()
    a = {
        v: np.asarray(calc.array(v), dtype=float)
        for v in [
            "c02500",
            "c00100",
            "standard",
            "qbided",
            "senior_deduction",
            "c04800",
            "taxbc",
            "c09600",
            "c07220",
            "odc",
            "setax",
            "ptax_amc",
            "niit",
            "eitc",
            "c11070",
            "iitax",
        ]
    }
    out: dict[str, dict[str, Any]] = {}
    for k, s in enumerate(scenarios):
        out[s["id"]] = {
            "taxable_ss": a["c02500"][k],
            "agi": a["c00100"][k],
            "standard_deduction": a["standard"][k],
            "qbid": a["qbided"][k],
            "senior_deduction": a["senior_deduction"][k],
            "taxable_income": a["c04800"][k],
            "regular_tax": a["taxbc"][k],
            "amt": a["c09600"][k],
            "nonrefundable_ctc_odc": a["c07220"][k] + a["odc"][k],
            "se_tax": a["setax"][k],
            "additional_medicare": a["ptax_amc"][k],
            "niit": a["niit"][k],
            "eitc": a["eitc"][k],
            "actc": a["c11070"][k],
            "net_income_tax": a["iitax"][k],
        }
    return out
