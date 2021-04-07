import { Dependent, FilingStatus, TaxPayer as TP } from '../redux/data'
import TaxPayer from '../redux/TaxPayer'
import F1040 from './F1040'
import { sumFields } from './util'
import * as federal from '../data/federal'
import F2555 from './F2555'
import F4797 from './F4797'
import F8814 from './F8814'
import Pub596Worksheet1 from './worksheets/Pub596Worksheet1'
import Form from './Form'
import { anArrayOf, evaluatePiecewise, Piecewise } from '../util'

type PrecludesEIC<F> = (f: F) => boolean

const unimplemented = (message: string): void =>
  console.warn(`[Schedule EIC] unimplemented ${message}`)

const checks2555: PrecludesEIC<F2555> = (f): boolean => {
  unimplemented('check F2555')
  return false
}

const checks4797: PrecludesEIC<F4797> = (f): boolean => {
  unimplemented('check F4797')
  return false
}

const checks8814: PrecludesEIC<F8814> = (f): boolean => {
  unimplemented('check F8814')
  return false
}

const checksPub596: PrecludesEIC<Pub596Worksheet1> = (f): boolean => {
  unimplemented('check Pub596 worksheet 1')
  return false
}

const precludesEIC = <F>(p: PrecludesEIC<F>) => (f: F | undefined) => {
  if (f === undefined) {
    return false
  }
  return p(f)
}

export default class ScheduleEIC implements Form {
  tp: TaxPayer
  f2555?: F2555
  f4797?: F4797
  f8814?: F8814
  pub596Worksheet1: Pub596Worksheet1
  qualifyingStudentCutoffYear: number = 1996
  qualifyingCutoffYear: number = 2001
  investmentIncomeLimit: number = 3650

  constructor (tp: TP) {
    this.tp = new TaxPayer(tp)
    this.f2555 = new F2555(tp)
    this.f4797 = new F4797(tp)
    this.f8814 = new F8814(tp)
    this.pub596Worksheet1 = new Pub596Worksheet1(tp)
  }

  // instructions step 1.1
  passIncomeLimit = (f1040: F1040): boolean => {
    if (this.tp.tp.filingStatus !== undefined) {
      const incomeLimits = federal.EIC.caps[this.tp.tp.filingStatus]
      if (incomeLimits !== undefined) {
        const limit = incomeLimits[Math.min(this.qualifyingDependents.length, incomeLimits.length - 1)]
        return (f1040.l11() ?? 0) < limit
      }
    }
    return false
  }

  // Step 1.2, todo, boths spouses must have a SSN issued before 2020 due date
  // and without work restriction and valid for eic purposes
  validSSNs = (): boolean => {
    unimplemented('Step 1.2 (valid SSNs) unchecked')
    return true
  }

  // Step 1.3
  allowedFilingStatus = (): boolean => this.tp.tp.filingStatus !== FilingStatus.MFS

  // Step 1.4
  allowedFilling2555 = (): boolean => !precludesEIC(checks2555)(this.f2555)

  // Step 1.5 nonResidentAlien
  allowedNonresidentAlien = (): boolean => {
    unimplemented('Step 1.5, Not checking non-resident alien')
    return true
  }

  // step 2, question 1
  investmentIncome = (f1040: F1040): number => sumFields([
    f1040.l2a(),
    f1040.l2b(),
    f1040.l3b(),
    Math.max(f1040.l7() ?? 0, 0)
  ])

  passInvestmentIncomeLimit = (f1040: F1040): boolean =>
    this.investmentIncome(f1040) < federal.EIC.maxInvestmentIncome

  // Todo, step 2, question 3
  f4797AllowsEIC = (): boolean => !precludesEIC(checks4797)(this.f4797)

  // Todo, instruction 2.4.1
  filingScheduleE = (): boolean => {
    unimplemented('Not checking Schedule E')
    return false
  }

  // 2.4.2
  passIncomeFromPersonalProperty = (): boolean => {
    unimplemented('Not checking personal property income')
    return true
  }

  // 2.4.3
  passForm8814 = (): boolean => !precludesEIC(checks8814)(this.f8814)

  // 2.4.4
  incomeOrLossFromPassiveActivity = (): boolean => {
    unimplemented('Not checking passive activity')
    return false
  }

  // 2.4.5
  passPub596 = (): boolean => precludesEIC(checksPub596)(this.pub596Worksheet1)

  // 3.1
  atLeastOneChild = (): boolean => this.qualifyingDependents().length > 0

  // 3.2, 4.4
  jointReturn = (): boolean => this.tp.tp.filingStatus === FilingStatus.MFJ

  // 3.3, 4.5
  qualifyingChildOfAnother = (): boolean => {
    unimplemented('3.3: Not checking qualifying child of another')
    return false
  }

  // 4.1 - covered by income limit check
  // 4.2
  over25Under65 = (): boolean => {
    unimplemented('4.2: Not checking taxpayer age')
    return true
  }

  // 4.3
  mainHomeInsideUsBothPeople = (): boolean => {
    unimplemented('4.3: Not checking residency')
    return true
  }

  // 4.4 covered above
  // 4.5 covered above
  // 4.6 dependent of another
  dependentOfAnother = (): boolean => {
    unimplemented('4.6: Not checking dependent of another')
    return false
  }

  // 5.1 - Filing schedule SE for church
  filingSEChurchIncome = (): boolean => {
    unimplemented('5.1: Not checking church self-employment income')
    return false
  }

  // 5.1.2
  taxableScholarshipIncome = (): number => {
    unimplemented('5.1.2: Not checking scholarship, grants')
    return 0
  }

  // 5.1.3
  prisonIncome = (): number => {
    unimplemented('5.1.3: Not checking prison income')
    return 0
  }

  // 5.1.4
  pensionPlanIncome = (): number => {
    unimplemented('5.1.4: Not checking pension income')
    return 0
  }

  // 5.1.5
  medicaidWaiverPayment = (): number => {
    unimplemented('5.1.5: Not checking medicaid waiver')
    return 0
  }

  // 5.1.8
  nontaxableCombatPay = (): number => {
    unimplemented('5.1.8: Not checking nontaxable combat pay')
    return 0
  }

  // 5.1 - Earned income
  earnedIncome = (f1040: F1040): number => {
    const l1 = f1040.l1() ?? 0
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

  calculateEICForIncome = (income: number): number => {
    if (this.tp.tp.filingStatus === undefined) {
      return 0
    }
    const f: Piecewise[] | undefined = federal.EIC.formulas[this.tp.tp.filingStatus]
    if (f === undefined) {
      return 0
    }

    return Math.max(0, evaluatePiecewise(f[this.qualifyingDependents().length], income))
  }

  // 5.2
  selfEmployed = (): boolean => {
    unimplemented('5.2: Not checking selfemployment')
    return false
  }

  // 5.3 - covered by income check

  // 6.1 - We will figure the credit.

  // EIC worksheet A calculation
  credit = (f1040: F1040): number => Math.min(
    this.calculateEICForIncome(this.earnedIncome(f1040)),
    this.calculateEICForIncome(f1040.l11() ?? 0)
  )

  allowed = (f1040: F1040): boolean => {
    return (
      // Step 1
      this.passIncomeLimit(f1040) &&
      this.validSSNs() &&
      this.allowedFilingStatus() &&
      this.allowedFilling2555() &&
      this.allowedNonresidentAlien()
    ) && (
      // Step 2
      this.passInvestmentIncomeLimit(f1040) || (this.f4797AllowsEIC())
    ) && (
      !(
        // Step 3
        this.filingScheduleE() ||
        !this.passIncomeFromPersonalProperty() ||
        !this.passForm8814() ||
        this.incomeOrLossFromPassiveActivity()
      ) || this.passPub596()
    ) && this.credit(f1040) > 0
  }

  qualifyingDependents = (): Dependent[] => this.tp.tp.dependents
    .filter((d) =>
      (d.qualifyingInfo?.birthYear !== undefined) && (
        (d.qualifyingInfo?.birthYear !== undefined && d.qualifyingInfo?.birthYear >= this.qualifyingCutoffYear) ||
        ((d.qualifyingInfo?.isStudent ?? false) && (d.qualifyingInfo?.birthYear >= this.qualifyingStudentCutoffYear))
      )
    )
    .sort((d) => (d.qualifyingInfo?.birthYear as number))
    .slice(0, 3)

  qualifyingDependentsFilled = (): Array<Dependent | undefined> => {
    const res = this.qualifyingDependents()
    return [...res, ...anArrayOf(3 - res.length, undefined)]
  }

  // EIC line 1
  nameFields = (): Array<string | undefined> =>
    this.qualifyingDependentsFilled()
      .map((d) => `${d?.firstName ?? ''} ${d?.lastName ?? ''}`)

  // EIC line 2
  ssnFields = (): Array<string | undefined> =>
    this.qualifyingDependentsFilled().map((d) => (d?.ssid))

  years = (): Array<number | undefined> =>
    this.qualifyingDependentsFilled()
      .map((d) => d?.qualifyingInfo?.birthYear)

  // EIC line 3
  birthYearFields = (): Array<string | undefined> =>
    this.years()
      .flatMap((year) => {
        if (year !== undefined) {
          return String(year).split('')
        }
        return [undefined, undefined, undefined, undefined]
      })

  // EIC line 4a: Not handling case of child older than taxpayer
  ageFields = (): Array<boolean | undefined> =>
    this.years()
      .flatMap((year) => {
        if (year !== undefined) {
          const qualifies = year > 1996
          return [qualifies, !qualifies]
        }
        return [undefined, undefined]
      })

  // TODO: disability
  disabledFields = (): Array<boolean | undefined> =>
    this.years()
      .flatMap((year) => {
        if (year === undefined || year < this.qualifyingCutoffYear) {
          return [undefined, undefined]
        }
        return [undefined, undefined]
      })

  // Line 5
  // TODO: Address eic relationships
  relationships = (): Array<string | undefined> =>
    this.qualifyingDependentsFilled()
      .map((d) => d?.relationship)

  // Line 6
  numberMonths = (): Array<number | undefined> =>
    this.qualifyingDependents()
      .map((d) => 12)

  fields = (): Array<string | number | boolean | undefined> => ([
    this.tp.namesString(),
    this.tp.tp.primaryPerson?.ssid,
    ...this.nameFields(), // 6
    ...this.ssnFields(), // 3
    ...this.birthYearFields(), // 12
    ...this.ageFields(), // 6
    ...this.disabledFields(), // 6
    ...this.relationships(),
    ...this.numberMonths()
  ])
}
