import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'

/**
 * Referenced from line 21 of Schedule E
 */
export default class F6168 extends F1040Attachment {
  tag = 'f6168'
  sequenceIndex = 999

  fields = (): Field[] => []
}
