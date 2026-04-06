import F1040Attachment from './F1040Attachment'
import { CreditType } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 4136 — Credit for Federal Tax on Fuels.
 * Input via Information.credits[] with type CreditType.FuelTax.
 * Flows to Schedule 3 line 12.
 */
export default class F4136 extends F1040Attachment {
  tag: FormTag = 'f4136'
  sequenceIndex = 57

  credit = (): number | undefined => {
    const total = this.f1040.info.credits
      .filter((c) => c.type === CreditType.FuelTax)
      .reduce((sum, c) => sum + c.amount, 0)
    return total > 0 ? total : undefined
  }

  isNeeded = (): boolean => (this.credit() ?? 0) > 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
