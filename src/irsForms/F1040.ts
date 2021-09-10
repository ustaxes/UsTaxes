import {
  AccountType,
  Dependent,
  FilingStatus,
  IncomeW2,
  Income1099R,
  PersonRole,
  Refund,
  TaxPayer,
  PlanType1099,
  Income1099SSA
} from 'ustaxes/redux/data'
import federalBrackets from 'ustaxes/data/federal'
import F4972 from './F4972'
import F5695 from './F5695'
import F8814 from './F8814'
import Schedule8863 from './F8863'
import F8888 from './F8888'
import F8910 from './F8910'
import F8936 from './F8936'
import F8959 from './F8959'
import F8995 from './F8995'
import F8995A from './F8995A'
import Schedule1 from './Schedule1'
import Schedule2 from './Schedule2'
import Schedule3 from './Schedule3'
import Schedule8812 from './Schedule8812'
import ScheduleA from './ScheduleA'
import ScheduleD from './ScheduleD'
import ScheduleE from './ScheduleE'
import ScheduleEIC from './ScheduleEIC'
import ScheduleR from './ScheduleR'
import Form, { FormTag } from './Form'
import { displayNumber, computeField, sumFields } from './util'
import ScheduleB from './ScheduleB'
import { computeOrdinaryTax } from './TaxTable'
import SDQualifiedAndCapGains from './worksheets/SDQualifiedAndCapGains'
import ChildTaxCreditWorksheet from './worksheets/ChildTaxCreditWorksheet'
import SocialSecurityBenefitsWorksheet from './worksheets/SocialSecurityBenefits'
import F4797 from './F4797'
import { Responses } from 'ustaxes/data/questions'
import StudentLoanInterestWorksheet from './worksheets/StudentLoanInterestWorksheet'

export enum F1040Error {
  filingStatusUndefined = 'Select a filing status'
}

export default class F1040 implements Form {
  tag: FormTag = 'f1040'
  sequenceIndex = 0
  // intentionally mirroring many fields from the state,
  // trying to represent the fields that the 1040 requires
  filingStatus?: FilingStatus
  firstNameAndInitial?: string
  lastName?: string
  yourSocialSecurityNumber?: string
  spousesFirstNameAndInitial?: string
  spousesLastName?: string
  spousesSocialSecurityNumber?: string
  homeAddress?: string
  aptNo?: string
  city?: string
  state?: string
  zip?: string
  foreignCountryName?: string
  province?: string
  postalCode?: string
  virtualCurrency: boolean
  isTaxpayerDependent: boolean
  isSpouseDependent: boolean
  dependents: Dependent[]
  refund?: Refund
  contactPhoneNumber?: string
  contactEmail?: string

  _w2s: IncomeW2[]
  _f1099rs: Income1099R[]
  _fSSA1099s: Income1099SSA[]

  schedule1?: Schedule1
  schedule2?: Schedule2
  schedule3?: Schedule3
  scheduleA?: ScheduleA
  scheduleB?: ScheduleB
  scheduleD?: ScheduleD
  scheduleE?: ScheduleE
  scheduleEIC?: ScheduleEIC
  scheduleR?: ScheduleR
  schedule8812?: Schedule8812
  schedule8863?: Schedule8863
  f4797?: F4797
  f4972?: F4972
  f5695?: F5695
  f8814?: F8814
  f8888?: F8888
  f8910?: F8910
  f8936?: F8936
  f8959?: F8959
  f8995?: F8995 | F8995A
  studentLoanInterestWorksheet?: StudentLoanInterestWorksheet
  socialSecurityBenefitsWorksheet?: SocialSecurityBenefitsWorksheet

  childTaxCreditWorksheet?: ChildTaxCreditWorksheet

  constructor(tp: TaxPayer) {
    this.filingStatus = tp.filingStatus
    this.firstNameAndInitial = tp.primaryPerson?.firstName
    this.lastName = tp.primaryPerson?.lastName
    this.yourSocialSecurityNumber = tp.primaryPerson?.ssid
    this.spousesFirstNameAndInitial = tp.spouse?.firstName
    this.spousesLastName = tp.spouse?.lastName
    this.spousesSocialSecurityNumber = tp.spouse?.ssid
    this.homeAddress = tp.primaryPerson?.address.address
    this.aptNo = tp.primaryPerson?.address.aptNo
    this.city = tp.primaryPerson?.address.city
    this.state = tp.primaryPerson?.address.state
    this.zip = tp.primaryPerson?.address.zip
    this.foreignCountryName = tp.primaryPerson?.address.foreignCountry
    this.province = tp.primaryPerson?.address.province
    this.postalCode = tp.primaryPerson?.address.postalCode
    this.virtualCurrency = false
    this.isTaxpayerDependent = Boolean(tp.primaryPerson?.isTaxpayerDependent)
    this.isSpouseDependent = Boolean(tp.spouse?.isTaxpayerDependent)
    this.dependents = tp.dependents
    this._w2s = []
    this._f1099rs = []
    this._fSSA1099s = []
    this.contactPhoneNumber = tp.contactPhoneNumber
    this.contactEmail = tp.contactEmail
  }

  addW2(w2: IncomeW2): void {
    this._w2s.push(w2)
  }

  add1099R(f1099r: Income1099R): void {
    this._f1099rs.push(f1099r)
  }

  add1099SSA(f1099SSA: Income1099SSA): void {
    this._fSSA1099s.push(f1099SSA)
  }

  addQuestions(questions: Responses): void {
    this.virtualCurrency = questions.CRYPTO ?? false
  }

  addSchedule1(s: Schedule1): void {
    this.schedule1 = s
  }

  addSchedule2(s: Schedule2): void {
    this.schedule2 = s
  }

  addSchedule3(s: Schedule3): void {
    this.schedule3 = s
  }

  addScheduleA(s: ScheduleA): void {
    this.scheduleA = s
  }

  addScheduleB(s: ScheduleB): void {
    this.scheduleB = s
  }

  addScheduleD(s: ScheduleD): void {
    this.scheduleD = s
  }

  addScheduleE(s: ScheduleE): void {
    this.scheduleE = s
  }

  addScheduleEIC(s: ScheduleEIC): void {
    this.scheduleEIC = s
  }

  add8959(f: F8959): void {
    this.f8959 = f
  }

  add8995(s: F8995 | F8995A): void {
    this.f8995 = s
  }

  add8814(s: F8814): void {
    this.f8814 = s
  }

  add4797(s: F4797): void {
    this.f4797 = s
  }

  add4972(s: F4972): void {
    this.f4972 = s
  }

  addChildTaxCreditWorksheet(s: ChildTaxCreditWorksheet): void {
    this.childTaxCreditWorksheet = s
  }

  addSchedule8812(s: Schedule8812): void {
    this.schedule8812 = s
  }

  addStudentLoanInterestWorksheet(s: StudentLoanInterestWorksheet): void {
    this.studentLoanInterestWorksheet = s
  }

  addSocialSecurityWorksheet(s: SocialSecurityBenefitsWorksheet): void {
    this.socialSecurityBenefitsWorksheet = s
  }

  addRefund(r: Refund): void {
    this.refund = r
  }

  // TODO -> born before 1956/01/02
  bornBeforeDate = (): boolean => false
  // TODO
  blind = (): boolean => false

  // TODO
  spouseBeforeDate = (): boolean => false

  // TODO
  spouseBlind = (): boolean => false

  validW2s = (): IncomeW2[] => {
    if (this.filingStatus === FilingStatus.MFS) {
      return this._w2s.filter((w2) => w2.personRole === PersonRole.PRIMARY)
    } else {
      return this._w2s
    }
  }

  wages = (): number => this.validW2s().reduce((res, w2) => res + w2.income, 0)

  occupation = (r: PersonRole): string | undefined =>
    this._w2s.find((w2) => w2.personRole === r && w2.occupation !== '')
      ?.occupation

  standardDeduction = (): number | undefined => {
    if (this.filingStatus === undefined) {
      return undefined
    } else if (this.isTaxpayerDependent || this.isSpouseDependent) {
      return Math.min(
        federalBrackets.ordinary.status[this.filingStatus].deductions[0].amount,
        this.wages() > 750 ? this.wages() + 350 : 1100
      )
    }
    return federalBrackets.ordinary.status[this.filingStatus].deductions[0]
      .amount
  }

  totalQualifiedDividends = (): number | undefined =>
    displayNumber(
      (this.scheduleB?.f1099divs() ?? [])
        .map((f) => f.form.qualifiedDividends)
        .reduce((l, r) => l + r, 0)
    )

  totalGrossDistributionsFrom1099R = (
    planType: PlanType1099
  ): number | undefined =>
    displayNumber(
      this._f1099rs
        .filter((element) => element.form.planType == planType)
        .reduce((res, f1099) => res + f1099.form.grossDistribution, 0)
    )

  totalTaxableFrom1099R = (planType: PlanType1099): number | undefined =>
    displayNumber(
      this._f1099rs
        .filter((element) => element.form.planType == planType)
        .reduce((res, f1099) => res + f1099.form.taxableAmount, 0)
    )

  /**
   * Line 1: Wages, salaries, tips, etc
   * @returns Total wages
   */
  l1 = (): number | undefined => displayNumber(this.wages())

  /**
   * Line 2:
   * @returns tax-exempt interest
   */
  l2a = (): number | undefined => this.scheduleB?.l3()

  /**
   * Line 2b
   * @returns Taxable interest
   */
  l2b = (): number | undefined => this.scheduleB?.l4()

  /**
   * Qualified dividends
   * @returns qualified dividends
   */
  l3a = (): number | undefined => this.totalQualifiedDividends()

  /**
   * Line 3b
   * @returns Total qualified dividends
   */
  l3b = (): number | undefined => this.scheduleB?.l6()

  /**
   * Line 4a: The value of box 1 in 1099-R forms coming from IRAs
   * @returns IRA distributions
   */
  l4a = (): number | undefined =>
    this.totalGrossDistributionsFrom1099R(PlanType1099.IRA)

  /**
   * Line 4b
   * The value of box 2a in 1099-R coming from IRAs
   * @returns Taxable amount of IRA distributions
   */
  l4b = (): number | undefined => this.totalTaxableFrom1099R(PlanType1099.IRA)

  /**
   * Line 5a
   * The value of box 1 in 1099-R forms coming from pensions/annuities
   * @returns Pensions and annuities
   */
  l5a = (): number | undefined =>
    this.totalGrossDistributionsFrom1099R(PlanType1099.Pension)

  /**
   * Line 5b
   * The value of box 2a in 1099-R forms coming from pensions/annuities
   * @returns Taxable amount of pensions and annuities
   */
  l5b = (): number | undefined =>
    this.totalTaxableFrom1099R(PlanType1099.Pension)

  /**
   * Line 6a
   * Sum of Box 5 from SSA-1099
   * @returns total social security benefits
   */
  l6a = (): number | undefined => this.socialSecurityBenefitsWorksheet?.l1()

  /**
   * Line 6b
   * Taxable amount of line 6a based on other income
   * @returns taxbale amount of social security benefits
   */
  l6b = (): number | undefined =>
    this.socialSecurityBenefitsWorksheet?.taxableAmount()

  /**
   * Line 7
   * Capital gain or (loss). Attach schedule D if required
   * @returns
   */
  l7 = (): number | undefined => this.scheduleD?.l16()

  /**
   * Line 8
   * Other income from Schedule 1, Line 9
   * @returns other income
   */
  l8 = (): number | undefined => this.schedule1?.l9()

  /**
   * Line 9
   * Total income
   * @returns total income
   */
  l9 = (): number | undefined =>
    displayNumber(
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
    )

  /**
   * Line 10a
   * Adjustments to income from schedule 1, line 22
   * @returns
   */
  l10a = (): number | undefined => this.schedule1?.l22()

  /**
   * Line 10b
   * Charitable contributions if you take the standard deduction
   * @returns charitable contributions
   */
  l10b = (): number | undefined => undefined

  /**
   * Line 10c
   * @returns Total adjustments to income
   */
  l10c = (): number | undefined =>
    displayNumber(sumFields([this.l10a(), this.l10b()]))

  /**
   * Line 11
   * @returns Adjusted gross income
   */
  l11 = (): number | undefined =>
    displayNumber(computeField(this.l9()) - computeField(this.l10c()))

  /**
   * Line 12
   * @returns Standard deduction or itemized deductions (from Schedule A)
   */
  l12 = (): number | undefined => {
    if (this.scheduleA !== undefined) {
      return this.scheduleA.deductions()
    }
    return this.standardDeduction()
  }

  /**
   * Line 13
   * Qualified busines income deduction Attach F8995 or F8995-A
   * @returns Qualified business income deduction
   */
  l13 = (): number | undefined => this.f8995?.deductions()

  /**
   * Line 14
   * @returns L12 + L13
   */
  l14 = (): number | undefined =>
    displayNumber(sumFields([this.l12(), this.l13()]))

  /**
   * Line 15
   * @returns Taxable income
   */
  l15 = (): number | undefined =>
    displayNumber(computeField(this.l11()) - computeField(this.l14()))

  computeTax = (): number | undefined => {
    if (this.scheduleD?.computeTaxOnQDWorksheet() ?? false) {
      const wksht = new SDQualifiedAndCapGains(this)
      return wksht.tax()
    }

    if (this.filingStatus !== undefined) {
      return computeOrdinaryTax(this.filingStatus, computeField(this.l15()))
    }

    return undefined
  }

  /**
   * Line 16
   * @returns Tax
   */
  l16 = (): number | undefined =>
    displayNumber(
      Math.round(
        sumFields([this.f8814?.tax(), this.f4972?.tax(), this.computeTax()])
      )
    )

  /**
   * Line 17
   * @returns Schedule 2, Line 3
   */
  l17 = (): number | undefined => this.schedule2?.l3()

  /**
   * Line 18
   * @returns L16 + L17
   */
  l18 = (): number | undefined =>
    displayNumber(sumFields([this.l16(), this.l17()]))

  /**
   * Line 19
   * @returns Child tax credit or credit for other dependents
   */
  l19 = (): number | undefined =>
    computeField(this.childTaxCreditWorksheet?.l12())

  /**
   * Line 20
   * @returns Schedule 3, line 7
   */
  l20 = (): number | undefined => this.schedule3?.l7()

  /**
   * Line 21
   * @returns L19 + L20
   */
  l21 = (): number | undefined =>
    displayNumber(sumFields([this.l19(), this.l20()]))

  /**
   * Line 22
   * @returns L18 - L21
   */
  l22 = (): number | undefined =>
    displayNumber(computeField(this.l18()) - computeField(this.l21()))

  /**
   * Line 23
   * @returns other taxes, including SE tax
   */
  l23 = (): number | undefined => this.schedule2?.l10()

  /**
   * Line 24
   * Total tax (L22 + L23)
   * @returns Total tax
   */
  l24 = (): number | undefined =>
    displayNumber(sumFields([this.l22(), this.l23()]))

  /**
   * Line 25a
   * @returns Federal income tax withheld from W-2
   */
  l25a = (): number | undefined =>
    displayNumber(
      this.validW2s().reduce(
        (res, w2) => res + computeField(w2.fedWithholding),
        0
      )
    )

  /**
   * Line 25b
   * @returns Federal income tax withheld from 1099
   */
  l25b = (): number | undefined =>
    displayNumber(
      this._f1099rs.reduce(
        (res, f1099) => res + f1099.form.federalIncomeTaxWithheld,
        0
      ) +
        this._fSSA1099s.reduce(
          (res, f1099) => res + f1099.form.federalIncomeTaxWithheld,
          0
        )
    )

  /**
   * Line 25c
   * W-2G box 4, schedule K-1, form 1042-S, form 8805, form 8288-A
   * @returns Federal income tax withheld from other forms
   */
  l25c = (): number | undefined => this.f8959?.l24()

  /**
   * Line 25d
   * Sum of 25 a - d, total tax withheld
   * @returns Federal income tax withheld
   */
  l25d = (): number | undefined =>
    displayNumber(sumFields([this.l25a(), this.l25b(), this.l25c()]))

  /**
   * Line 26
   * TODO: handle estimated tax payments
   * @returns  Estimated tax payment and prior year overpayment
   */
  l26 = (): number | undefined => undefined

  /**
   * Line 27
   * @returns Earned income credit (EIC)
   */
  l27 = (): number | undefined =>
    displayNumber(this.scheduleEIC?.credit(this) ?? 0)

  /**
   * Line 28
   * Additional child tax credit Schedule 8812
   * @returns Additional child tax credit
   */
  l28 = (): number | undefined => this.schedule8812?.l15()

  /**
   * Line 29
   * American opportunity credit
   * Form 8863, line 8
   * @returns American opportunity credit
   */
  l29 = (): number | undefined => this.schedule8863?.l8()

  /**
   * Recovery rebate credit
   * @returns TODO: recovery rebate credit?
   */
  l30 = (): number | undefined => undefined

  /**
   * Line 31
   * Amount from Schedule 3, line 13
   * @returns Schedule 3, line 13
   */
  l31 = (): number | undefined => this.schedule3?.l13()

  /**
   * Line 32
   * Sum 27 - 31
   * @returns Total other payments and refundable credits
   */
  l32 = (): number | undefined =>
    displayNumber(
      sumFields([this.l27(), this.l28(), this.l29(), this.l30(), this.l31()])
    )

  /**
   * Line 33
   * @returns Total payments
   */
  l33 = (): number | undefined =>
    displayNumber(sumFields([this.l25d(), this.l26(), this.l32()]))

  /**
   * Line 34
   * @returns Overpayment
   */
  l34 = (): number | undefined =>
    displayNumber(computeField(this.l33()) - computeField(this.l24()))

  /**
   * Line 35a
   * Amount you want refunded to you
   * TODO: assuming user wants amount refunded
   * rather than applied to estimated tax
   * @returns amount refunded
   */
  l35a = (): number | undefined => this.l34()

  /**
   * Line 36
   * Amount of overpayment you want applied to next year estimated tax
   * Assuming this is zero
   * @returns amount applied to next years tax
   */
  l36 = (): number | undefined =>
    displayNumber(computeField(this.l34()) - computeField(this.l35a()))

  /**
   * Line 37
   * @returns Amount owed
   */
  l37 = (): number | undefined =>
    displayNumber(computeField(this.l24()) - computeField(this.l33()))

  /**
   * Line 38
   * TODO - estimated tax penalty
   * @returns estimate tax penalty
   */
  l38 = (): number | undefined => displayNumber(0)

  _depField = (idx: number): string | boolean => {
    const deps: Dependent[] = this.dependents

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
    if (this.filingStatus === undefined) {
      result.push(F1040Error.filingStatusUndefined)
    }

    return result
  }

  fields = (): Array<string | number | boolean | undefined> =>
    [
      this.filingStatus === FilingStatus.S,
      this.filingStatus === FilingStatus.MFJ,
      this.filingStatus === FilingStatus.MFS,
      this.filingStatus === FilingStatus.HOH,
      this.filingStatus === FilingStatus.W,
      // TODO: implement non dependent child for HOH and QW
      this.spousesFirstNameAndInitial !== undefined &&
      this.spousesLastName !== undefined &&
      this.filingStatus === 'MFS'
        ? this.spousesFirstNameAndInitial + ' ' + this.spousesLastName
        : '',
      this.firstNameAndInitial,
      this.lastName,
      this.yourSocialSecurityNumber,
      this.filingStatus === FilingStatus.MFJ
        ? this.spousesFirstNameAndInitial
        : '',
      this.filingStatus === FilingStatus.MFJ ? this.spousesLastName ?? '' : '',
      this.spousesSocialSecurityNumber,
      this.homeAddress,
      this.aptNo,
      this.city,
      this.state,
      this.zip,
      this.foreignCountryName,
      this.province,
      this.postalCode,
      false, // election campaign boxes
      false,
      this.virtualCurrency,
      !this.virtualCurrency,
      this.isTaxpayerDependent,
      this.isSpouseDependent,
      false, // TODO: spouse itemizes separately,
      this.bornBeforeDate(),
      this.blind(),
      this.spouseBeforeDate(),
      this.spouseBlind(),
      this.dependents.length > 4,
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
      this.refund?.routingNumber,
      this.refund?.accountType === AccountType.checking,
      this.refund?.accountType === AccountType.savings,
      this.refund?.accountNumber,
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
      this.contactPhoneNumber,
      this.contactEmail,
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
