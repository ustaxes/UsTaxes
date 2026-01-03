import { FilingStatus, TaxYears } from 'ustaxes/core/data'
import { TaxReturnPacket } from 'ustaxes/core/returnPacket/types'
import { getFederalTables } from 'ustaxes/core/taxYear/tables'
import { ComputedReturn } from './types'
import { buildEngineDiagnostics } from '../shared/diagnostics'

const sum = (values: Array<number | undefined>): number =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0)

const ageOnDate = (dob: Date, asOf: Date): number => {
  const hadBirthday =
    asOf.getMonth() > dob.getMonth() ||
    (asOf.getMonth() === dob.getMonth() && asOf.getDate() >= dob.getDate())
  return asOf.getFullYear() - dob.getFullYear() - (hadBirthday ? 0 : 1)
}

const computeTax = (
  taxableIncome: number,
  filingStatus: FilingStatus,
  rates: number[],
  brackets: number[]
): number => {
  let remaining = taxableIncome
  let lastLimit = 0
  let tax = 0

  brackets.forEach((limit, index) => {
    if (remaining <= 0) return
    const taxableAtRate = Math.min(remaining, limit - lastLimit)
    tax += taxableAtRate * rates[index]
    remaining -= taxableAtRate
    lastLimit = limit
  })

  if (remaining > 0) {
    tax += remaining * rates[rates.length - 1]
  }

  return Math.round(tax)
}

const computeSelfEmploymentTax = (
  netProfit: number,
  wages: number,
  wageBase: number
): number => {
  if (netProfit <= 0) {
    return 0
  }
  const taxableSEIncome = netProfit * 0.9235
  const remainingBase = Math.max(0, wageBase - wages)
  const socialSecurityTax = Math.min(taxableSEIncome, remainingBase) * 0.124
  const medicareTax = taxableSEIncome * 0.029
  return Math.round(socialSecurityTax + medicareTax)
}

const computeChildTaxCredit = (
  packet: TaxReturnPacket,
  maxPerChild: number,
  qualifyingAge: number
): number => {
  const taxYear = TaxYears[packet.returnInfo.taxYear]
  const asOf = new Date(taxYear, 11, 31)
  const eligibleChildren = packet.dependents.filter((dependent) => {
    if (!dependent.dateOfBirth) {
      return false
    }
    const age = ageOnDate(dependent.dateOfBirth, asOf)
    return age <= qualifyingAge
  })
  return eligibleChildren.length * maxPerChild
}

export const computeFederalReturn = (
  packet: TaxReturnPacket
): ComputedReturn => {
  const filingStatus = packet.filingStatus ?? FilingStatus.S
  const tables = getFederalTables(packet.returnInfo.taxYear, filingStatus)

  const wages = sum(
    packet.incomes
      .filter((income) => income.type === 'W2')
      .map((income) => income.amount)
  )
  const otherIncome = sum(
    packet.incomes
      .filter((income) => income.type === '1099')
      .map((income) => income.amount)
  )
  const necIncome = sum(
    packet.incomes
      .filter((income) => income.type === '1099-NEC')
      .map((income) => income.amount)
  )
  const scheduleCNet = sum(
    packet.scheduleC.map((item) => item.grossReceipts - item.expenses)
  )

  const businessNet = scheduleCNet + necIncome
  const totalIncome = wages + otherIncome + businessNet
  const selfEmploymentTax = computeSelfEmploymentTax(
    businessNet,
    wages,
    tables.socialSecurityWageBase
  )
  const adjustments = selfEmploymentTax / 2
  const adjustedGrossIncome = Math.max(0, totalIncome - adjustments)

  const standardDeduction = tables.standardDeduction
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction)

  const incomeTax = computeTax(
    taxableIncome,
    filingStatus,
    tables.rates,
    tables.brackets
  )
  const childTaxCredit = computeChildTaxCredit(
    packet,
    tables.childTaxCredit.maxPerChild,
    tables.childTaxCredit.qualifyingAge
  )
  const totalTaxBeforeCredits = incomeTax + selfEmploymentTax
  const credits = Math.min(totalTaxBeforeCredits, childTaxCredit)
  const totalTax = Math.max(0, totalTaxBeforeCredits - credits)

  const withholdings = sum(
    packet.incomes.map((income) => income.federalWithholding)
  )
  const payments = withholdings + packet.estimatedPayments

  const refundAmount = Math.max(0, payments - totalTax)
  const amountOwed = Math.max(0, totalTax - payments)

  return {
    adjustedGrossIncome: Math.round(adjustedGrossIncome),
    taxableIncome: Math.round(taxableIncome),
    federalTax: Math.round(totalTax),
    credits,
    payments: Math.round(payments),
    refundAmount: Math.round(refundAmount),
    amountOwed: Math.round(amountOwed),
    selfEmploymentTax,
    diagnostics: buildEngineDiagnostics(packet)
  }
}
