import { Field } from 'ustaxes/pdfFiller'
import { TaxPayer } from 'ustaxes/redux/data'
import Form, { FormTag } from './Form'

// Not yet implemented
export default class Form8853 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8853'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l1 = (): number | undefined => undefined
  l2 = (): number | undefined => undefined

  fields = (): Field[] => []
}
