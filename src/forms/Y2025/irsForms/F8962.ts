import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Form1095A } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'

/**
 * Form 8962 — Premium Tax Credit (PTC).
 *
 * Reconciles the advance premium tax credit (APTC) paid on the taxpayer's
 * behalf with the actual allowable PTC based on household income and the
 * cost of the second lowest cost silver plan (SLCSP).
 *
 * This implementation covers the standard computation for individuals who
 * obtained coverage through the Marketplace:
 *   - Annual totals from Form(s) 1095-A
 *   - Contribution amount = household income × applicable contribution rate
 *   - PTC = SLCSP premium − contribution amount (per month)
 *   - Net PTC = total PTC − APTC already paid
 *
 * Limitations:
 *   - Alternative calculation for year of marriage is not implemented.
 *   - Shared policy allocations (covering multiple tax households) are not
 *     implemented; enter only the amounts allocable to this tax household.
 *   - Household income below 100% FPL or above 400% FPL special rules for
 *     ARPA continuation are not fully modeled — the credit is computed at
 *     the applicable contribution percentage.
 */
export default class F8962 extends F1040Attachment {
  tag: FormTag = 'f8962'
  sequenceIndex = 73

  isNeeded = (): boolean => (this.f1040.info.marketplace1095As ?? []).length > 0

  private forms1095A = (): Form1095A[] =>
    this.f1040.info.marketplace1095As ?? []

  /** Annual premium from all 1095-A forms (column A total). */
  annualPremium = (): number =>
    this.forms1095A().reduce(
      (sum, f) => sum + f.monthlyPremiums.reduce((a, b) => a + b, 0),
      0
    )

  /** Annual SLCSP amount from all 1095-A forms (column B total). */
  annualSlcsp = (): number =>
    this.forms1095A().reduce(
      (sum, f) => sum + f.monthlySlcsp.reduce((a, b) => a + b, 0),
      0
    )

  /** Total advance PTC paid on taxpayer's behalf (column C total). */
  annualAdvancePtc = (): number =>
    this.forms1095A().reduce(
      (sum, f) => sum + f.monthlyAdvancePtc.reduce((a, b) => a + b, 0),
      0
    )

  /**
   * Applicable contribution percentage — the fraction of household income
   * the taxpayer is expected to contribute toward benchmark coverage.
   * For TY2025, the ARPA caps the rate at 8.5% for all income levels.
   * A proper computation requires FPL lookup tables; this approximation uses
   * 8.5% (the statutory maximum), which is conservative (may understate PTC).
   *
   * Taxpayers with income 100%–150% FPL pay 0%; the simplified computation
   * here may overstate their contribution. Users near the FPL thresholds
   * should consult the Form 8962 instructions.
   */
  applicableContributionRate = (): number => 0.085

  /**
   * Annual contribution amount — household income × applicable rate.
   * This is what the taxpayer is expected to pay toward benchmark coverage.
   */
  contributionAmount = (): number =>
    Math.round(this.f1040.l11b() * this.applicableContributionRate())

  /**
   * Allowable premium tax credit before comparing to advance payments.
   * = SLCSP annual total − annual contribution amount, capped at zero and
   *   capped at actual premium paid.
   */
  allowablePtc = (): number =>
    Math.min(
      this.annualPremium(),
      Math.max(0, this.annualSlcsp() - this.contributionAmount())
    )

  /**
   * Net premium tax credit after subtracting advance payments.
   * Positive: additional credit flows to Schedule 3 line 9.
   * Negative: excess advance PTC repayment flows to Schedule 2 line 1a.
   */
  netPtc = (): number => this.allowablePtc() - this.annualAdvancePtc()

  /**
   * Credit flowing to Schedule 3 line 9 (additional PTC over advance).
   * Negative when advance PTC exceeded allowable PTC (repayment required).
   */
  credit = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    const net = this.netPtc()
    return net > 0 ? net : undefined
  }

  /**
   * Excess advance PTC repayment flowing to Schedule 2 line 1a.
   * Only populated when advance PTC exceeded the allowable credit.
   */
  excessRepayment = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    const net = this.netPtc()
    return net < 0 ? -net : undefined
  }

  fields = (): Field[] => [sumFields([this.credit()])]
  fillInstructions = (): FillInstructions => []
}
