import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * TODO: Not yet implemented
 * Net premium tax credit
 */
export default class F8962 extends F1040Attachment {
  tag: FormTag = 'f8962'
  sequenceIndex = 999

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
