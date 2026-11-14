import { FilingStatus, IncomeW2, PersonRole } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

const w2 = (
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE,
  income: number
): IncomeW2 => ({
  employer: { EIN: '111111111', employerName: 'employer' },
  personRole,
  occupation: 'occupation',
  state: 'AL',
  income,
  medicareIncome: income,
  fedWithholding: 0,
  ssWages: Math.min(income, 176100),
  ssWithholding: Math.round(Math.min(income, 176100) * 0.062),
  medicareWithholding: Math.round(income * 0.0145),
  stateWages: income,
  stateWithholding: 0
})

const person = {
  address: { address: '1 Main St', city: 'city', state: 'AL' as const },
  lastName: 'Payer',
  isTaxpayerDependent: false,
  isBlind: false,
  dateOfBirth: new Date('1985-06-01')
}

const makeReturn = (
  filingStatus: FilingStatus,
  w2s: IncomeW2[],
  form8919Wages: number
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s,
      otherEarnedIncome: { form8919Wages },
      taxPayer: {
        filingStatus,
        primaryPerson: {
          ...person,
          firstName: 'Pat',
          ssid: '111111111',
          role: PersonRole.PRIMARY
        },
        spouse:
          filingStatus === FilingStatus.MFJ
            ? {
                ...person,
                firstName: 'Sam',
                ssid: '222222222',
                role: PersonRole.SPOUSE
              }
            : undefined,
        dependents: []
      }
    },
    []
  )

// 2025 Form 8919: line 11 = 6.2% of wages up to the $176,100 wage base less
// W-2 social security wages; line 12 = 1.45% of line 6; line 13 = 11 + 12,
// reported on Schedule 2 line 6.
describe('Form 8919 (2025)', () => {
  it('carries the uncollected tax to Schedule 2 line 6 and Form 1040 line 23', () => {
    const f1040 = makeReturn(
      FilingStatus.S,
      [w2(PersonRole.PRIMARY, 50000)],
      10000
    )
    expect(f1040.l1g()).toBe(10000)
    // $620 social security + $145 Medicare.
    expect(f1040.f8919.l13()).toBeCloseTo(765, 6)
    expect(f1040.schedule2.l6()).toBeCloseTo(765, 6)
    expect(f1040.schedule2.l7()).toBeCloseTo(765, 6)
    expect(f1040.l23()).toBeCloseTo(765, 6)
  })

  it('limits social security tax to the remaining wage base', () => {
    // W-2 social security wages $170,000: only $6,100 of the $10,000 is
    // subject to the 6.2% tax. $378.20 + $145 = $523.20.
    const f1040 = makeReturn(
      FilingStatus.S,
      [w2(PersonRole.PRIMARY, 170000)],
      10000
    )
    expect(f1040.f8919.l9()).toBe(6100)
    expect(f1040.f8919.l10()).toBe(6100)
    expect(f1040.f8919.l13()).toBeCloseTo(523.2, 6)
  })

  it("doesn't count the spouse's W-2 wages against the wage base", () => {
    const f1040 = makeReturn(
      FilingStatus.MFJ,
      [w2(PersonRole.SPOUSE, 200000)],
      10000
    )
    expect(f1040.f8919.l8()).toBe(0)
    expect(f1040.f8919.l13()).toBeCloseTo(765, 6)
  })

  it('adds nothing without Form 8919 wages', () => {
    const f1040 = makeReturn(FilingStatus.S, [w2(PersonRole.PRIMARY, 50000)], 0)
    expect(f1040.f8919.isNeeded()).toBe(false)
    expect(f1040.schedule2.l6()).toBeUndefined()
  })
})
