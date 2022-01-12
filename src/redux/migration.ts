import { enumKeys } from 'ustaxes/core/util'
import { TaxYears } from 'ustaxes/data'
import { blankState } from './reducer'
import { USTPersistedState } from './store'

/**
 * Ensures all default fields are present on each year's data
 * @returns state, mutated
 */
export const migrateEachYear = <S extends USTPersistedState>(state: S): S =>
  enumKeys(TaxYears).reduce(
    (acc, year) => ({
      ...acc,
      [year]: {
        ...blankState,
        ...acc[year]
      }
    }),
    state
  )
