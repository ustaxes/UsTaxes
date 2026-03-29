import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { BusinessPropertySale } from 'ustaxes/core/data'

/**
 * Form 4797 — Sales of Business Property.
 *
 * Handles gain/loss on property used in a trade or business (Section 1231
 * transactions). Net Section 1231 gains flow to Schedule 1 line 4.
 *
 * Full depreciation recapture (Section 1245/1250), installment sales, and
 * involuntary conversions are not yet implemented. The current implementation
 * computes gain/loss from each sale as:
 *   amount realized − adjusted basis = realized gain (or loss)
 *
 * Impacts EIC eligibility (Pub 596 Worksheet 1) — see TODO in
 * Pub596Worksheet1.ts and ScheduleEIC.ts.
 */
export default class F4797 extends F1040Attachment {
  tag: FormTag = 'f4797'
  sequenceIndex = 27

  isNeeded = (): boolean =>
    (this.f1040.info.businessPropertySales ?? []).length > 0

  private sales = (): BusinessPropertySale[] =>
    this.f1040.info.businessPropertySales ?? []

  private gainOrLoss = (sale: BusinessPropertySale): number => {
    const amountRealized = sale.grossSalePrice - (sale.sellingExpenses ?? 0)
    const adjustedBasis = sale.costBasis - sale.depreciationAllowed
    return amountRealized - adjustedBasis
  }

  /**
   * Net Section 1231 gain or (loss) — flows to Schedule 1 line 4.
   * Gains increase ordinary income; losses reduce it.
   */
  private netGainLoss = (): number =>
    this.sales().reduce((sum, sale) => sum + this.gainOrLoss(sale), 0)

  /**
   * Line 7: Net gain included in ordinary income (positive Section 1231 gains
   * treated as ordinary income when there are Section 1231 losses in prior 5
   * years — the "non-recaptured net section 1231 losses" rule). Simplified:
   * returns 0 here; taxpayers with prior-year recapture must adjust manually.
   */
  l7 = (): number | undefined => {
    const net = this.netGainLoss()
    return net > 0 ? net : undefined
  }

  /**
   * Line 8: Gain from Part I (installment sales gain — not implemented).
   * Taxpayers with installment sales should compute this separately.
   */
  l8 = (): number | undefined => undefined

  /**
   * Line 9: Net gain or (loss). Positive flows to Schedule 1 line 4.
   * Negative flows to Schedule 1 line 4 as a loss.
   */
  l9 = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    return this.netGainLoss()
  }

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
