import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

export default class F8936 extends F1040Attachment {
  tag: FormTag = 'f8936'
  sequenceIndex = 999

  l15 = (): number | undefined => undefined
  l23 = (): number | undefined => undefined

  fields = (): Field[] => []
}
