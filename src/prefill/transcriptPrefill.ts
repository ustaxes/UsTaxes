import {
  Address,
  F1098,
  FilingStatus,
  Income1099B,
  Income1099DA,
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
  InformationSources,
  DataSource,
  AdjustmentsToIncome
} from 'ustaxes/core/data'
import { getSource, setSource } from 'ustaxes/core/data/sources'

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
  adjustments?: PrefillAdjustments
  sources?: InformationSources
}

type SourceTagged<T> = T & Record<string, unknown>

const parseSource = (value: unknown): DataSource | undefined =>
  typeof value === 'string' ? (value as DataSource) : undefined

const sourceFor = (
  obj: Record<string, unknown> | undefined,
  field: string
): DataSource | undefined => parseSource(obj?.[`${field}_source`])

const tagField = (
  obj: Record<string, unknown>,
  field: string,
  source: DataSource | undefined
): void => {
  if (source !== undefined) {
    obj[`${field}_source`] = source
  }
}

const stripSourceFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => stripSourceFields(item))
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const record = value as Record<string, unknown>
    const next = Object.entries(record).reduce<Record<string, unknown>>(
      (acc, [key, val]) => {
        if (key === 'sources') {
          acc[key] = val
          return acc
        }
        if (key.endsWith('_source')) {
          return acc
        }
        acc[key] = stripSourceFields(val)
        return acc
      },
      {}
    )
    return next
  }
  return value
}

type PrefillPerson = {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
  isBlind: boolean
  dateOfBirth: string | null
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

type Prefill1099DA = Prefill1099Base & {
  type: Income1099Type.DA
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
  | Prefill1099DA
  | Prefill1099R
  | Prefill1099SSA
  | Prefill1099NEC

type PrefillF1098 = {
  lender: string
  interest: number
  points?: number
  mortgageInsurancePremiums?: number
}

type PrefillAdjustments = {
  alimonyPaid?: number
  alimonyRecipientSsn?: string
  alimonyDivorceDate?: string | null
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

const formatDate = (value: Date | null | undefined): string | null =>
  value ? value.toISOString().split('T')[0] : null

const parseDate = (value: string | null | undefined): Date | undefined => {
  if (value === null || value === undefined || value.trim() === '') {
    return undefined
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const mapPrimaryPerson = (
  person: PrefillPerson,
  fallbackAddress?: Address,
  fallbackDate?: Date | null
): PrimaryPerson<Date> => {
  const address = person.address ?? fallbackAddress
  const dateOfBirth = parseDate(person.dateOfBirth) ?? fallbackDate
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    ssid: cleanSsid(person.ssid),
    role: PersonRole.PRIMARY,
    isBlind: person.isBlind,
    dateOfBirth,
    address,
    isTaxpayerDependent: person.isTaxpayerDependent ?? false
  }
}

const mapSpouse = (
  person: PrefillPerson,
  fallbackDate?: Date | null
): Spouse<Date> => {
  const dateOfBirth = parseDate(person.dateOfBirth) ?? fallbackDate
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    ssid: cleanSsid(person.ssid),
    role: PersonRole.SPOUSE,
    isBlind: person.isBlind,
    dateOfBirth,
    isTaxpayerDependent: person.isTaxpayerDependent ?? false
  }
}

const mapDependent = (
  person: PrefillDependent,
  fallback?: Dependent<Date>
): Dependent<Date> => {
  const dateOfBirth = parseDate(person.dateOfBirth) ?? fallback?.dateOfBirth
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    ssid: cleanSsid(person.ssid),
    role: PersonRole.DEPENDENT,
    isBlind: person.isBlind,
    dateOfBirth,
    relationship: person.relationship,
    qualifyingInfo: person.qualifyingInfo
      ? {
          numberOfMonths: person.qualifyingInfo.numberOfMonths ?? 0,
          isStudent: person.qualifyingInfo.isStudent ?? false
        }
      : undefined
  }
}

const mapAdjustments = (
  adjustments: PrefillAdjustments,
  fallback?: AdjustmentsToIncome<Date>
): AdjustmentsToIncome<Date> => ({
  alimonyPaid: adjustments.alimonyPaid ?? fallback?.alimonyPaid,
  alimonyRecipientSsn:
    adjustments.alimonyRecipientSsn ?? fallback?.alimonyRecipientSsn,
  alimonyDivorceDate:
    parseDate(adjustments.alimonyDivorceDate) ?? fallback?.alimonyDivorceDate
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
  relationship: person.relationship ?? '',
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
    case Income1099Type.DA:
      return {
        type: Income1099Type.DA,
        payer: f1099.payer,
        personRole: f1099.personRole,
        form: {
          shortTermProceeds: f1099.form.shortTermProceeds,
          shortTermCostBasis: f1099.form.shortTermCostBasis,
          longTermProceeds: f1099.form.longTermProceeds,
          longTermCostBasis: f1099.form.longTermCostBasis
        }
      } as Income1099DA
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
    case Income1099Type.DA:
      return {
        type: Income1099Type.DA,
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
          existing.primaryPerson?.address,
          existing.primaryPerson?.dateOfBirth
        ) ?? existing.primaryPerson

  const nextSpouse =
    prefill.spouse === undefined
      ? existing.spouse
      : mapSpouse(prefill.spouse, existing.spouse?.dateOfBirth)

  const nextDependents =
    prefill.dependents === undefined
      ? existing.dependents
      : prefill.dependents.map((dependent, index) =>
          mapDependent(dependent, existing.dependents[index])
        )

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

const buildSources = (prefill: ReturnInformation): InformationSources => {
  let sources: InformationSources = {}
  const taxPayer = prefill.taxPayer as SourceTagged<PrefillTaxPayer> | undefined
  const taxPayerRecord = taxPayer as Record<string, unknown> | undefined

  if (taxPayerRecord) {
    sources = setSource(
      sources,
      ['taxPayer', 'filingStatus'],
      sourceFor(taxPayerRecord, 'filingStatus')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'contactEmail'],
      sourceFor(taxPayerRecord, 'contactEmail')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'contactPhoneNumber'],
      sourceFor(taxPayerRecord, 'contactPhoneNumber')
    )
  }

  const primary = taxPayer?.primaryPerson as
    | SourceTagged<PrefillPerson>
    | undefined
  if (primary) {
    const primaryRecord = primary as Record<string, unknown>
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'firstName'],
      sourceFor(primaryRecord, 'firstName')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'lastName'],
      sourceFor(primaryRecord, 'lastName')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'ssid'],
      sourceFor(primaryRecord, 'ssid')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'role'],
      sourceFor(primaryRecord, 'role')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'isBlind'],
      sourceFor(primaryRecord, 'isBlind')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'dateOfBirth'],
      sourceFor(primaryRecord, 'dateOfBirth')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'primaryPerson', 'isTaxpayerDependent'],
      sourceFor(primaryRecord, 'isTaxpayerDependent')
    )
    const address = primary.address as
      | (Record<string, unknown> & Address)
      | undefined
    const addressRecord = address as unknown as
      | Record<string, unknown>
      | undefined
    if (addressRecord) {
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'address'],
        sourceFor(addressRecord, 'address')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'city'],
        sourceFor(addressRecord, 'city')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'state'],
        sourceFor(addressRecord, 'state')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'zip'],
        sourceFor(addressRecord, 'zip')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'aptNo'],
        sourceFor(addressRecord, 'aptNo')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'foreignCountry'],
        sourceFor(addressRecord, 'foreignCountry')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'province'],
        sourceFor(addressRecord, 'province')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'postalCode'],
        sourceFor(addressRecord, 'postalCode')
      )
    }
  }

  const spouse = taxPayer?.spouse as SourceTagged<PrefillPerson> | undefined
  if (spouse) {
    const spouseRecord = spouse as Record<string, unknown>
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'firstName'],
      sourceFor(spouseRecord, 'firstName')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'lastName'],
      sourceFor(spouseRecord, 'lastName')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'ssid'],
      sourceFor(spouseRecord, 'ssid')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'role'],
      sourceFor(spouseRecord, 'role')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'isBlind'],
      sourceFor(spouseRecord, 'isBlind')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'dateOfBirth'],
      sourceFor(spouseRecord, 'dateOfBirth')
    )
    sources = setSource(
      sources,
      ['taxPayer', 'spouse', 'isTaxpayerDependent'],
      sourceFor(spouseRecord, 'isTaxpayerDependent')
    )
  }

  if (taxPayer?.dependents) {
    taxPayer.dependents.forEach((dependent, index) => {
      const depRecord = dependent as Record<string, unknown>
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'firstName'],
        sourceFor(depRecord, 'firstName')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'lastName'],
        sourceFor(depRecord, 'lastName')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'ssid'],
        sourceFor(depRecord, 'ssid')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'role'],
        sourceFor(depRecord, 'role')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'isBlind'],
        sourceFor(depRecord, 'isBlind')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'dateOfBirth'],
        sourceFor(depRecord, 'dateOfBirth')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'dependents', index, 'relationship'],
        sourceFor(depRecord, 'relationship')
      )
      const qualifyingInfo = dependent.qualifyingInfo as
        | Record<string, unknown>
        | undefined
      if (qualifyingInfo) {
        sources = setSource(
          sources,
          ['taxPayer', 'dependents', index, 'qualifyingInfo', 'numberOfMonths'],
          sourceFor(qualifyingInfo, 'numberOfMonths')
        )
        sources = setSource(
          sources,
          ['taxPayer', 'dependents', index, 'qualifyingInfo', 'isStudent'],
          sourceFor(qualifyingInfo, 'isStudent')
        )
      }
    })
  }

  const adjustments = prefill.adjustments as
    | SourceTagged<PrefillAdjustments>
    | undefined
  if (adjustments) {
    const adjustmentsRecord = adjustments as Record<string, unknown>
    sources = setSource(
      sources,
      ['adjustments', 'alimonyPaid'],
      sourceFor(adjustmentsRecord, 'alimonyPaid')
    )
    sources = setSource(
      sources,
      ['adjustments', 'alimonyRecipientSsn'],
      sourceFor(adjustmentsRecord, 'alimonyRecipientSsn')
    )
    sources = setSource(
      sources,
      ['adjustments', 'alimonyDivorceDate'],
      sourceFor(adjustmentsRecord, 'alimonyDivorceDate')
    )
  }

  if (prefill.w2s) {
    prefill.w2s.forEach((w2, index) => {
      const w2Record = w2 as Record<string, unknown>
      sources = setSource(
        sources,
        ['w2s', index, 'occupation'],
        sourceFor(w2Record, 'occupation')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'income'],
        sourceFor(w2Record, 'income')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'medicareIncome'],
        sourceFor(w2Record, 'medicareIncome')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'fedWithholding'],
        sourceFor(w2Record, 'fedWithholding')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'ssWages'],
        sourceFor(w2Record, 'ssWages')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'ssWithholding'],
        sourceFor(w2Record, 'ssWithholding')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'medicareWithholding'],
        sourceFor(w2Record, 'medicareWithholding')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'personRole'],
        sourceFor(w2Record, 'personRole')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'state'],
        sourceFor(w2Record, 'state')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'stateWages'],
        sourceFor(w2Record, 'stateWages')
      )
      sources = setSource(
        sources,
        ['w2s', index, 'stateWithholding'],
        sourceFor(w2Record, 'stateWithholding')
      )
      const employer = w2.employer as Record<string, unknown> | undefined
      if (employer) {
        sources = setSource(
          sources,
          ['w2s', index, 'employer', 'EIN'],
          sourceFor(employer, 'EIN')
        )
        sources = setSource(
          sources,
          ['w2s', index, 'employer', 'employerName'],
          sourceFor(employer, 'employerName')
        )
      }
      const box12 = w2.box12 as Record<string, unknown> | undefined
      if (box12) {
        Object.keys(box12).forEach((code) => {
          if (code.endsWith('_source')) {
            return
          }
          sources = setSource(
            sources,
            ['w2s', index, 'box12', code],
            sourceFor(box12, code)
          )
        })
      }
    })
  }

  if (prefill.f1099s) {
    prefill.f1099s.forEach((f1099, index) => {
      const formRecord = f1099.form as Record<string, unknown>
      const f1099Record = f1099 as Record<string, unknown>
      sources = setSource(
        sources,
        ['f1099s', index, 'type'],
        sourceFor(f1099Record, 'type')
      )
      sources = setSource(
        sources,
        ['f1099s', index, 'payer'],
        sourceFor(f1099Record, 'payer')
      )
      sources = setSource(
        sources,
        ['f1099s', index, 'personRole'],
        sourceFor(f1099Record, 'personRole')
      )
      switch (f1099.type) {
        case Income1099Type.INT:
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'income'],
            sourceFor(formRecord, 'income')
          )
          break
        case Income1099Type.DIV:
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'dividends'],
            sourceFor(formRecord, 'dividends')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'qualifiedDividends'],
            sourceFor(formRecord, 'qualifiedDividends')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'totalCapitalGainsDistributions'],
            sourceFor(formRecord, 'totalCapitalGainsDistributions')
          )
          break
        case Income1099Type.B:
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'shortTermProceeds'],
            sourceFor(formRecord, 'shortTermProceeds')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'shortTermCostBasis'],
            sourceFor(formRecord, 'shortTermCostBasis')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'longTermProceeds'],
            sourceFor(formRecord, 'longTermProceeds')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'longTermCostBasis'],
            sourceFor(formRecord, 'longTermCostBasis')
          )
          break
        case Income1099Type.R:
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'grossDistribution'],
            sourceFor(formRecord, 'grossDistribution')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'taxableAmount'],
            sourceFor(formRecord, 'taxableAmount')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'federalIncomeTaxWithheld'],
            sourceFor(formRecord, 'federalIncomeTaxWithheld')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'planType'],
            sourceFor(formRecord, 'planType')
          )
          break
        case Income1099Type.SSA:
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'netBenefits'],
            sourceFor(formRecord, 'netBenefits')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'federalIncomeTaxWithheld'],
            sourceFor(formRecord, 'federalIncomeTaxWithheld')
          )
          break
        case Income1099Type.NEC:
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'nonemployeeCompensation'],
            sourceFor(formRecord, 'nonemployeeCompensation')
          )
          break
      }
    })
  }

  if (prefill.f1098s) {
    prefill.f1098s.forEach((f1098, index) => {
      const f1098Record = f1098 as Record<string, unknown>
      sources = setSource(
        sources,
        ['f1098s', index, 'lender'],
        sourceFor(f1098Record, 'lender')
      )
      sources = setSource(
        sources,
        ['f1098s', index, 'interest'],
        sourceFor(f1098Record, 'interest')
      )
      sources = setSource(
        sources,
        ['f1098s', index, 'points'],
        sourceFor(f1098Record, 'points')
      )
      sources = setSource(
        sources,
        ['f1098s', index, 'mortgageInsurancePremiums'],
        sourceFor(f1098Record, 'mortgageInsurancePremiums')
      )
    })
  }

  if (prefill.realEstate) {
    prefill.realEstate.forEach((property, index) => {
      const propertyRecord = property as Record<string, unknown>
      sources = setSource(
        sources,
        ['realEstate', index, 'rentalDays'],
        sourceFor(propertyRecord, 'rentalDays')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'personalUseDays'],
        sourceFor(propertyRecord, 'personalUseDays')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'rentReceived'],
        sourceFor(propertyRecord, 'rentReceived')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'propertyType'],
        sourceFor(propertyRecord, 'propertyType')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'isPassive'],
        sourceFor(propertyRecord, 'isPassive')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'otherPropertyType'],
        sourceFor(propertyRecord, 'otherPropertyType')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'qualifiedJointVenture'],
        sourceFor(propertyRecord, 'qualifiedJointVenture')
      )
      sources = setSource(
        sources,
        ['realEstate', index, 'otherExpenseType'],
        sourceFor(propertyRecord, 'otherExpenseType')
      )

      const addressRecord = property.address as
        | (Record<string, unknown> & Address)
        | undefined
      const address = addressRecord as unknown as
        | Record<string, unknown>
        | undefined
      if (address) {
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'address'],
          sourceFor(address, 'address')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'city'],
          sourceFor(address, 'city')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'state'],
          sourceFor(address, 'state')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'zip'],
          sourceFor(address, 'zip')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'aptNo'],
          sourceFor(address, 'aptNo')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'foreignCountry'],
          sourceFor(address, 'foreignCountry')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'province'],
          sourceFor(address, 'province')
        )
        sources = setSource(
          sources,
          ['realEstate', index, 'address', 'postalCode'],
          sourceFor(address, 'postalCode')
        )
      }

      const expensesRecord = property.expenses as
        | Record<string, unknown>
        | undefined
      if (expensesRecord) {
        const expenseFields: PropertyExpenseTypeName[] = [
          'advertising',
          'auto',
          'cleaning',
          'commissions',
          'insurance',
          'legal',
          'management',
          'mortgage',
          'otherInterest',
          'repairs',
          'supplies',
          'taxes',
          'utilities',
          'depreciation',
          'other'
        ]
        expenseFields.forEach((field) => {
          sources = setSource(
            sources,
            ['realEstate', index, 'expenses', field],
            sourceFor(expensesRecord, field)
          )
        })
      }
    })
  }

  return sources
}

const applySourcesToPrefill = (
  prefill: ReturnInformation,
  sources: InformationSources | undefined
): ReturnInformation => {
  if (sources === undefined) {
    return prefill
  }

  const adjustments = prefill.adjustments as Record<string, unknown> | undefined
  if (adjustments) {
    tagField(
      adjustments,
      'alimonyPaid',
      getSource(sources, ['adjustments', 'alimonyPaid'])
    )
    tagField(
      adjustments,
      'alimonyRecipientSsn',
      getSource(sources, ['adjustments', 'alimonyRecipientSsn'])
    )
    tagField(
      adjustments,
      'alimonyDivorceDate',
      getSource(sources, ['adjustments', 'alimonyDivorceDate'])
    )
  }

  const taxPayer = prefill.taxPayer as Record<string, unknown> | undefined
  if (taxPayer) {
    tagField(
      taxPayer,
      'filingStatus',
      getSource(sources, ['taxPayer', 'filingStatus'])
    )
    tagField(
      taxPayer,
      'contactEmail',
      getSource(sources, ['taxPayer', 'contactEmail'])
    )
    tagField(
      taxPayer,
      'contactPhoneNumber',
      getSource(sources, ['taxPayer', 'contactPhoneNumber'])
    )

    const primary = prefill.taxPayer?.primaryPerson as
      | Record<string, unknown>
      | undefined
    if (primary) {
      tagField(
        primary,
        'firstName',
        getSource(sources, ['taxPayer', 'primaryPerson', 'firstName'])
      )
      tagField(
        primary,
        'lastName',
        getSource(sources, ['taxPayer', 'primaryPerson', 'lastName'])
      )
      tagField(
        primary,
        'ssid',
        getSource(sources, ['taxPayer', 'primaryPerson', 'ssid'])
      )
      tagField(
        primary,
        'role',
        getSource(sources, ['taxPayer', 'primaryPerson', 'role'])
      )
      tagField(
        primary,
        'isBlind',
        getSource(sources, ['taxPayer', 'primaryPerson', 'isBlind'])
      )
      tagField(
        primary,
        'dateOfBirth',
        getSource(sources, ['taxPayer', 'primaryPerson', 'dateOfBirth'])
      )
      tagField(
        primary,
        'isTaxpayerDependent',
        getSource(sources, ['taxPayer', 'primaryPerson', 'isTaxpayerDependent'])
      )

      const address = primary.address as
        | (Record<string, unknown> & Address)
        | undefined
      const addressRecord = address as unknown as
        | Record<string, unknown>
        | undefined
      if (addressRecord) {
        tagField(
          addressRecord,
          'address',
          getSource(sources, [
            'taxPayer',
            'primaryPerson',
            'address',
            'address'
          ])
        )
        tagField(
          addressRecord,
          'city',
          getSource(sources, ['taxPayer', 'primaryPerson', 'address', 'city'])
        )
        tagField(
          addressRecord,
          'state',
          getSource(sources, ['taxPayer', 'primaryPerson', 'address', 'state'])
        )
        tagField(
          addressRecord,
          'zip',
          getSource(sources, ['taxPayer', 'primaryPerson', 'address', 'zip'])
        )
        tagField(
          addressRecord,
          'aptNo',
          getSource(sources, ['taxPayer', 'primaryPerson', 'address', 'aptNo'])
        )
        tagField(
          addressRecord,
          'foreignCountry',
          getSource(sources, [
            'taxPayer',
            'primaryPerson',
            'address',
            'foreignCountry'
          ])
        )
        tagField(
          addressRecord,
          'province',
          getSource(sources, [
            'taxPayer',
            'primaryPerson',
            'address',
            'province'
          ])
        )
        tagField(
          addressRecord,
          'postalCode',
          getSource(sources, [
            'taxPayer',
            'primaryPerson',
            'address',
            'postalCode'
          ])
        )
      }
    }

    const spouse = prefill.taxPayer?.spouse as
      | Record<string, unknown>
      | undefined
    if (spouse) {
      tagField(
        spouse,
        'firstName',
        getSource(sources, ['taxPayer', 'spouse', 'firstName'])
      )
      tagField(
        spouse,
        'lastName',
        getSource(sources, ['taxPayer', 'spouse', 'lastName'])
      )
      tagField(
        spouse,
        'ssid',
        getSource(sources, ['taxPayer', 'spouse', 'ssid'])
      )
      tagField(
        spouse,
        'role',
        getSource(sources, ['taxPayer', 'spouse', 'role'])
      )
      tagField(
        spouse,
        'isBlind',
        getSource(sources, ['taxPayer', 'spouse', 'isBlind'])
      )
      tagField(
        spouse,
        'dateOfBirth',
        getSource(sources, ['taxPayer', 'spouse', 'dateOfBirth'])
      )
      tagField(
        spouse,
        'isTaxpayerDependent',
        getSource(sources, ['taxPayer', 'spouse', 'isTaxpayerDependent'])
      )
    }

    if (prefill.taxPayer?.dependents) {
      prefill.taxPayer.dependents.forEach((dependent, index) => {
        const depRecord = dependent as Record<string, unknown>
        tagField(
          depRecord,
          'firstName',
          getSource(sources, ['taxPayer', 'dependents', index, 'firstName'])
        )
        tagField(
          depRecord,
          'lastName',
          getSource(sources, ['taxPayer', 'dependents', index, 'lastName'])
        )
        tagField(
          depRecord,
          'ssid',
          getSource(sources, ['taxPayer', 'dependents', index, 'ssid'])
        )
        tagField(
          depRecord,
          'role',
          getSource(sources, ['taxPayer', 'dependents', index, 'role'])
        )
        tagField(
          depRecord,
          'isBlind',
          getSource(sources, ['taxPayer', 'dependents', index, 'isBlind'])
        )
        tagField(
          depRecord,
          'dateOfBirth',
          getSource(sources, ['taxPayer', 'dependents', index, 'dateOfBirth'])
        )
        tagField(
          depRecord,
          'relationship',
          getSource(sources, ['taxPayer', 'dependents', index, 'relationship'])
        )
        const qualifyingInfo = dependent.qualifyingInfo as
          | Record<string, unknown>
          | undefined
        if (qualifyingInfo) {
          tagField(
            qualifyingInfo,
            'numberOfMonths',
            getSource(sources, [
              'taxPayer',
              'dependents',
              index,
              'qualifyingInfo',
              'numberOfMonths'
            ])
          )
          tagField(
            qualifyingInfo,
            'isStudent',
            getSource(sources, [
              'taxPayer',
              'dependents',
              index,
              'qualifyingInfo',
              'isStudent'
            ])
          )
        }
      })
    }
  }

  if (prefill.w2s) {
    prefill.w2s.forEach((w2, index) => {
      const w2Record = w2 as Record<string, unknown>
      tagField(
        w2Record,
        'occupation',
        getSource(sources, ['w2s', index, 'occupation'])
      )
      tagField(w2Record, 'income', getSource(sources, ['w2s', index, 'income']))
      tagField(
        w2Record,
        'medicareIncome',
        getSource(sources, ['w2s', index, 'medicareIncome'])
      )
      tagField(
        w2Record,
        'fedWithholding',
        getSource(sources, ['w2s', index, 'fedWithholding'])
      )
      tagField(
        w2Record,
        'ssWages',
        getSource(sources, ['w2s', index, 'ssWages'])
      )
      tagField(
        w2Record,
        'ssWithholding',
        getSource(sources, ['w2s', index, 'ssWithholding'])
      )
      tagField(
        w2Record,
        'medicareWithholding',
        getSource(sources, ['w2s', index, 'medicareWithholding'])
      )
      tagField(
        w2Record,
        'personRole',
        getSource(sources, ['w2s', index, 'personRole'])
      )
      tagField(w2Record, 'state', getSource(sources, ['w2s', index, 'state']))
      tagField(
        w2Record,
        'stateWages',
        getSource(sources, ['w2s', index, 'stateWages'])
      )
      tagField(
        w2Record,
        'stateWithholding',
        getSource(sources, ['w2s', index, 'stateWithholding'])
      )
      const employer = w2.employer as Record<string, unknown> | undefined
      if (employer) {
        tagField(
          employer,
          'EIN',
          getSource(sources, ['w2s', index, 'employer', 'EIN'])
        )
        tagField(
          employer,
          'employerName',
          getSource(sources, ['w2s', index, 'employer', 'employerName'])
        )
      }
      const box12 = w2.box12 as Record<string, unknown> | undefined
      if (box12) {
        Object.keys(box12).forEach((code) => {
          if (code.endsWith('_source')) {
            return
          }
          tagField(
            box12,
            code,
            getSource(sources, ['w2s', index, 'box12', code])
          )
        })
      }
    })
  }

  if (prefill.f1099s) {
    prefill.f1099s.forEach((f1099, index) => {
      const formRecord = f1099.form as Record<string, unknown>
      const f1099Record = f1099 as Record<string, unknown>
      tagField(
        f1099Record,
        'type',
        getSource(sources, ['f1099s', index, 'type'])
      )
      tagField(
        f1099Record,
        'payer',
        getSource(sources, ['f1099s', index, 'payer'])
      )
      tagField(
        f1099Record,
        'personRole',
        getSource(sources, ['f1099s', index, 'personRole'])
      )
      switch (f1099.type) {
        case Income1099Type.INT:
          tagField(
            formRecord,
            'income',
            getSource(sources, ['f1099s', index, 'form', 'income'])
          )
          break
        case Income1099Type.DIV:
          tagField(
            formRecord,
            'dividends',
            getSource(sources, ['f1099s', index, 'form', 'dividends'])
          )
          tagField(
            formRecord,
            'qualifiedDividends',
            getSource(sources, ['f1099s', index, 'form', 'qualifiedDividends'])
          )
          tagField(
            formRecord,
            'totalCapitalGainsDistributions',
            getSource(sources, [
              'f1099s',
              index,
              'form',
              'totalCapitalGainsDistributions'
            ])
          )
          break
        case Income1099Type.B:
          tagField(
            formRecord,
            'shortTermProceeds',
            getSource(sources, ['f1099s', index, 'form', 'shortTermProceeds'])
          )
          tagField(
            formRecord,
            'shortTermCostBasis',
            getSource(sources, ['f1099s', index, 'form', 'shortTermCostBasis'])
          )
          tagField(
            formRecord,
            'longTermProceeds',
            getSource(sources, ['f1099s', index, 'form', 'longTermProceeds'])
          )
          tagField(
            formRecord,
            'longTermCostBasis',
            getSource(sources, ['f1099s', index, 'form', 'longTermCostBasis'])
          )
          break
        case Income1099Type.R:
          tagField(
            formRecord,
            'grossDistribution',
            getSource(sources, ['f1099s', index, 'form', 'grossDistribution'])
          )
          tagField(
            formRecord,
            'taxableAmount',
            getSource(sources, ['f1099s', index, 'form', 'taxableAmount'])
          )
          tagField(
            formRecord,
            'federalIncomeTaxWithheld',
            getSource(sources, [
              'f1099s',
              index,
              'form',
              'federalIncomeTaxWithheld'
            ])
          )
          tagField(
            formRecord,
            'planType',
            getSource(sources, ['f1099s', index, 'form', 'planType'])
          )
          break
        case Income1099Type.SSA:
          tagField(
            formRecord,
            'netBenefits',
            getSource(sources, ['f1099s', index, 'form', 'netBenefits'])
          )
          tagField(
            formRecord,
            'federalIncomeTaxWithheld',
            getSource(sources, [
              'f1099s',
              index,
              'form',
              'federalIncomeTaxWithheld'
            ])
          )
          break
        case Income1099Type.NEC:
          tagField(
            formRecord,
            'nonemployeeCompensation',
            getSource(sources, [
              'f1099s',
              index,
              'form',
              'nonemployeeCompensation'
            ])
          )
          break
      }
    })
  }

  if (prefill.f1098s) {
    prefill.f1098s.forEach((f1098, index) => {
      const f1098Record = f1098 as Record<string, unknown>
      tagField(
        f1098Record,
        'lender',
        getSource(sources, ['f1098s', index, 'lender'])
      )
      tagField(
        f1098Record,
        'interest',
        getSource(sources, ['f1098s', index, 'interest'])
      )
      tagField(
        f1098Record,
        'points',
        getSource(sources, ['f1098s', index, 'points'])
      )
      tagField(
        f1098Record,
        'mortgageInsurancePremiums',
        getSource(sources, ['f1098s', index, 'mortgageInsurancePremiums'])
      )
    })
  }

  if (prefill.realEstate) {
    const expenseFields: PropertyExpenseTypeName[] = [
      'advertising',
      'auto',
      'cleaning',
      'commissions',
      'insurance',
      'legal',
      'management',
      'mortgage',
      'otherInterest',
      'repairs',
      'supplies',
      'taxes',
      'utilities',
      'depreciation',
      'other'
    ]
    prefill.realEstate.forEach((property, index) => {
      const propertyRecord = property as Record<string, unknown>
      tagField(
        propertyRecord,
        'rentalDays',
        getSource(sources, ['realEstate', index, 'rentalDays'])
      )
      tagField(
        propertyRecord,
        'personalUseDays',
        getSource(sources, ['realEstate', index, 'personalUseDays'])
      )
      tagField(
        propertyRecord,
        'rentReceived',
        getSource(sources, ['realEstate', index, 'rentReceived'])
      )
      tagField(
        propertyRecord,
        'propertyType',
        getSource(sources, ['realEstate', index, 'propertyType'])
      )
      tagField(
        propertyRecord,
        'isPassive',
        getSource(sources, ['realEstate', index, 'isPassive'])
      )
      tagField(
        propertyRecord,
        'otherPropertyType',
        getSource(sources, ['realEstate', index, 'otherPropertyType'])
      )
      tagField(
        propertyRecord,
        'qualifiedJointVenture',
        getSource(sources, ['realEstate', index, 'qualifiedJointVenture'])
      )
      tagField(
        propertyRecord,
        'otherExpenseType',
        getSource(sources, ['realEstate', index, 'otherExpenseType'])
      )
      const address = property.address as
        | (Record<string, unknown> & Address)
        | undefined
      const addressRecord = address as unknown as
        | Record<string, unknown>
        | undefined
      if (addressRecord) {
        tagField(
          addressRecord,
          'address',
          getSource(sources, ['realEstate', index, 'address', 'address'])
        )
        tagField(
          addressRecord,
          'city',
          getSource(sources, ['realEstate', index, 'address', 'city'])
        )
        tagField(
          addressRecord,
          'state',
          getSource(sources, ['realEstate', index, 'address', 'state'])
        )
        tagField(
          addressRecord,
          'zip',
          getSource(sources, ['realEstate', index, 'address', 'zip'])
        )
        tagField(
          addressRecord,
          'aptNo',
          getSource(sources, ['realEstate', index, 'address', 'aptNo'])
        )
        tagField(
          addressRecord,
          'foreignCountry',
          getSource(sources, ['realEstate', index, 'address', 'foreignCountry'])
        )
        tagField(
          addressRecord,
          'province',
          getSource(sources, ['realEstate', index, 'address', 'province'])
        )
        tagField(
          addressRecord,
          'postalCode',
          getSource(sources, ['realEstate', index, 'address', 'postalCode'])
        )
      }
      const expenses = property.expenses as Record<string, unknown> | undefined
      if (expenses) {
        expenseFields.forEach((field) => {
          tagField(
            expenses,
            field,
            getSource(sources, ['realEstate', index, 'expenses', field])
          )
        })
      }
    })
  }

  return prefill
}

export const applyReturnPayload = (
  info: Information,
  prefill: ReturnPayload
): Information => {
  const payload = prefill.information
  const importedSources = buildSources(payload)
  const sanitizedPayload = stripSourceFields(payload) as ReturnInformation
  const nextInfo: Information = {
    ...info,
    taxPayer: sanitizedPayload.taxPayer
      ? mapTaxPayer(info.taxPayer, sanitizedPayload.taxPayer)
      : info.taxPayer,
    w2s: sanitizedPayload.w2s ? sanitizedPayload.w2s.map(mapW2) : info.w2s,
    f1099s: sanitizedPayload.f1099s
      ? sanitizedPayload.f1099s.map(map1099)
      : info.f1099s,
    f1098s: sanitizedPayload.f1098s
      ? sanitizedPayload.f1098s.map(mapF1098)
      : info.f1098s,
    realEstate: sanitizedPayload.realEstate
      ? sanitizedPayload.realEstate.map(mapRentalProperty)
      : info.realEstate,
    adjustments: sanitizedPayload.adjustments
      ? mapAdjustments(sanitizedPayload.adjustments, info.adjustments)
      : info.adjustments
  }

  const nextSources: InformationSources = {
    ...(info.sources ?? {}),
    ...(payload.sources ?? {}),
    ...importedSources
  }

  const cleanedInfo = stripSourceFields(nextInfo) as Information

  return {
    ...cleanedInfo,
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
    adjustments: info.adjustments
      ? {
          alimonyPaid: info.adjustments.alimonyPaid,
          alimonyRecipientSsn: info.adjustments.alimonyRecipientSsn,
          alimonyDivorceDate: formatDate(info.adjustments.alimonyDivorceDate)
        }
      : undefined,
    sources: info.sources
  }

  return {
    taxYear,
    information: applySourcesToPrefill(information, info.sources)
  }
}
