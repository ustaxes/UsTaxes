import F1040Attachment from './F1040Attachment'
import { PersonRole, W2Box12Code } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
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
 * Form 8880 — Retirement Savings Contributions Credit (Saver's Credit).
 *
 * Approximation: IRA contributions + elective deferrals reduced by current-year
 * IRA distributions. A full implementation would also subtract distributions
 * received in the 2 prior years, which are not tracked in the data model.
 */
export default class F8880 extends F1040Attachment {
  tag: FormTag = 'f8880'
  sequenceIndex = 54

  private iraContribsForRole = (
    role: PersonRole.PRIMARY | PersonRole.SPOUSE
  ): number =>
    this.f1040.info.individualRetirementArrangements
      .filter((ira) => ira.personRole === role)
      .reduce((sum, ira) => sum + ira.contributions, 0)

  private iraDistributionsForRole = (
    role: PersonRole.PRIMARY | PersonRole.SPOUSE
  ): number =>
    this.f1040.info.individualRetirementArrangements
      .filter((ira) => ira.personRole === role)
      .reduce((sum, ira) => sum + ira.grossDistribution, 0)

  private electiveDeferralsForRole = (
    role: PersonRole.PRIMARY | PersonRole.SPOUSE
  ): number =>
    ELECTIVE_DEFERRAL_CODES.map((code) =>
      this.f1040.info.w2s
        .filter((w2) => w2.personRole === role)
        .reduce((sum, w2) => sum + (w2.box12?.[code] ?? 0), 0)
    ).reduce((sum, v) => sum + v, 0)

  private contributionsForRole = (
    role: PersonRole.PRIMARY | PersonRole.SPOUSE
  ): number =>
    Math.max(
      0,
      this.iraContribsForRole(role) +
        this.electiveDeferralsForRole(role) -
        this.iraDistributionsForRole(role)
    )

  /** Eligible contributions for primary filer (capped at $2,000). */
  l1Primary = (): number =>
    Math.min(
      MAX_ELIGIBLE_CONTRIBUTION,
      this.contributionsForRole(PersonRole.PRIMARY)
    )

  /** Eligible contributions for spouse (capped at $2,000). */
  l1Spouse = (): number =>
    this.f1040.info.taxPayer.spouse
      ? Math.min(
          MAX_ELIGIBLE_CONTRIBUTION,
          this.contributionsForRole(PersonRole.SPOUSE)
        )
      : 0

  /** Total eligible contributions. */
  l3 = (): number => this.l1Primary() + this.l1Spouse()

  /** Credit rate based on AGI (line 11 from F1040). */
  creditRate = (): number => {
    const agi = this.f1040.l11b()
    const fs = this.f1040.info.taxPayer.filingStatus
    const thresholds = saversCreditThresholds[fs]

    if (agi <= thresholds.rate50) return 0.5
    if (agi <= thresholds.rate20) return 0.2
    if (agi <= thresholds.rate10) return 0.1
    return 0
  }

  /** Credit amount before credit limit worksheet. */
  l4 = (): number => Math.floor(this.l3() * this.creditRate())

  isNeeded = (): boolean => this.l4() > 0

  /** Amount flowing to Schedule 3 line 4. */
  credit = (): number | undefined => (this.isNeeded() ? this.l4() : undefined)

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    // Line 1: IRA contributions (primary, spouse)
    this.iraContribsForRole(PersonRole.PRIMARY),
    this.f1040.info.taxPayer.spouse
      ? this.iraContribsForRole(PersonRole.SPOUSE)
      : undefined,
    // Line 2: Elective deferrals (primary, spouse)
    this.electiveDeferralsForRole(PersonRole.PRIMARY),
    this.f1040.info.taxPayer.spouse
      ? this.electiveDeferralsForRole(PersonRole.SPOUSE)
      : undefined,
    // Line 3: Line 1 + Line 2 (primary, spouse)
    this.iraContribsForRole(PersonRole.PRIMARY) +
      this.electiveDeferralsForRole(PersonRole.PRIMARY),
    this.f1040.info.taxPayer.spouse
      ? this.iraContribsForRole(PersonRole.SPOUSE) +
        this.electiveDeferralsForRole(PersonRole.SPOUSE)
      : undefined,
    // Line 4: Distributions (primary, spouse)
    this.iraDistributionsForRole(PersonRole.PRIMARY),
    this.f1040.info.taxPayer.spouse
      ? this.iraDistributionsForRole(PersonRole.SPOUSE)
      : undefined,
    // Line 5: Line 3 - Line 4 (primary, spouse)
    this.contributionsForRole(PersonRole.PRIMARY),
    this.f1040.info.taxPayer.spouse
      ? this.contributionsForRole(PersonRole.SPOUSE)
      : undefined,
    // Line 6: $2,000 limit (primary, spouse)
    Math.min(
      MAX_ELIGIBLE_CONTRIBUTION,
      this.contributionsForRole(PersonRole.PRIMARY)
    ),
    this.f1040.info.taxPayer.spouse
      ? Math.min(
          MAX_ELIGIBLE_CONTRIBUTION,
          this.contributionsForRole(PersonRole.SPOUSE)
        )
      : undefined,
    // Line 7: Total eligible contributions
    this.l3(),
    // Line 8: AGI
    this.f1040.l11b(),
    // Line 9: Credit rate (as percentage e.g. 50, 20, 10)
    this.creditRate() * 100,
    // Line 10: Credit before limit (line 7 × rate)
    this.l4(),
    // Line 11: Credit limit (from worksheet — not computed; leave undefined)
    undefined,
    // Line 12: Actual credit (smaller of line 10 and 11)
    this.l4(),
    // Page 2 worksheet (not computed)
    undefined,
    undefined,
    undefined
  ]

  // Generated from Y2025 PDF schema (schemas/Y2025/f8880.json) — 23 fields total
  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    // Line 1 — IRA contributions (primary col, spouse col)
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow1[0].f1_3[0]',
      this.iraContribsForRole(PersonRole.PRIMARY)
    ),
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow1[0].f1_4[0]',
      this.f1040.info.taxPayer.spouse
        ? this.iraContribsForRole(PersonRole.SPOUSE)
        : undefined
    ),
    // Line 2 — Elective deferrals (primary col, spouse col)
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow2[0].f1_5[0]',
      this.electiveDeferralsForRole(PersonRole.PRIMARY)
    ),
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow2[0].f1_6[0]',
      this.f1040.info.taxPayer.spouse
        ? this.electiveDeferralsForRole(PersonRole.SPOUSE)
        : undefined
    ),
    // Line 3 — Line 1 + Line 2 (primary col, spouse col)
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow3[0].f1_7[0]',
      this.iraContribsForRole(PersonRole.PRIMARY) +
        this.electiveDeferralsForRole(PersonRole.PRIMARY)
    ),
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow3[0].f1_8[0]',
      this.f1040.info.taxPayer.spouse
        ? this.iraContribsForRole(PersonRole.SPOUSE) +
            this.electiveDeferralsForRole(PersonRole.SPOUSE)
        : undefined
    ),
    // Line 4 — Distributions from IRAs/plans (primary col, spouse col)
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow4[0].f1_9[0]',
      this.iraDistributionsForRole(PersonRole.PRIMARY)
    ),
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow4[0].f1_10[0]',
      this.f1040.info.taxPayer.spouse
        ? this.iraDistributionsForRole(PersonRole.SPOUSE)
        : undefined
    ),
    // Line 5 — Subtract line 4 from line 3 (primary col, spouse col)
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow5[0].f1_11[0]',
      this.contributionsForRole(PersonRole.PRIMARY)
    ),
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow5[0].f1_12[0]',
      this.f1040.info.taxPayer.spouse
        ? this.contributionsForRole(PersonRole.SPOUSE)
        : undefined
    ),
    // Line 6 — $2,000 limit (primary col, spouse col)
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow6[0].f1_13[0]',
      Math.min(
        MAX_ELIGIBLE_CONTRIBUTION,
        this.contributionsForRole(PersonRole.PRIMARY)
      )
    ),
    text(
      'topmostSubform[0].Page1[0].Table_Ln1-6[0].BodyRow6[0].f1_14[0]',
      this.f1040.info.taxPayer.spouse
        ? Math.min(
            MAX_ELIGIBLE_CONTRIBUTION,
            this.contributionsForRole(PersonRole.SPOUSE)
          )
        : undefined
    ),
    // Line 7 — Total eligible contributions (smaller of line 5 or 6 for each, combined)
    text('topmostSubform[0].Page1[0].f1_15[0]', this.l3()),
    // Line 8 — AGI
    text('topmostSubform[0].Page1[0].f1_16[0]', this.f1040.l11b()),
    // Line 9 — Credit rate (as percentage integer: 50, 20, or 10)
    text('topmostSubform[0].Page1[0].f1_17[0]', this.creditRate() * 100),
    // Line 10 — Credit amount before credit limit (line 7 × line 9)
    text('topmostSubform[0].Page1[0].f1_18[0]', this.l4()),
    // Line 11 — Credit limit from worksheet (page 2) — not computed
    text('topmostSubform[0].Page1[0].f1_19[0]', undefined),
    // Line 12 — Final credit (smaller of line 10 or 11)
    text('topmostSubform[0].Page1[0].f1_20[0]', this.l4()),
    // Page 2 — Credit Limit Worksheet (not computed)
    text(
      'topmostSubform[0].Page2[0].Col2[0].Pg2Worksheet[0].f2_1[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page2[0].Col2[0].Pg2Worksheet[0].f2_2[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page2[0].Col2[0].Pg2Worksheet[0].f2_3[0]',
      undefined
    )
  ]
}
