import {
  DataSource,
  Dependent,
  F1098,
  Income1099Type,
  IncomeW2,
  PrimaryPerson,
  Spouse,
  Supported1099
} from 'ustaxes/core/data'
import { InformationSources } from 'ustaxes/core/data'
import { removeSourceIndex, setSource } from 'ustaxes/core/data/sources'

export const setW2Sources = (
  sources: InformationSources | undefined,
  index: number,
  w2: IncomeW2,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['w2s', index, 'occupation'], source)
  next = setSource(next, ['w2s', index, 'income'], source)
  next = setSource(next, ['w2s', index, 'medicareIncome'], source)
  next = setSource(next, ['w2s', index, 'fedWithholding'], source)
  next = setSource(next, ['w2s', index, 'ssWages'], source)
  next = setSource(next, ['w2s', index, 'ssWithholding'], source)
  next = setSource(next, ['w2s', index, 'medicareWithholding'], source)
  next = setSource(next, ['w2s', index, 'personRole'], source)
  next = setSource(next, ['w2s', index, 'state'], source)
  next = setSource(next, ['w2s', index, 'stateWages'], source)
  next = setSource(next, ['w2s', index, 'stateWithholding'], source)
  if (w2.employer) {
    next = setSource(next, ['w2s', index, 'employer', 'EIN'], source)
    next = setSource(next, ['w2s', index, 'employer', 'employerName'], source)
  }
  if (w2.box12) {
    Object.keys(w2.box12).forEach((code) => {
      next = setSource(next, ['w2s', index, 'box12', code], source)
    })
  }
  return next
}

export const set1099Sources = (
  sources: InformationSources | undefined,
  index: number,
  f1099: Supported1099,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['f1099s', index, 'type'], source)
  next = setSource(next, ['f1099s', index, 'payer'], source)
  next = setSource(next, ['f1099s', index, 'personRole'], source)
  switch (f1099.type) {
    case Income1099Type.INT:
      next = setSource(next, ['f1099s', index, 'form', 'income'], source)
      break
    case Income1099Type.DIV:
      next = setSource(next, ['f1099s', index, 'form', 'dividends'], source)
      next = setSource(
        next,
        ['f1099s', index, 'form', 'qualifiedDividends'],
        source
      )
      next = setSource(
        next,
        ['f1099s', index, 'form', 'totalCapitalGainsDistributions'],
        source
      )
      break
    case Income1099Type.B:
      next = setSource(
        next,
        ['f1099s', index, 'form', 'shortTermProceeds'],
        source
      )
      next = setSource(
        next,
        ['f1099s', index, 'form', 'shortTermCostBasis'],
        source
      )
      next = setSource(
        next,
        ['f1099s', index, 'form', 'longTermProceeds'],
        source
      )
      next = setSource(
        next,
        ['f1099s', index, 'form', 'longTermCostBasis'],
        source
      )
      break
    case Income1099Type.R:
      next = setSource(
        next,
        ['f1099s', index, 'form', 'grossDistribution'],
        source
      )
      next = setSource(next, ['f1099s', index, 'form', 'taxableAmount'], source)
      next = setSource(
        next,
        ['f1099s', index, 'form', 'federalIncomeTaxWithheld'],
        source
      )
      next = setSource(next, ['f1099s', index, 'form', 'planType'], source)
      next = setSource(
        next,
        ['f1099s', index, 'form', 'taxableAmountNotDetermined'],
        source
      )
      next = setSource(
        next,
        ['f1099s', index, 'form', 'totalDistribution'],
        source
      )
      break
    case Income1099Type.SSA:
      next = setSource(next, ['f1099s', index, 'form', 'netBenefits'], source)
      next = setSource(
        next,
        ['f1099s', index, 'form', 'federalIncomeTaxWithheld'],
        source
      )
      break
    case Income1099Type.NEC:
      next = setSource(
        next,
        ['f1099s', index, 'form', 'nonemployeeCompensation'],
        source
      )
      break
  }
  return next
}

export const set1098Sources = (
  sources: InformationSources | undefined,
  index: number,
  f1098: F1098,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['f1098s', index, 'lender'], source)
  next = setSource(next, ['f1098s', index, 'interest'], source)
  next = setSource(next, ['f1098s', index, 'points'], source)
  next = setSource(next, ['f1098s', index, 'mortgageInsurancePremiums'], source)
  return next
}

export const setPrimaryPersonSources = (
  sources: InformationSources | undefined,
  person: PrimaryPerson,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['taxPayer', 'primaryPerson', 'firstName'], source)
  next = setSource(next, ['taxPayer', 'primaryPerson', 'lastName'], source)
  next = setSource(next, ['taxPayer', 'primaryPerson', 'ssid'], source)
  next = setSource(next, ['taxPayer', 'primaryPerson', 'role'], source)
  next = setSource(next, ['taxPayer', 'primaryPerson', 'isBlind'], source)
  next = setSource(next, ['taxPayer', 'primaryPerson', 'dateOfBirth'], source)
  next = setSource(next, ['taxPayer', 'primaryPerson', 'occupation'], source)
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'isTaxpayerDependent'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'address'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'city'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'state'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'zip'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'aptNo'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'foreignCountry'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'province'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'primaryPerson', 'address', 'postalCode'],
    source
  )
  return next
}

export const setSpouseSources = (
  sources: InformationSources | undefined,
  person: Spouse,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['taxPayer', 'spouse', 'firstName'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'lastName'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'ssid'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'role'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'isBlind'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'dateOfBirth'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'occupation'], source)
  next = setSource(next, ['taxPayer', 'spouse', 'isTaxpayerDependent'], source)
  return next
}

export const setDependentSources = (
  sources: InformationSources | undefined,
  index: number,
  person: Dependent,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['taxPayer', 'dependents', index, 'firstName'], source)
  next = setSource(next, ['taxPayer', 'dependents', index, 'lastName'], source)
  next = setSource(next, ['taxPayer', 'dependents', index, 'ssid'], source)
  next = setSource(next, ['taxPayer', 'dependents', index, 'role'], source)
  next = setSource(next, ['taxPayer', 'dependents', index, 'isBlind'], source)
  next = setSource(
    next,
    ['taxPayer', 'dependents', index, 'dateOfBirth'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'dependents', index, 'relationship'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'dependents', index, 'qualifyingInfo', 'numberOfMonths'],
    source
  )
  next = setSource(
    next,
    ['taxPayer', 'dependents', index, 'qualifyingInfo', 'isStudent'],
    source
  )
  return next
}

export const removeDependentSources = (
  sources: InformationSources | undefined,
  index: number
): InformationSources | undefined =>
  removeSourceIndex(sources, ['taxPayer', 'dependents'], index)

export const removeW2Sources = (
  sources: InformationSources | undefined,
  index: number
): InformationSources | undefined => removeSourceIndex(sources, ['w2s'], index)

export const remove1099Sources = (
  sources: InformationSources | undefined,
  index: number
): InformationSources | undefined =>
  removeSourceIndex(sources, ['f1099s'], index)

export const remove1098Sources = (
  sources: InformationSources | undefined,
  index: number
): InformationSources | undefined =>
  removeSourceIndex(sources, ['f1098s'], index)

export const setFilingStatusSource = (
  sources: InformationSources | undefined,
  source: DataSource
): InformationSources =>
  setSource(sources, ['taxPayer', 'filingStatus'], source)

export const setContactInfoSource = (
  sources: InformationSources | undefined,
  field: 'contactEmail' | 'contactPhoneNumber',
  source: DataSource
): InformationSources => setSource(sources, ['taxPayer', field], source)

export const setStateResidencySource = (
  sources: InformationSources | undefined,
  source: DataSource
): InformationSources =>
  setSource(sources, ['stateResidencies', 0, 'state'], source)

export const setAdjustmentsSources = (
  sources: InformationSources | undefined,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(next, ['adjustments', 'alimonyPaid'], source)
  next = setSource(next, ['adjustments', 'alimonyRecipientSsn'], source)
  next = setSource(next, ['adjustments', 'alimonyDivorceDate'], source)
  next = setSource(next, ['adjustments', 'educatorExpenses'], source)
  next = setSource(
    next,
    ['adjustments', 'selfEmployedHealthInsuranceDeduction'],
    source
  )
  const worksheetFields = [
    'line1',
    'line2',
    'line3',
    'line4',
    'line5',
    'line6',
    'line7',
    'line8',
    'line9',
    'line10',
    'line11',
    'line12',
    'line13',
    'line14'
  ]
  worksheetFields.forEach((field) => {
    next = setSource(
      next,
      ['adjustments', 'selfEmployedHealthInsuranceWorksheet', field],
      source
    )
  })
  return next
}

export const setOtherIncomeSources = (
  sources: InformationSources | undefined,
  source: DataSource
): InformationSources => {
  let next = sources ?? {}
  next = setSource(
    next,
    ['otherIncome', 'foreignEarnedIncomeExclusion'],
    source
  )
  return next
}
