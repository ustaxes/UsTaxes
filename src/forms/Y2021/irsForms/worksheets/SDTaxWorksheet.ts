import { Worksheet } from '../F1040Attachment'

export default class SDTaxWorksheet extends Worksheet {
  /**
   * Complete this worksheet only if line 18 or line 19 of Schedule D is more than zero
   * and lines 15 and 16 of Schedule D are gains or if you file Form 4952 and you have
   * an amount on line 4g, even if you don’t need to file Schedule D. Otherwise,
   * complete the Qualified Dividends and Capital Gain Tax Worksheet in the instructions
   * for Forms 1040 and 1040-SR, line 16 (or in the instructions for Form 1040-NR, line 16)
   * to figure your tax. Before completing this worksheet, complete Form 1040, 1040-SR, or
   * 1040-NR through line 15.
   */
  isNeeded = (): boolean => {
    const sd = this.f1040.scheduleD
    const f4952 = this.f1040.f4952

    const sdCondition =
      sd !== undefined &&
      ((sd.l18() ?? 0) > 0 || (sd?.l19() ?? 0) > 0) &&
      sd.l15() > 0 &&
      sd.l16() > 0

    const f4952Condition = f4952 !== undefined && (f4952.l4g() ?? 0) > 0

    return sdCondition || f4952Condition
  }

  // TODO - Required by 6251,
  // Might be refigured for AMT
  l10 = (): number | undefined => undefined

  // TODO - Required by 6251,
  l13 = (): number | undefined => undefined

  // TODO - Required by 6251,
  l14 = (): number | undefined => undefined

  // TODO - Required by 6251,
  l21 = (): number | undefined => undefined
}
