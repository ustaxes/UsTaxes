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
  const values = Object.values(expenses ?? {}) as Array<unknown>
  return values.reduce<number>((sum, value) => {
    const amount = toFiniteNumber(value) ?? 0
    return sum + amount
  }, 0)
}

export const businessNetReceipts = (business: Business): number =>
  (toFiniteNumber(business.income.grossReceipts) ?? 0) -
  (toFiniteNumber(business.income.returnsAndAllowances) ?? 0) +
  (toFiniteNumber(business.income.otherIncome) ?? 0)

export const businessTotalExpenses = (business: Business): number =>
  sumBusinessExpenses(business.expenses) +
  (toFiniteNumber(business.homeOfficeDeduction) ?? 0)

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

  const baseNetProfit =
    selfEmployedIncomeWithNetProfitInputs.length > 0
      ? selfEmployedNetProfit
      : businessNetProfit

  const total = baseNetProfit + necIncome
  return total !== 0 ? total : undefined
}

export const estimateHealthInsurancePremiums = (
  info: Pick<Information, 'selfEmployedIncome'>
): number | undefined => {
  const total = (info.selfEmployedIncome ?? []).reduce((sum, income) => {
    const premiums = toFiniteNumber(income.healthInsurancePremiums)
    return sum + (premiums ?? 0)
  }, 0)

  return total > 0 ? total : undefined
}

export const estimateProfitableSelfEmploymentIncome = (
  info: Pick<
    Information,
    'businesses' | 'f1099s' | 'selfEmployedIncome' | 'scheduleK1Form1065s'
  >
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

  const explicitScheduleCProfits = selfEmployedIncomeWithNetProfitInputs.reduce(
    (sum, business) => {
      const profit =
        (toFiniteNumber(business.grossReceipts) ?? 0) -
        (toFiniteNumber(business.expenses) ?? 0)
      return sum + Math.max(profit, 0)
    },
    0
  )

  const businessProfits = (info.businesses ?? []).reduce((sum, business) => {
    const profit =
      businessNetReceipts(business) - businessTotalExpenses(business)
    return sum + Math.max(profit, 0)
  }, 0)

  const necIncome = info.f1099s.reduce((sum, form) => {
    if (form.type !== Income1099Type.NEC) {
      return sum
    }
    return (
      sum + Math.max(toFiniteNumber(form.form.nonemployeeCompensation) ?? 0, 0)
    )
  }, 0)

  const k1Income = Math.max(estimateK1SelfEmploymentEarnings(info) ?? 0, 0)

  const scheduleCIncome =
    selfEmployedIncomeWithNetProfitInputs.length > 0
      ? explicitScheduleCProfits
      : businessProfits

  const total = scheduleCIncome + necIncome + k1Income
  return total > 0 ? total : undefined
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
