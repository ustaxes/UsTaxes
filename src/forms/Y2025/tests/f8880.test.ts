import type { IncomeW2, Ira } from 'ustaxes/core/data'
import { FilingStatus, IraPlanType, PersonRole } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

type Role = PersonRole.PRIMARY | PersonRole.SPOUSE

const w2 = (income: number): IncomeW2 => ({
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

// Roth IRA activity, so contributions and (non-taxable) distributions don't
// change AGI.
const roth = (
  personRole: Role,
  contributions: number,
  grossDistribution = 0
): Ira => ({
  payer: 'broker',
  personRole,
  grossDistribution,
  taxableAmount: 0,
  taxableAmountNotDetermined: false,
  totalDistribution: false,
  federalIncomeTaxWithheld: 0,
  planType: IraPlanType.RothIRA,
  contributions,
  rolloverContributions: 0,
  rothIraConversion: 0,
  recharacterizedContributions: 0,
  requiredMinimumDistributions: 0,
  lateContributions: 0,
  repayments: 0
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
  wages: number,
  iras: Ira[],
  primary: Partial<typeof person> = {}
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [w2(wages)],
      individualRetirementArrangements: iras,
      taxPayer: {
        filingStatus,
        primaryPerson: {
          ...person,
          ...primary,
          firstName: 'Pat',
          ssid: '111111111',
          role: PersonRole.PRIMARY
        },
        spouse:
          filingStatus === FilingStatus.S
            ? undefined
            : {
                ...person,
                firstName: 'Sam',
                ssid: '222222222',
                role: PersonRole.SPOUSE
              },
        dependents: []
      }
    },
    []
  )

describe('Form 8880 (2025)', () => {
  it('limits the credit to tax liability (line 11)', () => {
    // Single, $20,000 AGI: 50% rate, so line 10 = $1,000. Tax on $4,250 of
    // taxable income (Tax Table row midpoint $4,275) is $427.50.
    const f1040 = makeReturn(FilingStatus.S, 20000, [
      roth(PersonRole.PRIMARY, 2000)
    ])
    const f8880 = f1040.f8880
    expect(f8880?.l10()).toBe(1000)
    expect(f8880?.l11()).toBeCloseTo(427.5, 6)
    expect(f8880?.credit()).toBeCloseTo(427.5, 6)
    expect(f1040.schedule3.l4()).toBeCloseTo(427.5, 6)
  })

  it("includes both spouses' distributions in both columns on a joint return", () => {
    // Each spouse contributes $2,000; the spouse took a $1,500 distribution,
    // so line 4 is $1,500 in both columns and line 5 is $500 in each.
    // Line 7 = $1,000 x 50% = $500.
    const f8880 = makeReturn(FilingStatus.MFJ, 40000, [
      roth(PersonRole.PRIMARY, 2000),
      roth(PersonRole.SPOUSE, 2000, 1500)
    ]).f8880
    expect(f8880?.l4(PersonRole.PRIMARY)).toBe(1500)
    expect(f8880?.l4(PersonRole.SPOUSE)).toBe(1500)
    expect(f8880?.l7()).toBe(1000)
    expect(f8880?.credit()).toBe(500)
  })

  it('leaves the spouse column blank when not filing jointly', () => {
    const f8880 = makeReturn(FilingStatus.MFS, 20000, [
      roth(PersonRole.PRIMARY, 1000),
      roth(PersonRole.SPOUSE, 2000)
    ]).f8880
    expect(f8880?.l1(PersonRole.SPOUSE)).toBeUndefined()
    expect(f8880?.l6(PersonRole.SPOUSE)).toBeUndefined()
    expect(f8880?.l7()).toBe(1000)
  })

  it('excludes a contributor born after January 1, 2008', () => {
    const f8880 = makeReturn(
      FilingStatus.S,
      20000,
      [roth(PersonRole.PRIMARY, 2000)],
      { dateOfBirth: new Date('2008-06-01') }
    ).f8880
    expect(f8880?.isEligible(PersonRole.PRIMARY)).toBe(false)
    expect(f8880?.l7()).toBe(0)
    expect(f8880?.credit()).toBeUndefined()
  })

  it('excludes a contributor claimed as a dependent', () => {
    const f8880 = makeReturn(
      FilingStatus.S,
      20000,
      [roth(PersonRole.PRIMARY, 2000)],
      { isTaxpayerDependent: true }
    ).f8880
    expect(f8880?.l7()).toBe(0)
    expect(f8880?.credit()).toBeUndefined()
  })
})
