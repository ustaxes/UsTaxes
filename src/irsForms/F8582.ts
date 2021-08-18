import { TaxPayer } from 'usTaxes/redux/data'
import ScheduleE, { MatrixRow } from './ScheduleE'
import log from 'usTaxes/log'

const unimplemented = (message: string): void => {
  log.warn(`[Form 8582]: ${message}`)
}

/**
 * Referenced from line 22 of Schedule E
 */
export default class F8582 {
  tp: TaxPayer
  scheduleE: ScheduleE

  constructor(tp: TaxPayer, scheduleE: ScheduleE) {
    this.tp = tp
    this.scheduleE = scheduleE
  }

  deductibleRealEstateLossAfterLimitation = (): MatrixRow => {
    unimplemented(
      'Deducible rental estate loss after limitation, assuming all allowed'
    )
    const rentalNet = this.scheduleE.rentalNet()
    return rentalNet.map((v) => {
      if (v === undefined || v >= 0) {
        return undefined
      }
      return v
    }) as MatrixRow
  }
}
