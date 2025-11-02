import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Impacts EIC, 1040 instructions L27 step 2 question 3
 * Not implemented yet
 */
export default class F4797 extends F1040Attachment {
  tag: FormTag = 'f4797'
  sequenceIndex = 999

  // TODO, required from schedule EIC, PUB 596, worksheet 1
  l7 = (): number | undefined => undefined
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined

  fields = (): Field[] => []
}
