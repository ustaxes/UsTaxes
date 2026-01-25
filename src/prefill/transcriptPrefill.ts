import {
  Address,
  F1098,
  FilingStatus,
  Income1099B,
  Income1099Div,
  Income1099Int,
  Income1099R,
  Income1099SSA,
  Income1099Type,
  IncomeW2,
  Information,
  PersonRole,
  PlanType1099,
  PrimaryPerson,
  Spouse,
  Dependent,
  Supported1099,
  TaxPayer,
  TaxYear
} from 'ustaxes/core/data'

export type TranscriptPrefill = {
  taxYear: TaxYear
  source?: string
  createdAt?: string
  taxPayer: PrefillTaxPayer
  w2s?: PrefillW2[]
  f1099s?: Prefill1099[]
  f1098s?: PrefillF1098[]
}

type PrefillPerson = {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
  isBlind: boolean
  dateOfBirth: string
  address?: Address
  isTaxpayerDependent?: boolean
}

type PrefillDependent = PrefillPerson & {
  relationship: string
  qualifyingInfo?: {
    numberOfMonths?: number
    isStudent?: boolean
  }
}

type PrefillTaxPayer = {
  filingStatus?: FilingStatus
  primaryPerson?: PrefillPerson
  spouse?: PrefillPerson
  dependents?: PrefillDependent[]
  contactEmail?: string
  contactPhoneNumber?: string
}

type PrefillEmployer = {
  EIN?: string
  employerName?: string
  address?: Address
}

type PrefillW2 = {
  occupation: string
  income: number
  medicareIncome: number
  fedWithholding: number
  ssWages: number
  ssWithholding: number
  medicareWithholding: number
  employer?: PrefillEmployer
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  state?: string
  stateWages?: number
  stateWithholding?: number
  box12?: Record<string, number>
}

type Prefill1099Base = {
  payer: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  type: Income1099Type
}

type Prefill1099Int = Prefill1099Base & {
  type: Income1099Type.INT
  form: {
    income: number
  }
}

type Prefill1099Div = Prefill1099Base & {
  type: Income1099Type.DIV
  form: {
    dividends: number
    qualifiedDividends: number
    totalCapitalGainsDistributions: number
  }
}

type Prefill1099B = Prefill1099Base & {
  type: Income1099Type.B
  form: {
    shortTermProceeds: number
    shortTermCostBasis: number
    longTermProceeds: number
    longTermCostBasis: number
  }
}

type Prefill1099R = Prefill1099Base & {
  type: Income1099Type.R
  form: {
    grossDistribution: number
    taxableAmount: number
    federalIncomeTaxWithheld: number
    planType: PlanType1099
    taxableAmountNotDetermined?: boolean
    totalDistribution?: boolean
  }
}

type Prefill1099SSA = Prefill1099Base & {
  type: Income1099Type.SSA
  form: {
    netBenefits: number
    federalIncomeTaxWithheld: number
  }
}

type Prefill1099 =
  | Prefill1099Int
  | Prefill1099Div
  | Prefill1099B
  | Prefill1099R
  | Prefill1099SSA

type PrefillF1098 = {
  lender: string
  interest: number
  points?: number
  mortgageInsurancePremiums?: number
}

const cleanSsid = (ssid: string): string => ssid.replace(/-/g, '')

const mapPrimaryPerson = (
  person: PrefillPerson,
  fallbackAddress?: Address
): PrimaryPerson<Date> | undefined => {
  const address = person.address ?? fallbackAddress
  if (address === undefined) {
    return undefined
  }
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    ssid: cleanSsid(person.ssid),
    role: PersonRole.PRIMARY,
    isBlind: person.isBlind,
    dateOfBirth: new Date(person.dateOfBirth),
    address,
    isTaxpayerDependent: person.isTaxpayerDependent ?? false
  }
}

const mapSpouse = (person: PrefillPerson): Spouse<Date> => ({
  firstName: person.firstName,
  lastName: person.lastName,
  ssid: cleanSsid(person.ssid),
  role: PersonRole.SPOUSE,
  isBlind: person.isBlind,
  dateOfBirth: new Date(person.dateOfBirth),
  isTaxpayerDependent: person.isTaxpayerDependent ?? false
})

const mapDependent = (person: PrefillDependent): Dependent<Date> => ({
  firstName: person.firstName,
  lastName: person.lastName,
  ssid: cleanSsid(person.ssid),
  role: PersonRole.DEPENDENT,
  isBlind: person.isBlind,
  dateOfBirth: new Date(person.dateOfBirth),
  relationship: person.relationship,
  qualifyingInfo: person.qualifyingInfo
    ? {
        numberOfMonths: person.qualifyingInfo.numberOfMonths ?? 0,
        isStudent: person.qualifyingInfo.isStudent ?? false
      }
    : undefined
})

const mapW2 = (w2: PrefillW2): IncomeW2 => ({
  occupation: w2.occupation,
  income: w2.income,
  medicareIncome: w2.medicareIncome,
  fedWithholding: w2.fedWithholding,
  ssWages: w2.ssWages,
  ssWithholding: w2.ssWithholding,
  medicareWithholding: w2.medicareWithholding,
  employer: w2.employer
    ? {
        EIN: w2.employer.EIN,
        employerName: w2.employer.employerName,
        address: w2.employer.address
      }
    : undefined,
  personRole: w2.personRole,
  state: w2.state,
  stateWages: w2.stateWages,
  stateWithholding: w2.stateWithholding,
  box12: w2.box12
})

const map1099 = (f1099: Prefill1099): Supported1099 => {
  switch (f1099.type) {
    case Income1099Type.INT:
      return {
        type: Income1099Type.INT,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: { income: f1099.form.income }
      } as Income1099Int
    case Income1099Type.DIV:
      return {
        type: Income1099Type.DIV,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          dividends: f1099.form.dividends,
          qualifiedDividends: f1099.form.qualifiedDividends,
          totalCapitalGainsDistributions:
            f1099.form.totalCapitalGainsDistributions
        }
      } as Income1099Div
    case Income1099Type.B:
      return {
        type: Income1099Type.B,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          shortTermProceeds: f1099.form.shortTermProceeds,
          shortTermCostBasis: f1099.form.shortTermCostBasis,
          longTermProceeds: f1099.form.longTermProceeds,
          longTermCostBasis: f1099.form.longTermCostBasis
        }
      } as Income1099B
    case Income1099Type.R:
      return {
        type: Income1099Type.R,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          grossDistribution: f1099.form.grossDistribution,
          taxableAmount: f1099.form.taxableAmount,
          federalIncomeTaxWithheld: f1099.form.federalIncomeTaxWithheld,
          planType: f1099.form.planType
        }
      } as Income1099R
    case Income1099Type.SSA:
      return {
        type: Income1099Type.SSA,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          netBenefits: f1099.form.netBenefits,
          federalIncomeTaxWithheld: f1099.form.federalIncomeTaxWithheld
        }
      } as Income1099SSA
    default:
      return f1099 as Supported1099
  }
}

const mapF1098 = (f1098: PrefillF1098): F1098 => ({
  lender: f1098.lender,
  interest: f1098.interest,
  points: f1098.points,
  mortgageInsurancePremiums: f1098.mortgageInsurancePremiums
})

const mapTaxPayer = (
  existing: TaxPayer<Date>,
  prefill: PrefillTaxPayer
): TaxPayer<Date> => {
  const nextPrimary =
    prefill.primaryPerson === undefined
      ? existing.primaryPerson
      : mapPrimaryPerson(
          prefill.primaryPerson,
          existing.primaryPerson?.address
        ) ?? existing.primaryPerson

  const nextSpouse =
    prefill.spouse === undefined ? existing.spouse : mapSpouse(prefill.spouse)

  const nextDependents =
    prefill.dependents === undefined
      ? existing.dependents
      : prefill.dependents.map(mapDependent)

  return {
    ...existing,
    filingStatus: prefill.filingStatus ?? existing.filingStatus,
    primaryPerson: nextPrimary,
    spouse: nextSpouse,
    dependents: nextDependents,
    contactEmail: prefill.contactEmail ?? existing.contactEmail,
    contactPhoneNumber:
      prefill.contactPhoneNumber ?? existing.contactPhoneNumber
  }
}

export const applyTranscriptPrefill = (
  info: Information,
  prefill: TranscriptPrefill
): Information => ({
  ...info,
  taxPayer: mapTaxPayer(info.taxPayer, prefill.taxPayer),
  w2s: prefill.w2s ? prefill.w2s.map(mapW2) : info.w2s,
  f1099s: prefill.f1099s ? prefill.f1099s.map(map1099) : info.f1099s,
  f1098s: prefill.f1098s ? prefill.f1098s.map(mapF1098) : info.f1098s
})
