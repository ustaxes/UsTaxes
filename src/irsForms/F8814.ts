import { TaxPayer } from 'ustaxes/redux/data'
import log from 'ustaxes/log'
import Form, { FormTag } from './Form'
import { Field } from 'ustaxes/pdfFiller'

const unimplemented = (message: string): void =>
  log.warn(`[Form 8814] unimplemented ${message}`)

export default class F8814 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8814'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  // TODO: required from schedule EIC, pub596, worksheet 1
  l1b = (): number | undefined => {
    unimplemented('line 1b')
    return undefined
  }

  tax = (): number => 0

  fields = (): Field[] => []
}
