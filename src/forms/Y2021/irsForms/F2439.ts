import { TaxPayer } from 'ustaxes/core/data'
import { Field } from 'ustaxes/core/pdfFiller'
import Form, { FormTag } from './Form'

/**
 * TODO: not implemented
 * Referenced Schedule 3 line 13a
 */
export default class F2439 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f2439'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
