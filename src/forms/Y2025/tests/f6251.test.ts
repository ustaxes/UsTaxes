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

  // 2025 Form 6251 line 2f: the alternative tax net operating loss deduction
  // is shown in parentheses and reduces AMTI on line 4.
  it('subtracts the ATNOLD on line 2f from AMTI', () => {
    const without = new F6251(new F1040(cloneDeep(baseInformation), []))

    const information = cloneDeep(baseInformation)
    information.amtAdjustments = { atnold: 20000 }
    const f6251 = new F6251(new F1040(information, []))

    expect(f6251.l2f()).toEqual(20000)
    expect(f6251.l4()).toEqual((without.l4() ?? 0) - 20000)
    expect(f6251.l11()).toBeLessThan(without.l11())
  })

  it('treats an ATNOLD entered as a negative number the same way', () => {
    const positive = cloneDeep(baseInformation)
    positive.amtAdjustments = { atnold: 20000 }
    const negative = cloneDeep(baseInformation)
    negative.amtAdjustments = { atnold: -20000 }

    const fromPositive = new F6251(new F1040(positive, []))
    const fromNegative = new F6251(new F1040(negative, []))
    expect(fromNegative.l2f()).toEqual(20000)
    expect(fromNegative.l4()).toEqual(fromPositive.l4())
  })

  // 2025 Form 6251 line 2s: pre-1987 installment sale income is entered as a
  // negative amount and reduces AMTI on line 4.
  it('subtracts installment sale income on line 2s, whatever its sign', () => {
    const without = new F6251(new F1040(cloneDeep(baseInformation), []))

    const positive = cloneDeep(baseInformation)
    positive.amtAdjustments = { installmentSales: 5000 }
    const negative = cloneDeep(baseInformation)
    negative.amtAdjustments = { installmentSales: -5000 }

    const fromPositive = new F6251(new F1040(positive, []))
    const fromNegative = new F6251(new F1040(negative, []))
    expect(fromPositive.l2s()).toEqual(5000)
    expect(fromNegative.l2s()).toEqual(5000)
    expect(fromPositive.l4()).toEqual((without.l4() ?? 0) - 5000)
    expect(fromNegative.l4()).toEqual(fromPositive.l4())
  })

  // Filing requirement 4: lines 2c through 3 total a negative amount, and
  // line 7 would be more than line 10 without them.
  it('is needed when lines 2c through 3 are negative and hide the AMT', () => {
    const information = cloneDeep(baseInformation)
    // Line 2i is +100,000 from the stock options. Lines 2f and 2s together
    // subtract 150,000, so lines 2c through 3 total -50,000.
    information.amtAdjustments = { atnold: 140000, installmentSales: -10000 }
    const f6251 = new F6251(new F1040(information, []))

    // Put the regular tax between the tentative minimum tax with and
    // without lines 2c through 3.
    const withAdjustments = f6251.l7() ?? 0
    const withoutAdjustments = f6251.l7(50000) ?? 0
    expect(withoutAdjustments).toBeGreaterThan(withAdjustments)
    jest
      .spyOn(f6251, 'l10')
      .mockReturnValue((withAdjustments + withoutAdjustments) / 2)

    expect(f6251.l7() ?? 0).toBeLessThanOrEqual(f6251.l10())
    expect(f6251.isNeeded()).toEqual(true)
  })

  it('is not needed when lines 2c through 3 are negative but hide no AMT', () => {
    const information = cloneDeep(baseInformation)
    information.amtAdjustments = { atnold: 140000, installmentSales: -10000 }
    const f6251 = new F6251(new F1040(information, []))

    jest.spyOn(f6251, 'l10').mockReturnValue((f6251.l7(50000) ?? 0) + 1)

    expect(f6251.isNeeded()).toEqual(false)
  })
})
