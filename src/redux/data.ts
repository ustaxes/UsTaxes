import { Asset, Information, Person, TaxYear } from 'ustaxes/core/data'
import { blankState } from './reducer'

/**
 * This is a simplified form of our global TaxesState
 * which allows TaxesState to be viewed as if if contained
 * data for a single year.
 */
export type TaxesState = { information: Information }

export type YearsTaxesState<D = Date> = { [K in TaxYear]: Information<D> } & {
  assets: Asset<D>[]
  activeYear: TaxYear
}

export const blankYearTaxesState: YearsTaxesState = {
  assets: [],
  Y2019: blankState,
  Y2020: blankState,
  Y2021: blankState,
  Y2022: blankState,
  activeYear: 'Y2020'
}

export const dateToStringPerson = <P extends Person<Date>>(
  p: P
): Omit<P, 'dateOfBirth'> & { dateOfBirth: string } => ({
  ...p,
  dateOfBirth: p.dateOfBirth.toISOString()
})

export const stringToDatePerson = <P extends Person<string>>(
  p: P
): Omit<P, 'dateOfBirth'> & { dateOfBirth: Date } => ({
  ...p,
  dateOfBirth: new Date(p.dateOfBirth)
})

export const stringToDateInfo = <I extends Information<string>>(
  info: I
): Information<Date> => ({
  ...info,
  healthSavingsAccounts: info.healthSavingsAccounts.map((h) => ({
    ...h,
    startDate: new Date(h.startDate),
    endDate: new Date(h.endDate)
  })),
  taxPayer: {
    ...info.taxPayer,
    primaryPerson: info.taxPayer.primaryPerson
      ? stringToDatePerson(info.taxPayer.primaryPerson)
      : undefined,
    dependents: info.taxPayer.dependents.map((d) => stringToDatePerson(d)),
    spouse: info.taxPayer.spouse
      ? stringToDatePerson(info.taxPayer.spouse)
      : undefined
  }
})

export const infoToStringInfo = <I extends Information<Date>>(
  info: I
): Information<string> => ({
  ...info,
  healthSavingsAccounts: info.healthSavingsAccounts.map((h) => ({
    ...h,
    startDate: h.startDate.toISOString(),
    endDate: h.endDate.toISOString()
  })),
  taxPayer: {
    ...info.taxPayer,
    primaryPerson: info.taxPayer.primaryPerson
      ? dateToStringPerson(info.taxPayer.primaryPerson)
      : undefined,
    dependents: info.taxPayer.dependents.map((d) => dateToStringPerson(d)),
    spouse: info.taxPayer.spouse
      ? dateToStringPerson(info.taxPayer.spouse)
      : undefined
  }
})
