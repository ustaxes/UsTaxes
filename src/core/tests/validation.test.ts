import * as arbitraries from './arbitraries'
import * as fc from 'fast-check'
import { Address, Dependent, Information, PrimaryPerson } from '../data'
import log from '../log'
import * as validators from '../data/validate'
import { dateToStringPerson, infoToStringInfo } from 'ustaxes/redux/data'

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  log.setDefaultLevel(log.levels.SILENT)
})

const primaryPerson: fc.Arbitrary<PrimaryPerson<string>> =
  arbitraries.primaryPerson.map((p) => dateToStringPerson(p))

const information: fc.Arbitrary<Information<string>> = arbitraries
  .forYear(2020)
  .information()
  .map((i) => infoToStringInfo(i))

const dependent: fc.Arbitrary<Dependent<string>> = arbitraries
  .forYear(2020)
  .dependent()
  .map((p) => ({
    ...p,
    dateOfBirth: p.dateOfBirth.toISOString()
  }))

describe('validation', () => {
  it('should validate some data', () => {
    fc.assert(
      fc.property(primaryPerson, (data) => {
        expect(validators.primaryPerson(data)).toEqual(true)
      })
    )
  })

  it('checktype should throw', () => {
    fc.assert(
      fc.property(primaryPerson, (data) => {
        expect(() =>
          validators.checkType(
            {
              ...data,
              address: '123 hi street' as unknown as Address
            },
            validators.primaryPerson
          )
        ).toThrow()
      })
    )
  })

  it('checks dependent', () => {
    fc.assert(
      fc.property(dependent, (data) => {
        expect(validators.checkType(data, validators.dependent)).toEqual(data)
      })
    )
  })

  it('checkType should not modify correct data', () => {
    fc.assert(
      fc.property(information, (info) => {
        expect(validators.checkType(info, validators.information)).toEqual(info)
      })
    )
  })
})
