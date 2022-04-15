import F1040Attachment from './F1040Attachment'
import { FilingStatus, ItemizedDeductions } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'

const blankItemizedDeductions = {
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

export default class ScheduleA extends F1040Attachment {
  tag: FormTag = 'f1040sa'
  itemizedDeductions: ItemizedDeductions
  sequenceIndex = 7

  constructor(f1040: F1040) {
    super(f1040)
    this.itemizedDeductions = {
      ...blankItemizedDeductions,
      ...(f1040.info.itemizedDeductions ?? {})
    }
  }

  deductions(): number {
    return (
      this.l4() + this.l7() + this.l10() + this.l14() + this.l15() + this.l16()
    )
  }

  l1 = (): number => Number(this.itemizedDeductions.medicalAndDental)

  l2 = (): number => this.f1040.l11()

  l3 = (): number => this.l2() * 0.075

  l4 = (): number => Math.max(0, this.l1() - this.l3())

  l5aSalesTax = (): boolean => this.itemizedDeductions.isSalesTax

  l5a = (): number => Number(this.itemizedDeductions.stateAndLocalTaxes)
  l5b = (): number =>
    Number(this.itemizedDeductions.stateAndLocalRealEstateTaxes)
  l5c = (): number => Number(this.itemizedDeductions.stateAndLocalPropertyTaxes)
  l5d = (): number => this.l5a() + this.l5b() + this.l5c()
  l5e = (): number => {
    const max =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS ? 5000 : 10000
    return Math.min(max, this.l5d())
  }

  // TODO
  l6OtherTaxesTypeAndAmount1 = (): string | undefined => undefined
  l6OtherTaxesTypeAndAmount2 = (): string | undefined => undefined

  // TODO
  l6 = (): number | undefined => undefined

  l7 = (): number => this.l5e() + (this.l6() ?? 0)

  // TODO
  l8AllMortgageLoan = (): boolean => false
  l8a = (): number => Number(this.itemizedDeductions.interest8a)

  // TODO
  l8bUnreportedInterest1 = (): string | undefined => undefined
  // TODO
  l8bUnreportedInterest2 = (): string | undefined => undefined
  l8b = (): number => Number(this.itemizedDeductions.interest8b)
  l8c = (): number => Number(this.itemizedDeductions.interest8c)
  l8d = (): number => Number(this.itemizedDeductions.interest8d)
  l8e = (): number => this.l8a() + this.l8b() + this.l8c() + this.l8d()

  // Used in Form 8960
  l9 = (): number | undefined =>
    Number(this.itemizedDeductions.investmentInterest)

  l10 = (): number => this.l8e() + (this.l9() ?? 0)

  l11 = (): number => Number(this.itemizedDeductions.charityCashCheck)

  // TODO: form 8283
  l12 = (): number => Number(this.itemizedDeductions.charityOther)
  l13 = (): number => 0
  l14 = (): number => this.l11() + this.l12() + this.l13()

  l15 = (): number => 0

  // TODO
  l16Other1 = (): string | undefined => undefined
  l16Other2 = (): string | undefined => undefined
  l16Other3 = (): string | undefined => undefined
  l16 = (): number => 0

  l17 = (): number =>
    this.l4() + this.l7() + this.l10() + this.l14() + this.l15() + this.l16()

  l18 = (): boolean => false

  fields = (): Field[] => [
    this.f1040.info.namesString(),
    this.f1040.info.taxPayer.primaryPerson?.ssid ?? '',
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5aSalesTax(),
    this.l5a(),
    this.l5b(),
    this.l5c(),
    this.l5d(),
    this.l5e(),
    this.l6OtherTaxesTypeAndAmount1(),
    this.l6OtherTaxesTypeAndAmount2(),
    this.l6(),
    this.l7(),
    this.l8AllMortgageLoan(),
    this.l8a(),
    this.l8bUnreportedInterest1(),
    this.l8bUnreportedInterest2(),
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
    this.l16Other1(),
    this.l16Other2(),
    this.l16Other3(),
    this.l16(),
    this.l17(),
    this.l18()
  ]
}
