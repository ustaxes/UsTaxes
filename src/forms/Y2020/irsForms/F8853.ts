import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

// Not yet implemented
export default class F8853 extends F1040Attachment {
  tag: FormTag = 'f8853'
  sequenceIndex = 999

  l1 = (): number | undefined => undefined
  l2 = (): number | undefined => undefined

  fields = (): Field[] => []
}
