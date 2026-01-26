import {
  Address,
  F1098,
  FilingStatus,
  Income1099B,
  Income1099Div,
  Income1099Int,
  Income1099NEC,
  Income1099R,
  Income1099SSA,
  Income1099Type,
  IncomeW2,
  Information,
  Property,
  PropertyExpenseTypeName,
  PropertyTypeName,
  PersonRole,
  Person,
  State,
  PlanType1099,
  PrimaryPerson,
  Spouse,
  Dependent,
  Supported1099,
  TaxPayer,
  TaxYear,
  InformationSources
} from 'ustaxes/core/data'

export type ReturnPayload = {
  taxYear: TaxYear
  information: ReturnInformation
}

type ReturnInformation = {
  taxPayer?: PrefillTaxPayer
  w2s?: PrefillW2[]
  f1099s?: Prefill1099[]
  f1098s?: PrefillF1098[]
  realEstate?: PrefillRentalProperty[]
  sources?: InformationSources
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
  state?: State
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
  }
}

type Prefill1099SSA = Prefill1099Base & {
  type: Income1099Type.SSA
  form: {
    netBenefits: number
    federalIncomeTaxWithheld: number
  }
}

type Prefill1099NEC = Prefill1099Base & {
  type: Income1099Type.NEC
  form: {
    nonemployeeCompensation: number
  }
}

type Prefill1099 =
  | Prefill1099Int
  | Prefill1099Div
  | Prefill1099B
  | Prefill1099R
  | Prefill1099SSA
  | Prefill1099NEC

type PrefillF1098 = {
  lender: string
  interest: number
  points?: number
  mortgageInsurancePremiums?: number
}

type PrefillRentalProperty = {
  address: Address
  rentalDays: number
  personalUseDays: number
  rentReceived: number
  propertyType: PropertyTypeName
  isPassive?: boolean
  otherPropertyType?: string
  qualifiedJointVenture: boolean
  expenses: Partial<{ [K in PropertyExpenseTypeName]: number }>
  otherExpenseType?: string
}

const cleanSsid = (ssid: string): string => ssid.replace(/-/g, '')

const formatDate = (value: Date): string => value.toISOString().split('T')[0]

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

const mapPersonToPrefill = (
  person: Person<Date>,
  extras?: Partial<PrefillPerson>
): PrefillPerson => ({
  firstName: person.firstName,
  lastName: person.lastName,
  ssid: person.ssid,
  role: person.role,
  isBlind: person.isBlind,
  dateOfBirth: formatDate(person.dateOfBirth),
  ...extras
})

const mapPrimaryToPrefill = (person: PrimaryPerson<Date>): PrefillPerson => ({
  ...mapPersonToPrefill(person, {
    address: person.address,
    isTaxpayerDependent: person.isTaxpayerDependent
  })
})

const mapSpouseToPrefill = (person: Spouse<Date>): PrefillPerson => ({
  ...mapPersonToPrefill(person, {
    isTaxpayerDependent: person.isTaxpayerDependent
  })
})

const mapDependentToPrefill = (person: Dependent<Date>): PrefillDependent => ({
  ...mapPersonToPrefill(person),
  relationship: person.relationship,
  qualifyingInfo: person.qualifyingInfo
    ? {
        numberOfMonths: person.qualifyingInfo.numberOfMonths,
        isStudent: person.qualifyingInfo.isStudent
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
    case Income1099Type.NEC:
      return {
        type: Income1099Type.NEC,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          nonemployeeCompensation: f1099.form.nonemployeeCompensation
        }
      } as Income1099NEC
    default:
      return f1099 as Supported1099
  }
}

const mapW2ToPrefill = (w2: IncomeW2): PrefillW2 => ({
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

const map1099ToPrefill = (f1099: Supported1099): Prefill1099 => {
  switch (f1099.type) {
    case Income1099Type.INT:
      return {
        type: Income1099Type.INT,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: { income: f1099.form.income }
      }
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
      }
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
      }
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
      }
    case Income1099Type.SSA:
      return {
        type: Income1099Type.SSA,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          netBenefits: f1099.form.netBenefits,
          federalIncomeTaxWithheld: f1099.form.federalIncomeTaxWithheld
        }
      }
    case Income1099Type.NEC:
      return {
        type: Income1099Type.NEC,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: { nonemployeeCompensation: f1099.form.nonemployeeCompensation }
      }
    default:
      return f1099 as Prefill1099
  }
}

const mapF1098 = (f1098: PrefillF1098): F1098 => ({
  lender: f1098.lender,
  interest: f1098.interest,
  points: f1098.points,
  mortgageInsurancePremiums: f1098.mortgageInsurancePremiums
})

const mapRentalProperty = (property: PrefillRentalProperty): Property => ({
  address: property.address,
  rentalDays: property.rentalDays,
  personalUseDays: property.personalUseDays,
  rentReceived: property.rentReceived,
  propertyType: property.propertyType,
  isPassive: property.isPassive,
  otherPropertyType: property.otherPropertyType,
  qualifiedJointVenture: property.qualifiedJointVenture,
  expenses: property.expenses,
  otherExpenseType: property.otherExpenseType
})

const mapF1098ToPrefill = (f1098: F1098): PrefillF1098 => ({
  lender: f1098.lender,
  interest: f1098.interest,
  points: f1098.points,
  mortgageInsurancePremiums: f1098.mortgageInsurancePremiums
})

const mapRentalPropertyToPrefill = (
  property: Property
): PrefillRentalProperty => ({
  address: property.address,
  rentalDays: property.rentalDays,
  personalUseDays: property.personalUseDays,
  rentReceived: property.rentReceived,
  propertyType: property.propertyType,
  isPassive: property.isPassive,
  otherPropertyType: property.otherPropertyType,
  qualifiedJointVenture: property.qualifiedJointVenture,
  expenses: property.expenses,
  otherExpenseType: property.otherExpenseType
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

export const applyReturnPayload = (
  info: Information,
  prefill: ReturnPayload
): Information => {
  const payload = prefill.information
  const nextInfo: Information = {
    ...info,
    taxPayer: payload.taxPayer
      ? mapTaxPayer(info.taxPayer, payload.taxPayer)
      : info.taxPayer,
    w2s: payload.w2s ? payload.w2s.map(mapW2) : info.w2s,
    f1099s: payload.f1099s ? payload.f1099s.map(map1099) : info.f1099s,
    f1098s: payload.f1098s ? payload.f1098s.map(mapF1098) : info.f1098s,
    realEstate: payload.realEstate
      ? payload.realEstate.map(mapRentalProperty)
      : info.realEstate
  }

  const nextSources = payload.sources
    ? {
        ...(info.sources ?? {}),
        ...payload.sources
      }
    : info.sources

  return {
    ...nextInfo,
    sources: nextSources
  }
}

export const buildReturnPayload = (
  info: Information,
  taxYear: TaxYear
): ReturnPayload => {
  const information: ReturnInformation = {
    taxPayer: {
      filingStatus: info.taxPayer.filingStatus,
      primaryPerson: info.taxPayer.primaryPerson
        ? mapPrimaryToPrefill(info.taxPayer.primaryPerson)
        : undefined,
      spouse: info.taxPayer.spouse
        ? mapSpouseToPrefill(info.taxPayer.spouse)
        : undefined,
      dependents: info.taxPayer.dependents.map(mapDependentToPrefill),
      contactEmail: info.taxPayer.contactEmail,
      contactPhoneNumber: info.taxPayer.contactPhoneNumber
    },
    w2s: info.w2s.map(mapW2ToPrefill),
    f1099s: info.f1099s.map(map1099ToPrefill),
    f1098s: info.f1098s.map(mapF1098ToPrefill),
    realEstate: info.realEstate.map(mapRentalPropertyToPrefill),
    sources: info.sources
  }

  return {
    taxYear,
    information
  }
}
