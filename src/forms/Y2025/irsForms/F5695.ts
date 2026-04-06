import F1040Attachment from './F1040Attachment'
import { CreditType } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 5695 — Residential Energy Credits.
 *
 * Part I: Residential Clean Energy Credit (30% of eligible property costs).
 * Part II: Energy Efficient Home Improvement Credit (pre-calculated by taxpayer).
 *
 * Inputs are provided via Information.credits[] with types:
 *   - CreditType.ResidentialCleanEnergyCost: eligible cost (credit = cost × 30%)
 *   - CreditType.EnergyEfficientHomeImprovement: credit amount directly
 */
export default class F5695 extends F1040Attachment {
  tag: FormTag = 'f5695'
  sequenceIndex = 52

  /** Total eligible residential clean energy property costs from credits[]. */
  cleanEnergyCosts = (): number =>
    this.f1040.info.credits
      .filter((c) => c.type === CreditType.ResidentialCleanEnergyCost)
      .reduce((sum, c) => sum + c.amount, 0)

  /** Part I credit: 30% of eligible clean energy costs (line 15). */
  l15 = (): number => Math.round(this.cleanEnergyCosts() * 0.3)

  /** Part II: energy efficient home improvement credit (pre-calculated by taxpayer, line 14). */
  l14PartII = (): number =>
    this.f1040.info.credits
      .filter((c) => c.type === CreditType.EnergyEfficientHomeImprovement)
      .reduce((sum, c) => sum + c.amount, 0)

  /**
   * Total credit flowing to Schedule 3 line 5 (line 30).
   * Cap: total credits cannot exceed tax (Schedule 3 line 5 worksheet applies).
   * Here we return the uncapped sum; the Schedule 3 credit limit worksheet
   * in Schedule 8812 creditLimitWorksheetA() handles the cap.
   */
  l30 = (): number | undefined => {
    const total = this.l15() + this.l14PartII()
    return total > 0 ? total : undefined
  }

  isNeeded = (): boolean => (this.l30() ?? 0) > 0

  fields = (): Field[] => []

  // No PDF schema for F5695 in Y2025 yet; computation is wired to Schedule 3.
  fillInstructions = (): FillInstructions => []
}
