import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field, RadioSelect } from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { AccountType, FilingStatus, State } from 'ustaxes/core/data'
import parameters from './Parameters'
import { IL1040scheduleileeic } from './IL1040ScheduleILEIC'
import IL1040V from './IL1040V'
import { ILWIT } from './ILWit'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export class IL1040 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  scheduleEIC: IL1040scheduleileeic
  il1040V: IL1040V
  formOrder = 0
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'IL-1040'
    this.state = 'IL'
    this.scheduleEIC = new IL1040scheduleileeic(this.info, f1040)
    this.il1040V = new IL1040V(this.info, f1040, this)
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => {
    const pmt = this.payment()
    const result: Form[] = []
    if ((pmt ?? 0) > 0) {
      result.push(this.il1040V)
    }
    if (this.scheduleEIC.isRequired()) {
      result.push(this.scheduleEIC)
    }
    if (this.methods.stateWithholding() > 0) {
      const ilwit = new ILWIT(this.f1040)
      result.push(ilwit)
      ilwit.attachments().forEach((f) => result.push(f))
    }

    return result
  }

  /**
   * Index 0: Help
   */
  Help = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.Help()

  /**
   * Index 1: month
   */
  month = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.month()

  /**
   * Index 2: year
   */
  year = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.year()

  /**
   * Index 3: name1
   */
  name1 = (): string | undefined => this.info.taxPayer.primaryPerson.firstName

  f3 = (): string | undefined => this.name1()

  /**
   * Index 4: name2
   */
  name2 = (): string | undefined => this.info.taxPayer.primaryPerson.lastName

  f4 = (): string | undefined => this.name2()

  /**
   * Index 5: YoB
   * TODO - year of birth
   */
  YoB = (): string | undefined => undefined

  f5 = (): string | undefined => this.YoB()

  /**
   * Index 6: ssn1
   */
  ssn1 = (): string | undefined =>
    this.info.taxPayer.primaryPerson.ssid.slice(0, 3)

  f6 = (): string | undefined => this.ssn1()

  /**
   * Index 7: ssn2
   */
  ssn2 = (): string | undefined =>
    this.info.taxPayer.primaryPerson.ssid.slice(3, 5)

  f7 = (): string | undefined => this.ssn2()

  /**
   * Index 8: ssn3
   */
  ssn3 = (): string | undefined =>
    this.info.taxPayer.primaryPerson.ssid.slice(5)

  f8 = (): string | undefined => this.ssn3()

  /**
   * Index 9: name3
   */
  name3 = (): string | undefined => this.info.taxPayer.spouse?.firstName

  f9 = (): string | undefined => this.name3()

  /**
   * Index 10: name4
   */
  name4 = (): string | undefined => this.info.taxPayer.spouse?.lastName

  f10 = (): string | undefined => this.name4()

  /**
   * Index 11: SpYoB
   * TODO: spouse birth year
   */
  SpYoB = (): string | undefined => undefined

  f11 = (): string | undefined => this.SpYoB()

  /**
   * Index 12: ssn4
   */
  ssn4 = (): string | undefined => this.info.taxPayer.spouse?.ssid.slice(0, 3)

  f12 = (): string | undefined => this.ssn4()

  /**
   * Index 13: ssn5
   */
  ssn5 = (): string | undefined => this.info.taxPayer.spouse?.ssid.slice(3, 5)

  f13 = (): string | undefined => this.ssn5()

  /**
   * Index 14: ssn6
   */
  ssn6 = (): string | undefined => this.info.taxPayer.spouse?.ssid.slice(5)

  f14 = (): string | undefined => this.ssn6()

  /**
   * Index 15: address
   */
  address = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.address

  f15 = (): string | undefined => this.address()

  /**
   * Index 16: apt
   */
  apt = (): string | undefined => this.info.taxPayer.primaryPerson.address.aptNo

  f16 = (): string | undefined => this.apt()

  /**
   * Index 17: County
   * TODO - county
   */
  County = (): string | undefined => undefined

  f17 = (): string | undefined => this.County()

  /**
   * Index 18: city
   */
  city = (): string | undefined => this.info.taxPayer.primaryPerson.address.city

  f18 = (): string | undefined => this.city()

  /**
   * Index 19: st
   */
  st = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.state ??
    this.info.taxPayer.primaryPerson.address.province

  f19 = (): string | undefined => this.st()

  /**
   * Index 20: zip
   */
  zip = (): string | undefined => this.info.taxPayer.primaryPerson.address.zip

  f20 = (): string | undefined => this.zip()

  /**
   * Index 21: foreign
   */
  foreign = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.foreignCountry

  f21 = (): string | undefined => this.foreign()

  /**
   * Index 22: Check Box1
   * This is actually a radio group, so indicate the correct selection
   * by index.
   */
  CheckBox1 = (): RadioSelect | undefined => ({
    select: [
      FilingStatus.S,
      FilingStatus.MFJ,
      FilingStatus.MFS,
      FilingStatus.W,
      FilingStatus.HOH
    ].findIndex((x) => x === this.info.taxPayer.filingStatus)
  })

  f22 = (): RadioSelect | undefined => this.CheckBox1()

  /**
   * Index 23: Check Box1c
   */
  CheckBox1c = (): boolean | undefined =>
    this.info.taxPayer.primaryPerson.isTaxpayerDependent

  f23 = (): boolean | undefined => this.CheckBox1c()

  /**
   * Index 24: Check Box1cc
   */
  CheckBox1cc = (): boolean | undefined =>
    this.info.taxPayer.spouse?.isTaxpayerDependent

  f24 = (): boolean | undefined => this.CheckBox1cc()

  /**
   * Index 25: Check Box7
   * TODO - nonresident, part year
   */
  CheckBox7 = (): boolean | undefined => undefined

  f25 = (): boolean | undefined => this.CheckBox7()

  /**
   * Index 26: 1
   */
  l1 = (): number | undefined => this.f1040.l11()

  /**
   * Index 27: 2
   */
  l2 = (): number | undefined => this.f1040.l2a()

  /**
   * Index 28: 3
   * TODO: Schedule M, other additions
   */
  l3 = (): number | undefined => undefined

  /**
   * Index 29: 4
   */
  l4 = (): number => sumFields([this.l1(), this.l2(), this.l3()])

  /**
   * Index 30: 5
   * TODO - ss benefits and certain retirement plan income received if included in line 1, attach p1 of federal return
   */
  l5 = (): number | undefined => undefined

  /**
   * Index 31: 6
   * TODO IL income tax overpayment included in federal form 1040 S1 L1
   */
  l6 = (): number | undefined => undefined

  /**
   * Index 32: 7
   * TODO: other subtractions, attach Schedule M
   */
  l7 = (): number | undefined => undefined

  /**
   * Index 33: Check Box2
   * Check if L7 includes any amount from Schedule 1299-C
   */
  CheckBox2 = (): boolean | undefined => undefined

  f33 = (): boolean | undefined => this.CheckBox2()

  /**
   * Index 34: 8
   */
  l8 = (): number => sumFields([this.l5(), this.l6(), this.l7()])

  /**
   * Index 35: 9
   * IL base income
   */
  l9 = (): number => Math.max(0, this.l4() - this.l8())

  /**
   * Index 36: 10a
   */
  l10a = (): number => {
    if (this.info.taxPayer.filingStatus === FilingStatus.MFJ)
      return parameters.exemptions.MFJ.exemptionAmount
    return parameters.exemptions.S.exemptionAmount
  }

  /**
   * Index 37: Check Box3
   * Check if TP senior
   */
  primarySenior = (): boolean | undefined => undefined

  f37 = (): boolean | undefined => this.primarySenior()

  /**
   * Index 38: Check Box4
   * Check if spouse senior
   */
  spouseSenior = (): boolean | undefined => undefined

  f38 = (): boolean | undefined => this.spouseSenior()

  /**
   * Index 39: 10b
   */
  l10b = (): number =>
    [this.primarySenior() ?? false, this.spouseSenior() ?? false].filter(
      (x) => x
    ).length * parameters.seniorExemption

  /**
   * Index 40: Check Box5
   * TODO: TP blind
   */
  CheckBox5 = (): boolean | undefined => undefined

  f40 = (): boolean | undefined => this.CheckBox5()

  /**
   * Index 41: Check Box6
   * TODO: Spouse blind
   */
  CheckBox6 = (): boolean | undefined => undefined

  f41 = (): boolean | undefined => this.CheckBox6()

  /**
   * Index 42: 10c
   */
  l10c = (): number | undefined =>
    [this.CheckBox5(), this.CheckBox6()].filter((x) => x).length *
    parameters.blindExemption

  /**
   * Index 43: 10d
   * TODO: Schedule EC step 2, line 1
   */
  l10d = (): number | undefined => undefined

  /**
   * Index 44: 10
   * Net income
   */
  l10 = (): number =>
    sumFields([this.l10a(), this.l10b(), this.l10c(), this.l10d()])

  /**
   * Index 45: 11
   * TODO: handle non-residents, part year residents
   */
  l11 = (): number => Math.max(0, this.l9() - this.l10())

  /**
   * Index 46: 12
   */
  l12 = (): number => this.l11() * parameters.taxRate

  /**
   * Index 47: 13
   * TODO: recapture investment tax credits, schedule 4255
   */
  l13 = (): number | undefined => undefined

  /**
   * Index 48: 14
   * Income tax
   */
  l14 = (): number => sumFields([this.l12(), this.l13()])

  /**
   * Index 49: 15
   * TODO: income tax paid to another state while IL resident
   */
  l15 = (): number | undefined => undefined

  /**
   * Index 50: 16
   * Property tax and K12 education expense credit amount from Schedule ICR
   */
  l16 = (): number | undefined => undefined

  /**
   * Index 51: 17
   * TODO: Credit amount from Schedule 1299-C Attach 1299-C
   */
  l17 = (): number | undefined => undefined

  /**
   * Index 52: 18
   * Total credits
   */
  l18 = (): number => sumFields([this.l15(), this.l16(), this.l17()])

  /**
   * Index 53: 19
   * Total non-refundable credits
   */
  l19 = (): number => Math.max(0, this.l14() - this.l18())

  /**
   * Index 54: 20
   * TODO: Household employment tax
   */
  l20 = (): number | undefined => undefined

  /**
   * Index 55: 21
   * TODO: Use tax on internet, mail order, or other out-of-state purchases
   */
  l21 = (): number | undefined => undefined

  /**
   * Index 56: 22
   * TODO: Compassionate use of medical cannabis program act and sale of assets by gaming licensee
   */
  l22 = (): number | undefined => undefined

  /**
   * Index 57: 23
   * Total tax
   */
  l23 = (): number =>
    sumFields([this.l19(), this.l20(), this.l21(), this.l22()])

  /**
   * Index 58: 24
   */
  l24 = (): number => this.l23()

  /**
   * Index 59: 25
   * IL Income tax withheld
   */
  l25 = (): number | undefined => this.methods.witholdingForState('IL')

  /**
   * Index 60: 26
   * TODO: Estimated tax payments
   */
  l26 = (): number | undefined => undefined

  /**
   * Index 61: 27
   * Pass-through withholding
   */
  l27 = (): number | undefined => undefined

  /**
   * Index 62: 28
   * Earned income credit from Schedule IL-E/EIC, Step 4, line 8
   */
  l28 = (): number | undefined => this.scheduleEIC.earnedIncomeCredit()

  /**
   * Index 63: 29
   * Total payments and refundable credits
   */
  l29 = (): number =>
    sumFields([this.l25(), this.l26(), this.l27(), this.l28()])

  /**
   * Index 64: 30
   */
  l30 = (): number => Math.max(0, this.l29() - this.l24())

  /**
   * Index 65: 31
   */
  l31 = (): number => Math.max(0, this.l24() - this.l29())

  /**
   * Index 66: 32
   * TODO: late payment penalty for underpayment of estimated tax
   */
  l32 = (): number | undefined => undefined

  /**
   * Index 67: Check Box8a
   * TODO: 2/3 of income from farming
   */
  CheckBox8a = (): boolean | undefined => undefined

  f67 = (): boolean | undefined => this.CheckBox8a()

  /**
   * Index 68: Check Box8b
   * TODO: You or spouse is 65 or older and permanently in nursing home
   */
  CheckBox8b = (): boolean | undefined => undefined

  f68 = (): boolean | undefined => this.CheckBox8b()

  /**
   * Index 69: Check Box8c
   * TODO: Income not received evenly during the year and you annualized your income on IL-2210
   */
  CheckBox8c = (): boolean | undefined => undefined

  f69 = (): boolean | undefined => this.CheckBox8c()

  /**
   * Index 70: Check Box8d
   * TODO: Check if you were not required to file an IL individual tax return in the previous tax year.
   */
  CheckBox8d = (): boolean | undefined => undefined

  f70 = (): boolean | undefined => this.CheckBox8d()

  /**
   * Index 71: 33
   * TODO: Voluntary charitable contributions
   */
  l33 = (): number | undefined => undefined

  /**
   * Index 72: 34
   */
  l34 = (): number => sumFields([this.l32(), this.l33()])

  /**
   * Index 73: 35
   * If you have an amount on L30 and this amount is greater than L34, this is your overpayment
   */
  l35 = (): number => Math.max(0, this.l30() - this.l34())

  /**
   * Index 74: 36
   * Amount you want refunded to you
   * TODO: assuming payer wants all refunded.
   */
  l36 = (): number => this.l35()

  /**
   * Index 75: rn1
   */
  rn1 = (): string | undefined => this.info.refund?.routingNumber

  f75 = (): string | undefined => this.rn1()

  /**
   * Index 76: Check Box11
   * TODO: support savings account checkbox - radio field issue
   */
  CheckBox11 = (): boolean | undefined =>
    this.info.refund?.accountType === AccountType.checking

  f76 = (): boolean | undefined => this.CheckBox11()

  /**
   * Index 77: ac1
   */
  ac1 = (): string | undefined => this.info.refund?.accountNumber

  f77 = (): string | undefined => this.ac1()

  /**
   * Index 78: Refund Method
   * TODO: radio issue, only handling direct deposit.
   */
  RefundMethod = (): boolean | undefined => true

  f78 = (): boolean | undefined => this.RefundMethod()

  /**
   * Index 79: 38
   * TODO: not supporting credit forward
   */
  l38 = (): number | undefined => undefined

  /**
   * Index 80: 39
   */
  l39 = (): number | undefined => {
    const l31 = this.l31()
    const l34 = this.l34()
    const l30 = this.l30()
    if (l31 > 0) return l31 + l34
    if (l30 > 0 && l30 < l34) return l34 - l30
  }
  payment = (): number | undefined => this.l39()

  /**
   * Index 81: name1
   */
  initial = (): string | undefined => this.info.taxPayer.primaryPerson.initial

  f79 = (): string | undefined => this.initial()
  // Signature block fields omitted

  fields = (): Field[] => [
    this.f0(),
    this.f1(),
    this.f2(),
    this.f3(),
    this.f4(),
    this.f5(),
    this.f6(),
    this.f7(),
    this.f8(),
    this.f9(),
    this.f10(),
    this.f11(),
    this.f12(),
    this.f13(),
    this.f14(),
    this.f15(),
    this.f16(),
    this.f17(),
    this.f18(),
    this.f19(),
    this.f20(),
    this.f21(),
    this.f22(),
    this.f23(),
    this.f24(),
    this.f25(),
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.f33(),
    this.l8(),
    this.l9(),
    this.l10a(),
    this.f37(),
    this.f38(),
    this.l10b(),
    this.f40(),
    this.f41(),
    this.l10c(),
    this.l10d(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17(),
    this.l18(),
    this.l19(),
    this.l20(),
    this.l21(),
    this.l22(),
    this.l23(),
    this.l24(),
    this.l25(),
    this.l26(),
    this.l27(),
    this.l28(),
    this.l29(),
    this.l30(),
    this.l31(),
    this.l32(),
    this.f67(),
    this.f68(),
    this.f69(),
    this.f70(),
    this.l33(),
    this.l34(),
    this.l35(),
    this.l36(),
    this.f75(),
    this.f76(),
    this.f77(),
    this.f78(),
    this.l38(),
    this.l39(),
    this.f79()
  ]
}

const makeIL1040 = (f1040: F1040): IL1040 => new IL1040(f1040)

export default makeIL1040
