import type { DependentCareExpenses, IncomeW2 } from 'ustaxes/core/data'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

// $80,000 of wages (line 8 decimal 0.20) with the given dependent care
// benefits in W-2 box 10.
const w2 = (box10DependentCare: number): IncomeW2 => ({
  employer: { EIN: '111111111', employerName: 'employer' },
  personRole: PersonRole.PRIMARY,
  occupation: 'occupation',
  state: 'AL',
  income: 80000,
  medicareIncome: 80000,
  fedWithholding: 0,
  ssWages: 80000,
  ssWithholding: 4960,
  medicareWithholding: 1160,
  stateWages: 80000,
  stateWithholding: 0,
  box10DependentCare
})

const makeReturn = (
  benefits: number,
  dependentCareExpenses: DependentCareExpenses | undefined
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [w2(benefits)],
      dependentCareExpenses,
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
        dependents: []
      }
    },
    []
  )

// 2025 Form 2441 Part III: line 25 (excluded benefits) is the smaller of
// line 20 (benefits, expenses, earned income) or $5,000; lines 27-31 reduce
// the $3,000/$6,000 limit by the excluded benefits.
describe('Form 2441 dependent care benefits (2025)', () => {
  it('reduces the dollar limit, not the expenses, by excluded benefits', () => {
    // 2 people, $8,000 of expenses, $5,000 excluded benefits:
    // line 29 = $6,000 - $5,000 = $1,000; line 30 = $8,000 - $5,000 =
    // $3,000; line 31 = $1,000. Credit = 20% x $1,000 = $200.
    const f2441 = makeReturn(5000, {
      qualifyingPersonCount: 2,
      totalExpenses: 8000
    }).f2441
    expect(f2441.excludedBenefits()).toBe(5000)
    expect(f2441.taxableBenefits()).toBeUndefined()
    expect(f2441.l3()).toBe(1000)
    expect(f2441.credit()).toBe(200)
  })

  it('taxes benefits that exceed the qualified expenses', () => {
    // 1 person, $4,000 of expenses, $5,000 of benefits: line 20 = $4,000, so
    // $1,000 is taxable on Form 1040 line 1e. Line 29 = $3,000 - $4,000 is
    // below zero, so there's no credit.
    const f1040 = makeReturn(5000, {
      qualifyingPersonCount: 1,
      totalExpenses: 4000
    })
    expect(f1040.f2441.excludedBenefits()).toBe(4000)
    expect(f1040.f2441.taxableBenefits()).toBe(1000)
    expect(f1040.l1e()).toBe(1000)
    expect(f1040.f2441.credit()).toBeUndefined()
  })

  it('uses expenses up to the dollar limit without benefits', () => {
    const f2441 = makeReturn(0, {
      qualifyingPersonCount: 1,
      totalExpenses: 5000
    }).f2441
    expect(f2441.l3()).toBe(3000)
    expect(f2441.credit()).toBe(600)
  })

  it('excludes benefits up to $5,000 when no expenses were entered', () => {
    const f2441 = makeReturn(4000, undefined).f2441
    expect(f2441.excludedBenefits()).toBe(4000)
    expect(f2441.taxableBenefits()).toBeUndefined()
  })
})
