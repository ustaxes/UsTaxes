/* eslint @typescript-eslint/no-empty-function: "off" */

import * as federal from '../data/federal'
import { testKit, commonTests } from '.'
import {
  Dependent,
  FilingStatus,
  Income1099Type,
  IncomeW2,
  PersonRole
} from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

beforeAll(() => jest.spyOn(console, 'warn').mockImplementation(() => {}))

describe('ScheduleEIC', () => {
  it('should disallow EIC for income below threshold', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      const formula = federal.EIC.formulas[f1040.info.taxPayer.filingStatus]
      if (formula !== undefined && f1040.wages() < formula[0][1].lowerBound) {
        expect(f1040.scheduleEIC.allowed()).toBe(false)
        expect(f1040.scheduleEIC.credit()).toBe(0)
      }
      return Promise.resolve()
    })
  })
})

const eicW2 = (income: number): IncomeW2 => ({
  employer: { EIN: '111111111', employerName: 'employer' },
  personRole: PersonRole.PRIMARY,
  occupation: 'occupation',
  state: 'AL',
  income,
  medicareIncome: income,
  fedWithholding: 0,
  ssWages: income,
  ssWithholding: Math.round(income * 0.062),
  medicareWithholding: Math.round(income * 0.0145),
  stateWages: income,
  stateWithholding: 0
})

const child = (dateOfBirth: string, isStudent = false): Dependent => ({
  firstName: 'Child',
  lastName: dateOfBirth,
  ssid: '222222222',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: new Date(dateOfBirth),
  relationship: 'son',
  qualifyingInfo: { numberOfMonths: 12, isStudent }
})

const eicReturn = (
  wages: number,
  dependents: Dependent[],
  extra: Partial<ValidatedInformation> = {}
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [eicW2(wages)],
      taxPayer: {
        filingStatus: FilingStatus.S,
        primaryPerson: {
          address: { address: '1 Main St', city: 'city', state: 'AL' },
          firstName: 'Test',
          lastName: 'Payer',
          isTaxpayerDependent: false,
          isBlind: false,
          ssid: '111111111',
          role: PersonRole.PRIMARY,
          dateOfBirth: new Date('1985-06-01')
        },
        dependents
      },
      ...extra
    },
    []
  )

const interest = (income: number): ValidatedInformation['f1099s'] => [
  {
    payer: 'bank',
    type: Income1099Type.INT,
    personRole: PersonRole.PRIMARY,
    form: { income }
  }
]

// Expected amounts are from the 2025 EIC parameters (Rev. Proc. 2024-40):
// phase-in rates 34% (1 child) / 40% (2 children), plateau $4,328 (1 child)
// and $8,046 (3 or more), and for no children a $649 maximum phasing out at
// 7.65% above $10,620.
describe('ScheduleEIC 2025 computation', () => {
  it('uses the midpoint of the $50 table row containing earned income', () => {
    // $10,040 falls in the $10,000-$10,050 row: 40% x $10,025 = $4,010.
    const f1040 = eicReturn(10040, [child('2015-01-01'), child('2016-01-01')])
    expect(f1040.scheduleEIC.credit()).toBe(4010)
  })

  it('treats an 18-year-old as a qualifying child', () => {
    // Born in 2007, so under 19 at the end of 2025.
    const f1040 = eicReturn(15000, [child('2007-03-01')])
    expect(f1040.scheduleEIC.qualifyingDependents()).toHaveLength(1)
    expect(f1040.scheduleEIC.credit()).toBe(4328)
  })

  it('does not treat a 24-year-old student as a qualifying child', () => {
    // Born in 2001, so 24 at the end of 2025 (must be under 24).
    const f1040 = eicReturn(15000, [child('2001-03-01', true)])
    expect(f1040.scheduleEIC.qualifyingDependents()).toHaveLength(0)
    // No-child credit: $649 - 7.65% x ($15,025 - $10,620) = $312.
    expect(f1040.scheduleEIC.credit()).toBe(312)
  })

  it('treats a 23-year-old student as a qualifying child', () => {
    const f1040 = eicReturn(15000, [child('2002-03-01', true)])
    expect(f1040.scheduleEIC.qualifyingDependents()).toHaveLength(1)
    expect(f1040.scheduleEIC.credit()).toBe(4328)
  })

  it('uses the 3-or-more column for four qualifying children', () => {
    const f1040 = eicReturn(20000, [
      child('2015-01-01'),
      child('2016-01-01'),
      child('2017-01-01'),
      child('2018-01-01')
    ])
    expect(f1040.scheduleEIC.credit()).toBe(8046)
    expect(f1040.l27a()).toBe(8046)
  })

  it('disallows the credit when investment income is over $11,950', () => {
    const kids = [child('2015-01-01'), child('2016-01-01')]
    const over = eicReturn(20000, kids, { f1099s: interest(11951) })
    expect(over.scheduleEIC.allowed()).toBe(false)
    expect(over.l27a()).toBe(0)

    const atLimit = eicReturn(20000, kids, { f1099s: interest(11950) })
    expect(atLimit.scheduleEIC.allowed()).toBe(true)
    expect(atLimit.l27a()).toBeGreaterThan(0)
  })

  it('figures the credit on earned income alone when AGI is below the phase-out start', () => {
    // Earned income $8,040; a $2,000 IRA deduction makes AGI $6,040, which is
    // below $23,350, so Worksheet A uses only the earned income amount:
    // 40% x $8,025 = $3,210.
    const f1040 = eicReturn(8040, [child('2015-01-01'), child('2016-01-01')], {
      otherIncome: { iraDeduction: 2000 }
    })
    expect(f1040.l11b()).toBe(6040)
    expect(f1040.scheduleEIC.credit()).toBe(3210)
  })

  it('takes the smaller of the earned income and AGI amounts in the phase-out range', () => {
    // Earned income $25,000 and $5,000 of interest: AGI $30,000 is at least
    // $23,350, so the AGI amount applies. 1 child:
    // $4,328 - 15.98% x ($30,025 - $23,350) = $3,261.
    const f1040 = eicReturn(25000, [child('2015-01-01')], {
      f1099s: interest(5000)
    })
    expect(f1040.scheduleEIC.credit()).toBe(3261)
  })
})
