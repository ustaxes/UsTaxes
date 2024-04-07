import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * TODO: not implemented
 * Credit for federal tax on fuels
 */
export default class F4136 extends F1040Attachment {
  tag: FormTag = 'f4136'
  sequenceIndex = 999

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
