import F1040Attachment from './F1040Attachment'
import { FilingStatus, ItemizedDeductions } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
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

const sum1098Interest = (f1040: F1040): number =>
  f1040.info.f1098s
    .map((f) => f.interest + (f.points ?? 0))
    .reduce((l, r) => l + r, 0)

const sum1098MortgageInsurance = (f1040: F1040): number =>
  f1040.info.f1098s
    .map((f) => f.mortgageInsurancePremiums ?? 0)
    .reduce((l, r) => l + r, 0)

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
    this.itemizedDeductions.interest8a =
      Number(this.itemizedDeductions.interest8a) + sum1098Interest(f1040)
    this.itemizedDeductions.interest8d =
      Number(this.itemizedDeductions.interest8d) +
      sum1098MortgageInsurance(f1040)
  }

  isNeeded = (): boolean => {
    if (
      this.f1040.info.itemizedDeductions !== undefined ||
      this.f1040.info.f1098s.length > 0
    ) {
      const standardDeduction = this.f1040.standardDeduction()
      const itemizedAmount = this.deductions()
      return (
        standardDeduction === undefined || itemizedAmount > standardDeduction
      )
    }
    return false
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
  l8d = (): number | undefined => undefined // Reserved for future use
  l8e = (): number => this.l8a() + this.l8b() + this.l8c()

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
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
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
    this.l8d(), // Reserved for future use
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

  // Generated from Y2024 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 37 TS expressions, 37 PDF fields
  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    text('topmostSubform[0].Page1[0].f1_3[0]', this.l1()),
    text('topmostSubform[0].Page1[0].f1_4[0]', this.l2()),
    text('topmostSubform[0].Page1[0].f1_5[0]', this.l3()),
    text('topmostSubform[0].Page1[0].f1_6[0]', this.l4()),
    checkbox('topmostSubform[0].Page1[0].c1_1[0]', this.l5aSalesTax()),
    text('topmostSubform[0].Page1[0].f1_7[0]', this.l5a()),
    text('topmostSubform[0].Page1[0].f1_8[0]', this.l5b()),
    text('topmostSubform[0].Page1[0].f1_9[0]', this.l5c()),
    text('topmostSubform[0].Page1[0].f1_10[0]', this.l5d()),
    text('topmostSubform[0].Page1[0].f1_11[0]', this.l5e()),
    text(
      'topmostSubform[0].Page1[0].f1_12[0]',
      this.l6OtherTaxesTypeAndAmount1()
    ),
    text(
      'topmostSubform[0].Page1[0].f1_13[0]',
      this.l6OtherTaxesTypeAndAmount2()
    ),
    text('topmostSubform[0].Page1[0].f1_14[0]', this.l6()),
    text('topmostSubform[0].Page1[0].f1_15[0]', this.l7()),
    checkbox(
      'topmostSubform[0].Page1[0].Line8_ReadOrder[0].c1_2[0]',
      this.l8AllMortgageLoan()
    ),
    text('topmostSubform[0].Page1[0].f1_16[0]', this.l8a()),
    text('topmostSubform[0].Page1[0].f1_17[0]', this.l8bUnreportedInterest1()),
    text('topmostSubform[0].Page1[0].f1_18[0]', this.l8bUnreportedInterest2()),
    text('topmostSubform[0].Page1[0].f1_19[0]', this.l8b()),
    text('topmostSubform[0].Page1[0].f1_20[0]', this.l8c()),
    text('topmostSubform[0].Page1[0].f1_21[0]', this.l8d()),
    text('topmostSubform[0].Page1[0].f1_22[0]', this.l8e()),
    text('topmostSubform[0].Page1[0].f1_23[0]', this.l9()),
    text('topmostSubform[0].Page1[0].f1_24[0]', this.l10()),
    text('topmostSubform[0].Page1[0].f1_25[0]', this.l11()),
    text('topmostSubform[0].Page1[0].f1_26[0]', this.l12()),
    text('topmostSubform[0].Page1[0].f1_27[0]', this.l13()),
    text('topmostSubform[0].Page1[0].f1_28[0]', this.l14()),
    text('topmostSubform[0].Page1[0].f1_29[0]', this.l15()),
    text('topmostSubform[0].Page1[0].f1_30[0]', this.l16Other1()),
    text('topmostSubform[0].Page1[0].f1_31[0]', this.l16Other2()),
    text('topmostSubform[0].Page1[0].f1_32[0]', this.l16Other3()),
    text('topmostSubform[0].Page1[0].f1_33[0]', this.l16()),
    text('topmostSubform[0].Page1[0].f1_34[0]', this.l17()),
    checkbox(
      'topmostSubform[0].Page1[0].Line18_ReadOrder[0].c1_3[0]',
      this.l18()
    )
  ]
}
