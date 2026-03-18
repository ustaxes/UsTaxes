import F1040Attachment from './F1040Attachment'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Credit percentage table for Form 2441 line 8 (unchanged from prior years,
 * not indexed for inflation). AGI thresholds are the lower bounds of each bracket.
 * 
 * TODO: Move to federal, maybe? even if mostly unchaged?
 */
const CREDIT_RATE_TABLE: [number, number][] = [
  [0, 0.35],
  [15001, 0.34],
  [17001, 0.33],
  [19001, 0.32],
  [21001, 0.31],
  [23001, 0.3],
  [25001, 0.29],
  [27001, 0.28],
  [29001, 0.27],
  [31001, 0.26],
  [33001, 0.25],
  [35001, 0.24],
  [37001, 0.23],
  [39001, 0.22],
  [41001, 0.21],
  [43001, 0.2]
]

/** Maximum allowable expense per qualifying person for the credit. */
const EXPENSE_CAP_PER_PERSON = 3000

/** Maximum excludable employer-provided dependent care benefits. */
const EMPLOYER_BENEFIT_EXCLUSION = 5000

/**
 * Form 2441 — Child and Dependent Care Expenses.
 *
 * Produces two outputs:
 * - `taxableBenefits()`: employer-provided care includible in income (→ F1040 line 1e)
 * - `credit()`: nonrefundable care credit (→ Schedule 3 line 2)
 */
export default class F2441 extends F1040Attachment {
  tag: FormTag = 'f2441'
  sequenceIndex = 21

  private get dce() {
    return this.f1040.info.dependentCareExpenses
  }

  isNeeded = (): boolean =>
    this.dce !== undefined && this.dce.qualifyingPersonCount > 0

  /** Total employer-provided dependent care benefits across all W-2s. */
  private employerBenefits = (): number =>
    this.f1040.info.w2s.reduce(
      (sum, w2) => sum + (w2.box10DependentCare ?? 0),
      0
    )

  /** Earned income of the primary taxpayer. */
  private primaryEarnedIncome = (): number =>
    this.f1040.info.w2s
      .filter((w2) => w2.personRole === PersonRole.PRIMARY)
      .reduce((sum, w2) => sum + w2.income, 0) +
    (this.f1040.info.selfEmployedIncome
      ?.filter((s) => s.personRole === PersonRole.PRIMARY)
      .reduce((sum, s) => sum + Math.max(0, s.grossReceipts - s.expenses), 0) ??
      0)

  /** Earned income of the spouse. Returns undefined if no spouse. */
  private spouseEarnedIncome = (): number | undefined => {
    const info = this.f1040.info
    if (info.taxPayer.filingStatus !== FilingStatus.MFJ) return undefined
    return (
      info.w2s
        .filter((w2) => w2.personRole === PersonRole.SPOUSE)
        .reduce((sum, w2) => sum + w2.income, 0) +
      (info.selfEmployedIncome
        ?.filter((s) => s.personRole === PersonRole.SPOUSE)
        .reduce(
          (sum, s) => sum + Math.max(0, s.grossReceipts - s.expenses),
          0
        ) ?? 0)
    )
  }

  /**
   * Maximum excludable employer-provided care benefits (Part III).
   * Capped at $5,000 ($2,500 MFS), also cannot exceed the lesser of
   * earned incomes or the benefit exclusion limit.
   */
  private maxExclusion = (): number => {
    const fs = this.f1040.info.taxPayer.filingStatus
    const cap =
      fs === FilingStatus.MFS
        ? EMPLOYER_BENEFIT_EXCLUSION / 2
        : EMPLOYER_BENEFIT_EXCLUSION
    const primary = this.primaryEarnedIncome()
    const spouse = this.spouseEarnedIncome()
    const earnedIncomeLimit =
      spouse !== undefined ? Math.min(primary, spouse) : primary
    return Math.min(cap, earnedIncomeLimit)
  }

  /**
   * Line 26: taxable employer-provided dependent care benefits.
   * = employer benefits received − allowed exclusion.
   * Flows to F1040 line 1e as additional income.
   */
  taxableBenefits = (): number | undefined => {
    const benefits = this.employerBenefits()
    if (benefits <= 0) return undefined
    const taxable = Math.max(0, benefits - this.maxExclusion())
    return taxable > 0 ? taxable : undefined
  }

  /**
   * Part II: nonrefundable Child and Dependent Care Credit.
   * Flows to Schedule 3 line 2.
   */
  credit = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    if (this.dce === undefined) return undefined
    const { qualifyingPersonCount, totalExpenses } = this.dce
    const expenseCap =
      qualifyingPersonCount >= 2
        ? EXPENSE_CAP_PER_PERSON * 2
        : EXPENSE_CAP_PER_PERSON

    const exclusion = Math.min(this.employerBenefits(), this.maxExclusion())
    const adjustedExpenses = Math.max(0, totalExpenses - exclusion)
    const cappedExpenses = Math.min(adjustedExpenses, expenseCap)

    const primary = this.primaryEarnedIncome()
    const spouse = this.spouseEarnedIncome()
    const earnedIncomeLimit =
      spouse !== undefined ? Math.min(primary, spouse) : primary

    const qualifyingExpenses = Math.min(cappedExpenses, earnedIncomeLimit)
    if (qualifyingExpenses <= 0) return undefined

    const agi = this.f1040.l11()
    const rate =
      CREDIT_RATE_TABLE.slice()
        .reverse()
        .find(([threshold]) => agi >= threshold)?.[1] ?? 0.2

    const creditAmount = Math.round(qualifyingExpenses * rate)
    return creditAmount > 0 ? creditAmount : undefined
  }

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
