import { TaxPayer } from '../redux/data'

export default class Schedule8812 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  credit = (): number | undefined => undefined
}
