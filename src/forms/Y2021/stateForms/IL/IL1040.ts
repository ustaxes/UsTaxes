import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field, RadioSelect } from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import {
  AccountType,
  FilingStatus,
  Information,
  State
} from 'ustaxes/core/data'
import parameters from './Parameters'
import { IL1040scheduleileeic } from './IL1040ScheduleILEIC'
import IL1040V from './IL1040V'
import { ILWIT } from './ILWit'

export class IL1040 extends Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  scheduleEIC: IL1040scheduleileeic
  il1040V: IL1040V
  formOrder = 0
  methods: FormMethods

  constructor(info: Information, f1040: F1040) {
    super()
    this.info = info
    this.f1040 = f1040
    this.formName = 'IL-1040'
    this.state = 'IL'
    this.scheduleEIC = new IL1040scheduleileeic(info, f1040)
    this.il1040V = new IL1040V(info, f1040, this)
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
      const ilwit = new ILWIT(this.info, this.f1040)
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
   * Index 3: name2
   * Primary First Name
   */
  name2 = (): string | undefined => this.info.taxPayer.primaryPerson?.firstName

  f3 = (): string | undefined => this.name2()

  /**
   * Index 4: YoB
   */
  YoB = (): string | undefined => {
    return undefined
  }

  f4 = (): string | undefined => this.YoB()

  /**
   * Index 5: ssn1
   */
  ssn1 = (): string | undefined => this.info.taxPayer.primaryPerson?.ssid

  f5 = (): string | undefined => this.ssn1()

  /**
   * Primary last name?
   * Index 6: name3
   */
  name3 = (): string | undefined => this.info.taxPayer.primaryPerson?.lastName

  f6 = (): string | undefined => this.name3()

  /**
   * Spouse Fist name?
   * Index 7: name4
   */
  name4 = (): string | undefined => this.info.taxPayer.spouse?.firstName

  f7 = (): string | undefined => this.name4()

  /**
   * Index 8: SpYoB
   */
  SpYoB = (): string | undefined => undefined

  f8 = (): string | undefined => this.SpYoB()

  /**
   * Spouse SSN
   * Index 9: ssn4
   */
  ssn4 = (): string | undefined => this.info.taxPayer.spouse?.ssid

  f9 = (): string | undefined => this.ssn4()

  /**
   * Index 10: address
   */
  address = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.address

  f10 = (): string | undefined => this.address()

  /**
   * Index 11: apt
   */
  apt = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.aptNo

  f11 = (): string | undefined => this.apt()

  /**
   * Index 12: County
   */
  County = (): string | undefined => undefined

  f12 = (): string | undefined => this.County()

  /**
   * Index 13: city
   */
  city = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.city

  f13 = (): string | undefined => this.city()

  /**
   * Index 14: st
   */
  st = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.state ??
    this.info.taxPayer.primaryPerson?.address.province

  f14 = (): string | undefined => this.st()

  /**
   * Index 15: zip
   */
  zip = (): string | undefined => this.info.taxPayer.primaryPerson?.address.zip

  f15 = (): string | undefined => this.zip()

  /**
   * Index 16: foreign
   */
  foreign = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.foreignCountry

  f16 = (): string | undefined => this.foreign()

  /**
   * Index 17: Check Box1
   * This is actually a radio group, so indicate the correct selection
   * by index.
   */
  CheckBox1 = (): RadioSelect | undefined => {
    const fs = this.info.taxPayer.filingStatus
    if (fs === undefined) {
      throw new Error('Filing Status is undefined')
    }
    return {
      select: [
        FilingStatus.S,
        FilingStatus.MFJ,
        FilingStatus.MFS,
        FilingStatus.W,
        FilingStatus.HOH
      ].findIndex((x) => x === fs)
    }
  }

  f17 = (): RadioSelect | undefined => this.CheckBox1()

  /**
   * Index 18: Check Box1c
   */
  CheckBox1c = (): boolean | undefined =>
    this.info.taxPayer.primaryPerson?.isTaxpayerDependent

  f18 = (): boolean | undefined => this.CheckBox1c()

  /**
   * Index 19: Check Box1cc
   */
  CheckBox1cc = (): boolean | undefined =>
    this.info.taxPayer.spouse?.isTaxpayerDependent

  f19 = (): boolean | undefined => this.CheckBox1cc()

  /**
   * Index 20: Check Box7
   * TODO - nonresident, part year
   */
  CheckBox7 = (): boolean | undefined => {
    return undefined
  }

  f20 = (): boolean | undefined => this.CheckBox7()

  /**
   * Spouse last name !
   * Index 21: name1
   */
  name1 = (): string | undefined => this.info.taxPayer.spouse?.lastName

  f21 = (): string | undefined => this.name1()

  /**
   * Index 22: emailadd
   */
  emailadd = (): string | undefined => this.info.taxPayer.contactEmail

  f22 = (): string | undefined => this.emailadd()

  /**
   * Index 23: 1
   */
  l1 = (): number | undefined => this.f1040.l11()

  /**
   * Index 24: 2
   */
  l2 = (): number | undefined => this.f1040.l2a()

  /**
   * Index 25: 3
   * TODO: Schedule M, other additions
   */
  l3 = (): number | undefined => undefined

  /**
   * Index 26: 4
   */
  l4 = (): number => sumFields([this.l1(), this.l2(), this.l3()])

  /**
   * Index 27: 5
   * TODO - ss benefits and certain retirement plan income received if included in line 1, attach p1 of federal return
   */
  l5 = (): number | undefined => undefined

  /**
   * Index 28: 6
   * TODO IL income tax overpayment included in federal form 1040 S1 L1
   */
  l6 = (): number | undefined => undefined

  /**
   * Index 29: 7
   * TODO: other subtractions, attach Schedule M
   */
  l7 = (): number | undefined => undefined

  /**
   * Index 30: Check Box2
   * Check if L7 includes any amount from Schedule 1299-C
   */
  CheckBox2 = (): boolean | undefined => undefined

  f30 = (): boolean | undefined => this.CheckBox2()

  /**
   * Index 31: 8
   */
  l8 = (): number => sumFields([this.l5(), this.l6(), this.l7()])

  /**
   * Index 32: 9
   */
  l9 = (): number => Math.max(0, this.l4() - this.l8())

  /**
   * Index 33: 10a
   */
  l10a = (): number => {
    if (this.info.taxPayer.filingStatus === FilingStatus.MFJ)
      return parameters.exemptions.MFJ.exemptionAmount
    return parameters.exemptions.S.exemptionAmount
  }

  /**
   * Index 34: Check Box3
   * Check if TP senior
   */
  primarySenior = (): boolean | undefined => undefined

  f34 = (): boolean | undefined => this.primarySenior()

  /**
   * Index 35: Check Box4
   * Check if spouse senior
   */
  spouseSenior = (): boolean | undefined => {
    return undefined
  }

  f35 = (): boolean | undefined => this.spouseSenior()

  /**
   * Index 36: 10b
   */
  l10b = (): number =>
    [this.primarySenior() ?? false, this.spouseSenior() ?? false].filter(
      (x) => x
    ).length * parameters.seniorExemption

  /**
   * Index 37: Check Box5
   * TODO: TP blind
   */
  primaryBlind = (): boolean | undefined => undefined

  f37 = (): boolean | undefined => this.primaryBlind()

  /**
   * Index 38: Check Box6
   * TODO: Spouse blind
   */
  spouseBlind = (): boolean | undefined => undefined

  f38 = (): boolean | undefined => this.spouseBlind()

  /**
   * Index 39: 10c
   */
  l10c = (): number | undefined =>
    [this.primaryBlind(), this.spouseBlind()].filter((x) => x).length *
    parameters.blindExemption

  /**
   * Index 40: 10d
   * TODO: Schedule EC step 2, line 1
   */
  l10d = (): number | undefined => undefined

  /**
   * Index 41: 10
   * Net income
   */
  l10 = (): number =>
    sumFields([this.l10a(), this.l10b(), this.l10c(), this.l10d()])

  /**
   * Index 42: 11
   * TODO: handle non-residents, part year residents
   */
  l11 = (): number => Math.max(0, this.l9() - this.l10())

  /**
   * Index 43: 12
   */
  l12 = (): number => this.l11() * parameters.taxRate

  /**
   * Index 44: 13
   * TODO: recapture investment tax credits, schedule 4255
   */
  l13 = (): number | undefined => undefined

  /**
   * Index 45: 14
   * Income tax
   */
  l14 = (): number => sumFields([this.l12(), this.l13()])

  /**
   * Index 46: 15
   * TODO: income tax paid to another state while IL resident
   */
  l15 = (): number | undefined => undefined

  /**
   * Index 47: 16
   * Property tax and K12 education expense credit amount from Schedule ICR
   */
  l16 = (): number | undefined => undefined

  /**
   * Index 48: 17
   * TODO: Credit amount from Schedule 1299-C Attach 1299-C
   */
  l17 = (): number | undefined => undefined

  /**
   * Index 49: 18
   * Total credits
   */
  l18 = (): number => sumFields([this.l15(), this.l16(), this.l17()])

  /**
   * Index 50: 19
   */
  l19 = (): number => Math.max(0, this.l14() - this.l18())

  /**
   * Index 51: 20
   * TODO: Household employment tax
   */
  l20 = (): number | undefined => undefined

  /**
   * Index 52: 21
   * TODO: Use tax on internet, mail order, or other out-of-state purchases
   */
  l21 = (): number | undefined => undefined

  /**
   * Index 53: 22
   * TODO: Compassionate use of medical cannabis program act and sale of assets by gaming licensee
   */
  l22 = (): number | undefined => undefined

  /**
   * Index 54: 23
   */
  l23 = (): number =>
    sumFields([this.l19(), this.l20(), this.l21(), this.l22()])

  /**
   * Index 55: 24
   */
  l24 = (): number => this.l23()

  /**
   * Index 56: 25
   */
  l25 = (): number | undefined => this.methods.witholdingForState('IL')

  /**
   * Index 57: 26
   * TODO: Estimated tax payments
   */
  l26 = (): number | undefined => undefined

  /**
   * Index 58: 27
   * Pass-through withholding
   */
  l27 = (): number | undefined => undefined

  // After line 27, PDF form skips to Step 11 (after line 35)

  /**
   * Index 59: Check Box8a
   * TODO: 2/3 of income from farming
   */
  CheckBox8a = (): boolean | undefined => undefined

  f59 = (): boolean | undefined => this.CheckBox8a()

  /**
   * Index 60: Check Box8b ?? what
   * TODO: You or spouse is 65 or older and permanently in nursing home
   */
  CheckBox8b = (): boolean | undefined => undefined

  f60 = (): boolean | undefined => this.CheckBox8b()

  /**
   * Index 61: Check Box8c ?? what
   * TODO: Income not received evenly during the year and you annualized your income on IL-2210
   */
  CheckBox8c = (): boolean | undefined => undefined

  f61 = (): boolean | undefined => this.CheckBox8c()

  /**
   * Index 62: rn1
   */
  rn1 = (): string | undefined => this.info.refund?.routingNumber

  f62 = (): string | undefined => this.rn1()

  /**
   * Index 63: Check Box11
   * TODO: support savings account checkbox - radio field issue
   */
  CheckBox11 = (): boolean | undefined =>
    this.info.refund?.accountType === AccountType.checking

  f63 = (): boolean | undefined => this.CheckBox11()

  /**
   * Index 64: ac1
   */
  ac1 = (): string | undefined => this.info.refund?.accountNumber

  f64 = (): string | undefined => this.ac1()

  /**
   * Index 65: Refund Method
   * TODO: not supporting credit forward
   */
  RefundMethod = (): boolean => true

  f65 = (): boolean | undefined => this.RefundMethod()

  /**
   * Index 66: YourSignatureDate
   */
  YourSignatureDate = (): string | undefined => undefined

  f66 = (): string | undefined => this.YourSignatureDate()

  /**
   * Index 67: SpouseSignatureDate
   */
  SpouseSignatureDate = (): string | undefined => undefined

  f67 = (): string | undefined => this.SpouseSignatureDate()

  /**
   * Index 68: DaytimeAreaCode
   */
  DaytimeAreaCode = (): string | undefined =>
    this.info.taxPayer.contactPhoneNumber?.slice(0, 3)

  f68 = (): string | undefined => this.DaytimeAreaCode()

  /**
   * Index 69: DaytimePhoneNumber
   */
  DaytimePhoneNumber = (): string | undefined =>
    this.info.taxPayer.contactPhoneNumber?.slice(3)

  f69 = (): string | undefined => this.DaytimePhoneNumber()

  /**
   * Index 70: PreparerName
   */
  PreparerName = (): string | undefined => undefined

  f70 = (): string | undefined => this.PreparerName()

  /**
   * Index 71: PreparerSignatureDate
   */
  PreparerSignatureDate = (): string | undefined => undefined

  f71 = (): string | undefined => this.PreparerSignatureDate()

  /**
   * Index 72: CheckBoxSelfEmployed
   */
  CheckBoxSelfEmployed = (): undefined => undefined

  f72 = (): boolean | undefined => this.CheckBoxSelfEmployed()

  /**
   * Index 73: PreparerPTIN
   */
  PreparerPTIN = (): string | undefined => undefined

  f73 = (): string | undefined => this.PreparerPTIN()

  /**
   * Index 74: PreparerFirmName
   */
  PreparerFirmName = (): string | undefined => undefined

  f74 = (): string | undefined => this.PreparerFirmName()

  /**
   * Index 75: PreparerFirmFEIN
   */
  PreparerFirmFEIN = (): string | undefined => undefined

  f75 = (): string | undefined => this.PreparerFirmFEIN()

  /**
   * Index 76: PreparerFirmAddress
   */
  PreparerFirmAddress = (): string | undefined => undefined

  f76 = (): string | undefined => this.PreparerFirmAddress()

  /**
   * Index 77: PreparerFirmAreaCode
   */
  PreparerFirmAreaCode = (): string | undefined => undefined

  f77 = (): string | undefined => this.PreparerFirmAreaCode()

  /**
   * Index 78: PreparerFirmPhoneNumber
   */
  PreparerFirmPhoneNumber = (): string | undefined => undefined

  f78 = (): string | undefined => this.PreparerFirmPhoneNumber()

  /**
   * Index 79: ThirdPartyName
   */
  ThirdPartyName = (): string | undefined => undefined

  f79 = (): string | undefined => this.ThirdPartyName()

  /**
   * Index 80: ThirdPartyAreaCode
   */
  ThirdPartyAreaCode = (): string | undefined => undefined

  f80 = (): string | undefined => this.ThirdPartyAreaCode()

  /**
   * Index 81: ThirdPartyPhoneNumber
   */
  ThirdPartyPhoneNumber = (): string | undefined => undefined

  f81 = (): string | undefined => this.ThirdPartyPhoneNumber()

  /**
   * Index 82: CheckBoxDiscuss
   */
  CheckBoxDiscuss = (): boolean | undefined => undefined

  f82 = (): boolean | undefined => this.CheckBoxDiscuss()

  /**
   * Index 83: Reset
   */
  Reset = (): string | undefined => undefined

  f83 = (): string | undefined => this.Reset()

  /**
   * Index 84: Print
   */
  Print = (): string | undefined => undefined

  f84 = (): string | undefined => this.Print()

  /**
   * Index 85: 28
   * TODO: Pass-through entity tax credit, Schedule K-1-P / Schedule K-1-T
   */
  l28 = (): number | undefined => undefined

  /**
   * Index 86: 29
   * Earned income credit from Schedule IL-E/EIC, Step 4, line 8
   */
  l29 = (): number | undefined => this.scheduleEIC.earnedIncomeCredit()

  /**
   * Index 87: 31
   */
  l31 = (): number => Math.max(0, this.l30() - this.l24())

  /**
   * Index 88: 30
   */
  l30 = (): number =>
    sumFields([this.l25(), this.l26(), this.l27(), this.l28(), this.l29()])

  /**
   * Index 89: 32
   */
  l32 = (): number => Math.max(0, this.l24() - this.l30())

  /**
   * Index 90: 33
   * TODO: late payment penalty for underpayment of estimated tax
   */
  l33 = (): number | undefined => undefined

  /**
   * Index 91: 34
   * TODO: Voluntary charitable contributions
   */
  l34 = (): number | undefined => undefined

  /**
   * Index 92: 35
   */
  l35 = (): number => sumFields([this.l33(), this.l34()])

  /**
   * Index 93: 36
   * Overpayment
   */
  l36 = (): number => Math.max(this.l31() - this.l35())

  /**
   * Index 94: 37
   * TODO: not supporting credit forward
   */
  l37 = (): number => this.l36()

  /**
   * Index 95: 39
   * TODO: not supporting credit forward
   */
  l39 = (): number | undefined => undefined

  /**
   * Index 96: 40
   */
  l40 = (): number | undefined => {
    const l31 = this.l31()
    const l32 = this.l32()
    const l35 = this.l35()
    if (l32 > 0) return l32 + l35
    if (l31 > 0) return Math.max(0, l35 - l31)
  }

  payment = (): number | undefined => this.l40()

  /**
   * This box is left over from line 33
   * Index 97: CheckBox8d
   * TODO: Check if you were not required to file an IL individual tax return in the previous tax year.
   */
  CheckBox8d = (): boolean | undefined => undefined

  f97 = (): boolean | undefined => this.CheckBox8d()

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
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.f30(),
    this.l8(),
    this.l9(),
    this.l10a(),
    this.f34(),
    this.f35(),
    this.l10b(),
    this.f37(),
    this.f38(),
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
    this.f59(),
    this.f60(),
    this.f61(),
    this.f62(),
    this.f63(),
    this.f64(),
    this.f65(),
    this.f66(),
    this.f67(),
    this.f68(),
    this.f69(),
    this.f70(),
    this.f71(),
    this.f72(),
    this.f73(),
    this.f74(),
    this.f75(),
    this.f76(),
    this.f77(),
    this.f78(),
    this.f79(),
    this.f80(),
    this.f81(),
    this.f82(),
    this.f83(),
    this.f84(),
    this.l28(),
    this.l29(),
    this.l31(),
    this.l30(),
    this.l32(),
    this.l33(),
    this.l34(),
    this.l35(),
    this.l36(),
    this.l37(),
    this.l39(),
    this.l40(),
    this.f97()
  ]
}

const makeIL1040 = (info: Information, f1040: F1040): IL1040 =>
  new IL1040(info, f1040)

export default makeIL1040
