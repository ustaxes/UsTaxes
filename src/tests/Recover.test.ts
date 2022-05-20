import * as fc from 'fast-check'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import { stateToString, stringToState } from 'ustaxes/redux/fs'

describe('FS Recover / Save', () => {
  it('should restore the same data it created', () => {
    fc.assert(
      fc.property(arbitraries.yearsTaxesState, (state) => {
        expect(stringToState(stateToString(state))).toEqual(state)
      })
    )
  })
})
