import F1040Attachment from './F1040Attachment'
import type { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import type { FormTag } from 'ustaxes/core/irsForms/Form'
import type { BusinessPropertySale } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'

/**
 * Form 4797 — Sales of Business Property.
 *
 * - Property held 1 year or less: ordinary gain or loss in Part II, line 10.
 * - Property held more than 1 year at a loss, or with no depreciation: Part I,
 *   line 2.
 * - Depreciated property held more than 1 year at a gain: Part III. Gain up to
 *   the depreciation taken is recaptured as ordinary income (line 31, to
 *   Part II line 13). The rest is section 1231 gain (line 32, to Part I
 *   line 6).
 *
 * Part I line 7 is the net section 1231 gain or loss. A gain goes to
 * Schedule D line 11; a loss goes to Part II line 11. Part II line 18b goes to
 * Schedule 1 line 4.
 *
 * Simplifications:
 * - BusinessPropertySale doesn't say whether property is section 1245 or 1250,
 *   so all depreciation is recaptured as ordinary income, as for section 1245
 *   property. For real property this over-taxes: the gain should instead be
 *   unrecaptured section 1250 gain, taxed at up to 25%.
 * - Nonrecaptured section 1231 losses from prior years (lines 8 and 9),
 *   installment sales, casualties and like-kind exchanges aren't supported.
 */
export default class F4797 extends F1040Attachment {
  tag: FormTag = 'f4797'
  sequenceIndex = 27

  isNeeded = (): boolean => this.sales().length > 0

  private sales = (): BusinessPropertySale[] =>
    this.f1040.info.businessPropertySales ?? []

  private gainOrLoss = (sale: BusinessPropertySale): number => {
    const amountRealized = sale.grossSalePrice - (sale.sellingExpenses ?? 0)
    const adjustedBasis = sale.costBasis - sale.depreciationAllowed
    return amountRealized - adjustedBasis
  }

  private longTermSales = (): BusinessPropertySale[] =>
    this.sales().filter((s) => isHeldMoreThanOneYear(s))

  private shortTermSales = (): BusinessPropertySale[] =>
    this.sales().filter((s) => !isHeldMoreThanOneYear(s))

  /** Long-term sales figured in Part III: depreciated property sold at a gain. */
  private partIIISales = (): BusinessPropertySale[] =>
    this.longTermSales().filter(
      (s) => s.depreciationAllowed > 0 && this.gainOrLoss(s) > 0
    )

  private partISales = (): BusinessPropertySale[] =>
    this.longTermSales().filter((s) => !this.partIIISales().includes(s))

  private recapture = (sale: BusinessPropertySale): number =>
    Math.min(this.gainOrLoss(sale), sale.depreciationAllowed)

  // Part I

  /** Line 2: section 1231 sales not figured in Part III. */
  l2 = (): number | undefined =>
    this.partISales().length > 0
      ? sumFields(this.partISales().map((s) => this.gainOrLoss(s)))
      : undefined

  /** Line 6: gain from line 32 (Part III). */
  l6 = (): number | undefined => this.l32()

  /** Line 7: net section 1231 gain or (loss). */
  l7 = (): number => sumFields([this.l2(), this.l6()])

  /** Lines 8-9: nonrecaptured section 1231 losses aren't supported. */
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined

  /** Line 7 gain that goes to Schedule D line 11 (with no line 8 losses). */
  scheduleDGain = (): number | undefined =>
    this.l7() > 0 ? this.l7() : undefined

  // Part II

  /** Line 10: ordinary gains and losses on property held 1 year or less. */
  l10 = (): number | undefined =>
    this.shortTermSales().length > 0
      ? sumFields(this.shortTermSales().map((s) => this.gainOrLoss(s)))
      : undefined

  /** Line 11: loss from line 7. */
  l11 = (): number | undefined => (this.l7() < 0 ? this.l7() : undefined)

  /** Line 12: gain from line 7 or 9, only when line 8 has losses. */
  l12 = (): number | undefined => undefined

  /** Line 13: gain from line 31. */
  l13 = (): number | undefined => this.l31()

  /** Line 17: combine lines 10 through 16. */
  l17 = (): number =>
    sumFields([this.l10(), this.l11(), this.l12(), this.l13()])

  /** Line 18b: goes to Schedule 1 line 4. */
  l18b = (): number | undefined =>
    this.isNeeded() && this.l17() !== 0 ? this.l17() : undefined

  // Part III

  /** Line 31: ordinary income from depreciation recapture. */
  l31 = (): number | undefined =>
    this.partIIISales().length > 0
      ? sumFields(this.partIIISales().map((s) => this.recapture(s)))
      : undefined

  /** Line 32: gain on Part III property that isn't recaptured. */
  l32 = (): number | undefined =>
    this.partIIISales().length > 0
      ? sumFields(
          this.partIIISales().map((s) => this.gainOrLoss(s) - this.recapture(s))
        )
      : undefined

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}

/** Parse MM/DD/YYYY or YYYY-MM-DD into [year, month, day]. */
const parseDate = (date: string): [number, number, number] | undefined => {
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date.trim())
  if (us !== null) {
    return [Number(us[3]), Number(us[1]), Number(us[2])]
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim())
  if (iso !== null) {
    return [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  }
  return undefined
}

/**
 * Held more than 1 year: sold after the first anniversary of the date
 * acquired. Dates that can't be read count as more than 1 year, the usual case
 * for business property.
 */
export const isHeldMoreThanOneYear = (sale: BusinessPropertySale): boolean => {
  const acquired = parseDate(sale.dateAcquired)
  const sold = parseDate(sale.dateSold)
  if (acquired === undefined || sold === undefined) {
    return true
  }
  const [ay, am, ad] = acquired
  const [sy, sm, sd] = sold
  const anniversary = (ay + 1) * 10000 + am * 100 + ad
  return sy * 10000 + sm * 100 + sd > anniversary
}
