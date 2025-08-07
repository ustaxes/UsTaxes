import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

// Not yet implemented
export default class F8863 extends F1040Attachment {
  tag: FormTag = 'f8863'
  sequenceIndex = 999

  l8 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined

  fields = (): Field[] => []
}
