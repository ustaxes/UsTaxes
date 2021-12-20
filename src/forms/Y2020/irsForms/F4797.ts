import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Impacts EIC, 1040 instructions L27 step 2 question 3
 * Not implemented yet
 */
export default class F4797 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f4797'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  // TODO, required from schedule EIC, PUB 596, worksheet 1
  l7 = (): number | undefined => undefined
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined

  fields = (): Field[] => []
}
