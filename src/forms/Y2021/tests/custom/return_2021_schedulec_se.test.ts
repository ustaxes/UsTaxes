import F1040 from '../../irsForms/F1040'
import { blankState } from 'ustaxes/redux/reducer'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'

describe('2021 Schedule C + SE baseline', () => {
  it('matches core Schedule C and SE values from the 2021 return', () => {
    const info: ValidatedInformation = {
      ...blankState,
      businesses: [
        {
          name: 'Sole Prop',
          income: {
            grossReceipts: 16950,
            returnsAndAllowances: 0,
            otherIncome: 0
          },
          expenses: {
            other: 1587
          }
        }
      ],
      realEstate: [
        {
          address: {
            address: 'Rental',
            city: 'X',
            state: 'AL',
            zip: '00000'
          },
          rentalDays: 365,
          personalUseDays: 0,
          rentReceived: 1343,
          propertyType: 'singleFamily',
          qualifiedJointVenture: false,
          expenses: {}
        }
      ],
      w2s: [
        {
          employer: { EIN: '111111111', employerName: 'Employer' },
          personRole: PersonRole.PRIMARY,
          occupation: 'Job',
          state: 'AL',
          income: 264480,
          medicareIncome: 264480,
          fedWithholding: 60434,
          ssWages: 142800,
          ssWithholding: 8853.6,
          medicareWithholding: 4223,
          stateWages: 0,
          stateWithholding: 0
        }
      ],
      taxPayer: {
        dependents: [],
        filingStatus: FilingStatus.MFS,
        primaryPerson: {
          address: {
            address: 'X',
            city: 'X',
            state: 'AL',
            zip: '00000'
          },
          firstName: 'Primary',
          lastName: 'Taxpayer',
          isTaxpayerDependent: false,
          role: PersonRole.PRIMARY,
          ssid: '000000000',
          dateOfBirth: new Date('1980-01-01'),
          isBlind: false
        },
        spouse: {
          firstName: 'Spouse',
          lastName: 'Taxpayer',
          isTaxpayerDependent: false,
          role: PersonRole.SPOUSE,
          ssid: '000000001',
          dateOfBirth: new Date('1980-01-01'),
          isBlind: false
        }
      }
    }

    const f1040 = new F1040(info, [])

    expect(f1040.scheduleC?.l31()).toEqual(15363)
    expect(f1040.schedule1.l10()).toEqual(16706)
    expect(f1040.scheduleSE.l12()).toBeCloseTo(411, 0)
    expect(f1040.schedule2.l11()).toBeCloseTo(1383, 0)
    expect(f1040.schedule2.l17c()).toBeUndefined()
    expect(f1040.schedule2.l17d()).toBeUndefined()
    expect(f1040.schedule2.l18()).toBeCloseTo(0, 0)
    expect(f1040.schedule2.l12()).toBeCloseTo(0, 0)
    expect(f1040.schedule2.l21()).toBeCloseTo(1794, 0)
    expect(f1040.l8()).toEqual(16706)
  })
})
