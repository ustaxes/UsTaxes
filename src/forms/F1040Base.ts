import {
  FilingStatus,
  Income1099B,
  Income1099Div,
  Income1099Int,
  Income1099R,
  Income1099SSA,
  Income1099Type,
  Information,
  Person,
  PrimaryPerson,
  ScheduleK1Form1065,
  Supported1099,
  TaxPayer
} from 'ustaxes/core/data'
import Form from 'ustaxes/core/irsForms/Form'
import { Either, left, right } from 'ustaxes/core/util'
import { F1040Error } from './errors'

export type ValidatedTaxpayer = TaxPayer & {
  filingStatus: FilingStatus
  primaryPerson: PrimaryPerson
}

export interface ValidatedInformation extends Information {
  taxPayer: ValidatedTaxpayer
}

const isValidTaxpayer = (tp: TaxPayer): tp is ValidatedTaxpayer =>
  tp.filingStatus !== undefined && tp.primaryPerson !== undefined

export const isValidInformation = (
  info: Information
): info is ValidatedInformation => isValidTaxpayer(info.taxPayer)

export const validate = (
  info: Information
): Either<F1040Error[], ValidatedInformation> => {
  const result: F1040Error[] = []
  if (info.taxPayer.filingStatus === undefined) {
    result.push(F1040Error.filingStatusUndefined)
  }

  const fs = info.taxPayer.filingStatus
  const numDependents = info.taxPayer.dependents.length
  const hasSpouse = info.taxPayer.spouse !== undefined
  const hasDependents = numDependents > 0

  if (
    fs === undefined ||
    ([FilingStatus.S, FilingStatus.HOH].some((x) => x === fs) && hasSpouse) ||
    (fs === FilingStatus.HOH && !hasDependents)
  ) {
    result.push(F1040Error.filingStatusRequirementsNotMet)
  }

  if (result.length > 0) {
    return left(result)
  }

  if (isValidInformation(info)) {
    return right(info)
  }

  // Should never get here. Types from above are not exhaustive but
  // logic is.
  throw new Error('Invalid information')
}

export default abstract class F1040Base extends Form {
  info: ValidatedInformation

  constructor(info: ValidatedInformation) {
    super()
    this.info = info
  }

  namesString = (): string => {
    const ps: Person[] = [
      this.info.taxPayer.primaryPerson,
      this.info.taxPayer.spouse
    ]
      .filter((p: Person | undefined) => p !== undefined)
      .map((p: Person | undefined) => p as Person)

    return ps.map((p: Person) => `${p.firstName} ${p.lastName}`).join(', ')
  }

  k1sWithInterest = (): ScheduleK1Form1065[] =>
    this.info.scheduleK1Form1065s.filter((k1) => k1.interestIncome > 0)

  f1099sByType = (ft: Income1099Type): Supported1099[] =>
    this.info.f1099s.filter((f1099) => f1099.type === ft)

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
    this.fullName(this.info.taxPayer.primaryPerson)

  spouseFullName = (): string | undefined =>
    this.info.taxPayer.spouse !== undefined
      ? this.fullName(this.info.taxPayer.spouse)
      : undefined
}
