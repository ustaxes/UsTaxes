import F1040Attachment from './F1040Attachment'
import { ItemizedDeductions } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'
import { saltCap } from '../data/federal'

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

  isNeeded = (): boolean => {
    if (this.f1040.info.itemizedDeductions !== undefined) {
      const standardDeduction = this.f1040.standardDeduction()
      const itemizedAmount = this.deductions()
      return (
        standardDeduction === undefined || itemizedAmount > standardDeduction
      )
    }
    return false
  }

  l1 = (): number => Number(this.itemizedDeductions.medicalAndDental)

  l2 = (): number => this.f1040.l11b()

  l3 = (): number => this.l2() * 0.075

  l4 = (): number => Math.max(0, this.l1() - this.l3())

  l5aSalesTax = (): boolean => this.itemizedDeductions.isSalesTax

  l5a = (): number => Number(this.itemizedDeductions.stateAndLocalTaxes)
  l5b = (): number =>
    Number(this.itemizedDeductions.stateAndLocalRealEstateTaxes)
  l5c = (): number => Number(this.itemizedDeductions.stateAndLocalPropertyTaxes)
  l5d = (): number => this.l5a() + this.l5b() + this.l5c()
  l5e = (): number => {
    const fs = this.f1040.info.taxPayer.filingStatus
    const magi = this.f1040.l11b()
    const base = saltCap.base(fs)
    const floor = saltCap.floor(fs)
    const threshold = saltCap.phaseOutThreshold(fs)
    const excess = Math.max(0, magi - threshold)
    const cap = Math.max(floor, base - excess * saltCap.phaseOutRate)
    return Math.min(cap, this.l5d())
  }

  // TODO
  l6OtherTaxesTypeAndAmount = (): string | undefined => undefined

  // TODO
  l6 = (): number | undefined => undefined

  l7 = (): number => this.l5e() + (this.l6() ?? 0)

  // TODO
  l8AllMortgageLoan = (): boolean => false
  l8a = (): number => Number(this.itemizedDeductions.interest8a)

  // TODO
  l8bUnreportedInterest = (): string | undefined => undefined
  l8b = (): number => Number(this.itemizedDeductions.interest8b)
  l8c = (): number => Number(this.itemizedDeductions.interest8c)
  l8d = (): number | undefined => undefined // Reserved for future use
  l8e = (): number => this.l8a() + this.l8b() + this.l8c()

  // Used in Form 8960. Capped by Form 4952 net investment income when present.
  l9 = (): number | undefined => {
    const raw = Number(this.itemizedDeductions.investmentInterest)
    if (raw === 0) return undefined
    // If F4952 is needed, use the capped deductible amount
    const f4952 = this.f1040.f4952
    if (f4952 !== undefined) return f4952.l4g()
    return raw
  }

  l10 = (): number => this.l8e() + (this.l9() ?? 0)

  l11 = (): number => Number(this.itemizedDeductions.charityCashCheck)

  // TODO: form 8283
  l12 = (): number => Number(this.itemizedDeductions.charityOther)
  l13 = (): number => 0
  l14 = (): number => this.l11() + this.l12() + this.l13()

  l15 = (): number => 0

  // TODO
  l16Other = (): string | undefined => undefined
  l16 = (): number => 0

  deductions(): number {
    return (
      this.l4() + this.l7() + this.l10() + this.l14() + this.l15() + this.l16()
    )
  }

  l17 = (): number => this.deductions()

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
    this.l6OtherTaxesTypeAndAmount(),
    this.l6(),
    this.l7(),
    this.l8AllMortgageLoan(),
    this.l8a(),
    this.l8bUnreportedInterest(),
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
    this.l16Other(),
    this.l16(),
    this.l17(),
    this.l18()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 33 TS expressions, 33 PDF fields
  fillInstructions = (): FillInstructions => [
    text('form1[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'form1[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    text('form1[0].Page1[0].f1_3[0]', this.l1()),
    text('form1[0].Page1[0].Line2_ReadOrder[0].f1_4[0]', this.l2()),
    text('form1[0].Page1[0].f1_5[0]', this.l3()),
    text('form1[0].Page1[0].f1_6[0]', this.l4()),
    checkbox('form1[0].Page1[0].c1_1[0]', this.l5aSalesTax()),
    text('form1[0].Page1[0].f1_7[0]', this.l5a()),
    text('form1[0].Page1[0].f1_8[0]', this.l5b()),
    text('form1[0].Page1[0].f1_9[0]', this.l5c()),
    text('form1[0].Page1[0].f1_10[0]', this.l5d()),
    text('form1[0].Page1[0].f1_11[0]', this.l5e()),
    text('form1[0].Page1[0].f1_12[0]', this.l6OtherTaxesTypeAndAmount()),
    text('form1[0].Page1[0].f1_13[0]', this.l6()),
    text('form1[0].Page1[0].f1_14[0]', this.l7()),
    checkbox(
      'form1[0].Page1[0].Line8_ReadOrder[0].c1_2[0]',
      this.l8AllMortgageLoan()
    ),
    text('form1[0].Page1[0].f1_15[0]', this.l8a()),
    text(
      'form1[0].Page1[0].Line8b_ReadOrder[0].f1_16[0]',
      this.l8bUnreportedInterest()
    ),
    text('form1[0].Page1[0].f1_17[0]', this.l8b()),

    text('form1[0].Page1[0].f1_18[0]', this.l8c()),
    text('form1[0].Page1[0].f1_19[0]', this.l8d()),
    text('form1[0].Page1[0].f1_20[0]', this.l8e()),

    text('form1[0].Page1[0].f1_21[0]', this.l9()),
    text('form1[0].Page1[0].f1_22[0]', this.l10()),
    text('form1[0].Page1[0].f1_23[0]', this.l11()),
    text('form1[0].Page1[0].f1_24[0]', this.l12()),
    text('form1[0].Page1[0].f1_25[0]', this.l13()),
    text('form1[0].Page1[0].f1_26[0]', this.l14()),
    text('form1[0].Page1[0].f1_27[0]', this.l15()),
    text('form1[0].Page1[0].f1_28[0]', this.l16Other()),
    
    text('form1[0].Page1[0].f1_30[0]', this.l16()),
    text('form1[0].Page1[0].f1_30[0]', this.l17()),
    checkbox('form1[0].Page1[0].Line18_ReadOrder[0].c1_3[0]', this.l18())
  ]
}
