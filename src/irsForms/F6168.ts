import { TaxPayer } from '../redux/data'
import ScheduleE from './ScheduleE'

/**
 * Referenced from line 21 of Schedule E
 */
export default class F6168 {
  tp: TaxPayer
  scheduleE: ScheduleE

  constructor(tp: TaxPayer, scheduleE: ScheduleE) {
    this.tp = tp
    this.scheduleE = scheduleE
  }
}
