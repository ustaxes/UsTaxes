import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 4952 — Investment Interest Expense Deduction.
 *
 * Limits the Schedule A investment interest deduction to net investment income.
 * Disallowed amounts carry forward to the next year.
 *
 * Simplified: l4a uses taxable interest + net ordinary dividends; l4b, l4c, l4d
 * are left undefined (user would need to elect qualified dividend treatment or
 * have separable investment property gains — uncommon for most filers).
 */
export default class F4952 extends F1040Attachment {
  tag: FormTag = 'f4952'
  sequenceIndex = 39

  isNeeded = (): boolean => this.investmentInterestExpense() > 0

  private investmentInterestExpense = (): number =>
    Number(this.f1040.info.itemizedDeductions?.investmentInterest ?? 0)

  /** Line 1 — Investment interest expense from broker statements. */
  l1 = (): number => this.investmentInterestExpense()

  /** Line 2 — Disallowed investment interest from prior year (Form 4952 line 4h). */
  l2 = (): number | undefined =>
    this.f1040.info.otherIncome?.priorYearInvestmentInterestCarryover

  /** Line 3 — Total (line 1 + line 2). */
  l3 = (): number => this.l1() + (this.l2() ?? 0)

  /**
   * Line 4a — Gross income from property held for investment, excluding
   * qualified dividends not elected for investment income treatment.
   *
   * Approximation: taxable interest (1040 line 2b) + ordinary dividends
   * minus qualified dividends (1040 line 3b − qualified dividends).
   */
  l4a = (): number => {
    const interest = this.f1040.l2b() ?? 0
    const ordinaryDividends = this.f1040.l3b() ?? 0
    const qualifiedDividends = this.f1040.l3a() ?? 0
    return interest + Math.max(0, ordinaryDividends - qualifiedDividends)
  }

  /** Line 4b — Qualified dividends elected to be treated as investment income. */
  l4b = (): number | undefined => undefined

  /**
   * Line 4e — Net investment income (line 4a + 4b − 4d, not less than 0).
   * Since l4d is not separately computed, this approximates as l4a + l4b.
   */
  l4e = (): number => Math.max(0, this.l4a() + (this.l4b() ?? 0))

  /**
   * Line 4g — Investment interest expense deduction (lesser of line 3 or 4f).
   * Since l4c is not tracked, l4f ≈ l4e.
   */
  l4g = (): number => Math.min(this.l3(), this.l4e())

  /**
   * Line 4h — Disallowed investment interest expense carried to next year
   * (line 3 − line 4g).
   */
  l4h = (): number => this.l3() - this.l4g()

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4a(),
    this.l4b(),
    undefined, // 4c — net gain (not separately tracked)
    undefined, // 4d — net capital gain (not separately tracked)
    this.l4e(),
    this.l4e(), // 4f ≈ 4e (no separate 4c to add)
    this.l4g(),
    this.l4h(),
    undefined, // remaining fields
    undefined,
    undefined,
    undefined
  ]

  // Generated from Y2025 PDF schema (schemas/Y2025/f4952.json) — 17 fields total
  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_02[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    text('topmostSubform[0].Page1[0].f1_03[0]', this.l1()),
    text('topmostSubform[0].Page1[0].f1_04[0]', this.l2()),
    text('topmostSubform[0].Page1[0].f1_05[0]', this.l3()),
    text('topmostSubform[0].Page1[0].Line4a_ReadOrder[0].f1_06[0]', this.l4a()),
    text('topmostSubform[0].Page1[0].f1_07[0]', this.l4b()),
    text('topmostSubform[0].Page1[0].f1_08[0]', undefined), // 4c — not tracked
    text('topmostSubform[0].Page1[0].f1_09[0]', undefined), // 4d — not tracked
    text('topmostSubform[0].Page1[0].f1_10[0]', this.l4e()),
    text('topmostSubform[0].Page1[0].f1_11[0]', this.l4e()), // 4f ≈ 4e
    text('topmostSubform[0].Page1[0].f1_12[0]', this.l4g()),
    text('topmostSubform[0].Page1[0].f1_13[0]', this.l4h()),
    text('topmostSubform[0].Page1[0].f1_14[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_15[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_16[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_17[0]', undefined)
  ]
}
