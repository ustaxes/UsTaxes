import F1040Attachment from './F1040Attachment'
import { FilingStatus, PersonRole, W2Box12Code } from 'ustaxes/core/data'
import type { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import type { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import { text } from 'ustaxes/core/pdfFiller'
import { saversCreditThresholds } from '../data/federal'

/** Elective deferral box 12 codes that count toward the Saver's Credit. */
const ELECTIVE_DEFERRAL_CODES: W2Box12Code[] = [
  W2Box12Code.D, // 401(k)
  W2Box12Code.E, // 403(b)
  W2Box12Code.F, // 408(k) SEP
  W2Box12Code.G, // 457(b)
  W2Box12Code.H, // 501(c)(18)(D)
  W2Box12Code.S, // SIMPLE
  W2Box12Code.AA, // Roth 401(k)
  W2Box12Code.BB, // Roth 403(b)
  W2Box12Code.EE // Roth 457(b)
]

const MAX_ELIGIBLE_CONTRIBUTION = 2000

/**
 * People born after this date can't take the credit (2025 Form 8880:
 * "born after January 1, 2008").
 */
const BORN_AFTER_CUTOFF = new Date(2008, 0, 1, 23, 59, 59)

type Role = PersonRole.PRIMARY | PersonRole.SPOUSE

/**
 * Form 8880 — Credit for Qualified Retirement Savings Contributions
 * (Saver's Credit).
 *
 * Limitations of the data model:
 * - Line 4 uses only current-year IRA distributions; distributions from the
 *   two prior years and through the filing due date aren't tracked.
 * - There's no full-time student flag for the filer or spouse, so the
 *   student test isn't applied.
 */
export default class F8880 extends F1040Attachment {
  tag: FormTag = 'f8880'
  sequenceIndex = 54

  private isMFJ = (): boolean =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ

  /** Column (b) is completed only on a joint return. */
  private hasSpouseColumn = (): boolean =>
    this.isMFJ() && this.f1040.info.taxPayer.spouse !== undefined

  private person = (role: Role) =>
    role === PersonRole.SPOUSE
      ? this.f1040.info.taxPayer.spouse
      : this.f1040.info.taxPayer.primaryPerson

  /**
   * The person who made the contribution can't take the credit if they were
   * born after January 1, 2008, or are claimed as a dependent on someone
   * else's return.
   */
  isEligible = (role: Role): boolean => {
    if (role === PersonRole.SPOUSE && !this.hasSpouseColumn()) return false
    const p = this.person(role)
    if (p === undefined) return false
    return p.dateOfBirth <= BORN_AFTER_CUTOFF && !p.isTaxpayerDependent
  }

  private iraContribsForRole = (role: Role): number =>
    this.f1040.info.individualRetirementArrangements
      .filter((ira) => ira.personRole === role)
      .reduce((sum, ira) => sum + ira.contributions, 0)

  private iraDistributionsForRole = (role: Role): number =>
    this.f1040.info.individualRetirementArrangements
      .filter((ira) => ira.personRole === role)
      .reduce((sum, ira) => sum + ira.grossDistribution, 0)

  private electiveDeferralsForRole = (role: Role): number =>
    ELECTIVE_DEFERRAL_CODES.map((code) =>
      this.f1040.info.w2s
        .filter((w2) => w2.personRole === role)
        .reduce((sum, w2) => sum + (w2.box12?.[code] ?? 0), 0)
    ).reduce((sum, v) => sum + v, 0)

  private column = (role: Role): number | undefined =>
    role === PersonRole.SPOUSE && !this.hasSpouseColumn() ? undefined : 0

  // Line 1: IRA (and ABLE) contributions.
  l1 = (role: Role): number | undefined =>
    this.column(role) === undefined ? undefined : this.iraContribsForRole(role)

  // Line 2: Elective deferrals and voluntary employee contributions.
  l2 = (role: Role): number | undefined =>
    this.column(role) === undefined
      ? undefined
      : this.electiveDeferralsForRole(role)

  // Line 3: Add lines 1 and 2.
  l3 = (role: Role): number | undefined =>
    this.column(role) === undefined
      ? undefined
      : sumFields([this.l1(role), this.l2(role)])

  // Line 4: Certain distributions. "If married filing jointly, include both
  // spouses' amounts in both columns."
  l4 = (role: Role): number | undefined => {
    if (this.column(role) === undefined) return undefined
    if (this.isMFJ()) {
      return (
        this.iraDistributionsForRole(PersonRole.PRIMARY) +
        this.iraDistributionsForRole(PersonRole.SPOUSE)
      )
    }
    return this.iraDistributionsForRole(role)
  }

  // Line 5: Subtract line 4 from line 3. If zero or less, enter -0-.
  l5 = (role: Role): number | undefined =>
    this.column(role) === undefined
      ? undefined
      : Math.max(0, (this.l3(role) ?? 0) - (this.l4(role) ?? 0))

  // Line 6: Smaller of line 5 or $2,000 (0 if the person isn't eligible).
  l6 = (role: Role): number | undefined => {
    if (this.column(role) === undefined) return undefined
    if (!this.isEligible(role)) return 0
    return Math.min(this.l5(role) ?? 0, MAX_ELIGIBLE_CONTRIBUTION)
  }

  // Line 7: Add the amounts on line 6.
  l7 = (): number =>
    sumFields([this.l6(PersonRole.PRIMARY), this.l6(PersonRole.SPOUSE)])

  // Line 8: Form 1040 line 11a.
  l8 = (): number => this.f1040.l11b()

  // Line 9: Decimal amount from the table.
  creditRate = (): number => {
    const agi = this.l8()
    const thresholds =
      saversCreditThresholds[this.f1040.info.taxPayer.filingStatus]

    if (agi <= thresholds.rate50) return 0.5
    if (agi <= thresholds.rate20) return 0.2
    if (agi <= thresholds.rate10) return 0.1
    return 0
  }

  // Line 10: Multiply line 7 by line 9.
  l10 = (): number => Math.floor(this.l7() * this.creditRate())

  /**
   * Credit Limit Worksheet, line 2: Schedule 3 lines 1 through 3, 6d and 6l.
   * The credit for the elderly or disabled (Schedule R, line 6d on the form)
   * is carried on Schedule 3 l6b in this codebase, so it's added explicitly.
   */
  creditLimitWorksheetL2 = (): number => {
    const s3 = this.f1040.schedule3
    return sumFields([
      s3.l1(),
      s3.l2(),
      s3.l3(),
      s3.l6d(),
      s3.l6l(),
      this.f1040.scheduleR?.l22()
    ])
  }

  // Line 11: Credit Limit Worksheet line 3 (Form 1040 line 18 less line 2).
  l11 = (): number =>
    Math.max(0, this.f1040.l18() - this.creditLimitWorksheetL2())

  // Line 12: Smaller of line 10 or line 11. To Schedule 3 line 4.
  l12 = (): number => Math.min(this.l10(), this.l11())

  isNeeded = (): boolean => this.l12() > 0

  /** Amount flowing to Schedule 3 line 4. */
  credit = (): number | undefined => (this.isNeeded() ? this.l12() : undefined)

  private values = (): Field[] => {
    const P = PersonRole.PRIMARY
    const S = PersonRole.SPOUSE
    return [
      this.f1040.namesString(),
      this.f1040.info.taxPayer.primaryPerson.ssid,
      this.l1(P),
      this.l1(S),
      this.l2(P),
      this.l2(S),
      this.l3(P),
      this.l3(S),
      this.l4(P),
      this.l4(S),
      this.l5(P),
      this.l5(S),
      this.l6(P),
      this.l6(S),
      this.l7(),
      this.l8(),
      // Line 9: credit rate as a percentage (50, 20 or 10).
      this.creditRate() * 100,
      this.l10(),
      this.l11(),
      this.l12(),
      // Page 2 Credit Limit Worksheet, lines 1-3.
      this.f1040.l18(),
      this.creditLimitWorksheetL2(),
      this.l11()
    ]
  }

  fields = (): Field[] => this.values()

  // Generated from Y2025 PDF schema (schemas/Y2025/f8880.json) — 23 fields total
  fillInstructions = (): FillInstructions => {
    const names = [
      'topmostSubform[0].Page1[0].f1_1[0]',
      'topmostSubform[0].Page1[0].f1_2[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow1[0].f1_3[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow1[0].f1_4[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow2[0].f1_5[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow2[0].f1_6[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow3[0].f1_7[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow3[0].f1_8[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow4[0].f1_9[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow4[0].f1_10[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow5[0].f1_11[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow5[0].f1_12[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow6[0].f1_13[0]',
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow6[0].f1_14[0]',
      'topmostSubform[0].Page1[0].f1_15[0]',
      'topmostSubform[0].Page1[0].f1_16[0]',
      'topmostSubform[0].Page1[0].f1_17[0]',
      'topmostSubform[0].Page1[0].f1_18[0]',
      'topmostSubform[0].Page1[0].f1_19[0]',
      'topmostSubform[0].Page1[0].f1_20[0]',
      'topmostSubform[0].Page2[0].Col2[0].Pg2Worksheet[0].f2_1[0]',
      'topmostSubform[0].Page2[0].Col2[0].Pg2Worksheet[0].f2_2[0]',
      'topmostSubform[0].Page2[0].Col2[0].Pg2Worksheet[0].f2_3[0]'
    ]
    const values = this.values()
    return names.map((name, i) =>
      text(name, values[i] as string | number | undefined)
    )
  }
}
