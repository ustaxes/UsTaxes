import _ from 'lodash'
import { MatrixRow } from './ScheduleE'
import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'

/** Maximum special allowance for active participation in rental real estate. */
const MAX_SPECIAL_ALLOWANCE = 25000

/** AGI at which the $25,000 special allowance begins phasing out. */
const PHASE_OUT_START = 100000

/**
 * Form 8582 — Passive Activity Loss Limitations (simplified active-participation path).
 *
 * Implements the $25,000 special allowance for rental real estate losses
 * where the taxpayer actively participates. The full passive activity rules
 * for other activities (general partnerships, passive S-corps, etc.) are
 * not yet implemented; their losses are treated as fully disallowed.
 */
export default class F8582 extends F1040Attachment {
  tag = 'f8582'
  sequenceIndex = 27

  /**
   * MAGI for the $25,000 rental loss allowance.
   * Simplified: MAGI ≈ AGI (F1040 line 11) ignoring the rare
   * IRA deduction and student loan interest add-back adjustments.
   */
  private magi = (): number => this.f1040.l11()

  /**
   * Maximum rental real estate loss allowed under the $25,000 special allowance.
   * The allowance phases out at 50 cents per dollar when MAGI exceeds $100,000,
   * reaching zero at MAGI ≥ $150,000.
   */
  private specialAllowance = (): number => {
    const magi = this.magi()
    const phaseOutReduction = Math.max(0, (magi - PHASE_OUT_START) * 0.5)
    return Math.max(0, MAX_SPECIAL_ALLOWANCE - phaseOutReduction)
  }

  /**
   * Net income / (loss) per rental property before the passive limitation.
   * Positive = profit, negative = loss.
   */
  private rentalNet = (): MatrixRow => this.f1040.scheduleE.rentalNet()

  /**
   * Total net rental losses (sum of negative values, expressed as positive).
   */
  private totalRentalLosses = (): number =>
    _.sum(
      this.rentalNet()
        .filter((v): v is number => v !== undefined && v < 0)
        .map((v) => -v)
    )

  /**
   * Allowed rental loss, limited to the $25,000 special allowance.
   */
  private allowedLoss = (): number =>
    Math.min(this.totalRentalLosses(), this.specialAllowance())

  /**
   * Deductible real estate loss per property after applying the passive limitation.
   * Losses are scaled proportionally across properties when total losses exceed the allowance.
   */
  deductibleRealEstateLossAfterLimitation = (): MatrixRow => {
    const net = this.rentalNet()
    const totalLoss = this.totalRentalLosses()
    const allowed = this.allowedLoss()

    if (totalLoss === 0) {
      return net.map(() => undefined) as MatrixRow
    }

    const scale = allowed / totalLoss

    return net.map((v) => {
      if (v === undefined || v >= 0) return undefined
      return Math.round(v * scale)
    }) as MatrixRow
  }

  isNeeded = (): boolean => this.totalRentalLosses() > 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
