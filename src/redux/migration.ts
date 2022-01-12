import { enumKeys } from 'ustaxes/core/util'
import { TaxYears } from 'ustaxes/data'
import { YearsTaxesState } from '.'
import { blankState } from './reducer'

/**
 * Ensures all default fields are present on each year's data
 * @returns state, mutated
 */
export function migrateEachYear<S extends YearsTaxesState>(state: S): S {
  return enumKeys(TaxYears).reduce(
    (acc, year) => ({
      ...acc,
      [year]: {
        ...blankState,
        ...acc[year]
      }
    }),
    state
  )
}
