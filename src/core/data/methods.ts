import {
  F3921,
  Ira,
  ItemizedDeductions,
  Responses,
  ScheduleK1Form1065
} from '.'
import {
  EstimatedTaxPayments,
  F1098e,
  HealthSavingsAccount,
  Income1099B,
  Income1099Div,
  Income1099Int,
  Income1099R,
  Income1099SSA,
  Income1099Type,
  IncomeW2,
  Information,
  Person,
  Property,
  Refund,
  StateResidency,
  Supported1099,
  TaxPayer
} from '.'

export default class InformationMethods implements Information {
  f1099s: Supported1099[]
  w2s: IncomeW2[]
  estimatedTaxes: EstimatedTaxPayments[]
  realEstate: Property[]
  f1098es: F1098e[]
  f3921s: F3921[]
  scheduleK1Form1065s: ScheduleK1Form1065[]
  itemizedDeductions: ItemizedDeductions | undefined
  refund?: Refund
  taxPayer: TaxPayer
  questions: Responses
  stateResidencies: StateResidency[]
  healthSavingsAccounts: HealthSavingsAccount[]
  individualRetirementArrangements: Ira[]

  constructor(info: Information) {
    this.f1099s = info.f1099s
    this.w2s = info.w2s
    this.estimatedTaxes = info.estimatedTaxes
    this.realEstate = info.realEstate
    this.f1098es = info.f1098es
    this.f3921s = info.f3921s
    this.scheduleK1Form1065s = info.scheduleK1Form1065s
    this.itemizedDeductions = info.itemizedDeductions
    this.refund = info.refund
    this.taxPayer = info.taxPayer
    this.questions = info.questions
    this.stateResidencies = info.stateResidencies
    this.healthSavingsAccounts = info.healthSavingsAccounts
    this.individualRetirementArrangements =
      info.individualRetirementArrangements
  }

  f1099sByType = (ft: Income1099Type): Supported1099[] =>
    this.f1099s.filter((f1099) => f1099.type === ft)

  f1099Ints = (): Income1099Int[] =>
    this.f1099sByType(Income1099Type.INT) as Income1099Int[]

  f1099Divs = (): Income1099Div[] =>
    this.f1099sByType(Income1099Type.DIV) as Income1099Div[]

  f1099Bs = (): Income1099B[] =>
    this.f1099sByType(Income1099Type.B) as Income1099B[]

  f1099rs = (): Income1099R[] =>
    this.f1099sByType(Income1099Type.R) as Income1099R[]

  f1099ssas = (): Income1099SSA[] =>
    this.f1099sByType(Income1099Type.SSA) as Income1099SSA[]

  fullName = (person: Person): string =>
    `${person.firstName} ${person.lastName}`

  primaryFullName = (): string | undefined =>
    this.taxPayer.primaryPerson !== undefined
      ? this.fullName(this.taxPayer.primaryPerson)
      : undefined

  spouseFullName = (): string | undefined =>
    this.taxPayer.spouse !== undefined
      ? this.fullName(this.taxPayer.spouse)
      : undefined
}
