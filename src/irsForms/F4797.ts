import { TaxPayer } from 'ustaxes/redux/data'

/**
 * Impacts EIC, 1040 instructions L27 step 2 question 3
 */
export default class F4797 {
  tp: TaxPayer

  constructor(tp: TaxPayer) {
    this.tp = tp
  }

  // TODO, required from schedule EIC, PUB 596, worksheet 1
  l7 = (): number | undefined => undefined
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined
}
