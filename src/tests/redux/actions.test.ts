import * as arbitraries from 'ustaxes-core/src/tests/arbitraries'
import * as fc from 'fast-check'
import * as validators from 'ustaxes-core/src/data/validate'
import Ajv from 'ajv'

const ajv = new Ajv()

describe('action creator', () => {
  it('should create an action with data', () => {
    const property = arbitraries.forYear(2020).property()
    fc.assert(
      fc.property(property, (prop) =>
        expect(validators.checkType(prop, validators.property(ajv))).toEqual(
          prop
        )
      )
    )
  })
})
