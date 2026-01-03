import { Information, TaxYear, State } from 'ustaxes/core/data'
import {
  AuditLogEntry,
  DeductionsCredits,
  Dependent,
  Document,
  IncomeItem,
  ScheduleCItem,
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
    federalWithholding: w2.fedWithholding,
    personRole: w2.personRole
  }))

  const f1099s: IncomeItem[] = info.f1099s.map((form) => ({
    type: form.type === 'NEC' ? '1099-NEC' : '1099',
    payerName: form.payer,
    amount:
      'income' in form.form
        ? form.form.income
        : 'dividends' in form.form
        ? form.form.dividends
        : 'compensation' in form.form
        ? form.form.compensation
        : undefined,
    federalWithholding:
      'federalIncomeTaxWithheld' in form.form
        ? form.form.federalIncomeTaxWithheld
        : undefined,
    personRole: form.personRole
  }))

  return [...w2s, ...f1099s]
}

const toDeductionsCredits = (info: Information): DeductionsCredits => ({
  itemized: info.itemizedDeductions !== undefined,
  credits: info.credits.map((credit) => credit.type)
})

const toScheduleC = (info: Information): ScheduleCItem[] =>
  (info.scheduleCs ?? []).map((schedule) => ({
    businessName: schedule.businessName,
    grossReceipts: schedule.grossReceipts,
    expenses: schedule.expenses
  }))

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
  filingStatus: info.taxPayer.filingStatus,
  taxpayer: toTaxpayer(info.taxPayer.primaryPerson),
  spouse: toTaxpayer(info.taxPayer.spouse),
  dependents: toDependents(info),
  incomes: toIncomeItems(info),
  scheduleC: toScheduleC(info),
  estimatedPayments: info.estimatedTaxes.reduce(
    (sum, item) => sum + item.payment,
    0
  ),
  deductionsCredits: toDeductionsCredits(info),
  documents: toDocuments(info),
  auditLog
})
