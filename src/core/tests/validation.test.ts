import * as arbitraries from './arbitraries'
import * as fc from 'fast-check'
import { Address, Dependent, Information, PrimaryPerson, Person } from '../data'
import log from '../log'
import * as validators from '../data/validate'

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  log.setDefaultLevel(log.levels.SILENT)
})

const dateToStringPerson = <P extends Person<Date>>(
  p: P
): Omit<P, 'dateOfBirth'> & { dateOfBirth: string } => ({
  ...p,
  dateOfBirth: p.dateOfBirth.toISOString()
})

const primaryPerson: fc.Arbitrary<PrimaryPerson<string>> =
  arbitraries.primaryPerson.map((p) => dateToStringPerson(p))

const information: fc.Arbitrary<Information<string>> = arbitraries
  .forYear(2020)
  .information()
  .map((i) => ({
    ...i,
    healthSavingsAccounts: i.healthSavingsAccounts.map((h) => ({
      ...h,
      startDate: h.startDate.toISOString(),
      endDate: h.endDate.toISOString()
    })),
    taxPayer: {
      ...i.taxPayer,
      primaryPerson: i.taxPayer.primaryPerson
        ? dateToStringPerson(i.taxPayer.primaryPerson)
        : undefined,
      dependents: i.taxPayer.dependents.map((d) => dateToStringPerson(d)),
      spouse: i.taxPayer.spouse
        ? dateToStringPerson(i.taxPayer.spouse)
        : undefined
    }
  }))

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
        expect(validators.primaryPerson?.(data)).toEqual(true)
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
            validators.primaryPerson!
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
