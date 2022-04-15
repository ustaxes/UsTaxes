/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { enumKeys } from 'ustaxes/core/util'
import { TaxYears } from 'ustaxes/core/data'
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

    // Ensure interestIncome on K1s
    acc[year].scheduleK1Form1065s.forEach((k1) => {
      if (k1.interestIncome === undefined) {
        k1.interestIncome = 0
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
