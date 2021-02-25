import {
  Income1099B,
  Income1099Type,
  Information,
  F1099DivData,
  F1099BData,
  FilingStatus
} from '../redux/data'
import Form from './Form'
import TaxPayer from '../redux/TaxPayer'
import { computeField, displayNumber, sumFields } from './util'
import SDRateGainWorksheet from './worksheets/SDRateGainWorksheet'
import SDUnrecaptured1250 from './worksheets/SDUnrecaptured1250'

export default class ScheduleD implements Form {
  state: Information
  aggregated: F1099BData
  rateGainWorksheet: SDRateGainWorksheet
  unrecaptured1250: SDUnrecaptured1250

  readonly l21MinMFS = 1500
  readonly l21MinDefault = 3000

  constructor (info: Information) {
    this.state = info

    const bs: F1099BData[] =
      this.state.f1099s
        .filter((v) => v.type === Income1099Type.B)
        .map((v) => (v as Income1099B).form)

    this.aggregated = {
      shortTermProceeds: bs.map((v) => v.shortTermProceeds).reduce((l, r) => l + r, 0),
      shortTermCostBasis: bs.map((v) => v.shortTermCostBasis).reduce((l, r) => l + r, 0),
      longTermProceeds: bs.map((v) => v.longTermProceeds).reduce((l, r) => l + r, 0),
      longTermCostBasis: bs.map((v) => v.longTermCostBasis).reduce((l, r) => l + r, 0)
    }

    this.rateGainWorksheet = new SDRateGainWorksheet()
    this.unrecaptured1250 = new SDUnrecaptured1250()
  }

  l21Min = (): number => {
    if (this.state.taxPayer.filingStatus === FilingStatus.MFJ) {
      return this.l21MinMFS
    } else {
      return this.l21MinDefault
    }
  }

  l1ad = (): number | undefined => this.aggregated.shortTermProceeds
  l1ae = (): number | undefined => this.aggregated.shortTermCostBasis
  // This field is greyed out, but fillable
  l1ag = (): number | undefined => undefined
  l1ah = (): number | undefined => displayNumber(sumFields(
    [this.l1ad(), -computeField(this.l1ae())]
  ))

  l1bd = (): number | undefined => undefined
  l1be = (): number | undefined => undefined
  l1bg = (): number | undefined => undefined
  l1bh = (): number | undefined => undefined
  l2d = (): number | undefined => undefined
  l2e = (): number | undefined => undefined
  l2g = (): number | undefined => undefined
  l2h = (): number | undefined => undefined
  l3d = (): number | undefined => undefined
  l3e = (): number | undefined => undefined
  l3g = (): number | undefined => undefined
  l3h = (): number | undefined => undefined

  l4 = (): number | undefined => undefined

  l5 = (): number | undefined => undefined

  l6 = (): number | undefined => undefined

  l7 = (): number | undefined => displayNumber(
    sumFields([
      this.l1ah(),
      this.l1bh(),
      this.l2h(),
      this.l3h(),
      this.l4(),
      this.l5(),
      this.l6()
    ])
  )

  l8ad = (): number | undefined => this.aggregated.longTermProceeds
  l8ae = (): number | undefined => this.aggregated.longTermCostBasis
  // This field is greyed out, but fillable
  l8ag = (): number | undefined => undefined
  l8ah = (): number | undefined => displayNumber(sumFields(
    [this.l8ad(), -computeField(this.l8ae())]
  ))

  l8bd = (): number | undefined => undefined
  l8be = (): number | undefined => undefined
  l8bg = (): number | undefined => undefined
  l8bh = (): number | undefined => undefined
  l9d = (): number | undefined => undefined
  l9e = (): number | undefined => undefined
  l9g = (): number | undefined => undefined
  l9h = (): number | undefined => undefined
  l10d = (): number | undefined => undefined
  l10e = (): number | undefined => undefined
  l10g = (): number | undefined => undefined
  l10h = (): number | undefined => undefined

  l11 = (): number | undefined => undefined

  l12 = (): number | undefined => undefined

  l13 = (): number | undefined => undefined

  l14 = (): number | undefined => undefined

  l15 = (): number | undefined => displayNumber(
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
  )

  l16 = (): number | undefined => displayNumber(
    sumFields([
      this.l7(),
      this.l15()
    ])
  )

  l17 = (): boolean => (computeField(this.l15()) > 0) && (computeField(this.l16()) > 0)

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
    return computeField(this.l18()) === 0 && computeField(this.l19()) === 0
  }

  l21 = (): number | undefined => {
    const l16 = computeField(this.l16())

    if (!this.l17() || l16 >= 0) {
      return undefined
    }

    return Math.max(-this.l21Min(), l16)
  }

  // TODO : Qualified dividends
  // neither box should be checked if this question was not required to be answered by l20.
  l22 = (): boolean | undefined => {
    if (this.l20() !== undefined) {
      return undefined
    }

    return undefined !== (
      this.state.f1099s
        .filter((f) => f.type === Income1099Type.DIV)
        .find((f) => ((f.form as F1099DivData).qualifiedDividends ?? 0) > 0)
    )
  }

  computeTaxOnQDWorksheet = (): boolean => (this.l20() ?? false) || (this.l22() ?? false)

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.state.taxPayer)

    return [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
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
}
