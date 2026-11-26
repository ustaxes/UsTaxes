import * as fc from 'fast-check'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import { stateToString, stringToState } from 'ustaxes/redux/fs'

describe('FS Recover / Save', () => {
  it('should restore the same data it created', () => {
    fc.assert(
      fc.property(arbitraries.yearsTaxesState, (state) => {
        expect(stringToState(stateToString(state))).toEqual(state)
      }),
      { numRuns: 10 }
    )
  })

  it('round-trips an asset with no open date', () => {
    const state = {
      assets: [
        {
          name: 'Various lots',
          positionType: 'Security',
          openDate: undefined,
          holdingPeriod: 'Long Term',
          closeDate: new Date('2025-06-01'),
          openPrice: 100,
          openFee: 0,
          closePrice: 200,
          quantity: 1
        }
      ]
    }
    expect(stringToState(stateToString(state))).toEqual(state)
  })
})
