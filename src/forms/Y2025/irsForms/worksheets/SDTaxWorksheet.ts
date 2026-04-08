import { FilingStatus } from 'ustaxes/core/data'
import { Worksheet } from '../F1040Attachment'
import { computeOrdinaryTax } from '../TaxTable'

/**
 * 0%, 15%, 20% capital gains rate bracket thresholds for 2025.
 *
 * TODO - migrate to using numbers in federal.ts
 */
const CUTOFFS: { [key in FilingStatus]: [number, number, number] } = {
  [FilingStatus.S]: [48350, 533400, Infinity],
  [FilingStatus.MFJ]: [96700, 600050, Infinity],
  [FilingStatus.MFS]: [48350, 300000, Infinity],
  [FilingStatus.W]: [96700, 600050, Infinity],
  [FilingStatus.HOH]: [64750, 566700, Infinity]
}

/**
 * Schedule D Tax Worksheet — used when Schedule D line 18 (28% rate gain)
 * or line 19 (unrecaptured §1250 gain) is nonzero.
 *
 * Line numbers follow the Schedule D Instructions (2025).
 * The lines exposed here are those referenced by Form 6251 Part III.
 */
export default class SDTaxWorksheet extends Worksheet {
  isNeeded = (): boolean => {
    const sd = this.f1040.scheduleD
    const f4952 = this.f1040.f4952

    const sdCondition =
      sd.isNeeded() &&
      ((sd.l18() ?? 0) > 0 || (sd.l19() ?? 0) > 0) &&
      sd.l15() > 0 &&
      sd.l16() > 0

    const f4952Condition = f4952 !== undefined && f4952.l4g() > 0

    return sdCondition || f4952Condition
  }

  private get fs(): FilingStatus {
    return this.f1040.info.taxPayer.filingStatus
  }

  private l1 = (): number => this.f1040.l15()
  private l2 = (): number => this.f1040.l3a() ?? 0
  private l3 = (): number => this.f1040.f4952?.l4g() ?? 0
  private l4 = (): number => this.f1040.f4952?.l4e() ?? 0
  private l5 = (): number => Math.max(0, this.l3() - this.l4())
  private l6 = (): number => Math.max(0, this.l2() - this.l5())

  private l7 = (): number => {
    const sd = this.f1040.scheduleD
    return Math.min(Math.max(sd.l15(), 0), Math.max(sd.l16(), 0))
  }

  private l8 = (): number => Math.min(this.l3(), this.l4())
  private l9 = (): number => Math.max(0, this.l7() - this.l8())

  /** Line 10: qualified dividends + LTCG eligible for preferential rates. */
  l10 = (): number | undefined =>
    this.isNeeded() ? this.l6() + this.l9() : undefined

  private l11 = (): number =>
    (this.f1040.scheduleD.l18() ?? 0) + (this.f1040.scheduleD.l19() ?? 0)

  private l12 = (): number => Math.min(this.l9(), this.l11())

  /** Line 13: qualified gains eligible for 0%/15%/20% rates. */
  l13 = (): number | undefined =>
    this.isNeeded() ? (this.l10() ?? 0) - this.l12() : undefined

  /** Line 14: ordinary income (taxable income minus preferential-rate gains). */
  l14 = (): number | undefined =>
    this.isNeeded() ? Math.max(0, this.l1() - (this.l13() ?? 0)) : undefined

  private l15 = (): number => CUTOFFS[this.fs][0]
  private l16 = (): number => Math.min(this.l1(), this.l15())
  private l17 = (): number => Math.min(this.l14() ?? 0, this.l16())

  /** Line 18: portion of income NOT covered by preferential-rate gains. */
  private l18 = (): number => Math.max(0, this.l1() - (this.l10() ?? 0))

  private l19 = (): number => CUTOFFS[this.fs][1]

  /** Line 20: ordinary income below the 15% bracket cutoff. */
  private l20 = (): number => Math.min(this.l14() ?? 0, this.l19())

  /**
   * Line 21: ordinary income used in subsequent rate-tier calculations.
   * = max(line 18, line 20). This is an intermediate value, not the full tax.
   * Feeds Form 6251 Part III as the "ordinary income floor".
   */
  l21 = (): number | undefined =>
    this.isNeeded() ? Math.max(this.l18(), this.l20()) : undefined

  /** Full tax from the Schedule D Tax Worksheet (equivalent to line 47). */
  tax = (): number | undefined => {
    if (!this.isNeeded()) return undefined

    const l1 = this.l1()
    const l10 = this.l10() ?? 0
    const l13 = this.l13() ?? 0
    const l16 = this.l16()
    const l17 = this.l17()
    const l19 = this.l19()
    const l21 = this.l21() ?? 0

    // Line 22: amount taxed at 0%
    const l22 = Math.max(0, l16 - l17)

    if (l1 === l16) {
      return Math.round(computeOrdinaryTax(this.fs, l1))
    }

    const l23 = Math.min(l1, l13)
    const l24 = l22
    const l25 = Math.max(0, l23 - l24)
    const l26 = l19
    const l27 = Math.min(l1, l26)
    const l28 = l21 + l22
    const l29 = Math.max(0, l27 - l28)
    const l30 = Math.min(l25, l29)
    const l31 = l30 * 0.15

    const l32 = l24 + l30
    if (l1 === l32) {
      return Math.round(computeOrdinaryTax(this.fs, l21) + l31)
    }

    const l33 = Math.max(0, l23 - l32)
    const l34 = l33 * 0.2

    const sdl19 = this.f1040.scheduleD.l19() ?? 0
    const l35 = Math.min(this.l9(), sdl19)
    const l36 = l10 + l21
    const l38 = Math.max(0, l36 - l1)
    const l39 = Math.max(0, l35 - l38)
    const l40 = l39 * 0.25

    const l41 = l21 + l22 + l30 + l33 + l39
    const l42 = Math.max(0, l1 - l41)
    const l43 = l42 * 0.28

    const l44 = computeOrdinaryTax(this.fs, l21)
    const l45 = l31 + l34 + l40 + l43 + l44
    const l46 = computeOrdinaryTax(this.fs, l1)

    return Math.round(Math.min(l45, l46))
  }
}
