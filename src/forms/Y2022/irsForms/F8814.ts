import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'

export default class F8814 extends F1040Attachment {
  tag: FormTag = 'f8814'
  sequenceIndex = 999

  // TODO: required from schedule EIC, pub596, worksheet 1
  l1b = (): number | undefined => undefined

  tax = (): number => 0

  fields = (): Field[] => []
}
