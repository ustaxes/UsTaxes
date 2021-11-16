import { Field } from 'ustaxes/pdfFiller'
import { TaxPayer } from 'ustaxes/redux/data'
import Form, { FormTag } from './Form'

// Not yet implemented
export default class ScheduleA extends Form {
  tp: TaxPayer
  tag: FormTag = 'f1040sa'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  deductions(): number {
    return 0
  }

  // Used in Form 8960
  l9 = (): number | undefined => undefined

  fields = (): Field[] => []
}
