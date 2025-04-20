import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * TODO: Not implemented yet
 */
export default class F4972 extends F1040Attachment {
  tag: FormTag = 'f4972'
  sequenceIndex = 999

  tax = (): number => 0

  fields = (): Field[] => []
}
