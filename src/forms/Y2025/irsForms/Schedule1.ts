import F1040Attachment from './F1040Attachment'
import { FilingStatus } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import F1040 from './F1040'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import { educatorExpenseLimit } from '../data/federal'

export default class Schedule1 extends F1040Attachment {
  tag: FormTag = 'f1040s1'
  sequenceIndex = 1
  otherIncomeStrings: Set<string>

  constructor(f1040: F1040) {
    super(f1040)
    this.otherIncomeStrings = new Set<string>()
  }

  isNeeded = (): boolean =>
    this.f1040.scheduleE.isNeeded() ||
    (this.f1040.studentLoanInterestWorksheet !== undefined &&
      this.f1040.studentLoanInterestWorksheet.notMFS() &&
      this.f1040.studentLoanInterestWorksheet.isNotDependent()) ||
    this.f1040.f8889.isNeeded() ||
    (this.f1040.f8889Spouse?.isNeeded() ?? false) ||
    (this.f1040.scheduleC?.isNeeded() ?? false) ||
    (this.f1040.info.otherIncome?.educatorExpenses ?? 0) > 0 ||
    (this.f1040.info.otherIncome?.spouseEducatorExpenses ?? 0) > 0 ||
    this.f1040.info.otherIncome?.iraDeduction !== undefined ||
    (this.l16() ?? 0) > 0 ||
    (this.l17() ?? 0) > 0 ||
    this.f1040.info.otherIncome?.earlyWithdrawalPenalty !== undefined ||
    (this.f1040.f4797?.isNeeded() ?? false) ||
    (this.f1040.info.otherIncome?.form2106Expenses ?? 0) > 0 ||
    (this.f1040.info.otherIncome?.prizesAndAwards ?? 0) > 0 ||
    (this.f1040.info.otherIncome?.juryDutyFees ?? 0) > 0 ||
    (this.f1040.info.otherIncome?.wagePaidWhileIncarcerated ?? 0) > 0

  l1 = (): number | undefined =>
    this.f1040.info.otherIncome?.taxableStateLocalRefunds
  l2a = (): number | undefined => this.f1040.info.otherIncome?.alimonyReceived
  l2b = (): string | undefined =>
    this.f1040.info.otherIncome?.alimonyDivorceDate
  /** Business income or (loss) from Schedule C. */
  l3 = (): number | undefined => this.f1040.scheduleC?.l31()
  l4Box1 = (): boolean => false
  l4Box2 = (): boolean => false
  /** Other gains or losses from Form 4797. */
  l4 = (): number | undefined => this.f1040.f4797?.l9()
  l5 = (): number | undefined => this.f1040.scheduleE.l41()
  l6 = (): number | undefined => undefined
  l7Box = (): boolean => false
  l7RepaidAmount = (): number | undefined => undefined
  l7 = (): number | undefined =>
    this.f1040.info.otherIncome?.unemploymentCompensation
  l8a = (): number | undefined => this.f1040.info.otherIncome?.netOperatingLoss
  l8b = (): number | undefined => this.f1040.info.otherIncome?.gamblingWinnings
  l8c = (): number | undefined =>
    this.f1040.info.otherIncome?.cancellationOfDebt
  l8d = (): number | undefined => this.f1040.info.otherIncome?.prizesAndAwards
  l8e = (): number | undefined =>
    this.f1040.info.otherIncome?.wagePaidWhileIncarcerated
  l8f = (): number | undefined =>
    sumFields([this.f1040.f8889.l16(), this.f1040.f8889Spouse?.l16()])
  l8g = (): number | undefined =>
    this.f1040.info.otherIncome?.alaskaPermanentFund
  l8h = (): number | undefined => undefined
  l8i = (): number | undefined => undefined
  l8j = (): number | undefined => undefined
  l8k = (): number | undefined => undefined
  l8l = (): number | undefined => undefined
  l8m = (): number | undefined => undefined
  l8n = (): number | undefined => undefined
  l8o = (): number | undefined => undefined
  l8p = (): number | undefined => undefined
  l8q = (): number | undefined => this.f1040.info.otherIncome?.juryDutyFees
  l8r = (): number | undefined => undefined
  l8s = (): number | undefined => undefined
  l8t = (): number | undefined => undefined
  l8u = (): number | undefined => undefined
  l8v = (): number | undefined => undefined

  l8z = (): number => {
    if (
      (this.f1040.f8889.isNeeded() && this.f1040.f8889.l20() > 0) ||
      ((this.f1040.f8889Spouse?.isNeeded() ?? false) &&
        this.f1040.f8889Spouse?.l20() !== undefined &&
        this.f1040.f8889Spouse.l20() > 0)
    ) {
      this.otherIncomeStrings.add('HSA')
    }

    return sumFields([this.f1040.f8889.l20(), this.f1040.f8889Spouse?.l20()])
  }

  l9 = (): number =>
    sumFields([
      this.l8a(),
      this.l8b(),
      this.l8c(),
      this.l8d(),
      this.l8e(),
      this.l8f(),
      this.l8g(),
      this.l8h(),
      this.l8i(),
      this.l8j(),
      this.l8k(),
      this.l8l(),
      this.l8m(),
      this.l8n(),
      this.l8o(),
      this.l8p(),
      this.l8q(),
      this.l8r(),
      this.l8s(),
      this.l8t(),
      this.l8u(),
      this.l8v(),
      this.l8z()
    ])

  l10 = (): number =>
    sumFields([
      this.l1(),
      this.l2a(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l9()
    ])

  to1040Line8 = (): number => this.l10()

  l11 = (): number | undefined => {
    const primary = this.f1040.info.otherIncome?.educatorExpenses
    const spouse = this.f1040.info.otherIncome?.spouseEducatorExpenses
    if (primary === undefined && spouse === undefined) return undefined
    const cappedPrimary = Math.min(primary ?? 0, educatorExpenseLimit)
    const cappedSpouse =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ
        ? Math.min(spouse ?? 0, educatorExpenseLimit)
        : 0
    const total = cappedPrimary + cappedSpouse
    return total > 0 ? total : undefined
  }
  l12 = (): number | undefined => this.f1040.info.otherIncome?.form2106Expenses
  l13 = (): number | undefined =>
    sumFields([this.f1040.f8889.l13(), this.f1040.f8889Spouse?.l13()])
  l14Box = (): boolean => false
  l14 = (): number | undefined => undefined
  l15 = (): number | undefined => this.f1040.scheduleSE.l13()
  l16 = (): number | undefined => {
    const selfEmployed = this.f1040.info.selfEmployedIncome ?? []
    const total = selfEmployed.reduce(
      (sum, se) =>
        sum + (se.sepContributions ?? 0) + (se.simpleContributions ?? 0),
      0
    )
    return total > 0 ? total : undefined
  }
  l17 = (): number | undefined => {
    const selfEmployed = this.f1040.info.selfEmployedIncome ?? []
    const total = selfEmployed.reduce(
      (sum, se) => sum + (se.healthInsurancePremiums ?? 0),
      0
    )
    return total > 0 ? total : undefined
  }
  l18 = (): number | undefined =>
    this.f1040.info.otherIncome?.earlyWithdrawalPenalty
  l19a = (): number | undefined => this.f1040.info.otherIncome?.iraDeduction
  l19b = (): string | undefined => undefined
  l19c = (): string | undefined => undefined
  l20Box = (): boolean => false
  l20 = (): number | undefined => undefined
  l21 = (): number | undefined => this.f1040.studentLoanInterestWorksheet?.l9()
  l23 = (): number | undefined => undefined
  l24a = (): number | undefined => undefined
  l24b = (): number | undefined => undefined
  l24c = (): number | undefined => undefined
  l24d = (): number | undefined => undefined
  l24e = (): number | undefined => undefined
  l24f = (): number | undefined => undefined
  l24g = (): number | undefined => undefined
  l24h = (): number | undefined => undefined
  l24i = (): number | undefined => undefined
  l24j = (): number | undefined => undefined
  l24k = (): number | undefined => undefined
  l24zDesc = (): string | undefined => undefined
  l24z = (): number | undefined => undefined

  l25 = (): number =>
    sumFields([
      this.l24a(),
      this.l24b(),
      this.l24c(),
      this.l24d(),
      this.l24e(),
      this.l24f(),
      this.l24g(),
      this.l24h(),
      this.l24i(),
      this.l24j(),
      this.l24k(),
      this.l24z()
    ])

  l26 = (): number =>
    sumFields([
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16(),
      this.l17(),
      this.l18(),
      this.l19a(),
      this.l20(),
      this.l21(),
      this.l23(),
      this.l25()
    ])

  to1040Line10 = (): number => this.l26()

  fields = (): Field[] => [
    // Part 1
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    undefined, // 1099-K shenanigans
    this.l1(),
    this.l2a(),
    this.l2b(),
    this.l3(),
    this.l4Box1(),
    this.l4Box2(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7Box(),
    this.l7RepaidAmount(),
    this.l7(),
    this.l8a(),
    this.l8b(),
    this.l8c(),
    this.l8d(),
    this.l8e(),
    this.l8f(),
    this.l8g(),
    this.l8h(),
    this.l8i(),
    this.l8j(),
    this.l8k(),
    this.l8l(),
    this.l8m(),
    this.l8n(),
    this.l8o(),
    this.l8p(),
    this.l8q(),
    this.l8r(),
    this.l8s(),
    this.l8t(),
    this.l8u(),
    this.l8v(),
    Array.from(this.otherIncomeStrings).join(' '),
    this.l8z(),
    this.l9(),
    this.l10(),

    // Part 2
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14Box(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17(),
    this.l18(),
    this.l19a(),
    this.l19b(),
    this.l19c(),
    this.l20Box(),
    this.l20(),
    this.l21(),
    undefined, // Reserved for future use
    this.l23(),
    this.l24a(),
    this.l24b(),
    this.l24c(),
    this.l24d(),
    this.l24e(),
    this.l24f(),
    this.l24g(),
    this.l24h(),
    this.l24i(),
    this.l24j(),
    this.l24k(),
    this.l24zDesc(),
    this.l24z(),
    this.l25(),
    this.l26()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 67 TS expressions, 73 PDF fields
  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_02[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    text('topmostSubform[0].Page1[0].f1_03[0]', undefined), // 1099-K shenanigans
    text('topmostSubform[0].Page1[0].f1_04[0]', this.l1()),
    text('topmostSubform[0].Page1[0].f1_05[0]', this.l2a()),
    text('topmostSubform[0].Page1[0].f1_06[0]', this.l2b()),
    text('topmostSubform[0].Page1[0].f1_07[0]', this.l3()),
    checkbox('topmostSubform[0].Page1[0].c1_1[0]', this.l4Box1()),
    checkbox('topmostSubform[0].Page1[0].c1_2[0]', this.l4Box2()),
    text('topmostSubform[0].Page1[0].f1_08[0]', this.l4()),
    text('topmostSubform[0].Page1[0].f1_09[0]', this.l5()),
    text('topmostSubform[0].Page1[0].f1_10[0]', this.l6()),
    checkbox('topmostSubform[0].Page1[0].Line7_ReadOrder[0].c1_3[0]', this.l7Box()),
    text('topmostSubform[0].Page1[0].Line7_ReadOrder[0].f1_11[0]', this.l7RepaidAmount()),
    text('topmostSubform[0].Page1[0].f1_12[0]', this.l7()),
    text('topmostSubform[0].Page1[0].f1_13[0]', this.l8a()),
    text('topmostSubform[0].Page1[0].f1_14[0]', this.l8b()),
    text('topmostSubform[0].Page1[0].f1_15[0]', this.l8c()),
    text('topmostSubform[0].Page1[0].f1_16[0]', this.l8d()),
    text('topmostSubform[0].Page1[0].f1_17[0]', this.l8e()),
    text('topmostSubform[0].Page1[0].f1_18[0]', this.l8f()),
    text('topmostSubform[0].Page1[0].f1_19[0]', this.l8g()),
    text('topmostSubform[0].Page1[0].f1_20[0]', this.l8h()),
    text('topmostSubform[0].Page1[0].f1_21[0]', this.l8i()),
    text('topmostSubform[0].Page1[0].f1_22[0]', this.l8j()),
    text('topmostSubform[0].Page1[0].f1_23[0]', this.l8k()),
    text('topmostSubform[0].Page1[0].f1_24[0]', this.l8l()),
    text('topmostSubform[0].Page1[0].f1_25[0]', this.l8m()),
    text('topmostSubform[0].Page1[0].f1_26[0]', this.l8n()),
    text('topmostSubform[0].Page1[0].f1_27[0]', this.l8o()),
    text('topmostSubform[0].Page1[0].f1_28[0]', this.l8p()),
    text('topmostSubform[0].Page1[0].f1_29[0]', this.l8q()),
    text('topmostSubform[0].Page1[0].f1_30[0]', this.l8r()),
    text('topmostSubform[0].Page1[0].f1_31[0]', this.l8s()),
    text('topmostSubform[0].Page1[0].f1_32[0]', this.l8t()),
    text('topmostSubform[0].Page1[0].f1_33[0]', this.l8u()),
    text('topmostSubform[0].Page1[0].f1_34[0]', this.l8v()),
    text(
      'topmostSubform[0].Page1[0].Line8z_ReadOrder[0].f1_35[0]',
      Array.from(this.otherIncomeStrings).join(' ')
    ),
    text('topmostSubform[0].Page1[0].f1_36[0]', this.l8z()),
    text('topmostSubform[0].Page1[0].f1_37[0]', this.l9()),
    text('topmostSubform[0].Page1[0].f1_38[0]', this.l10()),

    text('topmostSubform[0].Page2[0].f2_01[0]', this.l11()),
    text('topmostSubform[0].Page2[0].f2_02[0]', this.l12()),
    text('topmostSubform[0].Page2[0].f2_03[0]', this.l13()),
    checkbox('topmostSubform[0].Page2[0].c2_1[0]', false),
    text('topmostSubform[0].Page2[0].f2_04[0]', this.l14()),
    text('topmostSubform[0].Page2[0].f2_05[0]', this.l15()),
    text('topmostSubform[0].Page2[0].f2_06[0]', this.l16()),
    text('topmostSubform[0].Page2[0].f2_07[0]', this.l17()),
    text('topmostSubform[0].Page2[0].f2_08[0]', this.l18()),
    text('topmostSubform[0].Page2[0].f2_09[0]', this.l19a()),
    text('topmostSubform[0].Page2[0].Line19b_CombField[0].f2_10[0]', this.l19b()),
    text('topmostSubform[0].Page2[0].f2_11[0]', this.l19c()),
    checkbox('topmostSubform[0].Page2[0].c2_2[0]', this.l20Box()),

    text('topmostSubform[0].Page2[0].f2_12[0]', this.l20()),
    text('topmostSubform[0].Page2[0].f2_13[0]', this.l21()),
    text('topmostSubform[0].Page2[0].f2_14[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_15[0]', this.l23()),
    text('topmostSubform[0].Page2[0].Line24a_ReadOrder[0].f2_16[0]', this.l24a()),
    text('topmostSubform[0].Page2[0].f2_17[0]', this.l24b()),
    text('topmostSubform[0].Page2[0].f2_18[0]', this.l24c()),
    text('topmostSubform[0].Page2[0].f2_19[0]', this.l24d()),
    text('topmostSubform[0].Page2[0].f2_20[0]', this.l24e()),
    text('topmostSubform[0].Page2[0].f2_21[0]', this.l24f()),
    text('topmostSubform[0].Page2[0].f2_22[0]', this.l24g()),
    text('topmostSubform[0].Page2[0].f2_23[0]', this.l24h()),
    text('topmostSubform[0].Page2[0].f2_24[0]', this.l24i()),
    text('topmostSubform[0].Page2[0].f2_25[0]', this.l24j()),
    text('topmostSubform[0].Page2[0].f2_26[0]', this.l24k()),
    text('topmostSubform[0].Page2[0].Line24z_ReadOrder[0].f2_27[0]', this.l24zDesc()),
    text('topmostSubform[0].Page2[0].f2_28[0]', this.l24z()),
    text('topmostSubform[0].Page2[0].f2_29[0]', this.l25()),
    text('topmostSubform[0].Page2[0].f2_30[0]', this.l26())
  ]
}
