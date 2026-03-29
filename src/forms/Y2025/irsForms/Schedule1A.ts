import F1040Attachment from './F1040Attachment'
import { FilingStatus } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'
import { obbbDeductionLimits } from '../data/federal'

/** Schedule 1-A (Form 1040) — OBBB additional deductions (2025-2028). */
export default class Schedule1A extends F1040Attachment {
  tag: FormTag = 'f1040s1a'
  sequenceIndex = 1.5

  constructor(f1040: F1040) {
    super(f1040)
  }

  private get fs(): FilingStatus {
    return this.f1040.info.taxPayer.filingStatus
  }

  private get magi(): number {
    return this.f1040.l11()
  }

  private get obbb() {
    return this.f1040.info.obbbDeductions ?? {}
  }

  // ── Tips deduction (Lines 4-13) ──────────────────────────────────────────

  /** Qualified tips from employer records / W-2 */
  l4 = (): number => this.obbb.qualifiedTips ?? 0

  /** Statutory cap */
  l5 = (): number => obbbDeductionLimits.tips.cap

  /** Lesser of l4 and l5 */
  l6 = (): number => Math.min(this.l4(), this.l5())

  /** MAGI phase-out threshold for tips */
  l7Tips = (): number => obbbDeductionLimits.tips.phaseOutThreshold(this.fs)

  /** Excess MAGI over threshold */
  l8Tips = (): number => Math.max(0, this.magi - this.l7Tips())

  /** Reduction: $1 for every $4 over threshold (25 cents per dollar) */
  l9Tips = (): number => this.l8Tips() * 0.25

  /** Qualified tips deduction (cannot be less than zero) */
  l10 = (): number => Math.max(0, this.l6() - this.l9Tips())

  // ── Overtime deduction (Lines 14-21) ─────────────────────────────────────

  /** Qualified overtime premium pay */
  l14 = (): number => this.obbb.qualifiedOvertimePremium ?? 0

  /** Statutory cap ($12,500 single / $25,000 joint) */
  l15 = (): number => obbbDeductionLimits.overtime.cap(this.fs)

  /** Lesser of l14 and l15 */
  l16 = (): number => Math.min(this.l14(), this.l15())

  /** MAGI phase-out threshold for overtime */
  l17Ot = (): number => obbbDeductionLimits.overtime.phaseOutThreshold(this.fs)

  /** Excess MAGI over threshold */
  l18Ot = (): number => Math.max(0, this.magi - this.l17Ot())

  /** Reduction: $1 for every $4 */
  l19Ot = (): number => this.l18Ot() * 0.25

  /** Qualified overtime deduction */
  l20 = (): number => Math.max(0, this.l16() - this.l19Ot())

  // ── Car loan interest deduction (Lines 22-30) ────────────────────────────

  /** Total interest paid across all qualifying vehicles */
  l22Total = (): number =>
    (this.obbb.carLoanVehicles ?? []).reduce(
      (sum, v) => sum + v.interestPaid,
      0
    )

  /** Statutory cap */
  l23Car = (): number => obbbDeductionLimits.carLoan.cap

  /** Lesser of total interest and cap */
  l24Car = (): number => Math.min(this.l22Total(), this.l23Car())

  /** MAGI phase-out threshold for car loan */
  l25Car = (): number => obbbDeductionLimits.carLoan.phaseOutThreshold(this.fs)

  /** Excess MAGI over threshold */
  l26Car = (): number => Math.max(0, this.magi - this.l25Car())

  /** Proportional reduction over phase-out range */
  l27Car = (): number => {
    const range = obbbDeductionLimits.carLoan.phaseOutRange(this.fs)
    return Math.min(1, this.l26Car() / range) * this.l24Car()
  }

  /** Qualified car loan interest deduction */
  l28 = (): number => Math.max(0, this.l24Car() - this.l27Car())

  // ── Senior bonus deduction (Lines 31-37) ─────────────────────────────────

  /** $6,000 if primary taxpayer is 65+ */
  l31Primary = (): number =>
    this.f1040.bornBeforeDate() ? obbbDeductionLimits.senior.perPerson : 0

  /** $6,000 if spouse is 65+ */
  l31Spouse = (): number =>
    this.f1040.spouseBeforeDate() ? obbbDeductionLimits.senior.perPerson : 0

  /** Combined senior allowance before phase-out */
  l31 = (): number => this.l31Primary() + this.l31Spouse()

  /** MAGI phase-out threshold for senior bonus */
  l32Senior = (): number =>
    obbbDeductionLimits.senior.phaseOutThreshold(this.fs)

  /** Excess MAGI over threshold */
  l33Senior = (): number => Math.max(0, this.magi - this.l32Senior())

  /** Proportional reduction over phase-out range */
  l34Senior = (): number => {
    const range = obbbDeductionLimits.senior.phaseOutRange(this.fs)
    return Math.min(1, this.l33Senior() / range) * this.l31()
  }

  /** Qualified senior bonus deduction */
  l35 = (): number => Math.max(0, this.l31() - this.l34Senior())

  // ── Total (Line 38) ───────────────────────────────────────────────────────

  /** Total OBBB deduction flowing to F1040 Line 13b */
  total = (): number => this.l10() + this.l20() + this.l28() + this.l35()

  isNeeded = (): boolean => this.total() > 0

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    // tips
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7Tips(),
    this.l8Tips(),
    this.l9Tips(),
    this.l10(),
    // overtime
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17Ot(),
    this.l18Ot(),
    this.l19Ot(),
    this.l20(),
    // car loan (vehicle 1 VIN, purchase date, interest; vehicle 2 VIN, purchase date, interest)
    this.obbb.carLoanVehicles?.[0]?.vin,
    this.obbb.carLoanVehicles?.[0]?.purchaseDate,
    this.obbb.carLoanVehicles?.[0]?.interestPaid,
    this.obbb.carLoanVehicles?.[1]?.vin,
    this.obbb.carLoanVehicles?.[1]?.purchaseDate,
    this.obbb.carLoanVehicles?.[1]?.interestPaid,
    this.l22Total(),
    this.l23Car(),
    this.l24Car(),
    this.l25Car(),
    this.l26Car(),
    this.l27Car(),
    this.l28(),
    // senior
    this.l31(),
    this.l32Senior(),
    this.l33Senior(),
    this.l34Senior(),
    this.l35(),
    // total
    this.total()
  ]

  fillInstructions = (): FillInstructions => [
    text('form1[0].Page1[0].f1_01[0]', this.f1040.namesString()),
    text(
      'form1[0].Page1[0].f1_02[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    // Tips — Lines 4-10
    text('form1[0].Page1[0].f1_03[0]', this.l4()),
    text('form1[0].Page1[0].f1_04[0]', this.l5()),
    text('form1[0].Page1[0].f1_05[0]', this.l6()),
    text('form1[0].Page1[0].f1_06[0]', this.l7Tips()),
    text('form1[0].Page1[0].f1_07[0]', this.l8Tips()),
    text('form1[0].Page1[0].f1_08[0]', this.l9Tips()),
    text('form1[0].Page1[0].f1_09[0]', this.l9Tips()), // tips phase-out subtraction display
    text('form1[0].Page1[0].f1_10[0]', this.l10()),
    // Overtime — Lines 14-20
    text('form1[0].Page1[0].f1_11[0]', this.l14()),
    text('form1[0].Page1[0].f1_12[0]', this.l15()),
    text('form1[0].Page1[0].f1_13[0]', this.l16()),
    text('form1[0].Page1[0].f1_14[0]', this.l17Ot()),
    text('form1[0].Page1[0].f1_15[0]', this.l18Ot()),
    text('form1[0].Page1[0].f1_16[0]', this.l19Ot()),
    text('form1[0].Page1[0].f1_17[0]', this.l19Ot()), // overtime phase-out subtraction display
    text('form1[0].Page1[0].f1_18[0]', this.l20()),
    // Car loan summary (Page 1) — Lines 22-28
    text('form1[0].Page1[0].f1_19[0]', this.l22Total()),
    text('form1[0].Page1[0].f1_20[0]', this.l23Car()),
    text('form1[0].Page1[0].f1_21[0]', this.l24Car()),
    text('form1[0].Page1[0].f1_22[0]', this.l25Car()),
    text('form1[0].Page1[0].f1_23[0]', this.l26Car()),
    text('form1[0].Page1[0].f1_24[0]', this.l27Car()),
    text('form1[0].Page1[0].f1_25[0]', this.l28()),
    // Senior bonus — Lines 31-35
    text('form1[0].Page1[0].f1_26[0]', this.l31()),
    text('form1[0].Page1[0].f1_27[0]', this.l32Senior()),
    text('form1[0].Page1[0].f1_28[0]', this.l33Senior()),
    text('form1[0].Page1[0].f1_29[0]', this.l34Senior()),
    text('form1[0].Page1[0].f1_30[0]', this.l35()),
    // Total (Line 38) flowing to F1040 Line 13b
    text('form1[0].Page1[0].f1_31[0]', this.total()),
    // Page 2 — Vehicle detail table (two vehicles)
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22a[0].VIN-1_Comb[0].f2_01[0]',
      this.obbb.carLoanVehicles?.[0]?.vin
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22a[0].f2_02[0]',
      this.obbb.carLoanVehicles?.[0]?.purchaseDate
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22a[0].f2_03[0]',
      this.obbb.carLoanVehicles?.[0]?.interestPaid
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22b[0].VIN-2_Comb[0].f2_04[0]',
      this.obbb.carLoanVehicles?.[1]?.vin
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22b[0].f2_05[0]',
      this.obbb.carLoanVehicles?.[1]?.purchaseDate
    ),
    text(
      'form1[0].Page2[0].Table_Line22[0].Line22b[0].f2_06[0]',
      this.obbb.carLoanVehicles?.[1]?.interestPaid
    ),
    text('form1[0].Page2[0].f2_07[0]', undefined),
    text('form1[0].Page2[0].f2_08[0]', undefined),
    text('form1[0].Page2[0].f2_09[0]', undefined),
    text('form1[0].Page2[0].f2_10[0]', undefined),
    text('form1[0].Page2[0].f2_11[0]', undefined),
    text('form1[0].Page2[0].f2_12[0]', undefined),
    text('form1[0].Page2[0].f2_13[0]', undefined),
    text('form1[0].Page2[0].f2_14[0]', undefined),
    text('form1[0].Page2[0].f2_15[0]', undefined),
    text('form1[0].Page2[0].f2_16[0]', undefined),
    text('form1[0].Page2[0].f2_17[0]', undefined),
    text('form1[0].Page2[0].f2_18[0]', undefined),
    text('form1[0].Page2[0].f2_19[0]', undefined),
    text('form1[0].Page2[0].f2_20[0]', undefined),
    text('form1[0].Page2[0].f2_21[0]', undefined),
    text('form1[0].Page2[0].f2_22[0]', undefined),
    text('form1[0].Page2[0].f2_23[0]', undefined)
  ]
}
