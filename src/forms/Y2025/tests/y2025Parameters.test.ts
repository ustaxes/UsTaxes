import { FilingStatus, IncomeW2, PersonRole } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
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
  ssWages: income,
  ssWithholding: Math.round(income * 0.062),
  medicareWithholding: Math.round(income * 0.0145),
  stateWages: income,
  stateWithholding: 0
})

const person = {
  address: { address: '1 Main St', city: 'city', state: 'AL' as const },
  firstName: 'Test',
  lastName: 'Payer',
  isTaxpayerDependent: false,
  isBlind: false,
  ssid: '111111111',
  dateOfBirth: new Date('1985-06-01')
}

const makeInfo = (
  filingStatus: FilingStatus,
  wages: number,
  extra: Partial<ValidatedInformation> = {}
): ValidatedInformation => ({
  ...blankState,
  w2s: [w2(wages)],
  taxPayer: {
    filingStatus,
    primaryPerson: { ...person, role: PersonRole.PRIMARY },
    spouse:
      filingStatus === FilingStatus.MFJ
        ? { ...person, role: PersonRole.SPOUSE, firstName: 'Spouse' }
        : undefined,
    dependents: []
  },
  ...extra
})

// 2025 Form 8880, line 9 table: the 20% band ends at $25,500 (single/MFS/QSS),
// $38,250 (HOH) and $51,000 (MFJ).
describe('Form 8880 2025 credit rate bands', () => {
  const rateAt = (fs: FilingStatus, agi: number): number =>
    new F1040(makeInfo(fs, agi), []).f8880?.creditRate() ?? -1

  it.each([
    [FilingStatus.S, 25500, 0.2],
    [FilingStatus.S, 25501, 0.1],
    [FilingStatus.HOH, 38250, 0.2],
    [FilingStatus.HOH, 38251, 0.1],
    [FilingStatus.MFJ, 51000, 0.2],
    [FilingStatus.MFJ, 51001, 0.1]
  ])('%s with AGI %d gets rate %d', (fs, agi, rate) => {
    expect(rateAt(fs, agi)).toBe(rate)
  })
})

// Rev. Proc. 2024-40 sec. 3: the 2025 student loan interest phase-out starts
// at $85,000 MAGI ($170,000 MFJ) over a $15,000 ($30,000) range.
describe('Student loan interest 2025 phase-out', () => {
  const deduction = (fs: FilingStatus, wages: number): number | undefined =>
    new F1040(
      makeInfo(fs, wages, { f1098es: [{ lender: 'lender', interest: 2500 }] }),
      []
    ).studentLoanInterestWorksheet?.l9()

  it('allows the full deduction at the phase-out start', () => {
    expect(deduction(FilingStatus.S, 85000)).toBe(2500)
    expect(deduction(FilingStatus.MFJ, 170000)).toBe(2500)
  })

  it('reduces the deduction ratably above the start', () => {
    // $7,500 over the $85,000 start is half of the $15,000 range.
    expect(deduction(FilingStatus.S, 92500)).toBe(1250)
    // $15,000 over the $170,000 start is half of the $30,000 range.
    expect(deduction(FilingStatus.MFJ, 185000)).toBe(1250)
  })

  it('eliminates the deduction at the end of the range', () => {
    expect(deduction(FilingStatus.S, 100000)).toBe(0)
    expect(deduction(FilingStatus.MFJ, 200000)).toBe(0)
  })
})
