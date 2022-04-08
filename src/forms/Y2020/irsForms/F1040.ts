import {
  AccountType,
  Dependent,
  FilingStatus,
  IncomeW2,
  PersonRole,
  PlanType1099,
  Information,
  Asset
} from 'ustaxes/core/data'
import federalBrackets, { CURRENT_YEAR } from '../data/federal'
import F1040V from './F1040v'
import F2441 from './F2441'
import F2555 from './F2555'
import F4136 from './F4136'
import F4563 from './F4563'
import F4797 from './F4797'
import F4952 from './F4952'
import F4972 from './F4972'
import F5695 from './F5695'
import F8814 from './F8814'
import F8863 from './F8863'
import F8888 from './F8888'
import F8889, { needsF8889 } from './F8889'
import F8910 from './F8910'
import F8936 from './F8936'
import F8959, { needsF8959 } from './F8959'
import F8960, { needsF8960 } from './F8960'
import F8962 from './F8962'
import F8995 from './F8995'
import F8995A from './F8995A'
import Schedule1 from './Schedule1'
import Schedule2 from './Schedule2'
import Schedule3, { claimableExcessSSTaxWithholding } from './Schedule3'
import Schedule8812 from './Schedule8812'
import ScheduleA from './ScheduleA'
import ScheduleB from './ScheduleB'
import ScheduleC from './ScheduleC'
import ScheduleD from './ScheduleD'
import ScheduleE from './ScheduleE'
import ScheduleEIC from './ScheduleEIC'
import ScheduleR from './ScheduleR'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { computeOrdinaryTax } from './TaxTable'
import SDQualifiedAndCapGains from './worksheets/SDQualifiedAndCapGains'
import ChildTaxCreditWorksheet from './worksheets/ChildTaxCreditWorksheet'
import SocialSecurityBenefitsWorksheet from './worksheets/SocialSecurityBenefits'
import StudentLoanInterestWorksheet from './worksheets/StudentLoanInterestWorksheet'
import InformationMethods from 'ustaxes/core/data/methods'
import _ from 'lodash'
import { F1040Error } from 'ustaxes/forms/errors'
import F8949 from './F8949'
import F4137 from './F4137'
import F8919 from './F8919'
import F8582 from './F8582'
import { Field } from 'ustaxes/core/pdfFiller'
import Form8853 from './F8853'

export default class F1040 extends Form {
  tag: FormTag = 'f1040'
  sequenceIndex = 0

  info: InformationMethods
  assets: Asset<Date>[]

  schedule1?: Schedule1
  schedule2?: Schedule2
  schedule3?: Schedule3
  scheduleA?: ScheduleA
  scheduleB?: ScheduleB
  scheduleC?: ScheduleC
  scheduleD?: ScheduleD
  scheduleE?: ScheduleE
  scheduleEIC?: ScheduleEIC
  scheduleR?: ScheduleR
  schedule8812?: Schedule8812
  f2441?: F2441
  f2555?: F2555
  f4136?: F4136

  f4137?: F4137
  f4563?: F4563
  f4797?: F4797
  f4952?: F4952
  f4972?: F4972
  f5695?: F5695
  f8582?: F8582
  f8814?: F8814
  f8853?: Form8853
  f8863?: F8863
  f8888?: F8888
  f8889?: F8889
  f8889Spouse?: F8889
  f8910?: F8910
  f8919?: F8919
  f8936?: F8936
  f8949: F8949[]
  f8959?: F8959
  f8960?: F8960
  f8962?: F8962
  f8995?: F8995 | F8995A
  studentLoanInterestWorksheet?: StudentLoanInterestWorksheet
  socialSecurityBenefitsWorksheet?: SocialSecurityBenefitsWorksheet

  childTaxCreditWorksheet?: ChildTaxCreditWorksheet

  constructor(info: Information, assets: Asset<Date>[] = []) {
    super()
    this.info = new InformationMethods(info)
    this.f8949 = []
    this.assets = assets
    this.makeSchedules()
  }

  toString = (): string => `
    Form 1040 generated from information:
    Information:
    ${JSON.stringify(this.info)}
  `

  schedules = (): Form[] => {
    const res1: (Form | undefined)[] = [
      this,
      this.scheduleA,
      this.scheduleB,
      ...(this.scheduleB?.copies ?? []),
      this.scheduleD,
      this.scheduleE,
      this.scheduleR,
      this.scheduleEIC,
      this.schedule8812,
      this.f4797,
      this.f4952,
      this.f4972,
      this.f5695,
      this.f8814,
      this.f8888,
      this.f8889,
      this.f8889Spouse,
      this.f8910,
      this.f8936,
      ...this.f8949,
      this.f8959,
      this.f8960,
      this.f8995,
      this.schedule1,
      this.schedule2,
      this.schedule3
    ]
    const res = _.compact(res1)

    // Attach payment voucher to front if there is a payment due
    if ((this.l37() ?? 0) > 0) {
      res.push(new F1040V(this))
    }

    return res.sort((a, b) => a.sequenceIndex - b.sequenceIndex)
  }

  makeSchedules = (): void => {
    const f1099bs = this.info.f1099Bs()

    const f1099ssas = this.info.f1099ssas()

    const scheduleB = new ScheduleB(this)

    if (scheduleB.formRequired()) {
      this.scheduleB = scheduleB
    }

    if (this.assets.length > 0) {
      const f8949 = new F8949(this)
      if (f8949.isNeeded()) {
        // a F8949 may spawn more copies of itself.
        this.f8949 = [f8949, ...f8949.copies]
      }
    }

    if (f1099bs.length > 0 || this.f8949.length > 0) {
      this.scheduleD = new ScheduleD(this)
    }

    if (f1099ssas.length > 0) {
      const ssws = new SocialSecurityBenefitsWorksheet(this.info, this)
      this.socialSecurityBenefitsWorksheet = ssws
    }

    if (this.info.realEstate.length > 0) {
      this.scheduleE = new ScheduleE(this)
    }

    if (this.info.f1098es.length > 0) {
      this.studentLoanInterestWorksheet = new StudentLoanInterestWorksheet(
        this,
        this.info.f1098es
      )
      // Future proofing be checking if Schedule 1 exists before adding it
      // Don't add s1 if unable to take deduction
      if (
        this.schedule1 === undefined &&
        this.studentLoanInterestWorksheet.notMFS() &&
        this.studentLoanInterestWorksheet.isNotDependent()
      ) {
        this.schedule1 = new Schedule1(this)
      }
    }

    if (
      this.info.taxPayer.primaryPerson &&
      needsF8889(this.info, this.info.taxPayer.primaryPerson)
    ) {
      this.f8889 = new F8889(this, this.info.taxPayer.primaryPerson)
      if (this.schedule1 === undefined) {
        this.schedule1 = new Schedule1(this)
      }

      if (this.schedule2 === undefined) {
        this.schedule2 = new Schedule2(this)
      }
      this.schedule1.addF8889(this.f8889)
    }

    if (
      this.info.taxPayer.spouse &&
      needsF8889(this.info, this.info.taxPayer.spouse)
    ) {
      // add in separate form 8889 for the spouse
      this.f8889Spouse = new F8889(this, this.info.taxPayer.spouse)
      if (this.schedule1 === undefined) {
        this.schedule1 = new Schedule1(this)
      }

      if (this.schedule2 === undefined) {
        this.schedule2 = new Schedule2(this)
      }
      this.schedule1.addF8889Spouse(this.f8889Spouse)
    }

    if (needsF8959(this.info)) {
      if (this.f8959 === undefined) {
        this.f8959 = new F8959(this)
      }
    }

    if (needsF8960(this.info)) {
      this.f8960 = new F8960(this.info, this)
    }

    if (this.f8959 !== undefined || this.f8960 !== undefined) {
      this.schedule2 = new Schedule2(this)
    }

    if (
      claimableExcessSSTaxWithholding(this.info.w2s) > 0 &&
      this.schedule3 === undefined
    ) {
      this.schedule3 = new Schedule3(this)
    }

    if (this.scheduleE !== undefined) {
      if (this.schedule1 === undefined) {
        this.schedule1 = new Schedule1(this)
      }
      this.schedule1.addScheduleE(this.scheduleE)
    }

    const eic = new ScheduleEIC(this)
    if (eic.allowed()) {
      this.scheduleEIC = eic
    }

    const ws = new ChildTaxCreditWorksheet(this)
    const schedule8812 = new Schedule8812(this)

    if (
      this.info.taxPayer.dependents.some(
        (dep) => ws.qualifiesChild(dep) || ws.qualifiesOther(dep)
      )
    ) {
      this.childTaxCreditWorksheet = ws
      this.schedule8812 = schedule8812
    }
  }

  // TODO -> born before 1956/01/02
  bornBeforeDate = (): boolean =>
    (this.info.taxPayer.primaryPerson?.dateOfBirth ?? new Date()) <
    new Date(CURRENT_YEAR - 64, 0, 2)
  // TODO
  blind = (): boolean => this.info.taxPayer.primaryPerson?.isBlind ?? false

  // TODO
  spouseBeforeDate = (): boolean =>
    (this.info.taxPayer.spouse?.dateOfBirth ?? new Date()) <
    new Date(CURRENT_YEAR - 64, 0, 2)

  // TODO
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

  occupation = (r: PersonRole): string | undefined =>
    this.info.w2s.find((w2) => w2.personRole === r && w2.occupation !== '')
      ?.occupation

  standardDeduction = (): number | undefined => {
    const filingStatus = this.info.taxPayer.filingStatus
    if (filingStatus === undefined) {
      return undefined
    } else if (
      (this.info.taxPayer.primaryPerson?.isTaxpayerDependent ?? false) ||
      (this.info.taxPayer.spouse?.isTaxpayerDependent ?? false)
    ) {
      return Math.min(
        federalBrackets.ordinary.status[filingStatus].deductions[0].amount,
        this.wages() > 750 ? this.wages() + 350 : 1100
      )
    }
    return federalBrackets.ordinary.status[filingStatus].deductions[0].amount
  }

  totalQualifiedDividends = (): number =>
    this.info.f1099Divs().reduce((sum, f) => sum + f.form.qualifiedDividends, 0)

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
    this.info
      .f1099rs()
      .filter((element) => element.form.planType == planType)
      .reduce((res, f1099) => res + f1099.form.grossDistribution, 0)

  totalTaxableFrom1099R = (planType: PlanType1099): number =>
    this.info
      .f1099rs()
      .filter((element) => element.form.planType == planType)
      .reduce((res, f1099) => res + f1099.form.taxableAmount, 0)

  l1 = (): number => this.wages()
  l2a = (): number | undefined => this.scheduleB?.l3()
  l2b = (): number | undefined => this.scheduleB?.to1040l2b()
  l3a = (): number | undefined => this.totalQualifiedDividends()
  l3b = (): number | undefined => this.scheduleB?.to1040l3b()
  // This is the value of box 1 in 1099-R forms coming from IRAs
  l4a = (): number | undefined => this.totalGrossDistributionsFromIra()
  // This should be the value of box 2a in 1099-R coming from IRAs
  l4b = (): number | undefined => this.totalTaxableFromIra()
  // This is the value of box 1 in 1099-R forms coming from pensions/annuities
  l5a = (): number | undefined =>
    this.totalGrossDistributionsFrom1099R(PlanType1099.Pension)
  // this is the value of box 2a in 1099-R forms coming from pensions/annuities
  l5b = (): number | undefined =>
    this.totalTaxableFrom1099R(PlanType1099.Pension)
  // The sum of box 5 from SSA-1099
  l6a = (): number | undefined => this.socialSecurityBenefitsWorksheet?.l1()
  // calculation of the taxable amount of line 6a based on other income
  l6b = (): number | undefined =>
    this.socialSecurityBenefitsWorksheet?.taxableAmount()
  l7 = (): number | undefined => this.scheduleD?.to1040()
  l8 = (): number | undefined => this.schedule1?.l9()
  l9 = (): number =>
    sumFields([
      this.l1(),
      this.l2b(),
      this.l3b(),
      this.l4b(),
      this.l5b(),
      this.l6b(),
      this.l7(),
      this.l8()
    ])

  l10a = (): number | undefined => this.schedule1?.l22()
  l10b = (): number | undefined => undefined
  l10c = (): number => sumFields([this.l10a(), this.l10b()])

  l11 = (): number => Math.max(0, this.l9() - this.l10c())

  l12 = (): number | undefined => {
    if (this.scheduleA !== undefined) {
      return this.scheduleA.deductions()
    }
    return this.standardDeduction()
  }

  l13 = (): number | undefined => this.f8995?.deductions()
  l14 = (): number => sumFields([this.l12(), this.l13()])

  l15 = (): number => Math.max(0, this.l11() - this.l14())

  computeTax = (): number | undefined => {
    if (
      this.errors().length > 0 ||
      this.info.taxPayer.filingStatus === undefined
    ) {
      return undefined
    }

    if (
      this.scheduleD?.computeTaxOnQDWorksheet() ??
      this.totalQualifiedDividends() > 0
    ) {
      const wksht = new SDQualifiedAndCapGains(this)
      return wksht.tax()
    }

    return computeOrdinaryTax(this.info.taxPayer.filingStatus, this.l15())
  }

  l16 = (): number | undefined =>
    sumFields([this.f8814?.tax(), this.f4972?.tax(), this.computeTax()])

  l17 = (): number | undefined => this.schedule2?.l3()
  l18 = (): number => sumFields([this.l16(), this.l17()])

  // TODO
  l19 = (): number | undefined => this.childTaxCreditWorksheet?.l12()
  l20 = (): number | undefined => this.schedule3?.l7()
  l21 = (): number => sumFields([this.l19(), this.l20()])

  l22 = (): number => Math.max(0, (this.l18() ?? 0) - this.l21())

  l23 = (): number | undefined => this.schedule2?.l10()
  l24 = (): number => sumFields([this.l22(), this.l23()])

  l25a = (): number =>
    this.validW2s().reduce((res, w2) => res + (w2.fedWithholding ?? 0), 0)

  // tax withheld from 1099s
  l25b = (): number =>
    this.info
      .f1099rs()
      .reduce((res, f1099) => res + f1099.form.federalIncomeTaxWithheld, 0) +
    this.info
      .f1099ssas()
      .reduce((res, f1099) => res + f1099.form.federalIncomeTaxWithheld, 0)

  // TODO: form(s) W-2G box 4, schedule K-1, form 1042-S, form 8805, form 8288-A
  l25c = (): number | undefined => this.f8959?.l24()

  l25d = (): number => sumFields([this.l25a(), this.l25b(), this.l25c()])

  l26 = (): number =>
    this.info.estimatedTaxes.reduce((res, et) => res + et.payment, 0)

  l27 = (): number | undefined => this.scheduleEIC?.credit() ?? 0
  l28 = (): number | undefined => this.schedule8812?.l15()

  l29 = (): number | undefined => this.f8863?.l8()

  // TODO: recovery rebate credit?
  l30 = (): number | undefined => undefined

  l31 = (): number | undefined => this.schedule3?.l13()

  l32 = (): number =>
    sumFields([this.l27(), this.l28(), this.l29(), this.l30(), this.l31()])

  l33 = (): number => sumFields([this.l25d(), this.l26(), this.l32()])

  l34 = (): number => Math.max(0, this.l33() - (this.l24() ?? 0))

  // TODO: assuming user wants amount refunded
  // rather than applied to estimated tax
  l35a = (): number => this.l34()
  l36 = (): number => Math.max(0, this.l34() - this.l35a())

  l37 = (): number => Math.max(0, (this.l24() ?? 0) - this.l33())

  // TODO - estimated tax penalty
  l38 = (): number | undefined => undefined

  _depField = (idx: number): string | boolean => {
    const deps: Dependent[] = this.info.taxPayer.dependents

    // Based on the PDF row we are on, select correct dependent
    const depIdx = Math.floor(idx / 5)
    const depFieldIdx = idx % 5

    let fieldArr = ['', '', '', false, false]

    if (depIdx < deps.length) {
      const dep = deps[depIdx]
      // Based on the PDF column, select the correct field
      fieldArr = [
        `${dep.firstName} ${dep.lastName}`,
        dep.ssid,
        dep.relationship,
        this.childTaxCreditWorksheet?.qualifiesChild(dep) ?? false,
        this.childTaxCreditWorksheet?.qualifiesOther(dep) ?? false
      ]
    }

    return fieldArr[depFieldIdx]
  }

  // 1040 allows 4 dependents listed without a supplemental schedule,
  // so create field mappings for 4x5 grid of fields
  _depFieldMappings = (): Array<string | boolean> =>
    Array.from(Array(20)).map((u, n: number) => this._depField(n))

  errors = (): F1040Error[] => {
    const result: F1040Error[] = []
    if (this.info.taxPayer.filingStatus === undefined) {
      result.push(F1040Error.filingStatusUndefined)
    }

    const fs = this.info.taxPayer.filingStatus
    const numDependents = this.info.taxPayer.dependents.length
    const hasSpouse = this.info.taxPayer.spouse !== undefined
    const hasDependents = numDependents > 0
    // Check basic requirements of filing statuses
    if (
      fs === undefined ||
      ([FilingStatus.S, FilingStatus.HOH].some((x) => x === fs) && hasSpouse) ||
      (fs === FilingStatus.HOH && !hasDependents)
    ) {
      result.push(F1040Error.filingStatusRequirementsNotMet)
    }

    return result
  }

  fields = (): Field[] =>
    [
      this.info.taxPayer.filingStatus === FilingStatus.S,
      this.info.taxPayer.filingStatus === FilingStatus.MFJ,
      this.info.taxPayer.filingStatus === FilingStatus.MFS,
      this.info.taxPayer.filingStatus === FilingStatus.HOH,
      this.info.taxPayer.filingStatus === FilingStatus.W,
      // TODO: implement non dependent child for HOH and QW
      this.info.taxPayer.filingStatus === 'MFS'
        ? this.info.spouseFullName()
        : '',
      this.info.taxPayer.primaryPerson?.firstName,
      this.info.taxPayer.primaryPerson?.lastName,
      this.info.taxPayer.primaryPerson?.ssid,
      this.info.taxPayer.filingStatus === FilingStatus.MFJ
        ? this.info.taxPayer.spouse?.firstName
        : '',
      this.info.taxPayer.filingStatus === FilingStatus.MFJ
        ? this.info.taxPayer.spouse?.lastName ?? ''
        : '',
      this.info.taxPayer.spouse?.ssid,
      this.info.taxPayer.primaryPerson?.address.address,
      this.info.taxPayer.primaryPerson?.address.aptNo,
      this.info.taxPayer.primaryPerson?.address.city,
      this.info.taxPayer.primaryPerson?.address.state,
      this.info.taxPayer.primaryPerson?.address.zip,
      this.info.taxPayer.primaryPerson?.address.foreignCountry,
      this.info.taxPayer.primaryPerson?.address.province,
      this.info.taxPayer.primaryPerson?.address.postalCode,
      false, // election campaign boxes
      false,
      this.info.questions.CRYPTO ?? false,
      !(this.info.questions.CRYPTO ?? false),
      this.info.taxPayer.primaryPerson?.isTaxpayerDependent ?? false,
      this.info.taxPayer.spouse?.isTaxpayerDependent ?? false,
      false, // TODO: spouse itemizes separately,
      this.bornBeforeDate(),
      this.blind(),
      this.spouseBeforeDate(),
      this.spouseBlind(),
      this.info.taxPayer.dependents.length > 4,
      ...this._depFieldMappings(),
      this.l1(),
      this.l2a(),
      this.l2b(),
      this.l3a(),
      this.l3b(),
      this.l4a(),
      this.l4b(),
      this.l5a(),
      this.l5b(),
      this.l6a(),
      this.l6b(),
      this.scheduleD === undefined,
      this.l7(),
      this.l8(),
      this.l9(),
      this.l10a(),
      this.l10b(),
      this.l10c(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.f8814 !== undefined,
      this.f4972 !== undefined,
      false, // TODO: other tax form
      '', // TODO: other tax form
      this.l16(),
      this.l17(),
      this.l18(),
      this.l19(),
      this.l20(),
      this.l21(),
      this.l22(),
      this.l23(),
      this.l24(),
      this.l25a(),
      this.l25b(),
      this.l25c(),
      this.l25d(),
      this.l26(),
      this.l27(),
      this.l28(),
      this.l29(),
      this.l30(),
      this.l31(),
      this.l32(),
      this.l33(),
      this.l34(),
      this.f8888 !== undefined,
      this.l35a(),
      this.info.refund?.routingNumber,
      this.info.refund?.accountType === AccountType.checking,
      this.info.refund?.accountType === AccountType.savings,
      this.info.refund?.accountNumber,
      this.l36(),
      this.l37(),
      this.l38(),
      // TODO: 3rd party
      false,
      false,
      '',
      '',
      '',
      this.occupation(PersonRole.PRIMARY),
      // TODO: pin numbers
      '',
      this.occupation(PersonRole.SPOUSE),
      '',
      this.info.taxPayer.contactPhoneNumber,
      this.info.taxPayer.contactEmail,
      // Paid preparer fields:
      '',
      '',
      false,
      '',
      '',
      '',
      ''
    ].map((x) => (x === undefined ? '' : x))
}
