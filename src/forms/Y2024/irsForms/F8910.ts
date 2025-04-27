import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Not implemented
 */
export default class F8910 extends F1040Attachment {
  sequenceIndex = 999
  tag: FormTag = 'f8910'

  l15 = (): number | undefined => undefined

  fields = (): Field[] => []
}
