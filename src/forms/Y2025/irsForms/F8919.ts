import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'

/**
 * Form 8919 — Uncollected Social Security and Medicare Tax on Wages.
 * Used when an employer incorrectly treated a worker as an independent contractor.
 * Line 6 (total wages subject to social security and Medicare) flows to F1040 line 1g.
 */
export default class F8919 extends F1040Attachment {
  tag = 'f8919'
  sequenceIndex = 999

  l6 = (): number | undefined =>
    this.f1040.info.otherEarnedIncome?.form8919Wages

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
