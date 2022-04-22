import { F1099BData, FilingStatus } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import SDRateGainWorksheet from './worksheets/SDRateGainWorksheet'
import SDUnrecaptured1250 from './worksheets/SDUnrecaptured1250'
import F8949 from './F8949'
import F1040Attachment from './F1040Attachment'
import F1040 from './F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import SDTaxWorksheet from './worksheets/SDTaxWorksheet'
import QualDivAndCGWorksheet from './worksheets/SDQualifiedAndCapGains'
export default class ScheduleD extends F1040Attachment {
  tag: FormTag = 'f1040sd'
  sequenceIndex = 12
  _aggregated?: F1099BData
  qualifiedDivAndCGWorksheet: QualDivAndCGWorksheet
  taxWorksheet: SDTaxWorksheet
  rateGainWorksheet: SDRateGainWorksheet
  unrecaptured1250: SDUnrecaptured1250
  _f8949s?: F8949[]

  readonly l21MinMFS = 1500
  readonly l21MinDefault = 3000

  constructor(f1040: F1040) {
    super(f1040)

    this.rateGainWorksheet = new SDRateGainWorksheet()
    this.taxWorksheet = new SDTaxWorksheet(f1040)
    this.qualifiedDivAndCGWorksheet = new QualDivAndCGWorksheet(f1040)
    this.unrecaptured1250 = new SDUnrecaptured1250()
  }

  get aggregated(): F1099BData {
    if (this._aggregated === undefined) {
      const bs: F1099BData[] = this.f1040.f1099Bs().map((f) => f.form)

      this._aggregated = {
        shortTermProceeds: bs.reduce((l, r) => l + r.shortTermProceeds, 0),
        shortTermCostBasis: bs.reduce((l, r) => l + r.shortTermCostBasis, 0),
        longTermProceeds: bs.reduce((l, r) => l + r.longTermProceeds, 0),
        longTermCostBasis: bs.reduce((l, r) => l + r.longTermCostBasis, 0)
      }
    }

    return this._aggregated
  }

  isNeeded = (): boolean =>
    this.f1040.f1099Bs().length > 0 || this.f1040.f8949.isNeeded()

  l21Min = (): number => {
    if (this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS) {
      return this.l21MinMFS
    }
    return this.l21MinDefault
  }

  l1ad = (): number | undefined => this.aggregated.shortTermProceeds
  l1ae = (): number | undefined => this.aggregated.shortTermCostBasis
  // This field is greyed out, but fillable
  l1ag = (): number | undefined => undefined
  l1ah = (): number => sumFields([this.l1ad(), 0 - (this.l1ae() ?? 0)])

  l1f8949s = (): F8949[] => this.f1040.f8949s.filter((f) => f.part1BoxA())

  l1bd = (): number =>
    sumFields(this.l1f8949s().map((f) => f.shortTermTotalProceeds()))
  l1be = (): number =>
    sumFields(this.l1f8949s().map((f) => f.shortTermTotalCost()))

  l1bg = (): number =>
    sumFields(this.l1f8949s().map((f) => f.shortTermTotalAdjustments()))
  l1bh = (): number =>
    sumFields(this.l1f8949s().map((f) => f.shortTermTotalGain()))

  l2f8949s = (): F8949[] => this.f1040.f8949s.filter((f) => f.part1BoxB())

  l2d = (): number =>
    sumFields(this.l2f8949s().map((f) => f.shortTermTotalProceeds()))

  l2e = (): number =>
    sumFields(this.l2f8949s().map((f) => f.shortTermTotalCost()))

  l2g = (): number =>
    sumFields(this.l2f8949s().map((f) => f.shortTermTotalAdjustments()))

  l2h = (): number =>
    sumFields(this.l2f8949s().map((f) => f.shortTermTotalGain()))

  l3f8949s = (): F8949[] => this.f1040.f8949s.filter((f) => f.part1BoxC())

  l3d = (): number =>
    sumFields(this.l3f8949s().map((f) => f.shortTermTotalProceeds()))

  l3e = (): number =>
    sumFields(this.l3f8949s().map((f) => f.shortTermTotalCost()))

  l3g = (): number =>
    sumFields(this.l3f8949s().map((f) => f.shortTermTotalAdjustments()))

  l3h = (): number =>
    sumFields(this.l3f8949s().map((f) => f.shortTermTotalGain()))

  l4 = (): number | undefined => undefined

  l5 = (): number | undefined => undefined

  l6 = (): number | undefined => undefined

  l7 = (): number =>
    sumFields([
      this.l1ah(),
      this.l1bh(),
      this.l2h(),
      this.l3h(),
      this.l4(),
      this.l5(),
      this.l6()
    ])

  l8ad = (): number | undefined => this.aggregated.longTermProceeds
  l8ae = (): number | undefined => this.aggregated.longTermCostBasis
  // This field is greyed out, but fillable
  l8ag = (): number | undefined => undefined
  l8ah = (): number | undefined =>
    sumFields([this.l8ad(), 0 - (this.l8ae() ?? 0)])

  l8f8949s = (): F8949[] => this.f1040.f8949s.filter((f) => f.part2BoxD())

  l8bd = (): number =>
    sumFields(this.l8f8949s().map((f) => f.longTermTotalProceeds()))

  l8be = (): number =>
    sumFields(this.l8f8949s().map((f) => f.longTermTotalCost()))

  l8bg = (): number =>
    sumFields(this.l8f8949s().map((f) => f.longTermTotalAdjustments()))

  l8bh = (): number =>
    sumFields(this.l8f8949s().map((f) => f.longTermTotalGain()))

  l9f8949s = (): F8949[] => this.f1040.f8949s.filter((f) => f.part2BoxE())

  l9d = (): number =>
    sumFields(this.l9f8949s().map((f) => f.longTermTotalProceeds()))

  l9e = (): number =>
    sumFields(this.l9f8949s().map((f) => f.longTermTotalCost()))

  l9g = (): number =>
    sumFields(this.l9f8949s().map((f) => f.longTermTotalAdjustments()))

  l9h = (): number =>
    sumFields(this.l9f8949s().map((f) => f.longTermTotalGain()))

  l10f8949s = (): F8949[] => this.f1040.f8949s.filter((f) => f.part2BoxF())

  l10d = (): number =>
    sumFields(this.l10f8949s().map((f) => f.longTermTotalProceeds()))

  l10e = (): number =>
    sumFields(this.l10f8949s().map((f) => f.longTermTotalCost()))

  l10g = (): number =>
    sumFields(this.l10f8949s().map((f) => f.longTermTotalAdjustments()))

  l10h = (): number =>
    sumFields(this.l10f8949s().map((f) => f.longTermTotalGain()))

  l11 = (): number | undefined => undefined

  l12 = (): number | undefined => undefined

  l13 = (): number | undefined =>
    this.f1040
      .f1099Divs()
      .reduce((s, f) => s + f.form.totalCapitalGainsDistributions, 0)

  l14 = (): number | undefined => undefined

  l15 = (): number =>
    sumFields([
      this.l8ah(),
      this.l8bh(),
      this.l9h(),
      this.l10h(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14()
    ])

  // L7 + L15
  // If +, enter on L16 of F1040
  // If -, go to L21
  // If 0, go to L22
  l16 = (): number => sumFields([this.l7(), this.l15()])

  // Are L15 and L16 both gains?
  l17 = (): boolean => this.l15() > 0 && this.l16() > 0

  l18 = (): number | undefined => {
    if (!this.l17()) {
      return undefined
    }
    return this.rateGainWorksheet.l7()
  }

  l19 = (): number | undefined => {
    if (!this.l17()) {
      return undefined
    }
    return this.unrecaptured1250.l18()
  }

  l20 = (): boolean | undefined => {
    if (!this.l17()) {
      return undefined
    }
    return (this.l18() ?? 0) === 0 && (this.l19() ?? 0) === 0
  }

  fillL21 = (): boolean =>
    !this.l20() && ((this.l16() > 0 && this.l17()) || this.l16() < 0)

  l21 = (): number | undefined => {
    if (this.fillL21()) {
      return Math.max(-this.l21Min(), this.l16())
    }
  }

  haveQualifiedDividends = (): boolean =>
    this.f1040.f1099Divs().some((f) => f.form.qualifiedDividends > 0)

  // TODO: Schedule D tax worksheet
  // neither box should be checked if this question was not required to be answered by l20.
  l22 = (): boolean | undefined => {
    if (this.l20() !== false) {
      return this.haveQualifiedDividends()
    }
  }

  lossCarryForward = (): number => {
    const amount = this.l16() + this.l21Min()
    if (amount < 0) {
      return -amount
    }
    return 0
  }

  to1040 = (): number => this.l21() ?? this.l16()

  computeTaxOnQDWorksheet = (): boolean =>
    (this.l20() ?? false) || (this.l22() ?? false)

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    false,
    false,
    this.l1ad(),
    this.l1ae(),
    this.l1ag(),
    this.l1ah(),
    this.l1bd(),
    this.l1be(),
    this.l1bg(),
    this.l1bh(),
    this.l2d(),
    this.l2e(),
    this.l2g(),
    this.l2h(),
    this.l3d(),
    this.l3e(),
    this.l3g(),
    this.l3h(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.l8ad(),
    this.l8ae(),
    this.l8ag(),
    this.l8ah(),
    this.l8bd(),
    this.l8be(),
    this.l8bg(),
    this.l8bh(),
    this.l9d(),
    this.l9e(),
    this.l9g(),
    this.l9h(),
    this.l10d(),
    this.l10e(),
    this.l10g(),
    this.l10h(),
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17(),
    !this.l17(),
    this.l18(),
    this.l19(),
    this.l20() === true,
    this.l20() === false,
    this.l21(),
    this.l22() === true,
    this.l22() === false
  ]
}
