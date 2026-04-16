import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { PersonRole, SelfEmployedIncome } from 'ustaxes/core/data'

/**
 * Schedule C — Profit or Loss From Business (Sole Proprietorship).
 *
 * Inputs come from Information.selfEmployedIncome[].
 * Only the key lines needed by Schedule SE and earned income calculations
 * are implemented; full Schedule C PDF filling is not yet wired.
 */
export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  private allSelfEmployed = (): SelfEmployedIncome[] => {
    const explicit = this.f1040.info.selfEmployedIncome ?? []
    const necDerived = this.f1040.f1099necs().map<SelfEmployedIncome>((f) => ({
      businessName: f.payer,
      personRole: f.personRole,
      grossReceipts: f.form.nonemployeeCompensation,
      expenses: 0
    }))

    return [...explicit, ...necDerived]
  }

  private forRole = (role: PersonRole.PRIMARY | PersonRole.SPOUSE) =>
    this.allSelfEmployed().filter((s) => s.personRole === role)

  /**
   * Gross receipts from statutory employee W-2s (Schedule C line 1).
   * Sums only entries marked isStatutoryEmployee.
   */
  l1 = (): number | undefined => {
    const total = this.allSelfEmployed()
      .filter((s) => s.isStatutoryEmployee)
      .reduce((sum, s) => sum + s.grossReceipts, 0)
    return total > 0 ? total : undefined
  }

  /** Total net profit or loss across all self-employed activities (Schedule C line 31). */
  l31 = (): number | undefined => {
    const total = this.allSelfEmployed().reduce(
      (sum, s) => sum + s.grossReceipts - s.expenses,
      0
    )
    return total !== 0 ? total : undefined
  }

  /** Net profit for the primary filer — used by Schedule SE. */
  l31Primary = (): number =>
    this.forRole(PersonRole.PRIMARY).reduce(
      (sum, s) => sum + s.grossReceipts - s.expenses,
      0
    )

  /** Net profit for the spouse — used by Schedule SE. */
  l31Spouse = (): number =>
    this.forRole(PersonRole.SPOUSE).reduce(
      (sum, s) => sum + s.grossReceipts - s.expenses,
      0
    )

  isNeeded = (): boolean => this.allSelfEmployed().length > 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
