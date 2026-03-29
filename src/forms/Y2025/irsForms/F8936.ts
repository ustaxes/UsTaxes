import F1040Attachment from './F1040Attachment'
import { CreditType } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 8936 — Clean Vehicle Credits.
 *
 * Inputs are provided via Information.credits[] with type CreditType.CleanVehicle.
 * Each credit entry represents one qualifying vehicle (amount ≤ $7,500 for new,
 * ≤ $4,000 for previously owned).
 *
 * l15 = Part I credit (new clean vehicle, flows to Schedule 3 line 6d nonrefundable)
 * l23 = Part II credit (previously owned clean vehicle, flows to Schedule 3 line 6d)
 */
export default class F8936 extends F1040Attachment {
  tag: FormTag = 'f8936'
  sequenceIndex = 55

  private totalCleanVehicleCredit = (): number =>
    this.f1040.info.credits
      .filter((c) => c.type === CreditType.CleanVehicle)
      .reduce((sum, c) => sum + c.amount, 0)

  /** Part I: new clean vehicle credit (line 15). */
  l15 = (): number | undefined => {
    const total = this.totalCleanVehicleCredit()
    return total > 0 ? total : undefined
  }

  /** Part II: previously owned clean vehicle credit (line 23) — currently merged with l15. */
  l23 = (): number | undefined => undefined

  isNeeded = (): boolean => (this.l15() ?? 0) > 0 || (this.l23() ?? 0) > 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
