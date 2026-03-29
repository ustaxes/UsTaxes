import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { fica } from '../data/federal'

/**
 * Form 4137 — Social Security and Medicare Tax on Unreported Tip Income.
 *
 * Filed when a taxpayer received tips but did not report them all to their
 * employer. The employee owes their share of FICA on the unreported amount.
 *
 * L6: The unreported tip wage amount. Used by Form 8959 line 2 to include
 *     these wages in the Additional Medicare Tax wage-base calculation.
 *
 * The FICA tax on unreported tips flows to Schedule 2 line 5, but full
 * Schedule 2 line 5 wiring (which requires the SS wage base comparison) is
 * deferred — see Schedule2.l5 TODO.
 */
export default class F4137 extends F1040Attachment {
  tag = 'f4137'
  sequenceIndex = 22

  isNeeded = (): boolean =>
    (this.f1040.info.otherEarnedIncome?.unreportedTips ?? 0) > 0

  /** Total unreported tips subject to FICA (Form 4137 line 5 equivalent). */
  unreportedTips = (): number =>
    this.f1040.info.otherEarnedIncome?.unreportedTips ?? 0

  /**
   * Line 6: Unreported tip wages included in the Medicare wage base.
   * Form 8959 adds this to the taxpayer's total Medicare wages to determine
   * Additional Medicare Tax liability.
   */
  l6 = (): number | undefined => {
    const tips = this.unreportedTips()
    return tips > 0 ? tips : undefined
  }

  /**
   * Employee share of Social Security tax on unreported tips.
   * Computed as: unreported tips × 6.2% (capped by SS wage base).
   * Part of the total FICA owed flowing to Schedule 2 line 5.
   */
  ssTaxOnTips = (): number => {
    const ssTaxRate = fica.maxSSTax / fica.maxIncomeSSTaxApplies // 6.2%
    const tips = this.unreportedTips()
    const totalSSWages = this.f1040
      .validW2s()
      .reduce((sum, w2) => sum + w2.ssWages, 0)
    const remainingSSCapacity = Math.max(
      0,
      fica.maxIncomeSSTaxApplies - totalSSWages
    )
    const tipsSubjectToSS = Math.min(tips, remainingSSCapacity)
    return Math.round(tipsSubjectToSS * ssTaxRate)
  }

  /** Employee share of Medicare tax on unreported tips: tips × 1.45%. */
  medicareTaxOnTips = (): number =>
    Math.round(this.unreportedTips() * fica.regularMedicareTaxRate)

  /**
   * Total FICA tax on unreported tips (SS + Medicare).
   * Flows to Schedule 2 line 5.
   */
  totalFicaTax = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    return this.ssTaxOnTips() + this.medicareTaxOnTips()
  }

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
