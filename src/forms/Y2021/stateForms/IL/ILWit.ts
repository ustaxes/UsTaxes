import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { IncomeW2, Information, PersonRole, State } from 'ustaxes/core/data'

type FormType =
  | 'W' // W-2
  | 'WG' // W2-G
  | 'R' // 1099-R
  | 'G' // 1099-G
  | 'M' // 1099-MISC
  | 'O' // 1099-OID
  | 'D' // 1099-DIV
  | 'I' // 1099-INT
  | 'S' // 1042-S
  | 'B' // 1099-B
  | 'K' // 1099-K
  | 'N' // 1099-NEC

interface WithholdingForm {
  formType: [FormType, FormType | undefined]
  role: PersonRole
  ein: string
  federalWages: number
  ilWages: number
  ilTax: number
}

const toWithholdingForm = (w2: IncomeW2): WithholdingForm | undefined => {
  if (
    w2.stateWages !== undefined &&
    w2.stateWithholding !== undefined &&
    w2.employer?.EIN !== undefined
  ) {
    return {
      formType: ['W', undefined],
      ein: w2.employer.EIN,
      federalWages: w2.income,
      ilWages: w2.stateWages,
      ilTax: w2.stateWithholding,
      role: w2.personRole
    }
  }
}

/**
 * Each ILWIT form supports 5 withholding forms for
 * primary taxpayer and 5 for spouse
 * TODO: support more than 5 for each
 */
export class ILWIT extends Form {
  info: Information
  f1040: F1040
  formName = 'IL-WIT'
  state: State = 'IL'
  formOrder = 31
  methods: FormMethods
  formIndex: number

  static WITHHOLDING_FORMS_PER_PAGE = 5

  constructor(info: Information, f1040: F1040, subFormIndex = 0) {
    super()
    this.info = info
    this.f1040 = f1040
    this.methods = new FormMethods(this)
    this.formIndex = subFormIndex
  }

  attachments = (): Form[] => {
    // If this is the head form, see if we need
    // more copies. For example if the SSIDs have 4 and 11 forms,
    // we will need 2 extra copies. this one will have 4 + 5,
    // next will have 0 + 5, last will have 0 + 1
    if (this.formIndex === 0) {
      const copiesNeeded =
        Math.ceil(
          Math.max(
            ...[PersonRole.PRIMARY, PersonRole.SPOUSE].map(
              (r) =>
                this.methods
                  .stateW2s()
                  .filter((w2) => (w2.stateWithholding ?? 0) > 0)
                  .filter((w2) => w2.personRole === r).length
            )
          ) / ILWIT.WITHHOLDING_FORMS_PER_PAGE
        ) - 1

      return Array(copiesNeeded)
        .fill(undefined)
        .map((x, i) => new ILWIT(this.info, this.f1040, i + 1))
    }

    return []
  }

  /**
   * Index 0: Help
   */
  Help = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.Help()

  /**
   * Index 1: Your name
   */
  Yourname = (): string | undefined => {
    const person = this.info.taxPayer.primaryPerson
    return [person?.firstName, person?.lastName].flat().join(' ')
  }

  f1 = (): string | undefined => this.Yourname()

  /**
   * Index 2: Your SSN-3
   */
  YourSSN3 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(0, 3)

  f2 = (): string | undefined => this.YourSSN3()

  /**
   * Index 3: Your SSN-2
   */
  YourSSN2 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(3, 5)

  f3 = (): string | undefined => this.YourSSN2()

  /**
   * Index 4: Your SSN-4
   */
  YourSSN4 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(5)

  f4 = (): string | undefined => this.YourSSN4()

  allWithholdingForms = (): WithholdingForm[] =>
    this.methods
      .stateW2s()
      .map((w2) => toWithholdingForm(w2))
      .filter((x) => x !== undefined) as WithholdingForm[]

  formsByRole = (role: PersonRole): WithholdingForm[] =>
    this.allWithholdingForms().filter((w2) => w2.role === role)

  // TODO: handle more than 5 withholding forms.
  primaryForms = (): WithholdingForm[] =>
    this.formsByRole(PersonRole.PRIMARY).slice(0, 5)

  // TODO: handle more than 5 withholding forms.
  spouseForms = (): WithholdingForm[] =>
    this.formsByRole(PersonRole.SPOUSE).slice(0, 5)

  /**
   * 6 x 5 grid for primary taxpayer, rowwise.
   */
  formGrid = (forms: WithholdingForm[]): (string | number | undefined)[] => [
    ...forms.flatMap((form) => [
      ...form.formType,
      form.ein,
      form.federalWages,
      form.ilWages,
      form.ilTax
    ]),
    ...Array.from<undefined>(Array(5 - forms.length)).flatMap(() =>
      Array<undefined>(5).fill(undefined)
    )
  ]

  /**
   * Primary ssid withholding, Column B -> Column E
   */
  f5tof34 = (): (string | number | undefined)[] =>
    this.formGrid(this.primaryForms())

  /**
   * Index 35: Spouse's name
   */
  Spousesname = (): string | undefined => {
    const spouse = this.info.taxPayer.spouse
    if (spouse !== undefined) {
      return `${spouse.firstName} ${spouse.lastName}`
    }
  }

  f35 = (): string | undefined => this.Spousesname()

  /**
   * Index 28: Spouse's SSN-3
   */
  SpousesSSN3 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(0, 3)

  f36 = (): string | undefined => this.SpousesSSN3()

  /**
   * Index 29: Spouse's SSN-2
   */
  SpousesSSN2 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(3, 5)

  f37 = (): string | undefined => this.SpousesSSN2()

  /**
   * Index 30: Spouse's SSN-4
   */
  SpousesSSN4 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(5)

  f38 = (): string | undefined => this.SpousesSSN4()

  /**
   * Spouse ssid forms, Column B -> Column E
   */
  f39tof68 = (): (string | number | undefined)[] =>
    this.formGrid(this.spouseForms())

  /**
   * Index 51: Total amount
   */
  Totalamount = (): number | undefined => {
    if (this.formIndex === 0) {
      return this.allWithholdingForms().reduce((s, f) => s + f.ilTax, 0)
    }
  }

  f69 = (): number | undefined => this.Totalamount()

  fields = (): Field[] => [
    this.f0(),
    this.f1(),
    this.f2(),
    this.f3(),
    this.f4(),
    ...this.f5tof34(),
    this.f35(),
    this.f36(),
    this.f37(),
    this.f38(),
    ...this.f39tof68()
  ]
}

const makeILWIT = (info: Information, f1040: F1040): ILWIT =>
  new ILWIT(info, f1040)

export default makeILWIT
