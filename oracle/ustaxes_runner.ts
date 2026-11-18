/**
 * Runs engine-neutral oracle scenarios through the UsTaxes Y2025 engine.
 *
 * Usage (from the repo root):
 *   ts-node -r tsconfig-paths/register oracle/ustaxes_runner.ts <in.json> <out.json>
 *
 * <in.json> is a list of scenarios as produced by oracle/scenarios.py.
 * <out.json> maps scenario id to the comparison fields (see FIELDS in
 * oracle/compare.py), or to {"error": "..."} if UsTaxes rejected or threw.
 */

import { readFileSync, writeFileSync } from 'fs'
import type {
  Dependent,
  IncomeW2,
  Information,
  SelfEmployedIncome,
  Supported1099
} from 'ustaxes/core/data'
import {
  FilingStatus,
  Income1099Type,
  PersonRole,
  PlanType1099
} from 'ustaxes/core/data'
import { create1040 } from 'ustaxes/forms/Y2025/irsForms/Main'
import { isLeft } from 'ustaxes/core/util'

// Mirrors the scenario format documented in oracle/scenarios.py.
interface PersonFacts {
  age: number
  blind: boolean
}
interface Scenario {
  id: string
  filingStatus: keyof typeof FilingStatus
  primary: PersonFacts
  spouse: PersonFacts | null
  dependents: { age: number; student: boolean }[]
  income: {
    wagesPrimary: number
    wagesSpouse: number
    sePrimary: number
    seSpouse: number
    interest: number
    ordinaryDividends: number
    qualifiedDividends: number
    capGainDistributions: number
    shortTermGain: number
    longTermGain: number
    taxablePension: number
    unemployment: number
    ssPrimary: number
    ssSpouse: number
  }
}

const TAX_YEAR = 2025
// Social Security wage base for 2025 (SSA announcement, Oct 2024).
const SS_WAGE_BASE = 176100

// Born on 1 July so the age at 31 December 2025 is exactly `age`.
const dob = (age: number): Date => new Date(TAX_YEAR - age, 6, 1)

const address = {
  address: '1 Main St',
  city: 'Austin',
  state: 'TX' as const,
  zip: '78701'
}

const w2 = (role: PersonRole.PRIMARY | PersonRole.SPOUSE, wages: number) => {
  const ss = Math.min(wages, SS_WAGE_BASE)
  const w: IncomeW2 = {
    occupation: 'worker',
    income: wages,
    medicareIncome: wages,
    fedWithholding: 0,
    ssWages: ss,
    ssWithholding: Math.round(ss * 0.062 * 100) / 100,
    medicareWithholding: Math.round(wages * 0.0145 * 100) / 100,
    employer: { EIN: '111111111', employerName: 'Employer' },
    personRole: role,
    state: 'TX',
    stateWages: wages,
    stateWithholding: 0
  }
  return w
}

const BASIS = 100000

export const toInformation = (s: Scenario): Information => {
  const inc = s.income
  const fs = FilingStatus[s.filingStatus]
  const P = PersonRole.PRIMARY
  const S = PersonRole.SPOUSE

  const w2s: IncomeW2[] = []
  if (inc.wagesPrimary > 0) w2s.push(w2(P, inc.wagesPrimary))
  if (inc.wagesSpouse > 0) w2s.push(w2(S, inc.wagesSpouse))

  const f1099s: Supported1099[] = []
  if (inc.interest > 0) {
    f1099s.push({
      payer: 'Bank',
      type: Income1099Type.INT,
      personRole: P,
      form: { income: inc.interest }
    })
  }
  if (inc.ordinaryDividends > 0 || inc.capGainDistributions > 0) {
    f1099s.push({
      payer: 'Fund',
      type: Income1099Type.DIV,
      personRole: P,
      form: {
        dividends: inc.ordinaryDividends,
        qualifiedDividends: inc.qualifiedDividends,
        totalCapitalGainsDistributions: inc.capGainDistributions
      }
    })
  }
  if (inc.shortTermGain !== 0 || inc.longTermGain !== 0) {
    f1099s.push({
      payer: 'Broker',
      type: Income1099Type.B,
      personRole: P,
      form: {
        shortTermProceeds:
          inc.shortTermGain === 0 ? 0 : BASIS + inc.shortTermGain,
        shortTermCostBasis: inc.shortTermGain === 0 ? 0 : BASIS,
        longTermProceeds: inc.longTermGain === 0 ? 0 : BASIS + inc.longTermGain,
        longTermCostBasis: inc.longTermGain === 0 ? 0 : BASIS
      }
    })
  }
  if (inc.taxablePension > 0) {
    f1099s.push({
      payer: 'Pension plan',
      type: Income1099Type.R,
      personRole: P,
      form: {
        grossDistribution: inc.taxablePension,
        taxableAmount: inc.taxablePension,
        federalIncomeTaxWithheld: 0,
        planType: PlanType1099.Pension
      }
    })
  }
  for (const [role, amt] of [
    [P, inc.ssPrimary],
    [S, inc.ssSpouse]
  ] as const) {
    if (amt > 0) {
      f1099s.push({
        payer: 'SSA',
        type: Income1099Type.SSA,
        personRole: role,
        form: { netBenefits: amt, federalIncomeTaxWithheld: 0 }
      })
    }
  }

  const selfEmployedIncome: SelfEmployedIncome[] = []
  if (inc.sePrimary > 0) {
    selfEmployedIncome.push({
      personRole: P,
      grossReceipts: inc.sePrimary,
      expenses: 0
    })
  }
  if (inc.seSpouse > 0) {
    selfEmployedIncome.push({
      personRole: S,
      grossReceipts: inc.seSpouse,
      expenses: 0
    })
  }

  const dependents: Dependent[] = s.dependents.map((d, i) => ({
    firstName: `child${i}`,
    lastName: 'filer',
    ssid: `22222222${i}`,
    role: PersonRole.DEPENDENT,
    isBlind: false,
    dateOfBirth: dob(d.age),
    relationship: 'son',
    qualifyingInfo: { numberOfMonths: 12, isStudent: d.student }
  }))

  // MFS: the 1040 needs the spouse's identity. Their age is kept under 65 so
  // the spouse never adds to the standard deduction (see oracle/README.md).
  const spouseFacts =
    s.spouse ??
    (fs === FilingStatus.MFS ? { age: 40, blind: false } : undefined)

  return {
    f1099s,
    w2s,
    realEstate: [],
    estimatedTaxes: [],
    f1098es: [],
    f3921s: [],
    scheduleK1Form1065s: [],
    itemizedDeductions: undefined,
    taxPayer: {
      filingStatus: fs,
      primaryPerson: {
        firstName: 'primary',
        lastName: 'filer',
        ssid: '111111111',
        role: P,
        isBlind: s.primary.blind,
        dateOfBirth: dob(s.primary.age),
        address,
        isTaxpayerDependent: false
      },
      spouse: spouseFacts
        ? {
            firstName: 'spouse',
            lastName: 'filer',
            ssid: '333333333',
            role: S,
            isBlind: spouseFacts.blind,
            dateOfBirth: dob(spouseFacts.age),
            isTaxpayerDependent: false
          }
        : undefined,
      dependents
    },
    // MFS scenarios mean "lived apart from the spouse all year": that is the
    // only MFS case Tax-Calculator can represent (see oracle/README.md).
    questions: fs === FilingStatus.MFS ? { LIVE_APART_FROM_SPOUSE: true } : {},
    credits: [],
    stateResidencies: [{ state: 'TX' }],
    healthSavingsAccounts: [],
    individualRetirementArrangements: [],
    selfEmployedIncome,
    otherIncome:
      inc.unemployment > 0
        ? { unemploymentCompensation: inc.unemployment }
        : undefined
  }
}

const n = (x: number | undefined): number => x ?? 0

const run = (s: Scenario): Record<string, number | string> => {
  const result = create1040(toInformation(s), [])
  if (isLeft(result)) {
    return { error: `validation: ${result.left.join(', ')}` }
  }
  const [f] = result.right
  const seTax = n(f.schedule2.l4())
  const addlMedicare = n(f.schedule2.l11())
  const niit = n(f.schedule2.l12())
  const eitc = n(f.l27a())
  const actc = n(f.l28())
  return {
    total_income: f.l9(),
    taxable_ss: n(f.l6b()),
    agi: f.l11a(),
    standard_deduction: f.l12e(),
    qbid: n(f.l13a()),
    senior_deduction: n(f.l13b()),
    taxable_income: f.l15(),
    regular_tax: n(f.l16()),
    amt: n(f.f6251.l11()),
    nonrefundable_ctc_odc: n(f.l19()),
    se_tax: seTax,
    additional_medicare: addlMedicare,
    niit,
    eitc,
    actc,
    // Federal income tax net of refundable credits, excluding SE tax and
    // Additional Medicare Tax (which the oracles book as payroll taxes).
    net_income_tax: f.l24() - seTax - addlMedicare - eitc - actc
  }
}

const main = () => {
  const [, , inPath, outPath] = process.argv
  if (!inPath || !outPath) {
    console.error('Usage: ustaxes_runner.ts <in.json> <out.json>')
    process.exit(1)
  }
  // Form classes log noisy warnings; keep stdout/stderr for real problems.
  console.warn = () => undefined
  const scenarios = JSON.parse(readFileSync(inPath, 'utf8')) as Scenario[]
  const out: Record<string, unknown> = {}
  for (const s of scenarios) {
    try {
      out[s.id] = run(s)
    } catch (e) {
      out[s.id] = { error: `exception: ${(e as Error).message}` }
    }
  }
  writeFileSync(outPath, JSON.stringify(out, null, 1))
}

main()
