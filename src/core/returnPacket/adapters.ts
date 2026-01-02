import { Information, TaxYear, State } from 'ustaxes/core/data'
import {
  AuditLogEntry,
  DeductionsCredits,
  Dependent,
  Document,
  IncomeItem,
  TaxReturn,
  TaxReturnPacket,
  Taxpayer
} from './types'

const toTaxpayer = (person?: {
  firstName: string
  lastName: string
  ssid: string
  dateOfBirth: Date
}): Taxpayer | undefined =>
  person
    ? {
        firstName: person.firstName,
        lastName: person.lastName,
        ssid: person.ssid,
        dateOfBirth: person.dateOfBirth
      }
    : undefined

const toDependents = (info: Information): Dependent[] =>
  info.taxPayer.dependents.map((dependent) => ({
    firstName: dependent.firstName,
    lastName: dependent.lastName,
    ssid: dependent.ssid,
    relationship: dependent.relationship,
    dateOfBirth: dependent.dateOfBirth,
    isStudent: dependent.qualifyingInfo?.isStudent
  }))

const toIncomeItems = (info: Information): IncomeItem[] => {
  const w2s: IncomeItem[] = info.w2s.map((w2) => ({
    type: 'W2',
    payerName: w2.employer?.employerName,
    amount: w2.income,
    personRole: w2.personRole
  }))

  const f1099s: IncomeItem[] = info.f1099s.map((form) => ({
    type: '1099',
    payerName: form.payer,
    amount:
      'income' in form.form
        ? form.form.income
        : 'dividends' in form.form
        ? form.form.dividends
        : undefined,
    personRole: form.personRole
  }))

  return [...w2s, ...f1099s]
}

const toDeductionsCredits = (info: Information): DeductionsCredits => ({
  itemized: info.itemizedDeductions !== undefined,
  credits: info.credits.map((credit) => credit.type)
})

const toDocuments = (info: Information): Document[] => {
  const docs: Document[] = []
  info.w2s.forEach((w2, index) => {
    docs.push({
      id: `w2-${index}`,
      name: `W-2 ${w2.employer?.employerName ?? 'Employer'}`,
      received: true
    })
  })

  info.f1099s.forEach((form, index) => {
    docs.push({
      id: `1099-${index}`,
      name: `1099 ${form.payer || 'Payer'}`,
      received: true
    })
  })

  return docs
}

export const buildTaxReturn = (taxYear: TaxYear, state: State): TaxReturn => ({
  id: `${taxYear}-${Date.now()}`,
  taxYear,
  state,
  status: 'Draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totals: {}
})

export const buildReturnPacket = (
  info: Information,
  returnInfo: TaxReturn,
  auditLog: AuditLogEntry[]
): TaxReturnPacket => ({
  returnInfo,
  taxpayer: toTaxpayer(info.taxPayer.primaryPerson),
  spouse: toTaxpayer(info.taxPayer.spouse),
  dependents: toDependents(info),
  incomes: toIncomeItems(info),
  deductionsCredits: toDeductionsCredits(info),
  documents: toDocuments(info),
  auditLog
})
