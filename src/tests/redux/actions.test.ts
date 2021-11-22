import * as arbitraries from '../../forms/Y2020/tests/arbitraries'
import * as fc from 'fast-check'
import * as validators from '../../forms/Y2020/data/validate'
import schema from '../../forms/Y2020/data/validation.json'
import Ajv from 'ajv'

const ajv = new Ajv({ schemas: [schema] })

describe('action creator', () => {
  it('should create an action with data', () => {
    fc.assert(
      fc.property(arbitraries.property, (prop) =>
        expect(validators.checkType(prop, validators.property(ajv))).toEqual(
          prop
        )
      )
    )
  })
})
