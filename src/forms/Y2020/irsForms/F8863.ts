import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from './Form'

// Not yet implemented
export default class F8863 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8863'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l8 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined

  fields = (): Field[] => []
}
