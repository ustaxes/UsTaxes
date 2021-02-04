import { TaxPayer } from '../redux/data'

export default class ScheduleEIC {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  credit = (): number | undefined => undefined
}
