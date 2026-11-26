/* eslint @typescript-eslint/no-empty-function: "off" */

import * as federal from '../data/federal'
import { testKit, commonTests } from '.'
import type { Dependent, IncomeW2 } from 'ustaxes/core/data'
import { FilingStatus, Income1099Type, PersonRole } from 'ustaxes/core/data'
import type { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

beforeAll(() => jest.spyOn(console, 'warn').mockImplementation(() => {}))

describe('ScheduleEIC', () => {
  it('should disallow EIC at or above every completed phase-out amount', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      const caps = federal.EIC.caps[f1040.info.taxPayer.filingStatus]
      // AGI at or above the largest cap (3 or more children) fails Step 1
      // whatever the number of qualifying children.
      if (caps !== undefined && f1040.l11b() >= Math.max(...caps)) {
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

const child = (
  dateOfBirth: string,
  isStudent = false,
  numberOfMonths = 12
): Dependent => ({
  firstName: 'Child',
  lastName: dateOfBirth,
  ssid: '222222222',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: new Date(dateOfBirth),
  relationship: 'son',
  qualifyingInfo: { numberOfMonths, isStudent }
})

const eicReturn = (
  wages: number,
  dependents: Dependent[],
  extra: Partial<ValidatedInformation> = {},
  filingStatus: FilingStatus = FilingStatus.S
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [eicW2(wages)],
      taxPayer: {
        filingStatus,
        spouse:
          filingStatus === FilingStatus.MFJ
            ? {
                firstName: 'Test',
                lastName: 'Spouse',
                isTaxpayerDependent: false,
                isBlind: false,
                ssid: '333333333',
                role: PersonRole.SPOUSE,
                dateOfBirth: new Date('1985-06-01')
              }
            : undefined,
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

  it('uses the statutory phase-in rate, rounding half-dollar rows up', () => {
    // 1 child, $1-$50 row: 34% x $25 = $8.50, which the EIC Table shows as $9.
    // A slope derived from the rounded amounts (4328 / 12730) gives $8.4996.
    expect(eicReturn(30, [child('2015-01-01')]).scheduleEIC.credit()).toBe(9)
  })

  it('shows the maximum credit in a row that reaches the plateau', () => {
    const one = [child('2015-01-01')]
    const two = [child('2015-01-01'), child('2016-01-01')]
    const three = [...two, child('2017-01-01')]
    // Earned income amounts $8,490 / $12,730 / $17,880 fall inside these rows.
    // The midpoint would give $648 / $4,327 / $7,150 / $8,044.
    expect(eicReturn(8460, []).scheduleEIC.credit()).toBe(649)
    expect(eicReturn(12700, one).scheduleEIC.credit()).toBe(4328)
    expect(eicReturn(17899, two).scheduleEIC.credit()).toBe(7152)
    expect(eicReturn(17850, three).scheduleEIC.credit()).toBe(8046)
    // The row before is still on the phase-in.
    expect(eicReturn(12699, one).scheduleEIC.credit()).toBe(4310)
  })

  it('shows the maximum credit in the MFJ row containing the $30,470 phase-out start', () => {
    const kids = [child('2015-01-01'), child('2016-01-01'), child('2017-01-01')]
    const mfj = (wages: number, n: number): F1040 =>
      eicReturn(wages, kids.slice(0, n), {}, FilingStatus.MFJ)
    // $30,450-$30,500 row: the midpoint $30,475 is past $30,470, but the
    // table shows the maximum.
    expect(mfj(30480, 1).scheduleEIC.credit()).toBe(4328)
    expect(mfj(30480, 2).scheduleEIC.credit()).toBe(7152)
    expect(mfj(30480, 3).scheduleEIC.credit()).toBe(8046)
    // $30,500-$30,550 row: $4,328 - 15.98% x ($30,525 - $30,470) = $4,319.
    expect(mfj(30500, 1).scheduleEIC.credit()).toBe(4319)
  })

  it('phases out from the $23,350-$23,400 row for unmarried filers', () => {
    // $23,350 is the start of a row, so that row is already phasing out:
    // $4,328 - 15.98% x ($23,375 - $23,350) = $4,324.
    const one = [child('2015-01-01')]
    expect(eicReturn(23349, one).scheduleEIC.credit()).toBe(4328)
    expect(eicReturn(23350, one).scheduleEIC.credit()).toBe(4324)
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

  it('does not count a child who lived with the filer half the year or less', () => {
    const f1040 = eicReturn(15000, [child('2015-06-15', false, 6)])
    expect(f1040.scheduleEIC.qualifyingDependents()).toHaveLength(0)
    // No-child credit: $649 - 7.65% x ($15,025 - $10,620) = $312.
    expect(f1040.scheduleEIC.credit()).toBe(312)
  })

  it('counts a child who lived with the filer 7 months', () => {
    const f1040 = eicReturn(15000, [child('2015-06-15', false, 7)])
    expect(f1040.scheduleEIC.credit()).toBe(4328)
  })

  it('counts a newborn who lived with the filer more than half their life', () => {
    // Born in October: alive 3 months, all of them in the filer's home.
    const f1040 = eicReturn(15000, [child('2025-10-15', false, 3)])
    expect(f1040.scheduleEIC.credit()).toBe(4328)
    // Schedule EIC line 6 shows 12 for a child born during the year.
    expect(f1040.scheduleEIC.numberMonths()).toEqual([12])
  })

  it('does not count a newborn who lived with the filer half their life or less', () => {
    // Born in March: alive 10 months, 3 of them in the filer's home.
    const f1040 = eicReturn(15000, [child('2025-03-15', false, 3)])
    expect(f1040.scheduleEIC.qualifyingDependents()).toHaveLength(0)
  })
})
