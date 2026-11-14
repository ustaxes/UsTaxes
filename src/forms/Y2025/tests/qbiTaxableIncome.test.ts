import {
  FilingStatus,
  IncomeW2,
  PersonRole,
  ScheduleK1Form1065
} from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
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
  ssWages: Math.min(income, 176100),
  ssWithholding: Math.round(Math.min(income, 176100) * 0.062),
  medicareWithholding: Math.round(income * 0.0145),
  stateWages: income,
  stateWithholding: 0
})

// S corporation K-1 whose ordinary income equals its QBI.
const k1 = (section199AQBI: number): ScheduleK1Form1065 => ({
  personRole: PersonRole.PRIMARY,
  partnershipName: 'S Corp',
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

const makeReturn = (
  dateOfBirth: string,
  extra: Partial<ValidatedInformation>,
  filingStatus: FilingStatus = FilingStatus.S
): F1040 =>
  new F1040(
    {
      ...blankState,
      taxPayer: {
        filingStatus,
        primaryPerson: {
          address: { address: '1 Main St', city: 'city', state: 'AL' },
          firstName: 'Test',
          lastName: 'Payer',
          isTaxpayerDependent: false,
          isBlind: false,
          ssid: '111111111',
          role: PersonRole.PRIMARY,
          dateOfBirth: new Date(dateOfBirth)
        },
        dependents: []
      },
      ...extra
    },
    []
  )

// 2025 Instructions for Form 8995, line 11: taxable income before the QBI
// deduction is Form 1040 line 11a minus lines 12e and 13b.
describe('Taxable income before the QBI deduction (2025)', () => {
  it('subtracts Schedule 1-A deductions (line 13b) on Form 8995 line 11', () => {
    // Age 65+ with $30,000 of S corporation QBI and nothing else:
    // AGI $30,000, standard deduction $17,750, senior deduction $6,000.
    const f1040 = makeReturn('1955-06-01', { scheduleK1Form1065s: [k1(30000)] })
    expect(f1040.l11b()).toBe(30000)
    expect(f1040.l12e()).toBe(17750)
    expect(f1040.l13b()).toBe(6000)
    expect(f1040.f8995).toBeInstanceOf(F8995)
    expect(f1040.f8995?.l11()).toBe(6250)
    // Smaller of 20% x $30,000 QBI or 20% x $6,250 taxable income.
    expect(f1040.l13a()).toBe(1250)
  })

  it('uses Form 8995 when line 13b brings taxable income to the threshold or below', () => {
    // $217,050 of wages (including $25,000 of qualified tips) and $1,000 of
    // QBI. Before line 13b, taxable income is $218,050 - $15,750 = $202,300,
    // over the $197,300 threshold. The tips deduction is $25,000 less
    // $100 x 68 = $18,200, leaving $184,100.
    const f1040 = makeReturn('1985-06-01', {
      w2s: [w2(217050)],
      scheduleK1Form1065s: [k1(1000)],
      obbbDeductions: { qualifiedTips: 25000 }
    })
    expect(f1040.l13b()).toBe(18200)
    expect(f1040.taxableIncomeBeforeQbi()).toBe(184100)
    expect(f1040.f8995).toBeInstanceOf(F8995)
    expect(f1040.f8995).not.toBeInstanceOf(F8995A)
  })

  it('uses Form 8995 when taxable income equals the threshold', () => {
    // $212,050 of wages + $1,000 of QBI - $15,750 = $197,300 exactly.
    const f1040 = makeReturn('1985-06-01', {
      w2s: [w2(212050)],
      scheduleK1Form1065s: [k1(1000)]
    })
    expect(f1040.taxableIncomeBeforeQbi()).toBe(197300)
    expect(f1040.f8995).not.toBeInstanceOf(F8995A)
  })

  it('uses the same figure on Form 8995-A line 20', () => {
    // MFJ, $450,000 of wages and $1,000 of QBI: MAGI $451,000. Overtime
    // deduction: $25,000 cap less $100 x 151 = $9,900. Taxable income before
    // QBI is $451,000 - $31,500 - $9,900 = $409,600, over $394,600.
    const f1040 = makeReturn(
      '1985-06-01',
      {
        w2s: [w2(450000)],
        scheduleK1Form1065s: [k1(1000)],
        obbbDeductions: { qualifiedOvertimePremium: 30000 }
      },
      FilingStatus.MFJ
    )
    expect(f1040.l13b()).toBe(9900)
    expect(f1040.f8995).toBeInstanceOf(F8995A)
    expect((f1040.f8995 as F8995A).l20()).toBe(409600)
  })
})
