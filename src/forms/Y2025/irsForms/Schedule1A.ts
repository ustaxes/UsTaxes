import F1040Attachment from './F1040Attachment'
import { FilingStatus } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'
import { obbbDeductionLimits } from '../data/federal'
import { sumFields } from 'ustaxes/core/irsForms/util'

/** Schedule 1-A (Form 1040) — OBBB additional deductions (2025-2028). */
export default class Schedule1A extends F1040Attachment {
  tag: FormTag = 'f1040s1a'
  sequenceIndex = 1.5

  constructor(f1040: F1040) {
    super(f1040)
  }

  isMFJ = (): boolean =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ

  private get fs(): FilingStatus {
    return this.f1040.info.taxPayer.filingStatus
  }

  private get obbb() {
    return this.f1040.info.obbbDeductions ?? {}
  }

  // ─── Part I: Modified Adjusted Gross Income (MAGI) Amount ───────────────────

  // Line 1: AGI from Form 1040 line 11
  l1 = (): number => this.f1040.l11b()

  // Line 2a: Income from Puerto Rico excluded (not supported)
  l2a = (): number | undefined => undefined

  // Line 2b: Amount from Form 2555 line 45 (foreign earned income exclusion)
  l2b = (): number | undefined =>
    this.f1040.f2555 !== undefined ? this.f1040.f2555.l45() : undefined

  // Line 2c: Amount from Form 2555 line 50
  l2c = (): number | undefined =>
    this.f1040.f2555 !== undefined ? this.f1040.f2555.l50() : undefined

  // Line 2d: Amount from Form 4563 line 15 (exclusion for American Samoa residents)
  l2d = (): number | undefined =>
    this.f1040.f4563 !== undefined ? this.f1040.f4563.l15() : undefined

  // Line 2e: Add lines 2a, 2b, 2c, and 2d
  l2e = (): number =>
    sumFields([this.l2a(), this.l2b(), this.l2c(), this.l2d()])

  // Line 3: MAGI — add lines 1 and 2e
  l3 = (): number => this.l1() + this.l2e()

  // ─── Part II: No Tax on Tips ─────────────────────────────────────────────────
  // Fill out only if qualified tips were received in a tipped occupation.

  /** Qualified tips from employer records / W-2 */
  l4a = (): number => this.obbb.qualifiedTips ?? 0

  // Line 4b: Qualified tips on Form 4137 line 1, row A, col (c)
  l4b = (): number | undefined => this.f1040.f4137?.l6()

  // Line 4c: Larger of lines 4a or 4b (single employer case); see instructions
  l4c = (): number => {
    return Math.max(this.l4a(), this.l4b() ?? 0)
  }

  // Line 5: Qualified tips from a trade or business (1099-NEC, 1099-MISC, 1099-K)
  // TODO: requires self-employment tip data not yet in the data model
  l5 = (): number | undefined => undefined

  // Line 6: Add lines 4c and 5
  l6 = (): number => {
    return this.l4c() + (this.l5() ?? 0)
  }

  // Line 7: Smaller of line 6 or $25,000
  l7 = (): number => {
    return Math.min(this.l6(), obbbDeductionLimits.tips.cap)
  }

  // Line 8: Amount from line 3 (MAGI)
  l8 = (): number => this.l3()

  // Line 9: $150,000 ($300,000 if MFJ)
  l9 = (): number => obbbDeductionLimits.tips.phaseOutThreshold(this.fs)

  // Line 10: Subtract line 9 from line 8; if zero or less, treat as 0 for phase-out
  l10 = (): number => Math.max(0, this.l8() - this.l9())

  // Line 11: Divide line 10 by $1,000, rounded down to next lower whole number
  l11 = (): number => Math.floor(this.l10() / 1000)

  // Line 12: Multiply line 11 by $100
  l12 = (): number => this.l11() * 100

  // Line 13: Qualified tips deduction — subtract line 12 from line 7; if ≤ 0 enter 0
  l13 = (): number => {
    // If MAGI ≤ phase-out threshold (l10 = 0), no phase-out applies
    if (this.l10() === 0) return this.l7()
    return Math.max(0, this.l7() - this.l12())
  }

  // ─── Part III: No Tax on Overtime ────────────────────────────────────────────
  // Fill out only if qualified overtime compensation was received.

  // Line 14a: Qualified overtime from W-2 box 1 not separately reported
  // TODO: requires overtime data not yet in the data model
  l14a = (): number => this.obbb.qualifiedOvertimePremium ?? 0

  // Line 14b: Qualified overtime from Form 1099-NEC box 1 or 1099-MISC box 3
  // TODO: requires self-employment overtime data not yet in the data model
  l14b = (): number | undefined => undefined

  // Line 14c: Add lines 14a and 14b
  l14c = (): number => this.l14a() + (this.l14b() ?? 0)

  // Line 15: Smaller of line 14c or $12,500 ($25,000 if MFJ)
  l15 = (): number => {
    return Math.min(this.l14c(), obbbDeductionLimits.overtime.cap(this.fs))
  }

  // Line 16: Amount from line 3 (MAGI)
  l16 = (): number => this.l3()

  // Line 17: $150,000 ($300,000 if MFJ)
  l17 = (): number => obbbDeductionLimits.overtime.phaseOutThreshold(this.fs)

  // Line 18: Subtract line 17 from line 16; if zero or less, treat as 0 for phase-out
  l18 = (): number => Math.max(0, this.l16() - this.l17())

  // Line 19: Divide line 18 by $1,000, rounded down to next lower whole number
  l19 = (): number => Math.floor(this.l18() / 1000)

  // Line 20: Multiply line 19 by $100
  l20 = (): number => this.l19() * 100

  // Line 21: Qualified overtime compensation deduction — subtract line 20 from line 15; if ≤ 0 enter 0
  l21 = (): number => {
    return Math.max(0, this.l15() - this.l20())
  }

  // ─── Part IV: No Tax on Car Loan Interest ────────────────────────────────────
  // Fill out only if qualified passenger vehicle loan interest (QPVLI) was paid.

  // Line 22a column (ii): amount deducted on Sch. C, E, or F
  // TODO: requires QPVLI data (VIN + interest amounts) not yet in the data model
  l22aii = (): number | undefined => undefined

  // Line 22a column (iii): Schedule 1-A interest amount for vehicle 1
  // TODO: requires QPVLI data (VIN + interest amounts) not yet in the data model
  l22aiii = (): number | undefined => undefined

  // Line 22b column (ii): amount deducted on Sch. C, E, or F
  // TODO: requires QPVLI data (VIN + interest amounts) not yet in the data model
  l22bii = (): number | undefined => undefined

  // Line 22b column (iii): Schedule 1-A interest amount for vehicle 2
  // TODO: requires QPVLI data (VIN + interest amounts) not yet in the data model
  l22biii = (): number | undefined => undefined

  l22iiiTotal = (): number =>
    (this.obbb.carLoanVehicles ?? []).reduce(
      (sum, v) => sum + v.interestPaid,
      0
    )

  // Line 23: Add lines 22a and 22b, column (iii)
  l23 = (): number | undefined => {
    const a = this.l22aiii()
    const b = this.l22biii()
    if (a === undefined && b === undefined) return undefined
    return (a ?? 0) + (b ?? 0)
  }

  // Line 24: Smaller of line 23 or $10,000
  l24 = (): number | undefined => {
    const twentyThree = this.l23()
    if (twentyThree === undefined) return undefined
    return Math.min(twentyThree, obbbDeductionLimits.carLoan.cap)
  }

  // Line 25: Amount from line 3 (MAGI)
  l25 = (): number => this.l3()

  // Line 26: $100,000 ($200,000 if MFJ)
  l26 = (): number => obbbDeductionLimits.carLoan.phaseOutThreshold(this.fs)

  // Line 27: Subtract line 26 from line 25; if zero or less, treat as 0 for phase-out
  l27 = (): number => Math.max(0, this.l25() - this.l26())

  // Line 28: Divide line 27 by $1,000, rounded UP to next higher whole number
  l28 = (): number => Math.ceil(this.l27() / 1000)

  // Line 29: Multiply line 28 by $200
  l29 = (): number => this.l28() * 200

  // Line 30: Qualified passenger vehicle loan interest deduction
  // Subtract line 29 from line 24; if ≤ 0 enter 0
  l30 = (): number => {
    const twentyFour = this.l24()
    if (twentyFour === undefined) return 0
    if (this.l27() === 0) return twentyFour
    return Math.max(0, twentyFour - this.l29())
  }

  // ─── Part V: Enhanced Deduction for Seniors ──────────────────────────────────
  // Requires valid SSN. If MFJ, must file jointly to claim.

  // Line 31: Amount from line 3 (MAGI)
  l31 = (): number => this.l3()

  // Line 32: $75,000 ($150,000 if MFJ)
  l32 = (): number => obbbDeductionLimits.senior.phaseOutThreshold(this.fs)

  // Line 33: Subtract line 32 from line 31; if zero or less, $6,000 goes to line 35
  l33 = (): number => Math.max(0, this.l31() - this.l32())

  // Line 34: Multiply line 33 by 6%
  l34 = (): number => this.l33() * 0.06

  // Line 35: Subtract line 34 from $6,000; if ≤ 0 enter 0
  l35 = (): number =>
    Math.max(0, obbbDeductionLimits.senior.perPerson - this.l34())

  // Line 36a: Primary filer born before January 2, 1961 (age 65+)
  l36a = (): number => (this.f1040.bornBeforeDate() ? this.l35() : 0)

  // Line 36b: Spouse born before January 2, 1961 (MFJ only)
  l36b = (): number => (this.f1040.spouseBeforeDate() ? this.l35() : 0)

  // Line 37: Enhanced deduction for seniors — add lines 36a and 36b
  l37 = (): number => this.l36a() + this.l36b()

  // ─── Part VI: Total Additional Deductions ────────────────────────────────────

  // Line 38: Add lines 13, 21, 30, and 37
  // Enter here and on Form 1040 line 13b (or 1040-NR line 13c)
  l38 = (): number =>
    sumFields([this.l13(), this.l21(), this.l30(), this.l37()])

  isNeeded = (): boolean => this.l38() > 0

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    // Part I
    this.l1(),
    this.l2a(),
    this.l2b(),
    this.l2c(),
    this.l2d(),
    this.l2e(),
    this.l3(),
    // Part II
    this.l4a(),
    this.l4b(),
    this.l4c(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.l8(),
    this.l9(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13(),
    // Part III
    this.l14a(),
    this.l14b(),
    this.l14c(),
    this.l15(),
    this.l16(),
    this.l17(),
    this.l18(),
    this.l19(),
    this.l20(),
    this.l21(),
    // Part IV - line 22 has two vehicles each with 3 columns
    undefined, // 22a (i) VIN
    this.l22aii(), // 22a (ii) already deducted on Sch C/E/F
    this.l22aiii(), // 22a (iii) Schedule 1-A amount
    undefined, // 22b (i) VIN
    this.l22bii(), // 22b (ii) already deducted on Sch C/E/F
    this.l22biii(), // 22b (iii) Schedule 1-A amount
    this.l23(),
    this.l24(),
    this.l25(),
    this.l26(),
    this.l27(),
    this.l28(),
    this.l29(),
    this.l30(),
    // Part V
    this.l31(),
    this.l32(),
    this.l33(),
    this.l34(),
    this.l35(),
    this.l36a(),
    this.l36b(),
    this.l37(),
    // Part VI
    this.l38()
  ]

  fillInstructions = (): FillInstructions => [
    text('form1[0].Page1[0].f1_01[0]', this.f1040.namesString()),
    text(
      'form1[0].Page1[0].f1_02[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    // Part I
    text('form1[0].Page1[0].f1_03[0]', this.l1()),
    text('form1[0].Page1[0].f1_04[0]', this.l2a()),
    text('form1[0].Page1[0].f1_05[0]', this.l2b()),
    text('form1[0].Page1[0].f1_06[0]', this.l2c()),
    text('form1[0].Page1[0].f1_07[0]', this.l2d()),
    text('form1[0].Page1[0].f1_08[0]', this.l2e()),
    text('form1[0].Page1[0].f1_09[0]', this.l3()),
    // Tips — Lines 4-10 // tips phase-out subtraction display
    text('form1[0].Page1[0].f1_10[0]', this.l4a()),
    text('form1[0].Page1[0].f1_11[0]', this.l4b()),
    text('form1[0].Page1[0].f1_12[0]', this.l4c()),
    text('form1[0].Page1[0].f1_13[0]', this.l5()),
    text('form1[0].Page1[0].f1_14[0]', this.l6()),
    text('form1[0].Page1[0].f1_15[0]', this.l7()),
    text('form1[0].Page1[0].f1_16[0]', this.l8()),
    text('form1[0].Page1[0].f1_17[0]', this.l9()),
    text('form1[0].Page1[0].f1_18[0]', this.l10()),
    text('form1[0].Page1[0].f1_19[0]', this.l11()),
    text('form1[0].Page1[0].f1_20[0]', this.l12()),
    text('form1[0].Page1[0].f1_21[0]', this.l13()),
    // Overtime — Lines 14-20
    text('form1[0].Page1[0].f1_22[0]', this.l14a()),
    text('form1[0].Page1[0].f1_23[0]', this.l14b()),
    text('form1[0].Page1[0].f1_24[0]', this.l14c()),
    text('form1[0].Page1[0].f1_25[0]', this.l15()),
    text('form1[0].Page1[0].f1_26[0]', this.l16()),
    text('form1[0].Page1[0].f1_27[0]', this.l17()),
    text('form1[0].Page1[0].f1_28[0]', this.l18()),
    text('form1[0].Page1[0].f1_29[0]', this.l19()),
    text('form1[0].Page1[0].f1_30[0]', this.l20()),
    text('form1[0].Page1[0].f1_31[0]', this.l21()),
    // Car loan summary (Page 1) — Lines 22-28
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22a[0].VIN-1_Comb[0].f2_01[0]',
      this.obbb.carLoanVehicles?.[0]?.vin // 22a (i) VIN
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22a[0].f2_02[0]',
      this.l22aii() // 22a (ii) already deducted on Sch C/E/F
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22a[0].f2_03[0]',
      this.l22aiii() // 22a (iii) Schedule 1-A amount
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22b[0].VIN-2_Comb[0].f2_04[0]',
      this.obbb.carLoanVehicles?.[1]?.vin // 22b (i) VIN
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22b[0].f2_05[0]',
      this.l22bii() // 22b (ii) already deducted on Sch C/E/F
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22b[0].f2_06[0]',
      this.l22biii() // 22b (iii) Schedule 1-A amount
    ),
    text('form1[0].Page2[0].f2_07[0]', this.l23()),
    text('form1[0].Page2[0].f2_08[0]', this.l24()),
    text('form1[0].Page2[0].f2_09[0]', this.l25()),
    text('form1[0].Page2[0].f2_10[0]', this.l26()),
    text('form1[0].Page2[0].f2_11[0]', this.l27()),
    text('form1[0].Page2[0].f2_12[0]', this.l28()),
    text('form1[0].Page2[0].f2_13[0]', this.l29()),
    text('form1[0].Page2[0].f2_14[0]', this.l30()),
    // Senior bonus — Lines 31-35
    text('form1[0].Page2[0].f2_15[0]', this.l31()),
    text('form1[0].Page2[0].f2_16[0]', this.l32()),
    text('form1[0].Page2[0].f2_17[0]', this.l33()),
    text('form1[0].Page2[0].f2_18[0]', this.l34()),
    text('form1[0].Page2[0].f2_19[0]', this.l35()),
    text('form1[0].Page2[0].f2_20[0]', this.l36a()),
    text('form1[0].Page2[0].f2_21[0]', this.l36b()),
    text('form1[0].Page2[0].f2_22[0]', this.l37()),
    // Total (Line 38) flowing to F1040 Line 13b
    text('form1[0].Page2[0].f2_23[0]', this.l38())
  ]
}
