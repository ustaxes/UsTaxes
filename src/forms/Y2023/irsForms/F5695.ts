import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Not implemented yet
 */
export default class F5695 extends F1040Attachment {
  tag: FormTag = 'f5695'
  sequenceIndex = 999

  l30 = (): number | undefined => undefined

  fields = (): Field[] => []
}
