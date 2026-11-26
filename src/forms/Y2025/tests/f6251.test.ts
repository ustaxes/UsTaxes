/* eslint @typescript-eslint/no-empty-function: "off" */

import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import F1040 from '../irsForms/F1040'
import F6251 from '../irsForms/F6251'
import { cloneDeep } from 'lodash'
import type { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import federalBrackets, { amt } from '../data/federal'

const baseInformation: ValidatedInformation = {
  f1099s: [],
  f3921s: [
    {
      name: 'Stock Option',
      personRole: PersonRole.PRIMARY,
      exercisePricePerShare: 1,
      fmv: 101,
      numShares: 1000
    }
  ],
  credits: [],
  scheduleK1Form1065s: [],
  itemizedDeductions: undefined,
  w2s: [
    {
      employer: { EIN: '111111111', employerName: 'w2s employer name' },
      personRole: PersonRole.PRIMARY,
      occupation: 'w2s-occupation',
      state: 'AL',
      income: 100000,
      medicareIncome: 0,
      fedWithholding: 0,
      ssWages: 100000,
      ssWithholding: 0,
      medicareWithholding: 0,
      stateWages: 100000,
      stateWithholding: 0
    }
  ],
  estimatedTaxes: [],
  realEstate: [],
  taxPayer: {
    primaryPerson: {
      address: {
        address: '0001',
        aptNo: '',
        city: 'AR city',
        state: 'AR',
        zip: '1234567'
      },
      firstName: 'payer-first-name',
      lastName: 'payer-last-name',
      isTaxpayerDependent: false,
      role: PersonRole.PRIMARY,
      ssid: '111111111',
      dateOfBirth: new Date('01/01/1970'),
      isBlind: false
    },
    spouse: undefined,
    dependents: [],
    filingStatus: FilingStatus.S
  },
  questions: {},
  f1098es: [],
  stateResidencies: [{ state: 'AL' }],
  healthSavingsAccounts: [],
  individualRetirementArrangements: []
}

describe('AMT', () => {
  it('stock options should trigger AMT', () => {
    const information = cloneDeep(baseInformation)
    const income = baseInformation.w2s[0].income
    const f1040 = new F1040(information, [])
    const f6251 = new F6251(f1040)
    expect(f6251.isNeeded()).toEqual(true)
    expect(Math.round(f6251.l1b())).toEqual(
      income -
        federalBrackets.ordinary.status[FilingStatus.S].deductions[0].amount
    )
    expect(Math.round(f6251.l7() ?? 0)).toEqual(
      (income + 100000 - amt.excemption(FilingStatus.S, income + 100000)) * 0.26
    )
    expect(Math.round(f6251.l10())).toEqual(Math.round(f1040.l16() ?? 0))
    expect(Math.round(f6251.l11())).toEqual(
      Math.round(f6251.l9() - f6251.l10())
    )
  })

  it('small stock options should NOT trigger AMT', () => {
    const information = cloneDeep(baseInformation)
    information.f3921s[0].exercisePricePerShare = 100

    const f1040 = new F1040(information, [])
    const f6251 = new F6251(f1040)
    expect(f6251.isNeeded()).toEqual(false)
    expect(Math.round(f6251.l11())).toEqual(0)
  })

  // 2025 Form 6251 line 2b: state and local income tax refunds from Schedule 1
  // line 1 reduce AMTI. Other income on Schedule 1 line 8z does not.
  it('subtracts the state tax refund on line 2b', () => {
    const without = new F6251(new F1040(cloneDeep(baseInformation), []))

    const information = cloneDeep(baseInformation)
    information.otherIncome = { taxableStateLocalRefunds: 2000 }
    const f6251 = new F6251(new F1040(information, []))

    expect(f6251.l2b()).toEqual(2000)
    // The refund adds 2,000 to AGI on line 1b and line 2b takes it back out.
    expect(f6251.l4()).toEqual(without.l4())
  })

  it('keeps other Schedule 1 line 8z income in AMTI', () => {
    const without = new F6251(new F1040(cloneDeep(baseInformation), []))

    const f1040 = new F1040(cloneDeep(baseInformation), [])
    jest.spyOn(f1040.schedule1, 'l8z').mockReturnValue(30000)
    const f6251 = new F6251(f1040)

    expect(f6251.l2b()).toBeUndefined()
    expect(f6251.l4()).toEqual((without.l4() ?? 0) + 30000)
  })
})
