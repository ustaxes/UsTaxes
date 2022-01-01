import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'

export default class ScheduleR extends Form {
  tp: TaxPayer
  tag: FormTag = 'f1040sr'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l22 = (): number | undefined => undefined

  fields = (): Field[] => []
}
