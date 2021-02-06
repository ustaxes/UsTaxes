import { TaxPayer } from '../redux/data'

export default class F8995 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  deductions = (): number => 0
}
