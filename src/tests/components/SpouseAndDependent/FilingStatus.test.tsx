/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

// import * as fc from 'fast-check'
import { TaxYear } from 'ustaxes/data'
import log from 'ustaxes/core/log'

// import { YearsTaxesState } from 'ustaxes/redux'
// import { blankState } from 'ustaxes/redux/reducer'
// import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as yarbitraries from '../../arbitraries'
import { SpouseAndDependentTestPage } from './Pages'
import { filingStatuses, TaxPayer } from 'ustaxes/core/data'
import { waitFor } from '@testing-library/react'

beforeEach(() => {
  log.setLevel(log.levels.TRACE)
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

jest.setTimeout(10000)

describe('FilingStatus', () => {
  jest.setTimeout(20000)

  // const twoYears = (): fc.Arbitrary<[TaxYear, TaxYear, YearsTaxesState]> =>
  //   fc.tuple(yarbitraries.taxYear, yarbitraries.taxYear).chain(([y1, y2]) =>
  //     fc
  //       .tuple(
  //         new arbitraries.Arbitraries(TaxYears[y1]).taxPayer(),
  //         new arbitraries.Arbitraries(TaxYears[y2]).taxPayer()
  //       )
  //       .map(([tp1, tp2]): [TaxYear, TaxYear, YearsTaxesState] => [
  //         y1,
  //         y2,
  //         {
  //           [y1]: { ...blankState, taxPayer: tp1 },
  //           [y2]: { ...blankState, taxPayer: tp2 },
  //           activeYear: y1
  //         }
  //       ])
  //   )

  it('should update on year change', async () => {
    const state = yarbitraries.justOneState()
    const y1: TaxYear = 'Y2020'
    const y2: TaxYear = 'Y2021'

    state.activeYear = y1
    const page = new SpouseAndDependentTestPage(state)

    expect(page.filingStatus.dropdown()).toBeInTheDocument()

    const checkFs = (tp: TaxPayer) => {
      if (
        tp.filingStatus !== undefined &&
        filingStatuses(tp).includes(tp.filingStatus)
      ) {
        expect(page.filingStatus.selected()).toEqual(tp.filingStatus)
      } else {
        expect(page.filingStatus.selected()).toEqual('')
      }
    }

    expect(state[y1]?.taxPayer).not.toBeUndefined()
    expect(state[y2]?.taxPayer).not.toBeUndefined()

    checkFs(state[y1]?.taxPayer!)
    await page.yearStatus.setYear(y2)

    await waitFor(() => {
      expect(page.store.getState().activeYear).toEqual(y2)
    })
    await waitFor(() => {
      expect(page.yearStatus.yearValue()).toEqual(y2)
    })
    const tp = state[y2]?.taxPayer
    if (tp !== undefined) {
      await waitFor(() => {
        checkFs(tp)
      })
    }
    return true
  })
})
