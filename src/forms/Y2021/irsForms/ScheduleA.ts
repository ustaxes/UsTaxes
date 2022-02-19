import { FilingStatus, ItemizedDeductions } from 'ustaxes/core/data'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import TaxPayer from 'ustaxes/core/data/TaxPayer'
import F1040 from './F1040'

// Not yet implemented
export default class ScheduleA extends Form {
  tag: FormTag = 'f1040sa'
  f1040: F1040
  itemizedDeductions: ItemizedDeductions
  sequenceIndex = 999

  constructor(f1040: F1040) {
    super()
    this.f1040 = f1040
    this.itemizedDeductions = f1040.info.itemizedDeductions ?? {
      medicalAndDental: 0,
      stateAndLocalTaxes: 0,
      isSalesTax: false,
      stateAndLocalRealEstateTaxes: 0,
      stateAndLocalPropertyTaxes: 0,
      interest8a: 0,
      interest8b: 0,
      interest8c: 0,
      interest8d: 0,
      investmentInterest: 0,
      charityCashCheck: 0,
      charityOther: 0
    }
  }

  deductions(): number {
    return (
      this.l4() + this.l7() + this.l10() + this.l14() + this.l15() + this.l16()
    )
  }

  l1 = (): number | undefined =>
    Number(this.itemizedDeductions.medicalAndDental)

  l2 = (): number | undefined => this.f1040.l11()

  l3 = (): number | undefined => {
    const l2 = this.l2()
    if (l2 === undefined) return undefined
    return l2 * 0.075
  }

  l4 = (): number => {
    const l1 = this.l1() ?? 0
    const l3 = this.l3() ?? 0
    return Math.max(0, l1 - l3)
  }

  l5a = (): number => Number(this.itemizedDeductions.stateAndLocalTaxes)
  l5b = (): number =>
    Number(this.itemizedDeductions.stateAndLocalRealEstateTaxes)
  l5c = (): number => Number(this.itemizedDeductions.stateAndLocalPropertyTaxes)
  l5d = (): number => (this.l5a() ?? 0) + (this.l5b() ?? 0) + (this.l5c() ?? 0)
  l5e = (): number => {
    const max =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS ? 5000 : 10000
    return Math.min(max, this.l5d())
  }

  l6 = (): number | undefined => undefined

  l7 = (): number => this.l5e() + (this.l6() ?? 0)

  l8a = (): number => Number(this.itemizedDeductions.interest8a)
  l8b = (): number => Number(this.itemizedDeductions.interest8b)
  l8c = (): number => Number(this.itemizedDeductions.interest8c)
  l8d = (): number => Number(this.itemizedDeductions.interest8d)
  l8e = (): number => this.l8a() + this.l8b() + this.l8c() + this.l8d()

  // Used in Form 8960
  l9 = (): number | undefined =>
    this.itemizedDeductions.investmentInterest === undefined
      ? undefined
      : Number(this.itemizedDeductions.investmentInterest)

  l10 = (): number => this.l8e() + (this.l9() ?? 0)

  l11 = (): number => Number(this.itemizedDeductions.charityCashCheck)
  l12 = (): number => Number(this.itemizedDeductions.charityOther)
  l13 = (): number => 0
  l14 = (): number => this.l11() + this.l12() + this.l13()

  l15 = (): number => 0
  l16 = (): number => 0

  l17 = (): number =>
    this.l4() + this.l7() + this.l10() + this.l14() + this.l15() + this.l16()

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.f1040.info.taxPayer)

    const result = [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid ?? '',
      this.l1(),
      this.l2(),
      this.l3(),
      this.l4(),
      this.itemizedDeductions.isSalesTax,
      this.l5a(),
      this.l5b(),
      this.l5c(),
      this.l5d(),
      this.l5e(),
      '',
      '',
      this.l6(),
      this.l7(),
      false,
      this.l8a(),
      '',
      '',
      this.l8b(),
      this.l8c(),
      this.l8d(),
      this.l8e(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      '',
      '',
      '',
      this.l16(),
      this.l17(),
      false
    ]

    return result
  }
}
