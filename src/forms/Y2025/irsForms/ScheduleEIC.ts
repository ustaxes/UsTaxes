import F1040Attachment from './F1040Attachment'
import { Dependent, FilingStatus } from 'ustaxes/core/data'
import F1040 from './F1040'
import { sumFields } from 'ustaxes/core/irsForms/util'
import * as federal from '../data/federal'
import F2555 from './F2555'
import F4797 from './F4797'
import F8814 from './F8814'
import Pub596Worksheet1 from './worksheets/Pub596Worksheet1'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { evaluatePiecewise, Piecewise } from 'ustaxes/core/util'
import _ from 'lodash'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'

type PrecludesEIC<F> = (f: F) => boolean

// TODO: check F2555
const checks2555: PrecludesEIC<F2555> = (): boolean => false

// TODO: check F4797
const checks4797: PrecludesEIC<F4797> = (): boolean => false

// TODO: check F8814
const checks8814: PrecludesEIC<F8814> = (): boolean => false

const checksPub596: PrecludesEIC<Pub596Worksheet1> = (f): boolean =>
  f.precludesEIC()

const precludesEIC =
  <F>(p: PrecludesEIC<F>) =>
  (f: F | undefined): boolean => {
    if (f === undefined) {
      return false
    }
    return p(f)
  }

export default class ScheduleEIC extends F1040Attachment {
  tag: FormTag = 'f1040sei'
  sequenceIndex = 43
  pub596Worksheet1: Pub596Worksheet1
  qualifyingStudentCutoffYear = federal.CURRENT_YEAR - federal.QualifyingDependents.qualifyingStudentMaxAge
  qualifyingCutoffYear = federal.CURRENT_YEAR - federal.QualifyingDependents.childMaxAge
  investmentIncomeLimit = federal.EIC.maxInvestmentIncome

  constructor(f1040: F1040) {
    super(f1040)
    this.pub596Worksheet1 = new Pub596Worksheet1(f1040)
  }

  isNeeded = (): boolean => this.allowed()

  // instructions step 1.1
  passIncomeLimit = (): boolean => {
    const filingStatus = this.f1040.info.taxPayer.filingStatus
    const incomeLimits = federal.EIC.caps[filingStatus]
    if (incomeLimits !== undefined) {
      const limit =
        incomeLimits[
          Math.min(this.qualifyingDependents().length, incomeLimits.length - 1)
        ]
      return this.f1040.l11b() < limit
    }
    return false
  }

  // Step 1.2, todo, both spouses must have a SSN issued before 2020 due date
  //
  // TODO: ('Step 1.2 (valid SSNs) unchecked') and without work restriction and valid for eic purpos
  validSSNs = (): boolean => {
    return true
  }

  // Step 1.3
  allowedFilingStatus = (): boolean =>
    this.f1040.info.taxPayer.filingStatus !== FilingStatus.MFS

  // Step 1.4
  allowedFilling2555 = (): boolean =>
    !precludesEIC(checks2555)(this.f1040.f2555)

  //
  // TODO: ('Step 1.5, Not checking non-resident alien') Step 1.5 nonResidentAli
  allowedNonresidentAlien = (): boolean => {
    return true
  }

  // step 2, question 1
  investmentIncome = (): number =>
    sumFields([
      this.f1040.l2a(),
      this.f1040.l2b(),
      this.f1040.l3b(),
      Math.max(this.f1040.l7a() ?? 0, 0)
    ])

  passInvestmentIncomeLimit = (): boolean =>
    this.investmentIncome() < federal.EIC.maxInvestmentIncome

  // Todo, step 2, question 3
  f4797AllowsEIC = (): boolean => !precludesEIC(checks4797)(this.f1040.f4797)

  // Todo, instruction 2.4.1
  filingScheduleE = (): boolean => this.f1040.scheduleE.isNeeded()

  //
  // TODO: ('Not checking personal property income') 2.4
  passIncomeFromPersonalProperty = (): boolean => {
    return true
  }

  // 2.4.3
  passForm8814 = (): boolean => !precludesEIC(checks8814)(this.f1040.f8814)

  //
  // TODO: ('Not checking passive activity') 2.4
  incomeOrLossFromPassiveActivity = (): boolean => {
    return false
  }

  // 2.4.5
  passPub596 = (): boolean => !precludesEIC(checksPub596)(this.pub596Worksheet1)

  // 3.1
  atLeastOneChild = (): boolean => this.qualifyingDependents().length > 0

  // 3.2, 4.4
  jointReturn = (): boolean =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ

  //
  // TODO: ('3.3: Not checking qualifying child of another') 3.3, 4
  qualifyingChildOfAnother = (): boolean => {
    return false
  }

  // 4.1 - covered by income limit check
  //
  // TODO: ('4.2: Not checking taxpayer age') 4
  over25Under65 = (): boolean => {
    return true
  }

  //
  // TODO: ('4.3: Not checking residency') 4
  mainHomeInsideUsBothPeople = (): boolean => {
    return true
  }

  // 4.4 covered above
  // 4.5 covered above
  // 4.6 dependent of another
  dependentOfAnother = (): boolean =>
    this.f1040.info.taxPayer.primaryPerson.isTaxpayerDependent ||
    (this.f1040.info.taxPayer.spouse?.isTaxpayerDependent ?? false)

  //
  // TODO: ('5.1: Not checking church self-employment income') 5.1 - Filing schedule SE for chur
  filingSEChurchIncome = (): boolean => {
    return false
  }

  //
  // TODO: ('5.1.2: Not checking scholarship, grants') 5.1
  taxableScholarshipIncome = (): number => {
    return 0
  }

  //
  // TODO: ('5.1.3: Not checking prison income') 5.1
  prisonIncome = (): number => {
    return 0
  }

  //
  // TODO: ('5.1.4: Not checking pension income') 5.1
  pensionPlanIncome = (): number => {
    return 0
  }

  //
  // TODO: ('5.1.5: Not checking medicaid waiver') 5.1
  medicaidWaiverPayment = (): number => {
    return 0
  }

  //
  // TODO: ('5.1.8: Not checking nontaxable combat pay') 5.1
  nontaxableCombatPay = (): number => {
    return 0
  }

  // 5.1 - Earned income
  earnedIncome = (): number => {
    const l1 = this.f1040.l1z()
    const l2 = this.taxableScholarshipIncome()
    const l3 = this.prisonIncome()
    const l4 = this.pensionPlanIncome()
    const l5 = this.medicaidWaiverPayment()
    const l6 = l2 + l3 + l4 + l5
    const l7 = l1 - l6
    const l8 = this.nontaxableCombatPay()
    const l9 = l7 + l8
    return l9
  }

  /**
   * The credit table in Publication 596 provides an
   * amount for each interval of $50, calculated from the
   * midpoint of the interval.
   *
   * @param income The earned income
   * @returns the earned income rounded to the nearest 25
   */
  roundIncome = (income: number): number => {
    if (income < 1) {
      return 0
    }
    return Math.round(Math.round(income) / 50) * 50 + 25
  }

  /**
   * Based on the earned income and filing status, calculate the
   * allowed EITC.
   *
   * For tax year 2020, IRS Rev. Proc. 2019-44 outlines the required
   * calculation for the EITC based on number of qualifying children
   * and filing status.
   *
   * https://www.irs.gov/pub/irs-drop/rp-19-44.pdf
   *
   * IRS publication 596 provides a table that can be used
   * to figure the EITC, and is the basis of online calculators published
   * by IRS. This table uses the formulas outlined in Rev Proc 2019-44
   * but applies them to incomes lying in $50 intervals, with the midpoint
   * of those intervals used to calculate the credit for the entire window.
   * For example, if the taxpayer has an earned income of $5000, the amount
   * that is found in the table is calculated based on an income of $5025 and
   * comes out ahead. Conversely, someone with an earned income of $5049 finds
   * a credit in the table calculated off the same $5,025 and loses out.
   *
   * https://www.irs.gov/pub/irs-pdf/p596.pdf
   *
   * @param income The earned income
   * @returns
   */
  calculateEICForIncome = (income: number): number => {
    const filingStatus = this.f1040.info.taxPayer.filingStatus
    const f: Piecewise[] | undefined = federal.EIC.formulas[filingStatus]
    if (f === undefined) {
      return 0
    }

    return Math.max(
      0,
      evaluatePiecewise(
        f[this.qualifyingDependents().length],
        this.roundIncome(income)
      )
    )
  }

  //
  // TODO: ('5.2: Not checking selfemployment') 5
  selfEmployed = (): boolean => {
    return false
  }

  // 5.3 - covered by income check

  // 6.1 - We will figure the credit.

  // EIC worksheet A calculation
  credit = (): number =>
    Math.min(
      this.calculateEICForIncome(this.earnedIncome()),
      this.calculateEICForIncome(this.f1040.l11b())
    )

  allowed = (): boolean => {
    return (
      // Step 1
      this.passIncomeLimit() &&
      this.validSSNs() &&
      this.allowedFilingStatus() &&
      this.allowedFilling2555() &&
      this.allowedNonresidentAlien() &&
      // Step 2
      (this.passInvestmentIncomeLimit() || this.f4797AllowsEIC()) &&
      (!(
        // Step 3
        (
          this.filingScheduleE() ||
          !this.passIncomeFromPersonalProperty() ||
          !this.passForm8814() ||
          this.incomeOrLossFromPassiveActivity()
        )
      ) ||
        this.passPub596()) &&
      !(
        // Step 4
        (
          this.f1040.info.taxPayer.filingStatus !== FilingStatus.MFJ &&
          this.dependentOfAnother()
        )
      ) &&
      this.credit() > 0
    )
  }

  qualifyingDependents = (): Dependent[] =>
    this.f1040.info.taxPayer.dependents
      .filter(
        (d) =>
          d.dateOfBirth.getFullYear() >= this.qualifyingCutoffYear ||
          ((d.qualifyingInfo?.isStudent ?? false) &&
            d.dateOfBirth.getFullYear() >= this.qualifyingStudentCutoffYear)
      )
      .sort((d) => d.dateOfBirth.getFullYear())
      .slice(0, 3)

  qualifyingDependentsFilled = (): Array<Dependent | undefined> => {
    const res = this.qualifyingDependents()
    return _.fill([...res], undefined, res.length, 3)
  }

  // EIC line 1
  nameFields = (): Array<string | undefined> =>
    this.qualifyingDependentsFilled().map(
      (d) => `${d?.firstName ?? ''} ${d?.lastName ?? ''}`
    )

  // EIC line 2
  ssnFields = (): Array<string | undefined> =>
    this.qualifyingDependentsFilled().map((d) => d?.ssid)

  years = (): Array<number | undefined> =>
    this.qualifyingDependentsFilled().map((d) => d?.dateOfBirth.getFullYear())

  // EIC line 3
  birthYearFields = (): Array<string | undefined> =>
    this.years().flatMap((year) => {
      if (year !== undefined) {
        return String(year).split('')
      }
      return [undefined, undefined, undefined, undefined]
    })

  // EIC line 4a: Not handling case of child older than taxpayer
  ageFields = (): Array<boolean | undefined> =>
    this.years().flatMap((year) => {
      if (year !== undefined) {
        const qualifies = year > this.qualifyingStudentCutoffYear
        return [qualifies, !qualifies]
      }
      return [undefined, undefined]
    })

  // TODO: disability
  disabledFields = (): Array<boolean | undefined> =>
    this.years().flatMap((year) => {
      if (year === undefined || year < this.qualifyingCutoffYear) {
        return [undefined, undefined]
      }
      return [undefined, undefined]
    })

  // Line 5
  // TODO: Address eic relationships
  relationships = (): Array<string | undefined> =>
    this.qualifyingDependentsFilled().map((d) => d?.relationship)

  // Line 6
  numberMonths = (): Array<number | undefined> =>
    this.qualifyingDependents().map((d) => d.qualifyingInfo?.numberOfMonths)

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    ...this.nameFields(), // 3 "firstName lastName"
    ...this.ssnFields(), // 3
    ...this.birthYearFields(), // 12
    ...this.ageFields(), // 6
    ...this.disabledFields(), // 6
    ...this.relationships(), // 3
    ...this.numberMonths() // 3
  ]

  fillInstructions = (): FillInstructions => {
    const nameF = this.nameFields()
    const ssnF = this.ssnFields()
    const birthY = this.birthYearFields()
    const ageF = this.ageFields()
    const disabledF = this.disabledFields()
    const rels = this.relationships()
    const months = this.numberMonths()

    return [
      // Header
      text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_02[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      // Line 1: Child names (3 children)
      text('topmostSubform[0].Page1[0].f1_03[0]', nameF[0]),
      text('topmostSubform[0].Page1[0].f1_04[0]', nameF[1]),
      text('topmostSubform[0].Page1[0].f1_05[0]', nameF[2]),
      // Line 2: Child SSNs (3 children)
      text('topmostSubform[0].Page1[0].f1_06[0]', ssnF[0]),
      text('topmostSubform[0].Page1[0].f1_07[0]', ssnF[1]),
      text('topmostSubform[0].Page1[0].f1_08[0]', ssnF[2]),
      // Line 3: Birth year digits — child 1 (4 individual digit fields)
      text('topmostSubform[0].Page1[0].Year1_ReadOrder[0].f1_09[0]', birthY[0]),
      text('topmostSubform[0].Page1[0].Year1_ReadOrder[0].f1_10[0]', birthY[1]),
      text('topmostSubform[0].Page1[0].Year1_ReadOrder[0].f1_11[0]', birthY[2]),
      text('topmostSubform[0].Page1[0].Year1_ReadOrder[0].f1_12[0]', birthY[3]),
      // Line 3: Birth year digits — child 2
      text('topmostSubform[0].Page1[0].Year2_ReadOrder[0].f1_13[0]', birthY[4]),
      text('topmostSubform[0].Page1[0].Year2_ReadOrder[0].f1_14[0]', birthY[5]),
      text('topmostSubform[0].Page1[0].Year2_ReadOrder[0].f1_15[0]', birthY[6]),
      text('topmostSubform[0].Page1[0].Year2_ReadOrder[0].f1_16[0]', birthY[7]),
      // Line 3: Birth year digits — child 3
      text('topmostSubform[0].Page1[0].f1_17[0]', birthY[8]),
      text('topmostSubform[0].Page1[0].f1_18[0]', birthY[9]),
      text('topmostSubform[0].Page1[0].f1_19[0]', birthY[10]),
      text('topmostSubform[0].Page1[0].f1_20[0]', birthY[11]),
      // Line 4a: Age qualifies (yes/no per child)
      checkbox(
        'topmostSubform[0].Page1[0].Line4a_Child1_ReadOrder[0].Yes_ReadOrder[0].c1_1[0]',
        ageF[0]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4a_Child1_ReadOrder[0].c1_1[0]',
        ageF[1]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4a_Child2_ReadOrder[0].Yes_ReadOrder[0].c1_2[0]',
        ageF[2]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4a_Child2_ReadOrder[0].c1_2[0]',
        ageF[3]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4a_Child3_Yes_ReadOrder[0].c1_3[0]',
        ageF[4]
      ),
      checkbox('topmostSubform[0].Page1[0].c1_3[0]', ageF[5]),
      // Line 4b: Permanently disabled (yes/no per child)
      checkbox(
        'topmostSubform[0].Page1[0].Line4b_Child1_ReadOrder[0].Yes_ReadOrder[0].c1_4[0]',
        disabledF[0]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4b_Child1_ReadOrder[0].c1_4[0]',
        disabledF[1]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4b_Child2_ReadOrder[0].Yes_ReadOrder[0].c1_5[0]',
        disabledF[2]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4b_Child2_ReadOrder[0].c1_5[0]',
        disabledF[3]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Line4b_Child3_Yes_ReadOrder[0].c1_6[0]',
        disabledF[4]
      ),
      checkbox('topmostSubform[0].Page1[0].c1_6[0]', disabledF[5]),
      // Line 5: Relationship to taxpayer (3 children)
      text('topmostSubform[0].Page1[0].f1_21[0]', rels[0]),
      text('topmostSubform[0].Page1[0].f1_22[0]', rels[1]),
      text('topmostSubform[0].Page1[0].f1_23[0]', rels[2]),
      // Line 6: Months lived in home (3 children)
      text(
        'topmostSubform[0].Page1[0].Line6_Child1_ReadOrder[0].f1_24[0]',
        months[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Line6_Child2_ReadOrder[0].f1_25[0]',
        months[1]
      ),
      text('topmostSubform[0].Page1[0].f1_26[0]', months[2])
    ]
  }
}
