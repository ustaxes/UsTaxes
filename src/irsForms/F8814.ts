import { TaxPayer } from '../redux/data'

export default class F8814 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  tax = (): number => 0
}
