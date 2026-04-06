import F1040Attachment from './F1040Attachment'
import { PersonRole } from 'ustaxes/core/data'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/** 10% additional tax rate on early IRA/retirement distributions. */
const EARLY_WITHDRAWAL_TAX_RATE = 0.1

/**
 * Form 5329 — Additional Taxes on Qualified Plans (Including IRAs) and Other
 * Tax-Favored Accounts.
 *
 * Part I: 10% additional tax on early distributions from qualified plans.
 * The `earlyWithdrawalAmount` on each IRA record specifies the amount subject
 * to the penalty (amounts with exception codes should be excluded by the user).
 *
 * Flows to Schedule 2 lines 6 and 8.
 */
export default class F5329 extends F1040Attachment {
  tag: FormTag = 'f5329'
  sequenceIndex = 29

  /**
   * Total early-withdrawal amount across all IRAs for the given person role.
   * Excludes entries where earlyWithdrawalAmount is not set.
   */
  private earlyWithdrawalForRole = (role: PersonRole): number =>
    this.f1040.info.individualRetirementArrangements
      .filter(
        (ira) => ira.personRole === role && (ira.earlyWithdrawalAmount ?? 0) > 0
      )
      .reduce((sum, ira) => sum + (ira.earlyWithdrawalAmount ?? 0), 0)

  /** Part I line 1: total distributions subject to 10% additional tax. */
  l1 = (): number | undefined => {
    const primary = this.earlyWithdrawalForRole(PersonRole.PRIMARY)
    const spouse = this.earlyWithdrawalForRole(PersonRole.SPOUSE)
    const total = primary + spouse
    return total > 0 ? total : undefined
  }

  /** Part I line 8: 10% additional tax on early distributions. */
  l8 = (): number | undefined => {
    const base = this.l1()
    return base !== undefined
      ? Math.round(base * EARLY_WITHDRAWAL_TAX_RATE)
      : undefined
  }

  isNeeded = (): boolean => (this.l8() ?? 0) > 0

  /** Total additional tax flowing to Schedule 2 line 8. */
  toSchedule2l8 = (): number | undefined => this.l8()

  fields = (): Field[] => [
    // Header
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    // Part I — Lines 1-8 (early distributions, 10% additional tax)
    this.l1(), // Line 1: Amount distributed
    undefined, // Line 2: Exceptions
    this.l1(), // Line 3: Line 1 - Line 2 (assuming no exceptions)
    false, // Line 4 checkbox (exception applies)
    undefined, // Line 4 exception code
    undefined, // Line 5: Exception amount
    this.l1(), // Line 6: Line 3 - Line 5 (taxable amount)
    this.l8(), // Line 8 (approximate position): 10% additional tax
    // Parts II-IX (lines 9+) — not implemented
    ...new Array<Field>(66).fill(undefined)
  ]

  // Generated from Y2025 PDF schema (schemas/Y2025/f5329.json) — 75 fields total
  fillInstructions = (): FillInstructions => [
    // Header (0-1)
    text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    // Part I — Additional Tax on Early Distributions (lines 1-8) (2-10)
    text('topmostSubform[0].Page1[0].f1_3[0]', this.l1()), // Line 1
    text('topmostSubform[0].Page1[0].f1_4[0]', undefined), // Line 2 (exceptions)
    text('topmostSubform[0].Page1[0].f1_5[0]', this.l1()), // Line 3 (line 1 − 2)
    checkbox('topmostSubform[0].Page1[0].c1_1[0]', false), // Line 4 checkbox
    text('topmostSubform[0].Page1[0].f1_6[0]', undefined), // Line 4 exception code
    text('topmostSubform[0].Page1[0].f1_7[0]', undefined), // Line 5 exception amount
    text('topmostSubform[0].Page1[0].f1_8[0]', this.l1()), // Line 6 (taxable)
    text('topmostSubform[0].Page1[0].f1_9[0]', this.l8()), // Line 7/8 (10% tax)
    // Part I additional fields / Part II start (10-34)
    text('topmostSubform[0].Page1[0].f1_10[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_11[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_12[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_13[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_14[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_15[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_16[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_17[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_18[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_19[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_20[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_21[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_22[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_23[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_24[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_25[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_26[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_27[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_28[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_29[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_30[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_31[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_32[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_33[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_34[0]', undefined),
    // Page 2 — Parts V-VII (35-60)
    text('topmostSubform[0].Page2[0].f2_1[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_2[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_3[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_4[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_5[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_6[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_7[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_8[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_9[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_10[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_11[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_12[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_13[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_14[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_15[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_16[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_17[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_18[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_19[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_20[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_21[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_22[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_23[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_24[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_25[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_26[0]', undefined),
    // Page 3 — Part VIII-IX + summary (61-74)
    text('topmostSubform[0].Page3[0].f3_1[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_2[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_3[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_4[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_5[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_6[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_7[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_8[0]', undefined),
    checkbox('topmostSubform[0].Page3[0].c3_1[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_9[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_10[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_11[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_12[0]', undefined),
    text('topmostSubform[0].Page3[0].f3_13[0]', undefined)
  ]
}
