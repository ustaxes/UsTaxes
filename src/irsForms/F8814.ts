import { TaxPayer } from 'ustaxes/redux/data'
import log from 'ustaxes/log'

const unimplemented = (message: string): void =>
  log.warn(`[Form 8814] unimplemented ${message}`)

export default class F8814 {
  tp: TaxPayer

  constructor(tp: TaxPayer) {
    this.tp = tp
  }

  // TODO: required from schedule EIC, pub596, worksheet 1
  l1b = (): number | undefined => {
    unimplemented('line 1b')
    return undefined
  }

  tax = (): number => 0
}
