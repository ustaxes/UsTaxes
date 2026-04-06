import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

export default class ScheduleR extends F1040Attachment {
  tag: FormTag = 'f1040sr'
  sequenceIndex = 16

  isNeeded = (): boolean =>
    this.f1040.info.otherIncome?.elderlyOrDisabledCredit !== undefined

  /**
   * Line 22: Credit for the elderly or the disabled.
   * Flows to Schedule 3 line 6b.
   */
  l22 = (): number | undefined =>
    this.f1040.info.otherIncome?.elderlyOrDisabledCredit

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
