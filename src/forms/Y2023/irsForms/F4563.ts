import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Exclusion of income for residents of American Somoa
 * Impacts 8812,
 */
export default class F4563 extends F1040Attachment {
  sequenceIndex = 563
  tag: FormTag = 'f4563'

  // TODO - required from 8812
  l15 = (): number => 0

  fields = (): Field[] => []
}
