import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Impacts EIC, 1040 instructions L27 step 1 squestion 4
 */
export default class F2555 extends F1040Attachment {
  tag: FormTag = 'f2555'
  sequenceIndex = 34

  // TODO - Required from SDCapitalGainWorksheet
  l3 = (): number | undefined => undefined

  // TODO - required from 6251
  l36 = (): number => 0

  // TODO - required from 6251
  l42 = (): number => 0

  // TODO - required from 8812
  l45 = (): number => 0

  // TODO - required from 6251 & 8812
  l50 = (): number => 0

  fields = (): Field[] => []
}
