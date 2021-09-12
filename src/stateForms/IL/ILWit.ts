import Form, { FormMethods } from '../Form'
import F1040 from '../../irsForms/F1040'
import { Field } from '../../pdfFiller'
import { IncomeW2, Information, PersonRole, State } from '../../redux/data'

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
  formType: FormType
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
      formType: 'W',
      ein: w2.employer?.EIN ?? '',
      federalWages: w2.income,
      ilWages: w2.stateWages,
      ilTax: w2.stateWithholding
    }
  }
}

/**
 * Each ILWIT form supports 5 withholding forms for
 * primary taxpayer and 5 for spouse
 * TODO: support more than 5 for each
 */
export class ILWIT implements Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  formOrder = 31
  methods: FormMethods

  constructor(info: Information, f1040: F1040) {
    this.info = info
    this.f1040 = f1040
    this.formName = 'IL-WIT'
    this.state = 'IL' // <-- Fill here
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => []

  /**
   * Index 0: Help
   */
  Help = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.Help()

  /**
   * Index 1: Reset
   */
  Reset = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.Reset()

  /**
   * Index 2: Print
   */
  Print = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.Print()

  /**
   * Index 3: Your name
   */
  Yourname = (): string | undefined => {
    const person = this.info.taxPayer.primaryPerson
    return `${person?.firstName} ${person?.lastName}`
  }

  f3 = (): string | undefined => this.Yourname()

  /**
   * Index 4: Your SSN-3
   */
  YourSSN3 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(0, 3)

  f4 = (): string | undefined => this.YourSSN3()

  /**
   * Index 5: Your SSN-2
   */
  YourSSN2 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(3, 5)

  f5 = (): string | undefined => this.YourSSN2()

  /**
   * Index 6: Your SSN-4
   */
  YourSSN4 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(5)

  f6 = (): string | undefined => this.YourSSN4()

  formsByRole = (role: PersonRole): WithholdingForm[] =>
    this.methods
      .stateW2s()
      .filter((w2) => w2.personRole === role)
      .map((w2) => toWithholdingForm(w2))
      .filter((x) => x !== undefined) as WithholdingForm[]

  primaryForms = (): WithholdingForm[] => this.formsByRole(PersonRole.PRIMARY)

  spouseForms = (): WithholdingForm[] => this.formsByRole(PersonRole.SPOUSE)

  /**
   * 4 x 5 grid for primary taxpayer, columnwise
   * Note the form type column is indexed after all this.
   *
   * Index 7: EIN - 1
   */
  formGrid = (forms: WithholdingForm[]): (string | number | undefined)[] =>
    [
      forms.map((form) => form.ein),
      forms.map((form) => form.federalWages),
      forms.map((form) => form.ilWages),
      forms.map((form) => form.ilTax)
    ].flatMap((column) => [
      ...column,
      ...Array(5 - column.length).fill(undefined)
    ])

  f7Tof26 = (): (string | number | undefined)[] =>
    this.formGrid(this.primaryForms())

  /**
   * Index 27: Spouse's name
   */
  Spousesname = (): string | undefined => {
    const spouse = this.info.taxPayer.spouse
    if (spouse !== undefined) {
      return `${spouse.firstName} ${spouse.lastName}`
    }
  }

  f27 = (): string | undefined => this.Spousesname()

  /**
   * Index 28: Spouse's SSN-3
   */
  SpousesSSN3 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(0, 3)

  f28 = (): string | undefined => this.SpousesSSN3()

  /**
   * Index 29: Spouse's SSN-2
   */
  SpousesSSN2 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(3, 5)

  f29 = (): string | undefined => this.SpousesSSN2()

  /**
   * Index 30: Spouse's SSN-4
   */
  SpousesSSN4 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(5)

  f30 = (): string | undefined => this.SpousesSSN4()

  f31tof50 = (): (string | number | undefined)[] =>
    this.formGrid(this.spouseForms())

  /**
   * Index 51: Total amount
   */
  Totalamount = (): number | undefined =>
    this.primaryForms()
      .map((f) => f.ilTax)
      .concat(this.spouseForms().map((f) => f.ilTax))
      .reduce((s, a) => s + a, 0)

  f51 = (): number | undefined => this.Totalamount()

  /**
   * Index 52 -> 56
   * Spouse form types
   */

  formTypesColumn = (forms: WithholdingForm[]): (string | undefined)[] => [
    ...forms.map((f) => f.formType),
    ...Array(5 - forms.length).fill(undefined)
  ]

  f52to56 = (): (string | undefined)[] =>
    this.formTypesColumn(this.spouseForms())

  /**
   * Index 57 -> 61
   * Primary form types
   */
  f57to61 = (): (string | undefined)[] =>
    this.formTypesColumn(this.primaryForms())

  /**
   * There's a second field in the Column A column,
   * purpose not clear.
   */
  f62to71 = (): undefined[] => Array(10).fill(undefined)

  fields = (): Field[] => [
    this.f0(),
    this.f1(),
    this.f2(),
    this.f3(),
    this.f4(),
    this.f5(),
    this.f6(),
    ...this.f7Tof26(),
    this.f27(),
    this.f28(),
    this.f29(),
    this.f30(),
    ...this.f31tof50(),
    this.f51(),
    ...this.f52to56(),
    ...this.f57to61(),
    ...this.f62to71()
  ]
}

const makeILWIT = (info: Information, f1040: F1040): ILWIT =>
  new ILWIT(info, f1040)

export default makeILWIT
