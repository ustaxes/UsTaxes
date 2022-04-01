import * as arbitraries from './arbitraries'
import * as fc from 'fast-check'
import { Address } from '../data'
import log from '../log'
import * as validators from '../data/validate'

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  log.setDefaultLevel(log.levels.SILENT)
})

describe('validation', () => {
  it('should validate some data', () => {
    fc.assert(
      fc.property(arbitraries.primaryPerson, (data) => {
        expect(validators.primaryPerson?.(data)).toEqual(true)
      })
    )
  })

  it('checktype should throw', () => {
    fc.assert(
      fc.property(arbitraries.primaryPerson, (data) => {
        expect(() =>
          validators.checkType(
            {
              ...data,
              address: '123 hi street' as unknown as Address
            },
            validators.primaryPerson!
          )
        ).toThrow()
      })
    )
  })

  it('checks dependent', () => {
    fc.assert(
      fc.property(arbitraries.forYear(2020).dependent(), (data) => {
        expect(validators.checkType(data, validators.dependent!)).toEqual(data)
      })
    )
  })

  it('checkType should not modify correct data', () => {
    fc.assert(
      fc.property(arbitraries.forYear(2020).information(), (info) => {
        expect(validators.checkType(info, validators.information!)).toEqual(
          info
        )
      })
    )
  })
})
