import F1040Attachment from './F1040Attachment'
import type { Field } from 'ustaxes/core/pdfFiller'
import type { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * TODO: Credit for child and dependent care expenses
 */
export default class F2441 extends F1040Attachment {
  tag: FormTag = 'f2441'
  sequenceIndex = 999

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
