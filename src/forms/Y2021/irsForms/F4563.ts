import { TaxPayer } from 'ustaxes/core/data'
import { Field } from 'ustaxes/core/pdfFiller'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Exclusion of income for residents of American Somoa
 * Impacts 8812,
 */
export default class F4563 extends Form {
  tp: TaxPayer
  sequenceIndex = 563
  tag: FormTag = 'f4563'

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  // TODO - required from 8812
  l15 = (): number => 0

  fields = (): Field[] => []
}
