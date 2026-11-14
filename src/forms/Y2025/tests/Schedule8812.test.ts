import { commonTests } from '.'
import Schedule8812 from '../irsForms/Schedule8812'
import F1040 from '../irsForms/F1040'
import {
  Dependent,
  FilingStatus,
  IncomeW2,
  PersonRole
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'

const withSchedule8812 = async (
  f: (f1040: F1040, s8812: Schedule8812) => void
): Promise<void> =>
  await commonTests.withValid1040(
    (f1040: F1040): void => {
      if (f1040.schedule8812.isNeeded()) {
        f(f1040, f1040.schedule8812)
      }
    },
    // Add filter to info property so we're only testing in the domain
    // we care about.
    (info) => info.taxPayer.dependents.length > 0
  )

describe('Schedule 8812', () => {
  it('should be attached with qualifiying dependents', async () => {
    await commonTests.withValid1040((f1040) => {
      // If there are qualifying dependents, we must have a schedule 8812
      if (f1040.qualifyingDependents.qualifyingChildren().length > 0) {
        expect(f1040.schedule8812).not.toBe(undefined)
      }
    })
  })

  it('should not produce line 5 with no dependents', async () => {
    await withSchedule8812((f1040, s8812) => {
      // If Schedule A is attached, the deduction should be greater than the standard deduction
      if (s8812.l4() === 0) {
        expect(s8812.l5()).toEqual(0)
      }
    })
  })

  it('should show a multiple of 1000 at l10', async () => {
    await withSchedule8812((f1040, s8812) => {
      expect(s8812.l10() % 1000).toEqual(0)
    })
  })
})

// Fixed returns for Part II-A of the 2025 Schedule 8812. Married filing
// separately is used so the earned income credit (Form 1040 line 27a, which
// reduces Part II-B line 24) is zero and doesn't mask the Part II-B result.
const kid = (year: number): Dependent => ({
  firstName: 'Child',
  lastName: String(year),
  ssid: '222222222',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: new Date(`${year}-01-01`),
  relationship: 'son',
  qualifyingInfo: { numberOfMonths: 12, isStudent: false }
})

const mfsReturn = (wages: number, children: number): F1040 => {
  const w2: IncomeW2 = {
    employer: { EIN: '111111111', employerName: 'employer' },
    personRole: PersonRole.PRIMARY,
    occupation: 'occupation',
    state: 'AL',
    income: wages,
    medicareIncome: wages,
    fedWithholding: 0,
    ssWages: wages,
    ssWithholding: Math.round(wages * 0.062),
    medicareWithholding: Math.round(wages * 0.0145),
    stateWages: wages,
    stateWithholding: 0
  }
  return new F1040(
    {
      ...blankState,
      w2s: [w2],
      taxPayer: {
        filingStatus: FilingStatus.MFS,
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
        dependents: Array.from({ length: children }, (_, i) => kid(2015 + i))
      }
    },
    []
  )
}

describe('Schedule 8812 Part II-A (2025)', () => {
  it('enters the smaller of line 17 or line 20 when line 16b is under $5,100', () => {
    // 1 child: line 16b $1,700, line 17 $1,700. Earned income $4,000:
    // line 20 = 15% x $1,500 = $225. Part II-B does not apply.
    const s8812 = mfsReturn(4000, 1).schedule8812
    const part2a = s8812.part2a()
    expect(part2a.l16b).toBe(1700)
    expect(part2a.l20).toBe(225)
    expect(part2a.l20No).toBe(true)
    expect(part2a.l20Yes).toBe(false)
    expect(s8812.l27()).toBe(225)
  })

  it('goes to Part II-B when line 16b is $5,100 and line 20 is less than line 17', () => {
    // 3 children: line 16b $5,100, no tax so line 17 = $5,100.
    // Line 20 = $225 < $5,100, so Part II-B: line 21 = $248 + $58 social
    // security and Medicare withheld = $306; line 24 = 0, line 25 = $306;
    // line 26 = larger of $225 or $306; line 27 = $306.
    const s8812 = mfsReturn(4000, 3).schedule8812
    const part2a = s8812.part2a()
    expect(part2a.l16b).toBe(5100)
    expect(part2a.l17).toBe(5100)
    expect(part2a.l20Yes).toBe(true)
    expect(part2a.toLine27).toBeUndefined()
    expect(s8812.part2b().l25).toBe(306)
    expect(s8812.l27()).toBe(306)
  })

  it('enters line 17 when line 16b is $5,100 and line 20 is at least line 17', () => {
    const s8812 = mfsReturn(40000, 3).schedule8812
    const part2a = s8812.part2a()
    expect(part2a.l20).toBeGreaterThanOrEqual(part2a.l17 ?? Infinity)
    expect(s8812.l27()).toBe(part2a.l17)
  })

  it('answers line 19 "Yes" only when line 18a is more than $2,500', () => {
    expect(mfsReturn(4000, 1).schedule8812.part2a().l19Yes).toBe(true)
    const low = mfsReturn(2500, 1).schedule8812.part2a()
    expect(low.l19Yes).toBe(false)
    expect(low.l19No).toBe(true)
    expect(low.l20).toBe(0)
  })
})
