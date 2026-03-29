import F1040Attachment from './F1040Attachment'
import { CreditType } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 8910 — Alternative Motor Vehicle Credit.
 * Input via Information.credits[] with type CreditType.AlternativeMotorVehicle.
 * Flows to Schedule 3 line 6k.
 */
export default class F8910 extends F1040Attachment {
  sequenceIndex = 40
  tag: FormTag = 'f8910'

  l15 = (): number | undefined => {
    const total = this.f1040.info.credits
      .filter((c) => c.type === CreditType.AlternativeMotorVehicle)
      .reduce((sum, c) => sum + c.amount, 0)
    return total > 0 ? total : undefined
  }

  isNeeded = (): boolean => (this.l15() ?? 0) > 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
