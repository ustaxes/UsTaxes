import { Field } from 'ustaxes/core/pdfFiller'
import F1040Attachment from './F1040Attachment'

/**
 * Referenced from line 21 of Schedule E
 * TODO: Not implemented
 */
export default class F6168 extends F1040Attachment {
  sequenceIndex = 999
  tag = 'f6168'

  fields = (): Field[] => []
}
