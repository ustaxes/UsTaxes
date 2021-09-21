import { Field } from 'ustaxes/pdfFiller'
import { TaxPayer } from 'ustaxes/redux/data'
import Form, { FormTag } from './Form'

/**
 * Not implemented
 */
export default class F8995 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8995'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  deductions = (): number => 0

  fields = (): Field[] => []
}
