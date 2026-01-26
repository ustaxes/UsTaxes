import * as fc from 'fast-check'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import { stateToString, stringToImportState } from 'ustaxes/redux/fs'

describe('FS Recover / Save', () => {
  it('should restore the same data it created', () => {
    fc.assert(
      fc.property(arbitraries.yearsTaxesState, (state) => {
        expect(stringToImportState(stateToString(state))).toEqual(state)
      }),
      { numRuns: 10 }
    )
  })
})
