import { FilingStatus, IncomeW2, PersonRole } from 'ustaxes/core/data'
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
  lastName: 'Payer',
  isTaxpayerDependent: false,
  isBlind: false,
  // Born before January 2, 1961: eligible for the senior deduction.
  dateOfBirth: new Date('1955-06-01')
}

// $60,000 of wages including $10,000 of qualified tips and $5,000 of
// qualified overtime; both spouses are 65 or older. MAGI is under every
// phase-out threshold.
const makeReturn = (filingStatus: FilingStatus): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [w2(60000)],
      obbbDeductions: { qualifiedTips: 10000, qualifiedOvertimePremium: 5000 },
      taxPayer: {
        filingStatus,
        primaryPerson: {
          ...person,
          firstName: 'Pat',
          ssid: '111111111',
          role: PersonRole.PRIMARY
        },
        spouse: {
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

// 2025 Schedule 1-A Parts II, III and V: "If married, you must file jointly
// to claim this deduction." Line 36b applies only if married filing jointly.
describe('Schedule 1-A filing status rules (2025)', () => {
  it('allows the tips, overtime and senior deductions on a joint return', () => {
    const s1a = makeReturn(FilingStatus.MFJ).schedule1A
    expect(s1a.l13()).toBe(10000)
    expect(s1a.l21()).toBe(5000)
    expect(s1a.l36a()).toBe(6000)
    expect(s1a.l36b()).toBe(6000)
    expect(s1a.l38()).toBe(27000)
  })

  it('disallows them when married filing separately', () => {
    const f1040 = makeReturn(FilingStatus.MFS)
    const s1a = f1040.schedule1A
    expect(s1a.l13()).toBe(0)
    expect(s1a.l21()).toBe(0)
    expect(s1a.l36a()).toBe(0)
    expect(s1a.l36b()).toBe(0)
    expect(s1a.l38()).toBe(0)
    expect(s1a.isNeeded()).toBe(false)
    expect(f1040.l13b()).toBeUndefined()
  })

  it('claims line 36b only for a spouse on a joint return', () => {
    // A head of household return that still carries spouse data.
    const s1a = makeReturn(FilingStatus.HOH).schedule1A
    expect(s1a.l13()).toBe(10000)
    expect(s1a.l36a()).toBe(6000)
    expect(s1a.l36b()).toBe(0)
  })
})
