import { sumFields } from 'ustaxes/core/irsForms/util'
import F1040Attachment from './F1040Attachment'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import type { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import type { FormTag } from 'ustaxes/core/irsForms/Form'

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

  /** Smaller of the taxpayer's and (if MFJ) the spouse's earned income. */
  private earnedIncomeLimit = (): number => {
    const primary = this.primaryEarnedIncome()
    const spouse = this.spouseEarnedIncome()
    return spouse !== undefined ? Math.min(primary, spouse) : primary
  }

  /**
   * Part III line 25: excluded benefits — the smaller of line 20 (benefits,
   * qualified expenses (line 16) and earned income) or line 21 ($5,000, or
   * $2,500 MFS). Line 24 (deductible benefits from a sole proprietorship or
   * partnership) isn't supported, so line 25 is the whole exclusion.
   *
   * If no care expenses were entered, the expense limit can't be applied and
   * is skipped.
   */
  excludedBenefits = (): number => {
    const fs = this.f1040.info.taxPayer.filingStatus
    const l21 =
      fs === FilingStatus.MFS
        ? EMPLOYER_BENEFIT_EXCLUSION / 2
        : EMPLOYER_BENEFIT_EXCLUSION
    const l20 = Math.min(
      this.employerBenefits(),
      this.dce?.totalExpenses ?? Infinity,
      this.earnedIncomeLimit()
    )
    return Math.max(0, Math.min(l20, l21))
  }

  /**
   * Line 26: taxable employer-provided dependent care benefits
   * (line 23 − line 25). Flows to F1040 line 1e.
   */
  taxableBenefits = (): number | undefined => {
    const benefits = this.employerBenefits()
    if (benefits <= 0) return undefined
    const taxable = Math.max(0, benefits - this.excludedBenefits())
    return taxable > 0 ? taxable : undefined
  }

  /**
   * Line 3: qualified expenses for the credit. Without dependent care
   * benefits, the expenses up to $3,000 ($6,000 for two or more people).
   * With benefits, line 31 of Part III: the smaller of the dollar limit less
   * excluded benefits (line 29) or the expenses not paid with excluded
   * benefits (line 30).
   */
  l3 = (): number => {
    if (this.dce === undefined) return 0
    const { qualifyingPersonCount, totalExpenses } = this.dce
    const l27 =
      qualifyingPersonCount >= 2
        ? EXPENSE_CAP_PER_PERSON * 2
        : EXPENSE_CAP_PER_PERSON
    if (this.employerBenefits() <= 0) {
      return Math.min(totalExpenses, l27)
    }
    const l28 = this.excludedBenefits()
    const l29 = l27 - l28
    if (l29 <= 0) return 0
    const l30 = Math.max(0, totalExpenses - l28)
    return Math.min(l29, l30)
  }

  /**
   * Part II: nonrefundable Child and Dependent Care Credit.
   * Flows to Schedule 3 line 2.
   */
  credit = (): number | undefined => {
    if (!this.isNeeded()) return undefined

    // Line 6: smallest of line 3 and the earned income lines 4 and 5.
    const qualifyingExpenses = Math.min(this.l3(), this.earnedIncomeLimit())
    if (qualifyingExpenses <= 0) return undefined

    const agi = this.f1040.l11b()
    const rate =
      CREDIT_RATE_TABLE.slice()
        .reverse()
        .find(([threshold]) => agi >= threshold)?.[1] ?? 0.2

    const creditAmount = Math.min(
      Math.round(qualifyingExpenses * rate),
      this.creditLimit()
    )
    return creditAmount > 0 ? creditAmount : undefined
  }

  /**
   * Line 10 Credit Limit Worksheet: Form 1040 line 18 minus Schedule 3
   * line 1 (foreign tax credit) and line 6l (Form 8978, line 14).
   */
  creditLimit = (): number => {
    const s3 = this.f1040.schedule3
    return Math.max(0, this.f1040.l18() - sumFields([s3.l1(), s3.l6l()]))
  }

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
