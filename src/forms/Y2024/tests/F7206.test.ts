import F1040 from '../irsForms/F1040'
import { FilingStatus, Information, PersonRole } from 'ustaxes/core/data'
import { validate } from 'ustaxes/forms/F1040Base'
import { run } from 'ustaxes/core/util'
import { blankState } from 'ustaxes/redux/reducer'

const baseInformation: Information = {
  ...blankState,
  taxPayer: {
    filingStatus: FilingStatus.S,
    primaryPerson: {
      firstName: 'Taylor',
      lastName: 'Taxpayer',
      ssid: '123456789',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date(1990, 0, 1),
      isTaxpayerDependent: false,
      address: {
        address: '123 Maple St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }
    },
    dependents: []
  },
  businesses: [
    {
      name: 'Side Gig',
      principalBusinessOrProfession: 'Consulting',
      income: {
        grossReceipts: 12000,
        returnsAndAllowances: 500,
        otherIncome: 250
      },
      expenses: {
        advertising: 300,
        office: 450
      },
      homeOfficeDeduction: 750
    }
  ],
  adjustments: {
    selfEmployedHealthInsuranceWorksheet: {
      line1: 1000,
      line14: 1000
    },
    selfEmployedHealthInsuranceDeduction: 1000
  }
}

const makeF1040 = (info: Information = baseInformation): F1040 =>
  run(validate(info)).fold(
    (errors) => {
      throw new Error(`Validation failed: ${String(errors)}`)
    },
    (validInfo) => new F1040(validInfo, [])
  )

describe('F7206 (2024)', () => {
  it('defaults line 4 to Schedule C net profit when worksheet line 4 is blank', () => {
    const f1040 = makeF1040()

    expect(f1040.scheduleC?.l31()).toBe(10250)
    expect(f1040.f7206?.l4()).toBe(10250)
  })

  it('prefers an explicit worksheet line 4 value over the derived Schedule C amount', () => {
    const f1040 = makeF1040({
      ...baseInformation,
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          ...baseInformation.adjustments?.selfEmployedHealthInsuranceWorksheet,
          line4: 6400
        },
        selfEmployedHealthInsuranceDeduction: 1000
      }
    })

    expect(f1040.scheduleC?.l31()).toBe(10250)
    expect(f1040.f7206?.l4()).toBe(6400)
  })
})
