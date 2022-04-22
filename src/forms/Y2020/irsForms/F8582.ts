import F1040Attachment from './F1040Attachment'
import { MatrixRow } from './ScheduleE'
import { Field } from 'ustaxes/core/pdfFiller'

/**
 * Referenced from line 22 of Schedule E
 */
export default class F8582 extends F1040Attachment {
  tag = 'f8582'
  sequenceIndex = 999

  // TODO: 'Deducible rental estate loss after limitation, assuming all allowed'
  deductibleRealEstateLossAfterLimitation = (): MatrixRow => {
    const rentalNet = this.f1040.scheduleE.rentalNet()
    if (rentalNet === undefined) {
      return [undefined, undefined, undefined]
    }

    return rentalNet.map((v) => {
      if (v === undefined || v >= 0) {
        return undefined
      }
      return v
    }) as MatrixRow
  }

  fields = (): Field[] => []
}
