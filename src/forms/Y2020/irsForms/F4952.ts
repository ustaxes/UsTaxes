import { Field } from 'ustaxes/core/pdfFiller'
import { TaxPayer } from 'ustaxes/core/data'
import Form, { FormTag } from './Form'

/**
 * Impacts Schedule D, capital gains and taxes worksheet,
 * Not implemented yet
 */
export default class F4952 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f4952'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l4e = (): number | undefined => undefined
  l4g = (): number | undefined => undefined

  fields = (): Field[] => []
}
