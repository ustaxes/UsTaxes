import { Field } from 'ustaxes/pdfFiller'
import { TaxPayer } from 'ustaxes/redux/data'
import Form, { FormTag } from './Form'

export default class F8936 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8936'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l23 = (): number | undefined => undefined

  fields = (): Field[] => []
}
