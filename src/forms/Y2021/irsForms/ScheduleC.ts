import { TaxPayer } from 'ustaxes/core/data'
import { Field } from 'ustaxes/core/pdfFiller'
import Form, { FormTag } from './Form'

/**
 * Not implemented
 */
export default class ScheduleC extends Form {
  tp: TaxPayer
  tag: FormTag = 'f1040sc'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  // TODO: statutory employee income
  // shown on Schedule 8812, earned income
  l1 = (): number | undefined => undefined

  // TODO: net profit or loss
  // shown on Schedule 8812, earned income
  l31 = (): number | undefined => undefined

  fields = (): Field[] => []
}
