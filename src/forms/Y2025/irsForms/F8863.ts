import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { FilingStatus, EducationExpenses } from 'ustaxes/core/data'
import { educationCredits } from '../data/federal'
import { sumFields } from 'ustaxes/core/irsForms/util'

/**
 * Form 8863 — Education Credits (American Opportunity and Lifetime Learning).
 *
 * AOTC: Up to $2,500/student (100% of first $2,000 + 25% of next $2,000).
 *   40% is refundable (max $1,000/student); 60% nonrefundable.
 * LLC:  20% of up to $10,000 in total qualified expenses; entirely nonrefundable.
 *
 * Both credits phase out based on Modified AGI (MAGI):
 *   Single/HOH: $80,000–$90,000  |  MFJ: $160,000–$180,000
 */
export default class F8863 extends F1040Attachment {
  tag: FormTag = 'f8863'
  sequenceIndex = 50

  isNeeded = (): boolean => (this.f1040.info.educationExpenses ?? []).length > 0

  private filingStatus = (): FilingStatus =>
    this.f1040.info.taxPayer.filingStatus

  /**
   * Modified AGI for education credit phase-out purposes.
   * For most taxpayers, MAGI equals line 11 (AGI) of Form 1040.
   */
  magi = (): number => this.f1040.l11b()

  /** Phase-out fraction [0,1] to apply to the education credits. */
  private phaseOutFraction = (
    phaseOutStart: number,
    phaseOutRange: number
  ): number => {
    const excess = Math.max(0, this.magi() - phaseOutStart)
    if (excess === 0) return 1
    const reduction = excess / phaseOutRange
    return Math.max(0, 1 - reduction)
  }

  private aotcStudents = (): EducationExpenses[] =>
    (this.f1040.info.educationExpenses ?? []).filter(
      (e) => e.aotcEligible && (e.aotcQualifiedExpenses ?? 0) > 0
    )

  private llcStudents = (): EducationExpenses[] =>
    (this.f1040.info.educationExpenses ?? []).filter(
      (e) => !e.aotcEligible && (e.llcQualifiedExpenses ?? 0) > 0
    )

  /** AOTC credit per student before phase-out. */
  private aotcPerStudent = (e: EducationExpenses): number => {
    const expenses = Math.min(
      e.aotcQualifiedExpenses ?? 0,
      educationCredits.aotc.maxExpenses
    )
    const first2k = Math.min(expenses, 2000) * educationCredits.aotc.rate1
    const next2k =
      Math.max(0, Math.min(expenses - 2000, 2000)) * educationCredits.aotc.rate2
    return first2k + next2k
  }

  /** Total AOTC credit before phase-out reduction (Form 8863 line 7). */
  aotcBeforePhaseOut = (): number =>
    this.aotcStudents().reduce((sum, e) => sum + this.aotcPerStudent(e), 0)

  /** AOTC phase-out fraction for current MAGI and filing status. */
  private aotcPhaseOutFraction = (): number => {
    const fs = this.filingStatus()
    return this.phaseOutFraction(
      educationCredits.aotc.phaseOutStart(fs),
      educationCredits.aotc.phaseOutRange(fs)
    )
  }

  /** AOTC credit after phase-out. */
  private aotcAfterPhaseOut = (): number =>
    Math.round(this.aotcBeforePhaseOut() * this.aotcPhaseOutFraction())

  /**
   * Line 8: Refundable portion of AOTC (40% of credit, max $1,000/student).
   * Flows to Form 1040 line 29.
   */
  l8 = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    const refundable = Math.round(
      this.aotcAfterPhaseOut() * educationCredits.aotc.refundableFraction
    )
    return refundable > 0 ? refundable : undefined
  }

  /** Nonrefundable AOTC portion (60% of credit after phase-out). */
  private aotcNonrefundable = (): number =>
    Math.round(
      this.aotcAfterPhaseOut() * (1 - educationCredits.aotc.refundableFraction)
    )

  /** LLC phase-out fraction for current MAGI and filing status. */
  private llcPhaseOutFraction = (): number => {
    const fs = this.filingStatus()
    return this.phaseOutFraction(
      educationCredits.llc.phaseOutStart(fs),
      educationCredits.llc.phaseOutRange(fs)
    )
  }

  /** LLC credit before phase-out. */
  private llcBeforePhaseOut = (): number => {
    const totalExpenses = this.llcStudents().reduce(
      (sum, e) => sum + (e.llcQualifiedExpenses ?? 0),
      0
    )
    const capped = Math.min(totalExpenses, educationCredits.llc.maxExpenses)
    return Math.round(capped * educationCredits.llc.rate)
  }

  /** LLC credit after phase-out. */
  private llcAfterPhaseOut = (): number =>
    Math.round(this.llcBeforePhaseOut() * this.llcPhaseOutFraction())

  /**
   * Line 19: Nonrefundable education credits (nonrefundable AOTC + LLC).
   * Flows to Schedule 3 line 3.
   */
  l19 = (): number | undefined => {
    if (!this.isNeeded()) return undefined
    const total = sumFields([this.aotcNonrefundable(), this.llcAfterPhaseOut()])
    return total > 0 ? total : undefined
  }

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
