import F1040 from '../irsForms/F1040'
import {
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole
} from 'ustaxes/core/data'
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
  selfEmployedIncome: [
    {
      businessName: 'Side Gig',
      personRole: PersonRole.PRIMARY,
      grossReceipts: 12000,
      expenses: 1750,
      healthInsurancePremiums: 900
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

describe('F7206 (2025)', () => {
  it('defaults line 4 to Schedule C net profit when worksheet line 4 is blank', () => {
    const f1040 = makeF1040()

    expect(f1040.scheduleC?.l31()).toBe(10250)
    expect(f1040.f7206?.l4()).toBe(10250)
  })

  it('ignores legacy blank worksheet line 4 values and still derives Schedule C net profit', () => {
    const f1040 = makeF1040({
      ...baseInformation,
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          ...baseInformation.adjustments?.selfEmployedHealthInsuranceWorksheet,
          line4: '' as unknown as number
        },
        selfEmployedHealthInsuranceDeduction: 1000
      }
    })

    expect(f1040.scheduleC?.l31()).toBe(10250)
    expect(f1040.f7206?.l4()).toBe(10250)
  })

  it('uses Form 7206 line 14 on Schedule 1 line 17 and includes the attachment', () => {
    const f1040 = makeF1040({
      ...baseInformation,
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          ...baseInformation.adjustments?.selfEmployedHealthInsuranceWorksheet,
          line4: 6400,
          line14: 775
        },
        selfEmployedHealthInsuranceDeduction: 775
      }
    })

    expect(f1040.f7206?.l4()).toBe(6400)
    expect(f1040.schedule1.l17()).toBe(775)
    expect(f1040.schedules().map((form) => form.tag)).toContain('f7206')
  })

  it('creates Schedule C from 1099-NEC income and uses it for line 4', () => {
    const f1040 = makeF1040({
      ...baseInformation,
      selfEmployedIncome: [],
      f1099s: [
        {
          payer: 'Client Co',
          personRole: PersonRole.PRIMARY,
          type: Income1099Type.NEC,
          form: {
            nonemployeeCompensation: 6400
          }
        }
      ],
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          line1: 1000,
          line14: 1000
        },
        selfEmployedHealthInsuranceDeduction: 1000
      }
    })

    expect(f1040.scheduleC?.l31()).toBe(6400)
    expect(f1040.f7206?.l4()).toBe(6400)
    expect(f1040.scheduleSE.l2()).toBe(6400)
  })
})
