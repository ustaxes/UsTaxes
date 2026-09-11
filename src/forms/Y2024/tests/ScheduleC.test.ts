import { commonTests, testKit } from '.'
import { FilingStatus, Income1099Type, PersonRole } from 'ustaxes/core/data'
import { run } from 'ustaxes/core/util'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { blankState } from 'ustaxes/redux/reducer'

const baseInfo: ValidatedInformation = {
  ...blankState,
  taxPayer: {
    dependents: [],
    filingStatus: FilingStatus.S,
    primaryPerson: {
      address: {
        address: '',
        city: ''
      },
      firstName: '',
      isTaxpayerDependent: false,
      lastName: '',
      role: PersonRole.PRIMARY,
      ssid: '',
      isBlind: false,
      dateOfBirth: new Date('2000-01-01')
    }
  }
}

describe('ScheduleC', () => {
  it('is created for 1099-NEC income', () => {
    const info: ValidatedInformation = {
      ...baseInfo,
      f1099s: [
        {
          payer: 'NEC Payer',
          type: Income1099Type.NEC,
          personRole: PersonRole.PRIMARY,
          form: {
            nonemployeeCompensation: 1234
          }
        }
      ],
      businesses: []
    }

    const f1040 = run(testKit.builder.build(info, []).f1040())
      .map(commonTests.findF1040OrFail)
      .orThrow()

    expect(f1040.scheduleC).not.toBeUndefined()
    expect(f1040.scheduleC?.l1()).toEqual(1234)
  })
})
