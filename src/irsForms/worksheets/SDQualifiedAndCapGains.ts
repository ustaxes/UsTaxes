import F1040 from '../F1040'
import { computeLongTermCapGainsTax, computeOrdinaryTax } from '../TaxTable'

export default class SDQualifiedAndCapGains {
  f1040: F1040

  constructor (f1040: F1040) {
    this.f1040 = f1040
  }

  // worksheet line 1
  totalIncome = (): number | undefined => this.f1040.l15()

  // worksheet line 2
  qualDiv = (): number | undefined => this.f1040.l3a()

  // worksheet line 3
  longTermCapGains = (): number => Math.min(
    this.f1040.scheduleD?.l15() ?? 0,
    this.f1040.scheduleD?.l16() ?? 0
  )

  // worksheet line 5
  ordinary = (): number => Math.max(
    0,
    (
      (this.totalIncome() ?? 0) -
      (this.qualDiv() ?? 0) -
      (this.longTermCapGains() ?? 0)
    )
  )

  // worksheet line 24
  tax = (): number | undefined => {
    const fs = this.f1040.filingStatus
    if (fs === undefined) {
      return undefined
    }

    return Math.min(
      // ordinary computation on total income (worksheet line 24)
      computeOrdinaryTax(fs, this.totalIncome() ?? 0),
      // line 23
      computeOrdinaryTax(fs, this.ordinary()) + // line 22
      computeLongTermCapGainsTax(fs, this.totalIncome() ?? 0) -
      computeLongTermCapGainsTax(fs, this.ordinary())
    )
  }
}
