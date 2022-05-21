import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Not implemented
 */
export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  // TODO: statutory employee income
  // shown on Schedule 8812, earned income
  l1 = (): number | undefined => undefined

  // TODO: net profit or loss
  // shown on Schedule 8812, earned income
  l31 = (): number | undefined => undefined

  fields = (): Field[] => []
}
