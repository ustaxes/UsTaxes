import { enumKeys } from 'ustaxes/core/util'
import { TaxYears } from 'ustaxes/data'
import { YearsTaxesState } from '.'
import { blankState } from './reducer'

/**
 * Ensures all default fields are present on each year's data
 * @returns state, mutated
 */
export function migrateEachYear(state: YearsTaxesState) {
  for (const year of enumKeys(TaxYears)) {
    // copy default fields into each year's data
    state[year] = {
      ...blankState,
      ...state[year]
    }
  }
  return state
}
