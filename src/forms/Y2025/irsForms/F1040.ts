import {
  AccountType,
  Dependent,
  FilingStatus,
  IncomeW2,
  PersonRole,
  PlanType1099,
  Asset,
  W2Box12Code
} from 'ustaxes/core/data'
import federalBrackets, { CURRENT_YEAR } from '../data/federal'
import F4972 from './F4972'
import F5695 from './F5695'
import F8814 from './F8814'
import F8888 from './F8888'
import F8889 from './F8889'
import F8910 from './F8910'
import F8936 from './F8936'
import F8959 from './F8959'
import F8995, { getF8995PhaseOutIncome } from './F8995'
import F8995A from './F8995A'
import Schedule1 from './Schedule1'
import Schedule1A from './Schedule1A'
import Schedule2 from './Schedule2'
import Schedule3 from './Schedule3'
import Schedule8812 from './Schedule8812'
import ScheduleA from './ScheduleA'
import ScheduleD from './ScheduleD'
import ScheduleE from './ScheduleE'
import ScheduleSE from './ScheduleSE'
import ScheduleEIC from './ScheduleEIC'
import ScheduleR from './ScheduleR'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import ScheduleB from './ScheduleB'
import { computeOrdinaryTax } from './TaxTable'
import SDQualifiedAndCapGains from './worksheets/SDQualifiedAndCapGains'
import QualifyingDependents from './worksheets/QualifyingDependents'
import SocialSecurityBenefitsWorksheet from './worksheets/SocialSecurityBenefits'
import F4797 from './F4797'
import StudentLoanInterestWorksheet from './worksheets/StudentLoanInterestWorksheet'
import F1040V from './F1040v'
import _ from 'lodash'
import F8960 from './F8960'
import F4952 from './F4952'
import F8839 from './F8839'
import F2555 from './F2555'
import F4563 from './F4563'
import F8863 from './F8863'
import F8880 from './F8880'
import F8962 from './F8962'
import F4136 from './F4136'
import F2439 from './F2439'
import F2441 from './F2441'
import ScheduleC from './ScheduleC'
import F8949 from './F8949'
import F6251 from './F6251'
import F4137 from './F4137'
import F8919 from './F8919'
import F5329 from './F5329'
import F8853 from './F8853'
import F8582 from './F8582'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import F1040Base, { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import F1040Attachment from './F1040Attachment'
import F4547 from './F4547'

export default class F1040 extends F1040Base {
  tag: FormTag = 'f1040'
  sequenceIndex = 0
  l1hOtherIncomeStrings: Set<string>

  assets: Asset<Date>[]

  schedule1: Schedule1
  schedule1A: Schedule1A
  schedule2: Schedule2
  schedule3: Schedule3
  scheduleA: ScheduleA
  scheduleB: ScheduleB
  scheduleC?: ScheduleC
  scheduleD: ScheduleD
  scheduleE: ScheduleE
  scheduleSE: ScheduleSE
  scheduleEIC: ScheduleEIC
  scheduleR?: ScheduleR
  schedule8812: Schedule8812
  f2439?: F2439
  f2441: F2441
  f2555?: F2555
  f4136?: F4136
  f4137?: F4137
  f4563?: F4563
  f4797?: F4797
  f4952?: F4952
  f8839?: F8839
  f5329: F5329
  f4972?: F4972
  f5695?: F5695
  f6251: F6251
  f8814?: F8814
  f8582?: F8582
  f8853?: F8853
  f8863?: F8863
  f8880?: F8880
  f8888?: F8888
  f8889: F8889
  f8889Spouse?: F8889
  f8910?: F8910
  f8919: F8919
  f4547: F4547
  f8936?: F8936
  f8949: F8949
  f8949Digital: F8949
  _f8949s?: F8949[]
  f8959: F8959
  f8960: F8960
  f8962: F8962
  f8995?: F8995 | F8995A
  qualifiedAndCapGainsWorksheet?: SDQualifiedAndCapGains
  studentLoanInterestWorksheet?: StudentLoanInterestWorksheet
  socialSecurityBenefitsWorksheet?: SocialSecurityBenefitsWorksheet

  qualifyingDependents: QualifyingDependents

  constructor(info: ValidatedInformation, assets: Asset<Date>[]) {
    super(info)
    this.l1hOtherIncomeStrings = new Set<string>()
    this.assets = assets
    this.qualifyingDependents = new QualifyingDependents(this)

    this.scheduleA = new ScheduleA(this)
    this.scheduleB = new ScheduleB(this)
    this.scheduleD = new ScheduleD(this)
    this.scheduleE = new ScheduleE(this)
    this.scheduleEIC = new ScheduleEIC(this)
    this.scheduleSE = new ScheduleSE(this)

    this.schedule1 = new Schedule1(this)
    this.schedule1A = new Schedule1A(this)
    this.schedule2 = new Schedule2(this)
    this.schedule3 = new Schedule3(this)
    this.f4547 = new F4547(this)
    this.schedule8812 = new Schedule8812(this)

    this.f2441 = new F2441(this)
    this.f5329 = new F5329(this)
    this.f8919 = new F8919(this)
    this.f8962 = new F8962(this)
    this.f6251 = new F6251(this)
    this.f8949 = new F8949(this)
    this.f8949Digital = new F8949(this, 'digital')
    this.f8889 = new F8889(this, this.info.taxPayer.primaryPerson)

    // add in separate form 8889 for the spouse
    if (this.info.taxPayer.spouse) {
      this.f8889Spouse = new F8889(this, this.info.taxPayer.spouse)
    }

    this.f8959 = new F8959(this)
    this.f8960 = new F8960(this)
    this.f8880 = new F8880(this)

    if (this.f1099ssas().length > 0) {
      const ssws = new SocialSecurityBenefitsWorksheet(this)
      this.socialSecurityBenefitsWorksheet = ssws
    }

    if (this.info.f1098es.length > 0) {
      this.studentLoanInterestWorksheet = new StudentLoanInterestWorksheet(
        this,
        this.info.f1098es
      )
    }

    if (this.totalQbi() > 0) {
      const formAMinAmount = getF8995PhaseOutIncome(
        this.info.taxPayer.filingStatus
      )
      if (this.l11b() - this.l12e() >= formAMinAmount) {
        this.f8995 = new F8995A(this)
      } else {
        this.f8995 = new F8995(this)
      }
    }

    if ((this.info.educationExpenses ?? []).length > 0) {
      this.f8863 = new F8863(this)
    }

    if ((this.info.businessPropertySales ?? []).length > 0) {
      this.f4797 = new F4797(this)
    }

    if ((this.info.otherEarnedIncome?.unreportedTips ?? 0) > 0) {
      this.f4137 = new F4137(this)
    }

    if (this.info.otherIncome?.elderlyOrDisabledCredit !== undefined) {
      this.scheduleR = new ScheduleR(this)
    }

    if (Number(this.info.itemizedDeductions?.investmentInterest ?? 0) > 0) {
      this.f4952 = new F4952(this)
    }

    if ((this.info.otherEarnedIncome?.employerAdoptionBenefits ?? 0) > 0) {
      this.f8839 = new F8839(this)
    }
  }

  get f8949s(): F8949[] {
    if (this._f8949s === undefined) {
      this._f8949s = [
        this.f8949,
        ...this.f8949.copies(),
        this.f8949Digital,
        ...this.f8949Digital.copies()
      ]
    }
    return this._f8949s
  }

  totalQbi = () =>
    this.info.scheduleK1Form1065s
      .map((k1) => k1.section199AQBI)
      .reduce((c, a) => c + a, 0)

  toString = (): string => `
    Form 1040 generated from information:
    Information:
    ${JSON.stringify(this.info)}
  `

  /** Nontaxable combat pay from W-2 box 12, code Q. Used in EIC/ACTC earned income. */
  nonTaxableCombatPay = (): number | undefined => {
    const total = this.sumW2Box12Code(W2Box12Code.Q)
    return total > 0 ? total : undefined
  }

  schedules = (): Form[] => {
    const res1: (F1040Attachment | undefined)[] = [
      this.scheduleA,
      this.scheduleB,
      this.scheduleD,
      this.scheduleE,
      this.scheduleSE,
      this.scheduleR,
      this.scheduleEIC,
      this.schedule8812,
      this.f4797,
      this.f4952,
      this.f4972,
      this.f8839,
      this.f5329,
      this.f5695,
      this.f6251,
      this.f8814,
      this.f8880,
      this.f8888,
      this.f8889,
      this.f8889Spouse,
      this.f8910,
      this.f8936,
      this.f8949,
      this.f8949Digital,
      this.f8959,
      this.f8960,
      this.f8995,
      this.schedule1,
      this.schedule1A,
      this.schedule2,
      this.schedule3,
      this.f4547
    ]
    const res = _.compact(res1)
      .filter((f) => f.isNeeded())
      .flatMap((f) => [f, ...f.copies()])

    // Attach payment voucher to front if there is a payment due
    if (this.l37() > 0) {
      res.push(new F1040V(this))
    }

    return [this, ...res].sort((a, b) => a.sequenceIndex - b.sequenceIndex)
  }

  // born before 1961/01/02 (age 65 or older by end of 2025)
  bornBeforeDate = (): boolean =>
    this.info.taxPayer.primaryPerson.dateOfBirth <
    new Date(CURRENT_YEAR - 64, 0, 2)

  blind = (): boolean => this.info.taxPayer.primaryPerson.isBlind

  spouseBeforeDate = (): boolean =>
    (this.info.taxPayer.spouse?.dateOfBirth ?? new Date()) <
    new Date(CURRENT_YEAR - 64, 0, 2)

  spouseBlind = (): boolean => this.info.taxPayer.spouse?.isBlind ?? false

  validW2s = (): IncomeW2[] => {
    if (this.info.taxPayer.filingStatus === FilingStatus.MFS) {
      return this.info.w2s.filter((w2) => w2.personRole === PersonRole.PRIMARY)
    }
    return this.info.w2s
  }

  wages = (): number => this.validW2s().reduce((res, w2) => res + w2.income, 0)
  medicareWages = (): number =>
    this.validW2s().reduce((res, w2) => res + w2.medicareIncome, 0)

  /** Sum a specific W-2 box 12 code across all valid W-2s. */
  sumW2Box12Code = (code: W2Box12Code): number =>
    this.validW2s().reduce((sum, w2) => sum + (w2.box12?.[code] ?? 0), 0)

  occupation = (r: PersonRole): string | undefined =>
    this.info.w2s.find((w2) => w2.personRole === r && w2.occupation !== '')
      ?.occupation

  standardDeduction = (): number | undefined => {
    const filingStatus = this.info.taxPayer.filingStatus

    const allowances = [
      this.bornBeforeDate(),
      this.blind(),
      this.spouseBeforeDate(),
      this.spouseBlind()
    ].reduce((res, e) => res + +!!e, 0)

    if (
      this.info.taxPayer.primaryPerson.isTaxpayerDependent ||
      (this.info.taxPayer.spouse?.isTaxpayerDependent ?? false)
    ) {
      const l4a = Math.min(
        federalBrackets.ordinary.status[filingStatus].deductions[0].amount,
        this.wages() > 900 ? this.wages() + 450 : 1350
      )
      if (allowances > 0) {
        if (
          filingStatus === FilingStatus.HOH ||
          filingStatus === FilingStatus.S
        ) {
          return l4a + allowances * 2000
        } else {
          return l4a + allowances * 1600
        }
      } else {
        return l4a
      }
    }

    return federalBrackets.ordinary.status[filingStatus].deductions[allowances]
      .amount
  }

  totalQualifiedDividends = (): number =>
    this.f1099Divs()
      .map((f) => f.form.qualifiedDividends)
      .reduce((l, r) => l + r, 0)

  totalGrossDistributionsFromIra = (): number =>
    this.info.individualRetirementArrangements.reduce(
      (res, i) => res + i.grossDistribution,
      0
    )

  totalTaxableFromIra = (): number =>
    this.info.individualRetirementArrangements.reduce(
      (r, i) => r + i.taxableAmount,
      0
    )

  totalGrossDistributionsFrom1099R = (planType: PlanType1099): number =>
    this.f1099rs()
      .filter((element) => element.form.planType === planType)
      .reduce((res, f1099) => res + f1099.form.grossDistribution, 0)

  totalTaxableFrom1099R = (planType: PlanType1099): number =>
    this.f1099rs()
      .filter((element) => element.form.planType === planType)
      .reduce((res, f1099) => res + f1099.form.taxableAmount, 0)

  l1a = (): number => this.wages()
  l1b = (): number | undefined =>
    this.info.otherEarnedIncome?.householdEmployeeWages
  l1c = (): number | undefined => this.info.otherEarnedIncome?.unreportedTips
  l1d = (): number | undefined =>
    this.info.otherEarnedIncome?.medicaidWaiverPayments
  l1e = (): number | undefined => this.f2441.taxableBenefits()
  l1f = (): number | undefined =>
    this.info.otherEarnedIncome?.employerAdoptionBenefits
  l1g = (): number | undefined => this.f8919.l6()
  l1h = (): number | undefined => this.info.otherEarnedIncome?.otherEarnedIncome
  /** Nontaxable combat pay election (W-2 box 12 code Q) for EIC/ACTC purposes. */
  l1i = (): number | undefined => this.nonTaxableCombatPay()
  l1z = (): number =>
    sumFields([
      this.l1a(),
      this.l1b(),
      this.l1c(),
      this.l1d(),
      this.l1e(),
      this.l1f(),
      this.l1g(),
      this.l1h()
    ])
  l2a = (): number | undefined => this.scheduleB.l3()
  l2b = (): number | undefined => this.scheduleB.to1040l2b()
  l3a = (): number | undefined => this.totalQualifiedDividends()
  l3b = (): number | undefined => this.scheduleB.to1040l3b()
  l3c1 = (): boolean => false
  l3c2 = (): boolean => false
  // This is the value of box 1 in 1099-R forms coming from IRAs
  l4a = (): number | undefined => this.totalGrossDistributionsFromIra()
  // This should be the value of box 2a in 1099-R coming from IRAs
  l4b = (): number | undefined => this.totalTaxableFromIra()
  l4c1 = (): boolean => false
  l4c2 = (): boolean => false
  // TODO: other IRA distributions?
  l4c3Box = (): boolean => false
  l4c3Name = (): string | undefined => undefined
  // This is the value of box 1 in 1099-R forms coming from pensions/annuities
  l5a = (): number | undefined =>
    this.totalGrossDistributionsFrom1099R(PlanType1099.Pension)
  // this is the value of box 2a in 1099-R forms coming from pensions/annuities
  l5b = (): number | undefined =>
    this.totalTaxableFrom1099R(PlanType1099.Pension)
  l5c1 = (): boolean => false
  l5c2 = (): boolean => false
  // TODO: other pension distributions?
  l5c3Box = (): boolean => false
  l5c3Name = (): string | undefined => undefined
  // The sum of box 5 from SSA-1099
  l6a = (): number | undefined => this.socialSecurityBenefitsWorksheet?.l1()
  // calculation of the taxable amount of line 6a based on other income
  l6b = (): number | undefined =>
    this.socialSecurityBenefitsWorksheet?.taxableAmount()
  // TODO: change this so that it is not hard coded
  l6c = (): boolean =>  false
  //
  l6d = (): boolean => {
    if (this.info.taxPayer.filingStatus !== FilingStatus.MFS) {
      return false
    }
    // TODO Really this should be based on if the spouse lived
    // apart from the taxPayer for the last 6 months of 2025
    return true
  }
  l7a = (): number | undefined => this.scheduleD.to1040()
  l7bBox1 = (): boolean => !this.scheduleD.isNeeded()
  // TODO: Don't hard code child cap gains and losses
  l7bChildCapIncluded = (): boolean => false
  l7bChildCapAmount = (): number => 0
  l8 = (): number | undefined => this.schedule1.l10()
  l9 = (): number =>
    sumFields([
      this.l1z(),
      this.l2b(),
      this.l3b(),
      this.l4b(),
      this.l5b(),
      this.l6b(),
      this.l7a(),
      this.l8()
    ])

  l10 = (): number | undefined => this.schedule1.to1040Line10()

  l11a = (): number => Math.max(0, this.l9() - (this.l10() ?? 0))
  l11b = (): number => this.l11a()

  l12aSelfDependent = (): boolean =>
    this.info.taxPayer.primaryPerson.isTaxpayerDependent
  l12aSpouseDependent = (): boolean =>
    this.info.taxPayer.spouse?.isTaxpayerDependent ?? false
  l12b = (): boolean => false
  l12c = (): boolean => false
  l12dSelfOld = (): boolean => this.bornBeforeDate()
  l12dSelfBlind = (): boolean => this.blind()
  l12dSpouseOld = (): boolean => this.spouseBeforeDate()
  l12dSpouseBlind = (): boolean => this.spouseBlind()
  l12e = (): number => {
    if (this.scheduleA.isNeeded()) {
      return this.scheduleA.deductions()
    }
    return this.standardDeduction() ?? 0
  }

  l13a = (): number | undefined => this.f8995?.deductions()

  // Line 13b: Additional deductions from Schedule 1-A (2025)
  l13b = (): number | undefined => {
    const amt = this.schedule1A.l38()
    return this.schedule1A.isNeeded() && amt > 0 ? amt : undefined
  }
  l14 = (): number => sumFields([this.l12e(), this.l13a(), this.l13b()])

  l15 = (): number => Math.max(0, this.l11b() - this.l14())

  f8814Box = (): boolean | undefined => this.f8814 !== undefined
  f4972Box = (): boolean | undefined => this.f4972 !== undefined
  // TODO: tax from other form?
  otherFormBox = (): boolean => false
  otherFormName = (): string | undefined => undefined

  computeTax = (): number | undefined => {
    if (
      this.scheduleD.computeTaxOnQDWorksheet() ||
      this.totalQualifiedDividends() > 0
    ) {
      this.qualifiedAndCapGainsWorksheet = new SDQualifiedAndCapGains(this)
      return this.qualifiedAndCapGainsWorksheet.tax()
    }

    return computeOrdinaryTax(this.info.taxPayer.filingStatus, this.l15())
  }

  l16 = (): number | undefined =>
    sumFields([this.f8814?.tax(), this.f4972?.tax(), this.computeTax()])

  l17 = (): number | undefined => this.schedule2.l3()
  l18 = (): number => sumFields([this.l16(), this.l17()])

  l19 = (): number | undefined => this.schedule8812.to1040Line19()
  l20 = (): number | undefined =>
    this.schedule3.isNeeded() ? this.schedule3.l8() : undefined

  l21 = (): number => sumFields([this.l19(), this.l20()])

  l22 = (): number => Math.max(0, this.l18() - this.l21())

  l23 = (): number | undefined => this.schedule2.l21()

  l24 = (): number => sumFields([this.l22(), this.l23()])

  l25a = (): number =>
    this.validW2s().reduce((res, w2) => res + w2.fedWithholding, 0)

  // tax withheld from 1099s
  l25b = (): number =>
    this.f1099rs().reduce(
      (res, f1099) => res + f1099.form.federalIncomeTaxWithheld,
      0
    ) +
    this.f1099ssas().reduce(
      (res, f1099) => res + f1099.form.federalIncomeTaxWithheld,
      0
    )

  // TODO: form(s) W-2G box 4, schedule K-1, form 1042-S, form 8805, form 8288-A
  l25c = (): number | undefined => this.f8959.l24()

  l25d = (): number => sumFields([this.l25a(), this.l25b(), this.l25c()])

  l26 = (): number =>
    this.info.estimatedTaxes.reduce((res, et) => res + et.payment, 0)

  formerSpouseSSN = (): string | undefined => this.info.taxPayer.spouse?.ssid

  l27a = (): number =>
    this.scheduleEIC.isNeeded() ? this.scheduleEIC.credit() : 0

  // TODO handle clergy stuff
  l27b = (): boolean => false

  // TODO: handle taxpayer denying eic
  l27c = (): boolean => false

  // TODO: handle taxpayers between 1998 and 2004 that
  // can claim themselves for eic.
  //l27acheckBox = (): boolean => false

  // TODO: nontaxable combat pay
  //l27b = (): number | undefined => undefined

  // TODO: prior year earned income
  //l27c = (): number | undefined => undefined

  // TODO: handle taxpayer denying ACTC
  l28Box = (): boolean => false
  l28 = (): number | undefined => this.schedule8812.to1040Line28()

  l29 = (): number | undefined => this.f8863?.l8()

  // Recovery Rebate Credit does not apply for TY2025 (no new stimulus payments).
  // TODO: handle adoption credit now?
  l30 = (): number | undefined => undefined

  l31 = (): number | undefined =>
    this.schedule3.isNeeded() ? this.schedule3.l15() : undefined

  l32 = (): number =>
    sumFields([this.l27a(), this.l28(), this.l29(), this.l30(), this.l31()])

  l33 = (): number => sumFields([this.l25d(), this.l26(), this.l32()])

  l34 = (): number => Math.max(0, this.l33() - this.l24())

  // TODO: assuming user wants amount refunded
  // rather than applied to estimated tax
  l35a = (): number => this.l34()
  l36 = (): number => Math.max(0, this.l34() - this.l35a())

  l37 = (): number => Math.max(0, this.l24() - this.l33())

  // TODO - estimated tax penalty
  l38 = (): number | undefined => undefined

  _depField = (idx: number): string | boolean => {
    const deps: Dependent[] = this.info.taxPayer.dependents

    // Based on the PDF row we are on, select correct dependent
    const depIdx = idx % 4
    const depFieldIdx = Math.floor(idx / 4)

    let fieldArr = ['', '', '', '', false, false]

    if (depIdx < deps.length) {
      const dep = deps[depIdx]
      // Based on the PDF column, select the correct field
      fieldArr = [
        dep.firstName,
        dep.lastName,
        dep.ssid,
        dep.relationship,
        this.qualifyingDependents.qualifiesChild(dep),
        this.qualifyingDependents.qualifiesOther(dep)
      ]
    }

    return fieldArr[depFieldIdx]
  }

  _otherDepField = (idx: number): string | boolean => {
    const deps: Dependent[] = this.info.taxPayer.dependents

    // 8-column, 2-row table: 4 dependents × 2 columns each, row-major
    const depIdx = Math.floor((idx % 8) / 2)
    const depFieldIdx = Math.floor(idx / 8) * 2 + (idx % 2)

    let fieldArr = [false, false, false, false]

    if (depIdx < deps.length) {
      const dep = deps[depIdx]
      // Based on the PDF column, select the correct field
      fieldArr = [
        dep.qualifyingInfo?.isStudent ?? false,
        false, // TODO: handle qualifying permenant disablility
        this.qualifyingDependents.qualifiesChild(dep),
        this.qualifyingDependents.qualifiesOther(dep)
      ]
    }

    return fieldArr[depFieldIdx]
  }

  // 1040 allows 4 dependents listed without a supplemental schedule,
  // so create field mappings for 6x4 grid of fields
  _depFieldMappings = (): Array<string | boolean> =>
    Array.from(Array(24)).map((u, n: number) => this._depField(n))

  // maps the other fields that weren't as clean cut (2 box per line per dep)
  // is a 2x8 grid
  _otherDepFieldMappings = (): Array<string | boolean> =>
    Array.from(Array(16)).map((u, n: number) => this._otherDepField(n))

  /**
   * Positional values must match PDF field order (same sequence as fillInstructions).
   * Y2025 F1040 field order diverged from Y2024; deriving from fillInstructions avoids drift.
   */
  fields = (): Field[] =>
    this.fillInstructions().map((instr) => {
      if (instr.kind === 'text') {
        const v = instr.value
        return v === undefined ? '' : v
      }
      if (instr.kind === 'checkbox') {
        return instr.value
      }
      return instr.value
    })

  // Generated from Y2025 PDF schema (schemas/Y2025/f1040.json) — 199 fields total
  fillInstructions = (): FillInstructions => {
    const depFields = this._depFieldMappings()

    return [
      // Page 1 — header placeholders (0-2)
      text('topmostSubform[0].Page1[0].f1_01[0]', ''),
      text('topmostSubform[0].Page1[0].f1_02[0]', ''),
      text('topmostSubform[0].Page1[0].f1_03[0]', ''),
      // Campaign contribution checkboxes moved to top in Y2025 (3-4)
      checkbox('topmostSubform[0].Page1[0].c1_1[0]', false),
      checkbox('topmostSubform[0].Page1[0].c1_2[0]', false),
      // Primary first name (5)
      text(
        'topmostSubform[0].Page1[0].f1_04[0]',
        this.info.taxPayer.primaryPerson.firstName
      ),
      // OBBB senior bonus checkbox — primary taxpayer 65+ (6)
      checkbox('topmostSubform[0].Page1[0].c1_3[0]', this.bornBeforeDate()),
      // Primary date of birth month / day / year (7-9)
      text(
        'topmostSubform[0].Page1[0].f1_05[0]',
        String(
          this.info.taxPayer.primaryPerson.dateOfBirth.getMonth() + 1
        ).padStart(2, '0')
      ),
      text(
        'topmostSubform[0].Page1[0].f1_06[0]',
        String(this.info.taxPayer.primaryPerson.dateOfBirth.getDate()).padStart(
          2,
          '0'
        )
      ),
      text(
        'topmostSubform[0].Page1[0].f1_07[0]',
        String(this.info.taxPayer.primaryPerson.dateOfBirth.getFullYear())
      ),
      // Spouse date of birth month / day / year (10-12)
      text(
        'topmostSubform[0].Page1[0].f1_08[0]',
        this.info.taxPayer.spouse
          ? String(
              this.info.taxPayer.spouse.dateOfBirth.getMonth() + 1
            ).padStart(2, '0')
          : undefined
      ),
      text(
        'topmostSubform[0].Page1[0].f1_09[0]',
        this.info.taxPayer.spouse
          ? String(this.info.taxPayer.spouse.dateOfBirth.getDate()).padStart(
              2,
              '0'
            )
          : undefined
      ),
      text(
        'topmostSubform[0].Page1[0].f1_10[0]',
        this.info.taxPayer.spouse
          ? String(this.info.taxPayer.spouse.dateOfBirth.getFullYear())
          : undefined
      ),
      // OBBB senior bonus checkbox — spouse 65+ (13)
      checkbox('topmostSubform[0].Page1[0].c1_4[0]', this.spouseBeforeDate()),
      // Primary last name, spouse first/last name (14-16)
      text(
        'topmostSubform[0].Page1[0].f1_11[0]',
        this.info.taxPayer.primaryPerson.lastName
      ),
      text(
        'topmostSubform[0].Page1[0].f1_12[0]',
        this.info.taxPayer.filingStatus === FilingStatus.MFJ
          ? this.info.taxPayer.spouse?.firstName
          : ''
      ),
      text(
        'topmostSubform[0].Page1[0].f1_13[0]',
        this.info.taxPayer.filingStatus === FilingStatus.MFJ
          ? this.info.taxPayer.spouse?.lastName ?? ''
          : ''
      ),
      // New fields (17-18)
      text('topmostSubform[0].Page1[0].f1_14[0]', undefined),
      text('topmostSubform[0].Page1[0].f1_15[0]', undefined),
      // Primary SSN (maxLength 9) (19)
      text(
        'topmostSubform[0].Page1[0].f1_16[0]',
        this.info.taxPayer.primaryPerson.ssid
      ),
      // New fields (20-21)
      text('topmostSubform[0].Page1[0].f1_17[0]', undefined),
      text('topmostSubform[0].Page1[0].f1_18[0]', undefined),
      // Spouse SSN (maxLength 9) (22)
      text(
        'topmostSubform[0].Page1[0].f1_19[0]',
        this.info.taxPayer.spouse?.ssid
      ),
      // Address fields — renamed f1_20–f1_27 in Y2025 (23-30)
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_20[0]',
        this.info.taxPayer.primaryPerson.address.address
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_21[0]',
        this.info.taxPayer.primaryPerson.address.aptNo
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_22[0]',
        this.info.taxPayer.primaryPerson.address.city
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_23[0]',
        this.info.taxPayer.primaryPerson.address.state
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_24[0]',
        this.info.taxPayer.primaryPerson.address.zip
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_25[0]',
        this.info.taxPayer.primaryPerson.address.foreignCountry
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_26[0]',
        this.info.taxPayer.primaryPerson.address.province
      ),
      text(
        'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_27[0]',
        this.info.taxPayer.primaryPerson.address.postalCode
      ),
      // Filing status — standalone checkboxes in Y2025 (31-36)
      checkbox(
        'topmostSubform[0].Page1[0].c1_5[0]',
        this.info.taxPayer.filingStatus === FilingStatus.S
      ),
      checkbox(
        'topmostSubform[0].Page1[0].c1_6[0]',
        this.info.taxPayer.filingStatus === FilingStatus.MFJ
      ),
      checkbox(
        'topmostSubform[0].Page1[0].c1_7[0]',
        this.info.taxPayer.filingStatus === FilingStatus.MFS
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].c1_8[0]',
        this.info.taxPayer.filingStatus === FilingStatus.HOH
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].c1_8[1]',
        this.info.taxPayer.filingStatus === FilingStatus.W
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].c1_8[2]',
        undefined
      ),
      // MFS spouse name (text in Checkbox_ReadOrder) (37)
      text(
        'topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].f1_28[0]',
        this.info.taxPayer.filingStatus === FilingStatus.MFS
          ? this.spouseFullName()
          : ''
      ),
      // Digital assets question YES/NO (38-39)
      checkbox(
        'topmostSubform[0].Page1[0].c1_8[0]',
        this.info.questions.CRYPTO ?? false
      ),
      checkbox(
        'topmostSubform[0].Page1[0].c1_8[1]',
        !(this.info.questions.CRYPTO ?? false)
      ),
      // New fields — HOH qualifying person name or other OBBB fields (40-44)
      text('topmostSubform[0].Page1[0].f1_29[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_9[0]', undefined),
      text('topmostSubform[0].Page1[0].f1_30[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_10[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_10[1]', undefined),
      // More than 4 dependents (45)
      checkbox(
        'topmostSubform[0].Page1[0].Dependents_ReadOrder[0].c1_11[0]',
        this.info.taxPayer.dependents.length > 4
      ),
      // Dependent table — Y2025 transposed layout: each column = one dependent
      // Row 1: names for all 4 dependents (46-49)
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_31[0]',
        depFields[0] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_32[0]',
        depFields[5] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_33[0]',
        depFields[10] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_34[0]',
        depFields[15] as string
      ),
      // Row 2: new field per dependent (unknown — possibly DOB) (50-53)
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_35[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_36[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_37[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row2[0].f1_38[0]',
        undefined
      ),
      // Row 3: SSNs for all 4 dependents (maxLength 9 confirmed) (54-57)
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_39[0]',
        depFields[1] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_40[0]',
        depFields[6] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_41[0]',
        depFields[11] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row3[0].f1_42[0]',
        depFields[16] as string
      ),
      // Row 4: relationships for all 4 dependents (58-61)
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_43[0]',
        depFields[2] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_44[0]',
        depFields[7] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_45[0]',
        depFields[12] as string
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row4[0].f1_46[0]',
        depFields[17] as string
      ),
      // Row 5: qualifying child + qualifying other checkboxes per dependent (62-69)
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent1[0].c1_12[0]',
        depFields[3] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent1[0].c1_13[0]',
        depFields[4] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent2[0].c1_14[0]',
        depFields[8] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent2[0].c1_15[0]',
        depFields[9] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent3[0].c1_16[0]',
        depFields[13] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent3[0].c1_17[0]',
        depFields[14] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent4[0].c1_18[0]',
        depFields[18] as boolean
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent4[0].c1_19[0]',
        depFields[19] as boolean
      ),
      // Row 6: new OBBB dependent checkboxes (undefined) (70-77)
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent1[0].c1_20[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent1[0].c1_21[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent2[0].c1_22[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent2[0].c1_23[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent3[0].c1_24[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent3[0].c1_25[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent4[0].c1_26[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row6[0].Dependent4[0].c1_27[0]',
        undefined
      ),
      // Row 7: new OBBB dependent checkboxes (undefined) (78-85)
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent1[0].c1_28[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent1[0].c1_28[1]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent2[0].c1_29[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent2[0].c1_29[1]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent3[0].c1_30[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent3[0].c1_30[1]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent4[0].c1_31[0]',
        undefined
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Dependents[0].Row7[0].Dependent4[0].c1_31[1]',
        undefined
      ),
      // New checkbox before income section (86)
      checkbox('topmostSubform[0].Page1[0].c1_32[0]', undefined),
      // Income lines 1a-1z — includes two new OBBB exclusion lines (87-97)
      text('topmostSubform[0].Page1[0].f1_47[0]', this.l1a()),
      text('topmostSubform[0].Page1[0].f1_48[0]', this.l1b()),
      text('topmostSubform[0].Page1[0].f1_49[0]', this.l1c()),
      text('topmostSubform[0].Page1[0].f1_50[0]', this.l1d()),
      text('topmostSubform[0].Page1[0].f1_51[0]', this.l1e()),
      text('topmostSubform[0].Page1[0].f1_52[0]', this.l1f()),
      text('topmostSubform[0].Page1[0].f1_53[0]', this.l1g()),
      text('topmostSubform[0].Page1[0].f1_54[0]', this.l1h()),
      text('topmostSubform[0].Page1[0].f1_55[0]', this.l1i()),
      text('topmostSubform[0].Page1[0].f1_56[0]', undefined),
      text('topmostSubform[0].Page1[0].f1_57[0]', this.l1z()),
      // Lines 2-3: interest and dividends (98-101)
      text('topmostSubform[0].Page1[0].f1_58[0]', this.l2a()),
      text('topmostSubform[0].Page1[0].f1_59[0]', this.l2b()),
      text('topmostSubform[0].Page1[0].f1_60[0]', this.l3a()),
      text('topmostSubform[0].Page1[0].f1_61[0]', this.l3b()),
      // New checkboxes (102-103)
      checkbox('topmostSubform[0].Page1[0].c1_33[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_34[0]', undefined),
      // Lines 4a-4b: IRA distributions (104-105)
      text('topmostSubform[0].Page1[0].f1_62[0]', this.l4a()),
      text('topmostSubform[0].Page1[0].f1_63[0]', this.l4b()),
      // New checkboxes (106-108)
      checkbox('topmostSubform[0].Page1[0].c1_35[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_36[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_37[0]', undefined),
      // Lines 5a-6a: pensions and social security (109-111)
      text('topmostSubform[0].Page1[0].f1_64[0]', this.l5a()),
      text('topmostSubform[0].Page1[0].f1_65[0]', this.l5b()),
      text('topmostSubform[0].Page1[0].f1_66[0]', this.l6a()),
      // Line 6c lump-sum election, line 7 box, new checkbox (112-114)
      checkbox('topmostSubform[0].Page1[0].c1_38[0]', this.l6c()),
      checkbox('topmostSubform[0].Page1[0].c1_39[0]', this.l7bBox1()),
      checkbox('topmostSubform[0].Page1[0].c1_40[0]', undefined),
      // Lines 6b, 7, 8: SS taxable, capital gain, other income (115-117)
      text('topmostSubform[0].Page1[0].f1_67[0]', this.l6b()),
      text('topmostSubform[0].Page1[0].f1_68[0]', this.l7a()),
      text('topmostSubform[0].Page1[0].f1_69[0]', this.l8()),
      // New checkboxes (118-119)
      checkbox('topmostSubform[0].Page1[0].c1_41[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_42[0]', undefined),
      // Line 9: total income (120)
      text('topmostSubform[0].Page1[0].f1_70[0]', this.l9()),
      // New checkboxes (121-122)
      checkbox('topmostSubform[0].Page1[0].c1_43[0]', undefined),
      checkbox('topmostSubform[0].Page1[0].c1_44[0]', undefined),
      // Lines 10-11a: adjustments and AGI (123-124)
      text('topmostSubform[0].Page1[0].f1_71[0]', this.l10()),
      text('topmostSubform[0].Page1[0].f1_72[0]', this.l11a()),
      // New OBBB fields at end of page 1 (125-127)
      text('topmostSubform[0].Page1[0].f1_73[0]', undefined),
      text('topmostSubform[0].Page1[0].f1_74[0]', undefined),
      text('topmostSubform[0].Page1[0].f1_75[0]', undefined),
      // Page 2 — line 11b: AGI repeated from page 1 (128)
      text('topmostSubform[0].Page2[0].f2_01[0]', this.l11b()),
      // Standard deduction section — moved to page 2 in Y2025 (129-136)
      checkbox(
        'topmostSubform[0].Page2[0].c2_1[0]',
        this.info.taxPayer.primaryPerson.isTaxpayerDependent
      ),
      checkbox(
        'topmostSubform[0].Page2[0].c2_2[0]',
        this.info.taxPayer.spouse?.isTaxpayerDependent ?? false
      ),
      checkbox('topmostSubform[0].Page2[0].c2_3[0]', false),
      checkbox('topmostSubform[0].Page2[0].c2_4[0]', this.bornBeforeDate()),
      checkbox('topmostSubform[0].Page2[0].c2_5[0]', this.blind()),
      checkbox('topmostSubform[0].Page2[0].c2_6[0]', this.spouseBeforeDate()),
      checkbox('topmostSubform[0].Page2[0].c2_7[0]', this.spouseBlind()),
      checkbox('topmostSubform[0].Page2[0].c2_8[0]', undefined),
      // Deduction amounts: lines 12e, 13a, 13b, 14, 15 (137-141)
      text('topmostSubform[0].Page2[0].f2_02[0]', this.l12e()),
      text('topmostSubform[0].Page2[0].f2_03[0]', this.l13a()),
      text('topmostSubform[0].Page2[0].f2_04[0]', this.l13b()),
      text('topmostSubform[0].Page2[0].f2_05[0]', this.l14()),
      text('topmostSubform[0].Page2[0].f2_06[0]', this.l15()),
      // Tax computation checkboxes: Form 8814, 4972, other (142-144)
      checkbox('topmostSubform[0].Page2[0].c2_9[0]', this.f8814Box()),
      checkbox('topmostSubform[0].Page2[0].c2_10[0]', this.f4972Box()),
      checkbox('topmostSubform[0].Page2[0].c2_11[0]', this.otherFormBox()),
      // Tax computation lines 16-26 (145-159)
      text('topmostSubform[0].Page2[0].f2_07[0]', this.otherFormName()),
      text('topmostSubform[0].Page2[0].f2_08[0]', this.l16()),
      text('topmostSubform[0].Page2[0].f2_09[0]', this.l17()),
      text('topmostSubform[0].Page2[0].f2_10[0]', this.l18()),
      text('topmostSubform[0].Page2[0].f2_11[0]', this.l19()),
      text('topmostSubform[0].Page2[0].f2_12[0]', this.l20()),
      text('topmostSubform[0].Page2[0].f2_13[0]', this.l21()),
      text('topmostSubform[0].Page2[0].f2_14[0]', this.l22()),
      text('topmostSubform[0].Page2[0].f2_15[0]', this.l23()),
      text('topmostSubform[0].Page2[0].f2_16[0]', this.l24()),
      text('topmostSubform[0].Page2[0].f2_17[0]', this.l25a()),
      text('topmostSubform[0].Page2[0].f2_18[0]', this.l25b()),
      text('topmostSubform[0].Page2[0].f2_19[0]', this.l25c()),
      text('topmostSubform[0].Page2[0].f2_20[0]', this.l25d()),
      text('topmostSubform[0].Page2[0].f2_21[0]', this.l26()),
      // New SSN field near EIC section (160)
      text('topmostSubform[0].Page2[0].SSN_ReadOrder[0].f2_22[0]', undefined),
      // Line 27a: EIC (161)
      text('topmostSubform[0].Page2[0].f2_23[0]', this.l27a()),
      // New checkboxes near EIC/line 28 (162-164)
      checkbox('topmostSubform[0].Page2[0].c2_12[0]', undefined),
      checkbox('topmostSubform[0].Page2[0].c2_13[0]', undefined),
      checkbox(
        'topmostSubform[0].Page2[0].Line28_ReadOrder[0].c2_14[0]',
        undefined
      ),
      // Credits and payments: lines 28-34 (165-171)
      text('topmostSubform[0].Page2[0].f2_24[0]', this.l28()),
      text('topmostSubform[0].Page2[0].f2_25[0]', this.l29()),
      text('topmostSubform[0].Page2[0].f2_26[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_27[0]', this.l31()),
      text('topmostSubform[0].Page2[0].f2_28[0]', this.l32()),
      text('topmostSubform[0].Page2[0].f2_29[0]', this.l33()),
      text('topmostSubform[0].Page2[0].f2_30[0]', this.l34()),
      // Form 8888 direct deposit checkbox (172)
      checkbox('topmostSubform[0].Page2[0].c2_15[0]', this.f8888 !== undefined),
      // Refund: line 35a, routing, checking/savings, account (173-177)
      text('topmostSubform[0].Page2[0].f2_31[0]', this.l35a()),
      text(
        'topmostSubform[0].Page2[0].RoutingNo[0].f2_32[0]',
        this.info.refund?.routingNumber
      ),
      checkbox(
        'topmostSubform[0].Page2[0].c2_16[0]',
        this.info.refund?.accountType === AccountType.checking
      ),
      checkbox(
        'topmostSubform[0].Page2[0].c2_16[1]',
        this.info.refund?.accountType === AccountType.savings
      ),
      text(
        'topmostSubform[0].Page2[0].AccountNo[0].f2_33[0]',
        this.info.refund?.accountNumber
      ),
      // Lines 36-38: applied to next year, amount owed, penalty (178-180)
      text('topmostSubform[0].Page2[0].f2_34[0]', this.l36()),
      text('topmostSubform[0].Page2[0].f2_35[0]', this.l37()),
      text('topmostSubform[0].Page2[0].f2_36[0]', this.l38()),
      // Third party designee (181-185)
      checkbox('topmostSubform[0].Page2[0].c2_17[0]', false),
      checkbox('topmostSubform[0].Page2[0].c2_17[1]', false),
      text('topmostSubform[0].Page2[0].f2_37[0]', ''),
      text('topmostSubform[0].Page2[0].f2_38[0]', ''),
      text('topmostSubform[0].Page2[0].f2_39[0]', ''),
      // Sign here: occupation, PIN, spouse occupation, spouse PIN, phone, email (186-191)
      text(
        'topmostSubform[0].Page2[0].f2_40[0]',
        this.occupation(PersonRole.PRIMARY)
      ),
      text('topmostSubform[0].Page2[0].f2_41[0]', ''),
      text(
        'topmostSubform[0].Page2[0].f2_42[0]',
        this.occupation(PersonRole.SPOUSE)
      ),
      text('topmostSubform[0].Page2[0].f2_43[0]', ''),
      text(
        'topmostSubform[0].Page2[0].f2_44[0]',
        this.info.taxPayer.contactPhoneNumber
      ),
      text(
        'topmostSubform[0].Page2[0].f2_45[0]',
        this.info.taxPayer.contactEmail
      ),
      // Paid preparer section (192-198)
      text('topmostSubform[0].Page2[0].f2_46[0]', ''),
      text('topmostSubform[0].Page2[0].f2_47[0]', ''),
      checkbox('topmostSubform[0].Page2[0].c2_18[0]', false),
      text('topmostSubform[0].Page2[0].f2_48[0]', ''),
      text('topmostSubform[0].Page2[0].f2_49[0]', ''),
      text('topmostSubform[0].Page2[0].f2_50[0]', ''),
      text('topmostSubform[0].Page2[0].f2_51[0]', '')
    ]
  }
}
