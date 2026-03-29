import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Impacts EIC, 1040 instructions L27 step 1 squestion 4
 */
export default class F2555 extends F1040Attachment {
  tag: FormTag = 'f2555'
  sequenceIndex = 34

  /**
   * Line 3: Amount from the Foreign Earned Income Tax Worksheet line 3.
   * Equals taxable income (Form 1040 line 15) reduced by the FEIE,
   * used as the income base for computing tax on qualified dividends
   * and capital gains when the taxpayer claims foreign earned income exclusion.
   * Full FEIE worksheet computation is not implemented; this approximates
   * line 3 as max(0, l15 - foreignEarnedIncomeExclusion).
   */
  l3 = (): number | undefined => {
    const feie = this.f1040.info.otherIncome?.foreignEarnedIncomeExclusion
    if (feie === undefined) return undefined
    return Math.max(0, this.f1040.l15() - feie)
  }

  // TODO - required from 6251
  l36 = (): number => 0

  // TODO - required from 6251
  l42 = (): number => 0

  // TODO - required from 8812
  l45 = (): number => 0

  // TODO - required from 6251 & 8812
  l50 = (): number => 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
