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
  PersonRole,
  PlanType1099,
  PrimaryPerson,
  Spouse,
  Dependent,
  Supported1099,
  TaxPayer,
  TaxYear,
  DataSource,
  InformationSources
} from 'ustaxes/core/data'
import { setSource } from 'ustaxes/core/data/sources'

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

type SourceTagged<T> = T & Record<string, unknown>

const parseSource = (value: unknown): DataSource | undefined =>
  value === 'transcript' || value === 'return' || value === 'user'
    ? value
    : undefined

const sourceFor = (
  obj: Record<string, unknown> | undefined,
  field: string
): DataSource | undefined => parseSource(obj?.[`${field}_source`])

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

const buildSources = (prefill: TranscriptPrefill): InformationSources => {
  let sources: InformationSources = {}
  const taxPayer = prefill.taxPayer as SourceTagged<PrefillTaxPayer>
  const taxPayerRecord = taxPayer as Record<string, unknown>

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

  const primary = taxPayer.primaryPerson as
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
    const address = primary.address as Record<string, unknown> | undefined
    if (address) {
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'address'],
        sourceFor(address, 'address')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'city'],
        sourceFor(address, 'city')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'state'],
        sourceFor(address, 'state')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'zip'],
        sourceFor(address, 'zip')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'aptNo'],
        sourceFor(address, 'aptNo')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'foreignCountry'],
        sourceFor(address, 'foreignCountry')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'province'],
        sourceFor(address, 'province')
      )
      sources = setSource(
        sources,
        ['taxPayer', 'primaryPerson', 'address', 'postalCode'],
        sourceFor(address, 'postalCode')
      )
    }
  }

  const spouse = taxPayer.spouse as SourceTagged<PrefillPerson> | undefined
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

  if (taxPayer.dependents) {
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
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'taxableAmountNotDetermined'],
            sourceFor(formRecord, 'taxableAmountNotDetermined')
          )
          sources = setSource(
            sources,
            ['f1099s', index, 'form', 'totalDistribution'],
            sourceFor(formRecord, 'totalDistribution')
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

  return sources
}

export const applyTranscriptPrefill = (
  info: Information,
  prefill: TranscriptPrefill
): Information => {
  const nextInfo: Information = {
    ...info,
    taxPayer: mapTaxPayer(info.taxPayer, prefill.taxPayer),
    w2s: prefill.w2s ? prefill.w2s.map(mapW2) : info.w2s,
    f1099s: prefill.f1099s ? prefill.f1099s.map(map1099) : info.f1099s,
    f1098s: prefill.f1098s ? prefill.f1098s.map(mapF1098) : info.f1098s
  }

  const importedSources = buildSources(prefill)
  const existingSources = info.sources ?? {}
  const nextSources: InformationSources = {
    ...existingSources,
    taxPayer: importedSources.taxPayer,
    ...(prefill.w2s !== undefined ? { w2s: importedSources.w2s } : {}),
    ...(prefill.f1099s !== undefined ? { f1099s: importedSources.f1099s } : {}),
    ...(prefill.f1098s !== undefined ? { f1098s: importedSources.f1098s } : {})
  }

  return {
    ...nextInfo,
    sources: nextSources
  }
}
