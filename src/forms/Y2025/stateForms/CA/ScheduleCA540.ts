import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FilingStatus, State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import parameters from './Parameters'

/**
 * Schedule CA (540): California Adjustments — Residents.
 *
 * Part I bridges federal income/adjustments to California amounts via
 * column B (subtractions) and column C (additions). Part II rebuilds
 * itemized deductions under California law (no state income or sales tax
 * deduction, no federal SALT cap).
 *
 * California nonconformity captured from available data:
 * - HSA: contributions are not deductible (Section C line 13 col B removes
 *   the federal deduction; employer contributions from W-2 box 12 code W
 *   are added to wages, line 1a col C). Federal-taxable HSA distributions
 *   are not California income (line 8f col B).
 * - Social security benefits are not taxed (line 6b col B).
 * - Unemployment compensation is not taxed (Section B line 7 col B).
 * - State tax refunds are not income (Section B line 1 col B).
 *
 * Not captured (data not collected by the app): US Treasury interest,
 * non-California municipal bond interest, HSA account earnings, CA
 * lottery winnings, mortgage interest differences.
 */
export default class ScheduleCA540 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 1
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'ScheduleCA'
    this.state = 'CA'
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => []

  isNeeded = (): boolean =>
    this.l27B() !== 0 || this.l27C() !== 0 || this.isItemizing()

  // ---------------------------------------------------------------
  // Part I, Section A — Income from federal Form 1040
  // ---------------------------------------------------------------

  /** Employer HSA contributions (W-2 box 12 code W) are CA wages */
  employerHsaContributions = (): number =>
    this.info.w2s.reduce((sum, w2) => sum + (w2.box12?.W ?? 0), 0)

  a1aA = (): number => this.f1040.l1a()
  a1aC = (): number | undefined => {
    const amt = this.employerHsaContributions()
    return amt > 0 ? amt : undefined
  }

  a1bA = (): number | undefined => this.f1040.l1b()
  a1cA = (): number | undefined => this.f1040.l1c()
  a1dA = (): number | undefined => this.f1040.l1d()
  a1eA = (): number | undefined => this.f1040.l1e()
  a1fA = (): number | undefined => this.f1040.l1f()
  a1gA = (): number | undefined => this.f1040.l1g()
  a1hA = (): number | undefined => this.f1040.l1h()

  a1zA = (): number => this.f1040.l1z()
  a1zB = (): number | undefined => undefined
  a1zC = (): number | undefined => this.a1aC()

  a2a = (): number | undefined => this.f1040.l2a()
  a2bA = (): number | undefined => this.f1040.l2b()
  a2bB = (): number | undefined => undefined
  a2bC = (): number | undefined => undefined

  a3a = (): number | undefined => this.f1040.l3a()
  a3bA = (): number | undefined => this.f1040.l3b()

  a4a = (): number | undefined => this.f1040.l4a()
  a4bA = (): number | undefined => this.f1040.l4b()

  a5a = (): number | undefined => this.f1040.l5a()
  a5bA = (): number | undefined => this.f1040.l5b()

  a6a = (): number | undefined => this.f1040.l6a()
  a6bA = (): number | undefined => this.f1040.l6b()
  /** Social security benefits are not taxable in California */
  a6bB = (): number | undefined => this.f1040.l6b()

  a7aA = (): number | undefined => this.f1040.l7a()
  a7aB = (): number | undefined => undefined
  a7aC = (): number | undefined => undefined

  // ---------------------------------------------------------------
  // Part I, Section B — Additional income from federal Schedule 1
  // ---------------------------------------------------------------

  b1A = (): number | undefined => this.f1040.schedule1.l1()
  /** State tax refunds are not California income */
  b1B = (): number | undefined => this.f1040.schedule1.l1()

  b2aA = (): number | undefined => this.f1040.schedule1.l2a()
  b3A = (): number | undefined => this.f1040.schedule1.l3()
  b4A = (): number | undefined => this.f1040.schedule1.l4()
  b5A = (): number | undefined => this.f1040.schedule1.l5()
  b6A = (): number | undefined => this.f1040.schedule1.l6()

  b7A = (): number | undefined => this.f1040.schedule1.l7()
  /** Unemployment compensation is not taxable in California */
  b7B = (): number | undefined => this.f1040.schedule1.l7()

  // Other income rows. The California schedule letters differ from this
  // codebase's federal Schedule 1 line letters, so rows are mapped by
  // meaning, not letter.
  b8aA = (): number | undefined => this.f1040.schedule1.l8a()
  b8bA = (): number | undefined => this.f1040.schedule1.l8b()
  b8cA = (): number | undefined => this.f1040.schedule1.l8c()
  /** Income from federal Form 8889 (taxable HSA distributions) */
  b8fA = (): number | undefined => this.f1040.schedule1.l8f()
  /** HSA distributions are not taxable for California */
  b8fB = (): number | undefined => this.f1040.schedule1.l8f()
  /** Alaska Permanent Fund dividends */
  b8gA = (): number | undefined => this.f1040.schedule1.l8g()
  /** Jury duty pay (federal line letter in this codebase: 8q) */
  b8hA = (): number | undefined => this.f1040.schedule1.l8q()
  /** Prizes and awards (federal line letter in this codebase: 8d) */
  b8iA = (): number | undefined => this.f1040.schedule1.l8d()
  /** Wages earned while incarcerated (federal letter here: 8e) */
  b8uA = (): number | undefined => this.f1040.schedule1.l8e()
  b8zA = (): number | undefined => this.f1040.schedule1.l8z()

  b9aA = (): number => this.f1040.schedule1.l9()
  b9aB = (): number | undefined => this.b8fB()
  b9aC = (): number | undefined => undefined

  /** Line 10 totals: Section A line 1z-7a plus Section B lines 1-7, 9a */
  l10A = (): number => this.f1040.l9()
  l10B = (): number =>
    sumFields([this.a6bB(), this.b1B(), this.b7B(), this.b9aB()])
  l10C = (): number => sumFields([this.a1zC()])

  // ---------------------------------------------------------------
  // Part I, Section C — Adjustments to income from federal Schedule 1
  // ---------------------------------------------------------------

  c11A = (): number | undefined => this.f1040.schedule1.l11()
  c12A = (): number | undefined => this.f1040.schedule1.l12()
  c13A = (): number | undefined => this.f1040.schedule1.l13()
  /**
   * California does not allow the HSA deduction; entering it in column B
   * removes it from the subtraction total.
   */
  c13B = (): number | undefined => this.f1040.schedule1.l13()
  c15A = (): number | undefined => this.f1040.schedule1.l15()
  c16A = (): number | undefined => this.f1040.schedule1.l16()
  c17A = (): number | undefined => this.f1040.schedule1.l17()
  c18A = (): number | undefined => this.f1040.schedule1.l18()
  /** IRA deduction (federal line method in this codebase: l19a) */
  c20A = (): number | undefined => this.f1040.schedule1.l19a()
  c21A = (): number | undefined => this.f1040.schedule1.l21()
  c23A = (): number | undefined => this.f1040.schedule1.l23()
  c25A = (): number => this.f1040.schedule1.l25()

  /** Line 26 totals: add lines 11 through 23 and line 25 */
  l26A = (): number => this.f1040.schedule1.l26()
  l26B = (): number => sumFields([this.c13B()])
  l26C = (): number => 0

  /** Line 27: line 10 less line 26, per column */
  l27A = (): number => this.l10A() - this.l26A()
  /** Form 540 line 14 (may be negative when disallowed deductions exceed subtractions) */
  l27B = (): number => this.l10B() - this.l26B()
  /** Form 540 line 16 */
  l27C = (): number => this.l10C() - this.l26C()

  // ---------------------------------------------------------------
  // Part II — Adjustments to federal itemized deductions
  // ---------------------------------------------------------------

  hasFederalItemized = (): boolean => this.f1040.scheduleA.isNeeded()

  p2l1 = (): number => this.f1040.scheduleA.l1()
  p2l2 = (): number => this.f1040.l11b()
  p2l3 = (): number => this.f1040.scheduleA.l3()
  p2l4A = (): number => this.f1040.scheduleA.l4()

  p2l5aA = (): number => this.f1040.scheduleA.l5a()
  /** California allows neither state income nor general sales taxes */
  p2l5aB = (): number => this.f1040.scheduleA.l5a()
  p2l5bA = (): number => this.f1040.scheduleA.l5b()
  p2l5cA = (): number => this.f1040.scheduleA.l5c()
  p2l5dA = (): number => this.f1040.scheduleA.l5d()
  p2l5eA = (): number => this.f1040.scheduleA.l5e()
  p2l5eB = (): number => Math.min(this.p2l5aB(), this.p2l5eA())
  /** Restore the amount the federal SALT cap removed (no CA cap) */
  p2l5eC = (): number => Math.max(0, this.p2l5dA() - this.p2l5eA())

  p2l6A = (): number => 0
  p2l7A = (): number => this.p2l5eA() + this.p2l6A()
  p2l7B = (): number => this.p2l5eB()
  p2l7C = (): number => this.p2l5eC()

  p2l8aA = (): number => this.f1040.scheduleA.l8a()
  p2l8bA = (): number => this.f1040.scheduleA.l8b()
  p2l8cA = (): number => this.f1040.scheduleA.l8c()
  p2l8eA = (): number => this.f1040.scheduleA.l8e()
  p2l9A = (): number | undefined => this.f1040.scheduleA.l9()
  p2l10A = (): number => this.f1040.scheduleA.l10()

  p2l11A = (): number => this.f1040.scheduleA.l11()
  p2l12A = (): number => this.f1040.scheduleA.l12()
  p2l13A = (): number => this.f1040.scheduleA.l13()
  p2l14A = (): number => this.f1040.scheduleA.l14()
  p2l15A = (): number => 0
  p2l16A = (): number => 0

  p2l17A = (): number =>
    sumFields([
      this.p2l4A(),
      this.p2l7A(),
      this.p2l10A(),
      this.p2l14A(),
      this.p2l15A(),
      this.p2l16A()
    ])
  p2l17B = (): number => this.p2l7B()
  p2l17C = (): number => this.p2l7C()

  /** Line 18: column A less column B plus column C */
  p2l18 = (): number => this.p2l17A() - this.p2l17B() + this.p2l17C()

  // Lines 19-25: job expenses and certain miscellaneous deductions
  // (California still allows these; not collected by the app)
  p2l22 = (): number => 0
  p2l25 = (): number => 0

  p2l26 = (): number => this.p2l18() + this.p2l25()
  p2l27 = (): number => 0
  p2l28 = (): number => this.p2l26() + this.p2l27()

  /**
   * Line 29: itemized deductions limitation for federal AGI over the
   * threshold — reduce by the lesser of 6% of excess AGI or 80% of the
   * deductions other than medical, investment interest, casualty, and
   * gambling losses.
   */
  p2l29 = (): number => {
    const l28 = this.p2l28()
    const fedAGI = this.f1040.l11b()
    const status = this.filingStatus()
    const threshold = parameters.highIncomeThreshold(status)
    if (fedAGI <= threshold) return l28
    const protectedAmounts = sumFields([
      this.p2l4A(),
      this.p2l9A(),
      this.p2l15A()
    ])
    const reducible = Math.max(0, l28 - protectedAmounts)
    const reduction = Math.min(reducible * 0.8, (fedAGI - threshold) * 0.06)
    return Math.round(l28 - reduction)
  }

  /** Line 30: larger of line 29 or the California standard deduction */
  p2l30 = (): number =>
    Math.max(this.p2l29(), parameters.standardDeduction(this.filingStatus()))

  isItemizing = (): boolean =>
    this.hasFederalItemized() &&
    this.p2l29() > parameters.standardDeduction(this.filingStatus())

  filingStatus = (): FilingStatus => this.info.taxPayer.filingStatus

  // ---------------------------------------------------------------
  // PDF fill
  // ---------------------------------------------------------------

  fullName = (): string => {
    const primary = this.info.taxPayer.primaryPerson
    const spouse = this.info.taxPayer.spouse
    const names = [
      `${primary.firstName} ${primary.lastName}`,
      ...(spouse !== undefined
        ? [`${spouse.firstName} ${spouse.lastName}`]
        : [])
    ]
    return names.join(', ')
  }

  fillInstructions = (): FillInstructions => [
    text('540ca_form - 1000', this.fullName()),
    text('540ca_form - 1001', this.info.taxPayer.primaryPerson.ssid),
    // Section A
    text('540ca_form - 1002', this.a1aA()),
    text('540ca_form - 1004', this.a1aC()),
    text('540ca_form - 1005', this.a1bA()),
    text('540ca_form - 1008', this.a1cA()),
    text('540ca_form - 1011', this.a1dA()),
    text('540ca_form - 1014', this.a1eA()),
    text('540ca_form - 1017', this.a1fA()),
    text('540ca_form - 1020', this.a1gA()),
    text('540ca_form - 1023b', this.a1hA()),
    text('540ca_form - 1027', this.a1zA()),
    text('540ca_form - 1028', this.a1zB()),
    text('540ca_form - 1029', this.a1zC()),
    text('540ca_form - 1030', this.a2a()),
    text('540ca_form - 1031', this.a2bA()),
    text('540ca_form - 1032', this.a2bB()),
    text('540ca_form - 1033', this.a2bC()),
    text('540ca_form - 1034', this.a3a()),
    text('540ca_form - 1035', this.a3bA()),
    text('540ca_form - 1038', this.a4a()),
    text('540ca_form - 1039', this.a4bA()),
    text('540ca_form - 1042', this.a5a()),
    text('540ca_form - 1043', this.a5bA()),
    text('540ca_form - 1046', this.a6a()),
    text('540ca_form - 1047', this.a6bA()),
    text('540ca_form - 1048', this.a6bB()),
    text('540ca_form - 1049', this.a7aA()),
    text('540ca_form - 1050', this.a7aB()),
    text('540ca_form - 1051', this.a7aC()),
    // Section B
    text('540ca_form - 1052', this.b1A()),
    text('540ca_form - 1053', this.b1B()),
    text('540ca_form - 1054', this.b2aA()),
    text('540ca_form - 1056', this.b3A()),
    text('540ca_form - 1059', this.b4A()),
    text('540ca_form - 1062', this.b5A()),
    text('540ca_form - 1065', this.b6A()),
    text('540ca_form - 1068', this.b7A()),
    text('540ca_form - 1069', this.b7B()),
    text('540ca_form - 2001', this.b8aA()),
    text('540ca_form - 2003', this.b8bA()),
    text('540ca_form - 2005', this.b8cA()),
    text('540ca_form - 2012', this.b8fA()),
    text('540ca_form - 2013', this.b8fB()),
    text('540ca_form - 2014', this.b8gA()),
    text('540ca_form - 2015', this.b8hA()),
    text('540ca_form - 2016', this.b8iA()),
    text('540ca_form - 2033', this.b8uA()),
    text('540ca_form - 2038', this.b8zA()),
    text('540ca_form - 3001', this.b9aA()),
    text('540ca_form - 3002', this.b9aB()),
    text('540ca_form - 3003', this.b9aC()),
    text('540ca_form - 3007', this.l10A()),
    text('540ca_form - 3008', this.l10B()),
    text('540ca_form - 3009', this.l10C()),
    // Section C
    text('540ca_form - 3010', this.c11A()),
    text('540ca_form - 3012', this.c12A()),
    text('540ca_form - 3015', this.c13A()),
    text('540ca_form - 3016', this.c13B()),
    text('540ca_form - 3019', this.c15A()),
    text('540ca_form - 3021', this.c16A()),
    text('540ca_form - 3022', this.c17A()),
    text('540ca_form - 3024', this.c18A()),
    text('540ca_form - 3029', this.c20A()),
    text('540ca_form - 3032', this.c21A()),
    text('540ca_form - 3034', this.c23A()),
    text('540ca_form - 4026', this.c25A()),
    text('540ca_form - 4029', this.l26A()),
    text('540ca_form - 4030', this.l26B()),
    text('540ca_form - 4031', this.l26C()),
    text('540ca_form - 4032', this.l27A()),
    text('540ca_form - 4033', this.l27B()),
    text('540ca_form - 4034', this.l27C()),
    // Part II (only filled when itemizing for California)
    checkbox(
      '540ca_form - 5000 CB',
      !this.hasFederalItemized() && this.isItemizing()
    ),
    ...(this.hasFederalItemized()
      ? [
          text('540ca_form - 5001', this.p2l1()),
          text('540ca_form - 5002', this.p2l2()),
          text('540ca_form - 5003', Math.round(this.p2l3())),
          text('540ca_form - 5004', this.p2l4A()),
          text('540ca_form - 5006', this.p2l5aA()),
          text('540ca_form - 5007', this.p2l5aB()),
          text('540ca_form - 5008', this.p2l5bA()),
          text('540ca_form - 5009', this.p2l5cA()),
          text('540ca_form - 5010', this.p2l5dA()),
          text('540ca_form - 5011', this.p2l5eA()),
          text('540ca_form - 5012', this.p2l5eB()),
          text('540ca_form - 5013', this.p2l5eC()),
          text('540ca_form - 5018', this.p2l7A()),
          text('540ca_form - 5019', this.p2l7B()),
          text('540ca_form - 5020', this.p2l7C()),
          text('540ca_form - 5021', this.p2l8aA()),
          text('540ca_form - 5023', this.p2l8bA()),
          text('540ca_form - 5025', this.p2l8cA()),
          text('540ca_form - 5027', this.p2l8eA()),
          text('540ca_form - 5030', this.p2l9A()),
          text('540ca_form - 5033', this.p2l10A()),
          text('540ca_form - 6001', this.p2l11A()),
          text('540ca_form - 6004', this.p2l12A()),
          text('540ca_form - 6007', this.p2l13A()),
          text('540ca_form - 6010', this.p2l14A()),
          text('540ca_form - 6019', this.p2l17A()),
          text('540ca_form - 6020', this.p2l17B()),
          text('540ca_form - 6021', this.p2l17C()),
          text('540ca_form - 6022', this.p2l18()),
          text('540ca_form - 6027', this.p2l22()),
          text('540ca_form - 6028', this.p2l2()),
          text('540ca_form - 6030', this.p2l25()),
          text('540ca_form - 6031', this.p2l26()),
          text('540ca_form - 6033', this.p2l27()),
          text('540ca_form - 6034', this.p2l28()),
          text('540ca_form - 6035', this.p2l29()),
          text('540ca_form - 6036', this.p2l30())
        ]
      : [])
  ]

  fields = (): Field[] => this.fillInstructions().map((i) => i.value)
}
