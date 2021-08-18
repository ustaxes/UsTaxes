import { TaxPayer } from 'usTaxes/redux/data'

export default class ScheduleA {
  tp: TaxPayer

  constructor(tp: TaxPayer) {
    this.tp = tp
  }

  deductions(): number {
    return 0
  }
}
