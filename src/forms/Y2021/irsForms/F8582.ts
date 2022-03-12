import { TaxPayer } from 'ustaxes/core/data'
import ScheduleE, { MatrixRow } from './ScheduleE'
import log from 'ustaxes/core/log'

let suppressedLogMessages: string[] = []

const unimplemented = (message: string): void => {
  // Excessive logging can hang the dev tools, so limit messages
  if (suppressedLogMessages.indexOf(message) === -1) {
    suppressedLogMessages.push(message)
    log.warn(`[Form 8582]: ${message}`)
  }
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

    // Reset suppressed messages
    suppressedLogMessages = []
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
