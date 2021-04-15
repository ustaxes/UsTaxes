import { TaxPayer } from '../redux/data'

/**
 * Impacts EIC, 1040 instructions L27 step 2 question 3
 */
export default class F4797 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }
}
