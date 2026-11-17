/* eslint @typescript-eslint/no-empty-function: "off" */

import type {
  BusinessPropertySale,
  Dependent,
  IncomeW2
} from 'ustaxes/core/data'
import { FilingStatus, Income1099Type, PersonRole } from 'ustaxes/core/data'
import type { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'
import { isHeldMoreThanOneYear } from '../irsForms/F4797'

beforeAll(() => jest.spyOn(console, 'warn').mockImplementation(() => {}))

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

const child = (dateOfBirth: string): Dependent => ({
  firstName: 'Child',
  lastName: dateOfBirth,
  ssid: '222222222',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: new Date(dateOfBirth),
  relationship: 'son',
  qualifyingInfo: { numberOfMonths: 12, isStudent: false }
})

const sale = (
  costBasis: number,
  depreciationAllowed: number,
  grossSalePrice: number,
  dateAcquired = '01/15/2020',
  dateSold = '06/30/2025'
): BusinessPropertySale => ({
  description: 'property',
  dateAcquired,
  dateSold,
  grossSalePrice,
  depreciationAllowed,
  costBasis
})

const makeReturn = (
  sales: BusinessPropertySale[],
  extra: Partial<ValidatedInformation> = {},
  wages = 50000,
  dependents: Dependent[] = []
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [w2(wages)],
      businessPropertySales: sales,
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

describe('Form 4797 (2025)', () => {
  it('recaptures depreciation as ordinary income and sends the rest to Schedule D line 11', () => {
    // Cost $10,000, $6,000 depreciation, sold for $12,000: gain $8,000.
    const f1040 = makeReturn([sale(10000, 6000, 12000)])
    const f4797 = f1040.f4797
    expect(f4797?.l31()).toBe(6000)
    expect(f4797?.l32()).toBe(2000)
    expect(f4797?.l7()).toBe(2000)
    expect(f4797?.l18b()).toBe(6000)
    expect(f1040.schedule1.l4()).toBe(6000)
    expect(f1040.scheduleD.l11()).toBe(2000)
    expect(f1040.l7a()).toBe(2000)
  })

  it('recaptures only the gain when it is less than the depreciation', () => {
    // Adjusted basis $4,000, sold for $7,000: gain $3,000, all recaptured.
    const f1040 = makeReturn([sale(10000, 6000, 7000)])
    expect(f1040.schedule1.l4()).toBe(3000)
    expect(f1040.scheduleD.l11()).toBeUndefined()
  })

  it('sends gain on undepreciated property held over a year to Schedule D', () => {
    const f1040 = makeReturn([sale(20000, 0, 25000)])
    expect(f1040.f4797?.l2()).toBe(5000)
    expect(f1040.scheduleD.l11()).toBe(5000)
    expect(f1040.schedule1.l4()).toBeUndefined()
  })

  it('nets section 1231 gains and losses in Part I', () => {
    const f1040 = makeReturn([sale(20000, 0, 25000), sale(10000, 0, 8000)])
    expect(f1040.f4797?.l7()).toBe(3000)
    expect(f1040.scheduleD.l11()).toBe(3000)
  })

  it('treats a net section 1231 loss as ordinary', () => {
    const f1040 = makeReturn([sale(10000, 2000, 4000)])
    expect(f1040.f4797?.l11()).toBe(-4000)
    expect(f1040.schedule1.l4()).toBe(-4000)
    expect(f1040.scheduleD.l11()).toBeUndefined()
  })

  it('treats property held 1 year or less as ordinary in Part II', () => {
    const f1040 = makeReturn([
      sale(10000, 1000, 12000, '03/01/2025', '09/01/2025')
    ])
    expect(f1040.f4797?.l10()).toBe(3000)
    expect(f1040.schedule1.l4()).toBe(3000)
    expect(f1040.scheduleD.isNeeded()).toBe(false)
  })

  it('counts as held more than 1 year only after the first anniversary', () => {
    expect(
      isHeldMoreThanOneYear(sale(0, 0, 0, '01/15/2024', '01/15/2025'))
    ).toBe(false)
    expect(
      isHeldMoreThanOneYear(sale(0, 0, 0, '01/15/2024', '01/16/2025'))
    ).toBe(true)
    expect(
      isHeldMoreThanOneYear(sale(0, 0, 0, '2024-01-15', '2025-01-16'))
    ).toBe(true)
  })
})

describe('Schedule D capital loss carryovers (2025)', () => {
  it('reports carryovers on lines 6 and 14', () => {
    const f1040 = makeReturn([], {
      priorYearCapitalLossCarryover: { shortTerm: 1000, longTerm: 2000 }
    })
    expect(f1040.scheduleD.l4()).toBeUndefined()
    expect(f1040.scheduleD.l6()).toBe(-1000)
    expect(f1040.scheduleD.l11()).toBeUndefined()
    expect(f1040.scheduleD.l14()).toBe(-2000)
    expect(f1040.scheduleD.l16()).toBe(-3000)
  })
})

describe('EIC for Form 4797 filers (2025)', () => {
  const kids = [child('2015-01-01'), child('2016-01-01')]
  const interest = (income: number): ValidatedInformation['f1099s'] => [
    {
      payer: 'bank',
      type: Income1099Type.INT,
      personRole: PersonRole.PRIMARY,
      form: { income }
    }
  ]

  it('uses Pub 596 Worksheet 1 when line 7a includes a Form 4797 gain', () => {
    // Interest $3,000 + line 7a $10,000 is over $11,950, but Worksheet 1
    // takes the Form 4797 gain back out, leaving $3,000.
    const f1040 = makeReturn(
      [sale(20000, 0, 30000)],
      { f1099s: interest(3000) },
      15000,
      kids
    )
    expect(f1040.l7a()).toBe(10000)
    expect(f1040.scheduleEIC.investmentIncome()).toBe(13000)
    expect(f1040.scheduleEIC.allowed()).toBe(true)
    expect(f1040.l27a()).toBeGreaterThan(0)
  })

  it('still disallows the credit when Worksheet 1 investment income is over the limit', () => {
    const f1040 = makeReturn(
      [sale(20000, 0, 30000)],
      { f1099s: interest(12000) },
      15000,
      kids
    )
    expect(f1040.scheduleEIC.allowed()).toBe(false)
  })
})
