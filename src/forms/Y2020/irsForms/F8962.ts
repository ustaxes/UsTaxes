import { TaxPayer } from 'ustaxes/core/data'
import { Field } from 'ustaxes/core/pdfFiller'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * TODO: Not yet implemented
 * Net premium tax credit
 */
export default class F8962 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8962'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
