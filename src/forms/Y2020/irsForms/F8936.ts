import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'

export default class F8936 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8936'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l15 = (): number | undefined => undefined
  l23 = (): number | undefined => undefined

  fields = (): Field[] => []
}
