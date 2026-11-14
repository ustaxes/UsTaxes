import {
  FilingStatus,
  IncomeW2,
  PersonRole,
  ScheduleK1Form1065
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'
import F8995 from '../irsForms/F8995'
import F8995A from '../irsForms/F8995A'

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

// S corporation K-1 (no SE earnings) whose ordinary income equals its QBI.
const k1 = (name: string, section199AQBI: number): ScheduleK1Form1065 => ({
  personRole: PersonRole.PRIMARY,
  partnershipName: name,
  partnershipEin: '999999999',
  partnerOrSCorp: 'S',
  isForeign: false,
  isPassive: false,
  ordinaryBusinessIncome: section199AQBI,
  interestIncome: 0,
  guaranteedPaymentsForServices: 0,
  guaranteedPaymentsForCapital: 0,
  selfEmploymentEarningsA: 0,
  selfEmploymentEarningsB: 0,
  selfEmploymentEarningsC: 0,
  distributionsCodeAAmount: 0,
  section199AQBI
})

const makeReturn = (wages: number, k1s: ScheduleK1Form1065[]): F1040 =>
  new F1040(
    {
      ...blankState,
      w2s: [w2(wages)],
      scheduleK1Form1065s: k1s,
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

// 2025 Form 8995: line 2 combines income and losses from every trade or
// business, and line 4 is zero if lines 2 and 3 combine to zero or less.
describe('Form 8995 QBI losses (2025)', () => {
  it('nets a K-1 QBI loss against QBI from another business', () => {
    const f1040 = makeReturn(100000, [k1('Gain', 10000), k1('Loss', -4000)])
    const f8995 = f1040.f8995
    expect(f8995).toBeInstanceOf(F8995)
    expect(f8995?.applicableK1s()).toHaveLength(2)
    expect(f8995?.l2()).toBe(6000)
    expect(f8995?.l4()).toBe(6000)
    // 20% of $6,000; 20% of taxable income is far larger.
    expect(f1040.l13a()).toBe(1200)
  })

  it('enters zero on line 4 and carries the loss forward on line 16', () => {
    const f1040 = makeReturn(100000, [k1('Gain', 6000), k1('Loss', -5000)])
    // Combined QBI is still positive here, so the form is attached.
    expect(f1040.f8995?.l2()).toBe(1000)
    expect(f1040.l13a()).toBe(200)

    const f8995 = new F8995(
      makeReturn(100000, [k1('Gain', 1000), k1('Loss', -5000)])
    )
    expect(f8995.l2()).toBe(-4000)
    expect(f8995.l4()).toBe(0)
    expect(f8995.l15()).toBe(0)
    expect(f8995.l16()).toBe(-4000)
  })

  it('keeps Form 8995-A on positive K-1s until its loss netting exists', () => {
    const f1040 = makeReturn(400000, [k1('Gain', 10000), k1('Loss', -4000)])
    expect(f1040.f8995).toBeInstanceOf(F8995A)
    expect(f1040.f8995?.applicableK1s()).toHaveLength(1)
  })
})
