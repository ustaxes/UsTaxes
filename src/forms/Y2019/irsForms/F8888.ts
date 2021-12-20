import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Not implemented yet
 */
export default class F8888 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8888'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  fields = (): Field[] => []
}
