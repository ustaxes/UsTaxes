import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Not implemented yet
 */
export default class F8888 extends F1040Attachment {
  tag: FormTag = 'f8888'
  sequenceIndex = 999

  fields = (): Field[] => []
}
