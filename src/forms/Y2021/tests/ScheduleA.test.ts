import { commonTests, testKit } from '.'
import * as fc from 'fast-check'
import { FilingStatus, F1098, PersonRole } from 'ustaxes/core/data'
import { run } from 'ustaxes/core/util'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { blankState } from 'ustaxes/redux/reducer'

const baseInfo: ValidatedInformation = {
  ...blankState,
  taxPayer: {
    dependents: [],
    filingStatus: FilingStatus.S,
    primaryPerson: {
      address: {
        address: '',
        city: ''
      },
      firstName: '',
      isTaxpayerDependent: false,
      lastName: '',
      role: PersonRole.PRIMARY,
      ssid: '',
      isBlind: false,
      dateOfBirth: new Date('2000-01-01')
    }
  }
}

const sample1098: F1098 = {
  lender: 'Sample Lender',
  interest: 1000,
  points: 100,
  mortgageInsurancePremiums: 200
}

jest.setTimeout(30000)

describe('ScheduleA', () => {
  it('should make deduction > standard deduction if Schedule A is attached', async () => {
    await commonTests.withValid1040((f1040) => {
      // If Schedule A is attached, the deduction should be greater than the standard deduction
      // Cancel test if Schedule A is not attached
      fc.pre(f1040.scheduleA.isNeeded())

      expect(f1040.l12a() ?? 0).toBeGreaterThan(f1040.standardDeduction() ?? 0)
    })
  })

  it('should be attached if deduction is more than standard', async () => {
    await commonTests.withValid1040((f1040) => {
      const standardDeduction = f1040.standardDeduction() ?? 0

      // If the deduction is more than standard, we must have a schedule A
      // Note dependents of other taxpayers may still itemize.
      if ((f1040.l12a() ?? 0) > standardDeduction) {
        expect(f1040.scheduleA).not.toBe(undefined)
      }
    })
  })

  it('includes 1098 interest and mortgage insurance in line 8', () => {
    const info: ValidatedInformation = {
      ...baseInfo,
      f1098s: [sample1098]
    }

    const f1040 = run(testKit.builder.build(info, []).f1040())
      .map(commonTests.findF1040OrFail)
      .orThrow()

    expect(f1040.scheduleA.l8a()).toEqual(1100)
    expect(f1040.scheduleA.l8d()).toEqual(200)
    expect(f1040.scheduleA.l8e()).toEqual(1300)
  })

  it('adds 1098 values without double-counting persisted itemized values', () => {
    const info: ValidatedInformation = {
      ...baseInfo,
      f1098s: [sample1098],
      itemizedDeductions: {
        interest8a: 50,
        interest8d: 25
      }
    }

    const f1040 = run(testKit.builder.build(info, []).f1040())
      .map(commonTests.findF1040OrFail)
      .orThrow()

    expect(f1040.scheduleA.l8a()).toEqual(1150)
    expect(f1040.scheduleA.l8d()).toEqual(225)
    expect(f1040.scheduleA.l8e()).toEqual(1375)
  })
})
