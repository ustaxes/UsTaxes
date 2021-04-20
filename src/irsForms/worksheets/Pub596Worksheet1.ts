import { TaxPayer } from '../../redux/data'

export default class Pub596Worksheet1 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  // TODO
  precludesEIC = (): boolean => false
}
