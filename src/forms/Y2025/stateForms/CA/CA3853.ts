import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import {
  Field,
  FillInstruction,
  FillInstructions,
  text
} from 'ustaxes/core/pdfFiller'
import { Person, State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import parameters from './Parameters'
import ScheduleCA540 from './ScheduleCA540'

/**
 * FTB 3853 — Health Coverage Exemptions and Individual Shared
 * Responsibility Penalty.
 *
 * Simplifying assumptions (documented for the user):
 * - The whole household (taxpayer, spouse, dependents) shares the same
 *   uncovered months, taken from
 *   `info.caStateInfo.monthsWithoutHealthCoverage` and assumed to start
 *   in January. The penalty math only depends on the COUNT of uncovered
 *   months, not which months they are.
 * - No coverage exemptions are claimed (affordability, hardship, etc.).
 *   If an exemption applies, the penalty here is an overestimate.
 * - Dependents' own income is not counted toward applicable household
 *   income (not collected by the app).
 */
export default class CA3853 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 3
  methods: FormMethods
  scheduleCA: ScheduleCA540

  constructor(f1040: F1040, scheduleCA: ScheduleCA540) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'FTB3853'
    this.state = 'CA'
    this.methods = new FormMethods(this)
    this.scheduleCA = scheduleCA
  }

  attachments = (): Form[] => []

  uncoveredMonths = (): number =>
    Math.max(
      0,
      Math.min(12, this.info.caStateInfo?.monthsWithoutHealthCoverage ?? 0)
    )

  isNeeded = (): boolean => this.uncoveredMonths() > 0

  household = (): Person<Date>[] => {
    const tp = this.info.taxPayer
    return [
      tp.primaryPerson,
      ...(tp.spouse !== undefined ? [tp.spouse] : []),
      ...tp.dependents
    ]
  }

  private ageAtEndOfYear = (p: Person<Date>): number => {
    const dob = new Date(p.dateOfBirth)
    return 2025 - dob.getFullYear() - (dob.getMonth() > 11 ? 1 : 0)
  }

  adultCount = (): number =>
    this.household().filter((p) => this.ageAtEndOfYear(p) >= 18).length

  childCount = (): number => this.household().length - this.adultCount()

  age65Count = (): number => {
    const tp = this.info.taxPayer
    return [
      this.f1040.bornBeforeDate(),
      tp.spouse !== undefined ? this.f1040.spouseBeforeDate() : false
    ].filter((x) => x).length
  }

  /**
   * Applicable household income: household MAGI = California AGI plus
   * California tax-exempt interest.
   */
  householdIncome = (): number => {
    const caAGI =
      this.f1040.l11b() - this.scheduleCA.l27B() + this.scheduleCA.l27C()
    return caAGI + (this.f1040.l2a() ?? 0)
  }

  filingThreshold = (): number =>
    parameters.filingThresholdAGI(
      this.scheduleCA.filingStatus(),
      this.age65Count(),
      this.info.taxPayer.dependents.length
    )

  belowFilingThreshold = (): boolean =>
    this.householdIncome() <= this.filingThreshold()

  /** Worksheet A line 5: flat dollar amount for one uncovered month */
  monthlyFlatAmount = (): number =>
    Math.min(
      parameters.isrPenalty.flatMonthlyMax,
      this.adultCount() * parameters.isrPenalty.flatPerAdult +
        this.childCount() * parameters.isrPenalty.flatPerChild
    )

  /** Worksheet A line 7: annualized flat dollar amount */
  flatDollarAmount = (): number =>
    Math.round((this.uncoveredMonths() * this.monthlyFlatAmount()) / 12)

  /** Step 4 line 5: 2.5% of income over the filing threshold */
  percentageIncomeAmount = (): number =>
    Math.round(
      Math.max(0, this.householdIncome() - this.filingThreshold()) *
        parameters.isrPenalty.incomeRate
    )

  /**
   * Worksheet B line 14: for each uncovered month take the larger of the
   * monthly flat amount and the annual percentage amount, sum, divide
   * by 12.
   */
  worksheetB = (): number =>
    Math.round(
      (this.uncoveredMonths() *
        Math.max(this.monthlyFlatAmount(), this.percentageIncomeAmount())) /
        12
    )

  /** Worksheet A line 8: total uncovered person-months (5+/month counts as 5) */
  personMonths = (): number =>
    this.uncoveredMonths() *
    Math.min(this.household().length, parameters.isrPenalty.bronzeMaxPeople)

  /** State average bronze plan premium cap */
  bronzeCap = (): number =>
    parameters.isrPenalty.bronzePremiumMonthly * this.personMonths()

  /** Individual Shared Responsibility Penalty → Form 540 line 92 */
  penalty = (): number => {
    if (!this.isNeeded()) return 0
    if (this.belowFilingThreshold()) return 0
    const larger = Math.max(this.flatDollarAmount(), this.worksheetB())
    return Math.min(larger, this.bronzeCap())
  }

  fullName = (): string => {
    const primary = this.info.taxPayer.primaryPerson
    const spouse = this.info.taxPayer.spouse
    return [
      `${primary.firstName} ${primary.lastName}`,
      ...(spouse !== undefined
        ? [`${spouse.firstName} ${spouse.lastName}`]
        : [])
    ].join(', ')
  }

  private formatDob = (p: Person<Date>): string => {
    const d = new Date(p.dateOfBirth)
    const mm = (d.getMonth() + 1).toString().padStart(2, '0')
    const dd = d.getDate().toString().padStart(2, '0')
    return `${mm}/${dd}/${d.getFullYear()}`
  }

  /**
   * Part I household rows: person i (0-based) fields start at
   * 1003 + 9i (first, mi, last, ssn, dob, magi, ecn1-3).
   * Part III rows: person i fields start at 2003 + 28i
   * (first, mi, last, col (a) full-year code, then two code fields per
   * month for January (b) through December (m)).
   */
  private personRows = (): FillInstruction[] => {
    const months = this.uncoveredMonths()
    return this.household()
      .slice(0, 12)
      .flatMap((p, i) => {
        const p1 = 1003 + 9 * i
        const p3 = 2003 + 28 * i
        const rows: FillInstruction[] = [
          text(`3853 Form ${p1}`, p.firstName),
          text(`3853 Form ${p1 + 2}`, p.lastName),
          text(`3853 Form ${p1 + 3}`, p.ssid),
          text(`3853 Form ${p1 + 4}`, this.formatDob(p)),
          text(`3853 Form ${p3}`, p.firstName),
          text(`3853 Form ${p3 + 2}`, p.lastName)
        ]
        if (months >= 12) {
          // No coverage all year: code X in column (a)
          rows.push(text(`3853 Form ${p3 + 3}`, 'X'))
        } else {
          // Months without coverage assumed to start in January: code X;
          // remaining months had coverage: code Z (full MEC).
          for (let m = 0; m < 12; m++) {
            rows.push(
              text(`3853 Form ${p3 + 4 + 2 * m}`, m < months ? 'X' : 'Z')
            )
          }
        }
        return rows
      })
  }

  fillInstructions = (): FillInstructions => [
    text('3853 Form 1001', this.fullName()),
    text('3853 Form 1002', this.info.taxPayer.primaryPerson.ssid),
    ...this.personRows()
  ]

  fields = (): Field[] => this.fillInstructions().map((i) => i.value)
}
