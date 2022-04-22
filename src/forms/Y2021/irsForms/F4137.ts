import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'

// TODO
export default class F4137 extends F1040Attachment {
  tag = 'f4137'
  sequenceIndex = 999

  l6 = (): number | undefined => undefined

  fields = (): Field[] => []
}
