import { Field } from 'ustaxes/pdfFiller'
import { TaxPayer } from 'ustaxes/redux/data'
import Form, { FormTag } from './Form'

/**
 * Not implemented
 */
export default class F8910 extends Form {
  tp: TaxPayer
  sequenceIndex = 999
  tag: FormTag = 'f8910'

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l15 = (): number | undefined => undefined

  fields = (): Field[] => []
}
