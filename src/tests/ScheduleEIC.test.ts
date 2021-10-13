/* eslint @typescript-eslint/no-empty-function: "off" */

import fc from 'fast-check'
import { waitFor } from '@testing-library/react'
import * as arbitraries from './arbitraries'
import * as federal from 'ustaxes/data/federal'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((_, reducers) => reducers)
  }
})

beforeAll(async () => jest.spyOn(console, 'warn').mockImplementation(() => {}))

describe('ScheduleEIC', () => {
  it('should disallow EIC for income below threshold', () => {
    fc.assert(
      fc.property(arbitraries.f1040(), ([f1040]) => {
        if (f1040.info.taxPayer.filingStatus !== undefined) {
          const formula = federal.EIC.formulas[f1040.info.taxPayer.filingStatus]
          if (
            formula !== undefined &&
            f1040.wages() < formula[0][1].lowerBound
          ) {
            expect(f1040.scheduleEIC?.allowed(f1040) ?? false).toBe(false)
            expect(f1040.scheduleEIC?.credit(f1040) ?? 0).toBe(0)
          }
        }
      })
    )
  })
})
