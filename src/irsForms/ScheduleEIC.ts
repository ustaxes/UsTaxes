import { Dependent, TaxPayer as TP } from '../redux/data'
import TaxPayer from '../redux/TaxPayer'
import F1040 from './F1040'
import { sumFields } from './util'
import * as federal from '../data/federal'
import F4797 from './F4797'
import Pub596Worksheet1 from './worksheets/Pub596Worksheet1'
import Form from './Form'

export default class ScheduleEIC implements Form {
  tp: TaxPayer
  f4797?: F4797
  pub596Worksheet1: Pub596Worksheet1
  qualifyingCutoffYear: number = 1996

  constructor (tp: TP, f4797?: F4797) {
    this.tp = new TaxPayer(tp)
    this.f4797 = f4797
    this.pub596Worksheet1 = new Pub596Worksheet1(tp)
  }

  // step 2, question 1
  investmentIncome = (f1040: F1040): number => sumFields([
    f1040.l2a(),
    f1040.l2b(),
    f1040.l3b(),
    Math.max(f1040.l7() ?? 0, 0)
  ])

  // Todo, step 2, question 3
  filingForm4797 = (): boolean => false

  // Todo, step 2 question 4, sub question 1
  filingScheduleE = (): boolean => false

  // Todo, step 2 question 4, sub question 2
  // reporting income from rental of personal property
  incomeFromPersonalProperty = (): boolean => false

  // Todo, step 2 question 4, sub question 3
  filingForm8814 = (): boolean => false

  // Todo, step 2 question 4, sub question 4
  incomeOrLossFromPassiveActivity = (): boolean => false

  // Todo, step question 3
  f4797PrecludesCredit = (): boolean => false

  allowed = (f1040: F1040): boolean => {
    return (
      !(
        // S2Q2
        this.investmentIncome(f1040) > federal.EIC.maxInvestmentIncome &&
        // S2Q3
        (!this.filingForm4797() || !this.f4797PrecludesCredit())
      ) && (!(
        this.filingScheduleE() ||
        this.incomeFromPersonalProperty() ||
        this.filingForm8814() ||
        this.incomeOrLossFromPassiveActivity()
      ) || !this.pub596Worksheet1.precludesEIC())
    )
  }

  // TODO: Step 2 question 3,
  // Are you filing Form 4797 (relating to sales of business
  // property?

  credit = (): number | undefined => undefined

  qualifyingDependents = (): Array<Dependent | undefined> => {
    const res: Array<Dependent | undefined> = this.tp.tp.dependents
      .filter((d) => d.qualifyingInfo?.birthYear !== undefined)
      .sort((d) => (d.qualifyingInfo?.birthYear as number))
      .slice(0, 3)

    res.fill(undefined, res.length - 1, 3)
    return res
  }

  // EIC line 1
  nameFields = (): Array<string | undefined> =>
    this.qualifyingDependents()
      .flatMap((d) => ([d?.firstName, d?.lastName]))

  // EIC line 2
  ssnFields = (): Array<string | undefined> =>
    this.qualifyingDependents().map((d) => (d?.ssid))

  years = (): Array<number | undefined> =>
    this.qualifyingDependents()
      .map((d) => d?.qualifyingInfo?.birthYear)

  // EIC line 3
  birthYearFields = (): Array<string | undefined> =>
    this.years()
      .flatMap((year) => {
        if (year !== undefined) {
          return year.toString().split('')
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
    this.qualifyingDependents()
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
