import {
  FilingStatus,
  IncomeW2,
  PersonRole,
  ScheduleK1Form1065,
  SelfEmployedIncome
} from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'
import ScheduleC from '../irsForms/ScheduleC'

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

const business = (
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE,
  netProfit: number,
  isStatutoryEmployee = false
): SelfEmployedIncome => ({
  personRole,
  grossReceipts: netProfit,
  expenses: 0,
  isStatutoryEmployee
})

// Partnership K-1 with SE earnings (box 14 code A) for one partner.
const k1 = (
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE,
  seEarnings: number
): ScheduleK1Form1065 => ({
  personRole,
  partnershipName: 'Partnership',
  partnershipEin: '999999999',
  partnerOrSCorp: 'P',
  isForeign: false,
  isPassive: false,
  ordinaryBusinessIncome: seEarnings,
  interestIncome: 0,
  guaranteedPaymentsForServices: 0,
  guaranteedPaymentsForCapital: 0,
  selfEmploymentEarningsA: seEarnings,
  selfEmploymentEarningsB: 0,
  selfEmploymentEarningsC: 0,
  distributionsCodeAAmount: 0,
  section199AQBI: 0
})

const person = {
  address: { address: '1 Main St', city: 'city', state: 'AL' as const },
  isTaxpayerDependent: false,
  isBlind: false,
  dateOfBirth: new Date('1985-06-01')
}

const makeReturn = (
  filingStatus: FilingStatus,
  extra: Partial<ValidatedInformation>
): F1040 =>
  new F1040(
    {
      ...blankState,
      taxPayer: {
        filingStatus,
        primaryPerson: {
          ...person,
          firstName: 'Pat',
          lastName: 'Primary',
          ssid: '111111111',
          role: PersonRole.PRIMARY
        },
        spouse: {
          ...person,
          firstName: 'Sam',
          lastName: 'Spouse',
          ssid: '222222222',
          role: PersonRole.SPOUSE
        },
        dependents: []
      },
      ...extra
    },
    []
  )

// SE tax for one person with no W-2 wages: 92.35% of net profit, 12.4% social
// security (up to $176,100) plus 2.9% Medicare.
const seTax = (netProfit: number): number => {
  const l4a = netProfit * 0.9235
  return Math.min(l4a, 176100) * 0.124 + l4a * 0.029
}

describe('Schedule SE is figured per person (2025)', () => {
  it("doesn't let a spouse's W-2 wages use up the other spouse's wage base", () => {
    // Spouse has $180,000 of W-2 wages (over the $176,100 wage base); the
    // primary filer has $50,000 of partnership SE earnings and no W-2. The
    // primary filer's line 8a is 0, so the full 12.4% applies.
    const f1040 = makeReturn(FilingStatus.MFJ, {
      w2s: [w2(PersonRole.SPOUSE, 180000)],
      scheduleK1Form1065s: [k1(PersonRole.PRIMARY, 50000)]
    })
    expect(f1040.scheduleSE.l8a()).toBe(0)
    expect(f1040.scheduleSE.l12()).toBeCloseTo(seTax(50000), 2)
    expect(f1040.scheduleSESpouse?.isNeeded()).toBe(false)
    expect(f1040.schedule2.l4()).toBeCloseTo(seTax(50000), 2)
  })

  it("applies each spouse's own $176,100 wage base", () => {
    // Each spouse has $150,000 of SE earnings. Separately, each one's
    // $138,525 of net earnings is under the wage base.
    const f1040 = makeReturn(FilingStatus.MFJ, {
      scheduleK1Form1065s: [
        k1(PersonRole.PRIMARY, 150000),
        k1(PersonRole.SPOUSE, 150000)
      ]
    })
    expect(f1040.scheduleSE.l12()).toBeCloseTo(seTax(150000), 2)
    expect(f1040.scheduleSESpouse?.l12()).toBeCloseTo(seTax(150000), 2)
    expect(f1040.schedule2.l4()).toBeCloseTo(2 * seTax(150000), 2)
    expect(f1040.schedule1.l15()).toBeCloseTo(seTax(150000), 2)
    // Form 8959 line 8 includes both spouses' line 6 amounts.
    expect(f1040.f8959.l8()).toBeCloseTo(2 * 150000 * 0.9235, 2)
  })

  it('puts the spouse name and SSN on the spouse Schedule SE', () => {
    const f1040 = makeReturn(FilingStatus.MFJ, {
      scheduleK1Form1065s: [k1(PersonRole.SPOUSE, 20000)]
    })
    expect(f1040.scheduleSE.isNeeded()).toBe(false)
    expect(f1040.scheduleSESpouse?.isNeeded()).toBe(true)
    expect(f1040.scheduleSESpouse?.personName()).toBe('Sam Spouse')
    expect(f1040.scheduleSESpouse?.person()?.ssid).toBe('222222222')
  })

  it("ignores the spouse's SE earnings on a married filing separately return", () => {
    const f1040 = makeReturn(FilingStatus.MFS, {
      scheduleK1Form1065s: [k1(PersonRole.SPOUSE, 50000)]
    })
    expect(f1040.scheduleSESpouse).toBeUndefined()
    expect(f1040.scheduleSE.isNeeded()).toBe(false)
    expect(f1040.schedule2.l4()).toBeUndefined()
  })

  it('ignores Schedule C data while no Schedule C is on the return', () => {
    // F1040 doesn't create a ScheduleC yet, so Schedule C profit isn't in
    // income (Schedule 1 line 3) and mustn't be charged SE tax either.
    const f1040 = makeReturn(FilingStatus.S, {
      selfEmployedIncome: [business(PersonRole.PRIMARY, 10000)]
    })
    expect(f1040.schedule1.l3()).toBeUndefined()
    expect(f1040.scheduleSE.isNeeded()).toBe(false)
    expect(f1040.schedule2.l4()).toBeUndefined()
  })

  it('excludes statutory employee income when a Schedule C is attached', () => {
    const f1040 = makeReturn(FilingStatus.S, {
      selfEmployedIncome: [
        business(PersonRole.PRIMARY, 30000, true),
        business(PersonRole.PRIMARY, 10000)
      ]
    })
    f1040.scheduleC = new ScheduleC(f1040)
    expect(f1040.scheduleSE.l2()).toBe(10000)
    expect(f1040.scheduleSE.l12()).toBeCloseTo(seTax(10000), 2)
  })
})
