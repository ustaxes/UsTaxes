import { enumKeys } from 'ustaxes/core/util'
import { TaxYears } from 'ustaxes/data'
import { blankState } from './reducer'
import { USTState } from './store'

/**
 * Ensures all default fields are present on each year's data
 * @returns state
 */
export const migrateEachYear = <S extends USTState>(state: S): S =>
  enumKeys(TaxYears).reduce((acc, year) => {
    // Make sure SS wages are set on W2s
    acc[year].w2s.forEach((w2) => {
      if (w2.ssWages === undefined) {
        w2.ssWages = 0
      }
    })

    return {
      ...acc,
      [year]: {
        ...blankState,
        ...acc[year]
      }
    }
  }, state)
