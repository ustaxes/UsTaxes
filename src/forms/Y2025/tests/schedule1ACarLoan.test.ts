import type { IncomeW2, ObbbCarLoanVehicle } from 'ustaxes/core/data'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

const w2 = (income: number): IncomeW2 => ({
  employer: { EIN: '111111111', employerName: 'employer' },
  personRole: PersonRole.PRIMARY,
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

const vehicle = (vin: string, interestPaid: number): ObbbCarLoanVehicle => ({
  vin,
  purchaseDate: '03/15/2025',
  interestPaid
})

const person = {
  address: { address: '1 Main St', city: 'city', state: 'AL' as const },
  lastName: 'Payer',
  isTaxpayerDependent: false,
  isBlind: false,
  dateOfBirth: new Date('1985-06-01')
}

// Wages are the only income, so MAGI (Schedule 1-A line 3) equals wages.
const makeReturn = (
  filingStatus: FilingStatus,
  wages: number,
  carLoanVehicles: ObbbCarLoanVehicle[]
): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [w2(wages)],
      obbbDeductions: { carLoanVehicles },
      taxPayer: {
        filingStatus,
        primaryPerson: {
          ...person,
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

// 2025 Schedule 1-A Part IV: line 24 caps column (iii) at $10,000; the
// deduction is reduced by $200 for each $1,000 (or part of $1,000) of MAGI
// over $100,000 ($200,000 if MFJ).
describe('Schedule 1-A car loan interest (2025)', () => {
  it('deducts qualified interest below the phase-out threshold', () => {
    const f1040 = makeReturn(FilingStatus.S, 60000, [
      vehicle('1HGCM82633A004352', 4000)
    ])
    const s1a = f1040.schedule1A
    expect(s1a.l22aiii()).toBe(4000)
    expect(s1a.l22biii()).toBeUndefined()
    expect(s1a.l23()).toBe(4000)
    expect(s1a.l30()).toBe(4000)
    expect(s1a.l38()).toBe(4000)
    expect(f1040.l13b()).toBe(4000)
  })

  it('caps the deduction at $10,000', () => {
    const s1a = makeReturn(FilingStatus.S, 60000, [
      vehicle('1HGCM82633A004352', 7000),
      vehicle('2HGCM82633A004353', 6000)
    ]).schedule1A
    expect(s1a.l22aiii()).toBe(7000)
    expect(s1a.l22biii()).toBe(6000)
    expect(s1a.l23()).toBe(13000)
    expect(s1a.l24()).toBe(10000)
    expect(s1a.l30()).toBe(10000)
  })

  it('includes vehicles beyond the two rows on line 23', () => {
    const s1a = makeReturn(FilingStatus.S, 60000, [
      vehicle('1HGCM82633A004352', 3000),
      vehicle('2HGCM82633A004353', 3000),
      vehicle('3HGCM82633A004354', 3000)
    ]).schedule1A
    expect(s1a.l23()).toBe(9000)
    expect(s1a.l30()).toBe(9000)
  })

  it('phases out by $200 per $1,000 or part of $1,000 over $100,000', () => {
    // MAGI $112,500: $12,500 over, rounded up to 13 x $200 = $2,600.
    const s1a = makeReturn(FilingStatus.S, 112500, [
      vehicle('1HGCM82633A004352', 4000)
    ]).schedule1A
    expect(s1a.l28()).toBe(13)
    expect(s1a.l29()).toBe(2600)
    expect(s1a.l30()).toBe(1400)
  })

  it('uses the $200,000 threshold for a joint return', () => {
    // MAGI $210,000: 10 x $200 = $2,000 reduction.
    const s1a = makeReturn(FilingStatus.MFJ, 210000, [
      vehicle('1HGCM82633A004352', 4000)
    ]).schedule1A
    expect(s1a.l30()).toBe(2000)
  })

  it('allows the deduction when married filing separately', () => {
    const s1a = makeReturn(FilingStatus.MFS, 60000, [
      vehicle('1HGCM82633A004352', 4000)
    ]).schedule1A
    expect(s1a.l30()).toBe(4000)
  })

  it('is zero once fully phased out', () => {
    const s1a = makeReturn(FilingStatus.S, 150000, [
      vehicle('1HGCM82633A004352', 10000)
    ]).schedule1A
    expect(s1a.l30()).toBe(0)
  })
})
