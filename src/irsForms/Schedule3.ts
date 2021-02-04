import { TaxPayer } from '../redux/data'

export default class Schedule3 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  deductions = (): number => 0

  // TODO
  l7 = (): number | undefined => undefined
  l13 = (): number | undefined => undefined
}
