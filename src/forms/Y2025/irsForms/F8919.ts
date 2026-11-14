import F1040Attachment from './F1040Attachment'
import { PersonRole } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { fica } from '../data/federal'

/**
 * Form 8919 — Uncollected Social Security and Medicare Tax on Wages.
 * Used when an employer incorrectly treated a worker as an independent contractor.
 * Line 6 (total wages subject to social security and Medicare) flows to F1040 line 1g,
 * and line 13 (the employee's share of the uncollected tax) to Schedule 2 line 6.
 *
 * The data model has a single amount (`otherEarnedIncome.form8919Wages`),
 * treated as the primary taxpayer's.
 */
export default class F8919 extends F1040Attachment {
  tag = 'f8919'
  sequenceIndex = 999

  isNeeded = (): boolean => (this.l6() ?? 0) > 0

  // Line 6: Total wages with no social security or Medicare withholding.
  l6 = (): number | undefined =>
    this.f1040.info.otherEarnedIncome?.form8919Wages

  // Line 7: Maximum wages subject to social security tax ($176,100 for 2025).
  l7 = (): number => fica.maxIncomeSSTaxApplies

  // Line 8: Social security wages from this person's Form(s) W-2 (box 3).
  // TODO: box 7 social security tips, tier 1 RRTA compensation, and
  // Form 4137 line 10 aren't in the data model separately.
  l8 = (): number =>
    this.f1040
      .validW2s()
      .filter((w2) => w2.personRole === PersonRole.PRIMARY)
      .reduce((sum, w2) => sum + w2.ssWages, 0)

  // Line 9: Subtract line 8 from line 7; if line 8 is more, enter 0.
  l9 = (): number => Math.max(0, this.l7() - this.l8())

  // Line 10: Wages subject to social security tax: smaller of line 6 or 9.
  l10 = (): number => Math.min(this.l6() ?? 0, this.l9())

  // Line 11: Line 10 x 6.2%.
  l11 = (): number => this.l10() * 0.062

  // Line 12: Line 6 x 1.45%.
  l12 = (): number => (this.l6() ?? 0) * fica.regularMedicareTaxRate

  // Line 13: Add lines 11 and 12. To Schedule 2 line 6.
  l13 = (): number | undefined =>
    this.isNeeded() ? this.l11() + this.l12() : undefined

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
