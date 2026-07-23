import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
import { FilingStatus, PersonRole, State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import parameters from './Parameters'

/**
 * FTB 3506 — Child and Dependent Care Expenses Credit.
 *
 * California's credit is the federal Form 2441 credit computation
 * multiplied by a percentage (50%/43%/34%) based on federal AGI, zero
 * above $100,000. Assumes all care was provided in California (resident
 * return).
 *
 * Provider details (Part 2) and per-person expense rows are not
 * collected by the app and must be completed by hand on the printed
 * form; the computed credit lines are filled.
 */
export default class CA3506 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 2
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'FTB3506'
    this.state = 'CA'
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => []

  isNeeded = (): boolean => this.l12() > 0

  earnedIncome = (role: PersonRole.PRIMARY | PersonRole.SPOUSE): number =>
    this.info.w2s
      .filter((w2) => w2.personRole === role)
      .reduce((sum, w2) => sum + w2.income, 0) +
    (this.info.selfEmployedIncome
      ?.filter((s) => s.personRole === role)
      .reduce((sum, s) => sum + Math.max(0, s.grossReceipts - s.expenses), 0) ??
      0)

  /** Line 3: qualified expenses, capped at $3,000 / $6,000 */
  l3 = (): number => {
    const dce = this.info.dependentCareExpenses
    if (dce === undefined || dce.qualifyingPersonCount < 1) return 0
    const cap = dce.qualifyingPersonCount >= 2 ? 6000 : 3000
    return Math.min(dce.totalExpenses, cap)
  }

  /** Line 4: your earned income */
  l4 = (): number => this.earnedIncome(PersonRole.PRIMARY)

  /** Line 5: spouse's earned income on a joint return, else line 4 */
  l5 = (): number =>
    this.info.taxPayer.filingStatus === FilingStatus.MFJ
      ? this.earnedIncome(PersonRole.SPOUSE)
      : this.l4()

  l6 = (): number => Math.min(this.l3(), this.l4(), this.l5())

  /** Line 7: federal-style credit decimal from federal AGI */
  l7 = (): number => {
    const agi = this.f1040.l11b()
    if (agi <= 15000) return 0.35
    if (agi > 43000) return 0.2
    return 0.35 - Math.ceil((agi - 15000) / 2000) * 0.01
  }

  l8 = (): number => Math.round(this.l6() * this.l7())

  /** Line 9: California credit decimal from federal AGI */
  l9 = (): number => parameters.dependentCareCreditDecimal(this.f1040.l11b())

  l10 = (): number => Math.round(this.l8() * this.l9())

  /** Line 11: credit for prior year expenses (not supported) */
  l11 = (): number | undefined => undefined

  /** Line 12: credit → Form 540 line 40 */
  l12 = (): number => this.l10() + (this.l11() ?? 0)

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

  fillInstructions = (): FillInstructions => [
    text('3506 - 1000', this.fullName()),
    text('3506 - 1001', this.info.taxPayer.primaryPerson.ssid),
    text('3506 - 1049', this.l3()),
    text('3506 - 1050', this.l4()),
    text('3506 - 1051', this.l5()),
    text('3506 - 1052', this.l6()),
    // Decimal fields are 2 characters; the "0." is preprinted on the form
    text('3506 - 1053', Math.round(this.l7() * 100).toString()),
    text('3506 - 1054', this.l8()),
    text('3506 - 1055', Math.round(this.l9() * 100).toString()),
    text('3506 - 1056', this.l10()),
    text('3506 - 1057', this.l11()),
    text('3506 - 1058', this.l12())
  ]

  fields = (): Field[] => this.fillInstructions().map((i) => i.value)
}
