import { TaxPayer } from 'usTaxes/redux/data'

/**
 * Impacts EIC, 1040 instructions L27 step 1 question 4
 */
export default class F2555 {
  tp: TaxPayer

  constructor(tp: TaxPayer) {
    this.tp = tp
  }
}
