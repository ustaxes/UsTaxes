import F1040Attachment from './F1040Attachment'
import { CreditType } from 'ustaxes/core/data'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 2439 — Notice to Shareholder of Undistributed Long-Term Capital Gains.
 * Input via Information.credits[] with type CreditType.UndistributedCapitalGains.
 * Flows to Schedule 3 line 13a.
 */
export default class F2439 extends F1040Attachment {
  tag: FormTag = 'f2439'
  sequenceIndex = 50

  credit = (): number | undefined => {
    const total = this.f1040.info.credits
      .filter((c) => c.type === CreditType.UndistributedCapitalGains)
      .reduce((sum, c) => sum + c.amount, 0)
    return total > 0 ? total : undefined
  }

  isNeeded = (): boolean => (this.credit() ?? 0) > 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
