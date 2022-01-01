import { Field } from 'ustaxes/core/pdfFiller'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import { TaxPayer } from 'ustaxes/core/data'

/**
 * Impacts EIC, 1040 instructions L27 step 1 question 4
 */
export default class F2555 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f2555'
  sequenceIndex = 34

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  // TODO - required from 8812
  l45 = (): number => 0

  // TODO - required from 8812
  l50 = (): number => 0

  fields = (): Field[] => []
}
