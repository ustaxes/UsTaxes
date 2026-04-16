import {
  Business,
  BusinessExpenses,
  Information,
  Income1099Type,
  PersonRole,
  ScheduleK1Form1065
} from 'ustaxes/core/data'
import { toFiniteNumber } from 'ustaxes/core/util'

export const sumBusinessExpenses = (
  expenses: BusinessExpenses | undefined
): number => {
  const values = Object.values(expenses ?? {}) as Array<number | undefined>
  return values.reduce<number>((sum, value) => {
    const amount: number = value ?? 0
    return sum + amount
  }, 0)
}

export const businessNetReceipts = (business: Business): number =>
  business.income.grossReceipts -
  business.income.returnsAndAllowances +
  (business.income.otherIncome ?? 0)

export const businessTotalExpenses = (business: Business): number =>
  sumBusinessExpenses(business.expenses) + (business.homeOfficeDeduction ?? 0)

export const toSelfEmployedIncome = (
  business: Business,
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE = PersonRole.PRIMARY
) => ({
  businessName: business.name || business.principalBusinessOrProfession,
  personRole,
  grossReceipts: businessNetReceipts(business),
  expenses: businessTotalExpenses(business)
})

export const toBusinessFromSelfEmployedIncome = (
  selfEmployedIncome: NonNullable<Information['selfEmployedIncome']>[number]
): Business => ({
  name: selfEmployedIncome.businessName ?? '',
  income: {
    grossReceipts: selfEmployedIncome.grossReceipts,
    returnsAndAllowances: 0,
    otherIncome: 0
  },
  expenses: {
    other: selfEmployedIncome.expenses
  },
  otherExpenseType: 'Total expenses'
})

export const estimateScheduleCNetProfit = (
  info: Pick<Information, 'businesses' | 'f1099s' | 'selfEmployedIncome'>
): number | undefined => {
  const selfEmployedIncomeWithNetProfitInputs = (
    info.selfEmployedIncome ?? []
  ).filter(
    (business) =>
      toFiniteNumber(
        (business as { grossReceipts?: unknown }).grossReceipts
      ) !== undefined ||
      toFiniteNumber((business as { expenses?: unknown }).expenses) !==
        undefined
  )

  const selfEmployedNetProfit = selfEmployedIncomeWithNetProfitInputs.reduce(
    (sum, business) =>
      sum +
      (toFiniteNumber(business.grossReceipts) ?? 0) -
      (toFiniteNumber(business.expenses) ?? 0),
    0
  )

  if (selfEmployedIncomeWithNetProfitInputs.length > 0) {
    return selfEmployedNetProfit !== 0 ? selfEmployedNetProfit : undefined
  }

  const businessNetProfit = (info.businesses ?? []).reduce(
    (sum, business) =>
      sum + businessNetReceipts(business) - businessTotalExpenses(business),
    0
  )

  const necIncome = info.f1099s.reduce((sum, form) => {
    if (form.type !== Income1099Type.NEC) {
      return sum
    }
    return sum + (toFiniteNumber(form.form.nonemployeeCompensation) ?? 0)
  }, 0)

  const total = businessNetProfit + necIncome
  return total !== 0 ? total : undefined
}

export const estimateK1SelfEmploymentEarnings = (
  info: Pick<Information, 'scheduleK1Form1065s'>
): number | undefined => {
  const total = info.scheduleK1Form1065s.reduce(
    (sum, k1: ScheduleK1Form1065) =>
      sum +
      k1.selfEmploymentEarningsA +
      k1.selfEmploymentEarningsB +
      k1.selfEmploymentEarningsC,
    0
  )

  return total !== 0 ? total : undefined
}
