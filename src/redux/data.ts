import { Asset, Information, TaxYear } from 'ustaxes/core/data'
import { blankState } from './reducer'

/**
 * This is a simplified form of our global TaxesState
 * which allows TaxesState to be viewed as if if contained
 * data for a single year.
 */
export type TaxesState = { information: Information }

export type YearsTaxesState = { [K in TaxYear]: Information } & {
  assets: Asset<Date>[]
  activeYear: TaxYear
}

export const blankYearTaxesState: YearsTaxesState = {
  assets: [],
  Y2019: blankState,
  Y2020: blankState,
  Y2021: blankState,
  activeYear: 'Y2020'
}
