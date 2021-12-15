import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from './Form'

/**
 * Not implemented yet
 */
export default class F4972 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f4972'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  tax = (): number => 0

  fields = (): Field[] => []
}
