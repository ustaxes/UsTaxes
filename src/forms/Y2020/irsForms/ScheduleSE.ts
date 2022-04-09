import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'

// TODO
export default class ScheduleSE extends F1040Attachment {
  tag = 'f1040se'
  sequenceIndex = 999

  l6 = (): number | undefined => undefined

  fields = (): Field[] => []
}
