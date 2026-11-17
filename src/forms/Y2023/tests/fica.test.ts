import { fica } from '../data/federal'
import type F1040 from '../irsForms/F1040'
import F8959 from '../irsForms/F8959'
import type Form from 'ustaxes/core/irsForms/Form'
import Schedule2 from '../irsForms/Schedule2'
import Schedule3 from '../irsForms/Schedule3'
import { displayRound } from 'ustaxes/core/irsForms/util'
import { testKit, commonTests } from '.'
import type { IncomeW2 } from 'ustaxes/core/data'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { run } from 'ustaxes/core/util'
import { blankState } from 'ustaxes/redux/reducer'
import type { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import * as fc from 'fast-check'
import { expectedExcessSSTax } from 'ustaxes/tests/excessSSTax'

jest.setTimeout(30000)

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {
    // do nothing
  })
})

const sampleW2: IncomeW2 = {
  employer: { EIN: '111111111', employerName: 'w2s employer name' },
  personRole: PersonRole.PRIMARY,
  occupation: 'w2s-occupation',
  state: 'AL',
  income: 111,
  medicareIncome: 222,
  fedWithholding: 333,
  ssWages: 111,
  ssWithholding: fica.maxSSTax,
  medicareWithholding: 555,
  stateWages: 666,
  stateWithholding: 777
}

const sampleInfo: ValidatedInformation = {
  ...blankState,
  taxPayer: {
    dependents: [],
    filingStatus: FilingStatus.MFJ,
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
    },
    spouse: {
      firstName: '',
      isTaxpayerDependent: false,
      lastName: '',
      role: PersonRole.SPOUSE,
      ssid: '',
      isBlind: false,
      dateOfBirth: new Date('2000-01-01')
    }
  }
}

const hasSSRefund = (f1040: F1040): boolean => f1040.schedule3.l11() > 0

const expectedExcess = (w2s: IncomeW2[]): number =>
  expectedExcessSSTax(w2s, fica)

function hasAdditionalMedicareTax(f1040: F1040): boolean {
  const medicareTax = f1040.f8959.l18()
  return medicareTax > 0
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Constructor<T> = new (...args: any[]) => T
function hasAttachment<FormType>(
  attachments: Form[],
  formType: Constructor<FormType>
): boolean {
  return (
    attachments.find((f) => {
      return f instanceof formType
    }) !== undefined
  )
}

describe('fica', () => {
  it('should give refund SS tax overpayment only in some conditions', async () => {
    await testKit.with1040Assert((forms) => {
      const f1040 = commonTests.findF1040OrFail(forms)
      const ssRefund = f1040.schedule3.l11()
      const w2s = f1040.validW2s()
      for (const role of [PersonRole.PRIMARY, PersonRole.SPOUSE] as const) {
        if (w2s.filter((w2) => w2.personRole === role).length <= 1) {
          // A person with one or fewer W2s never has a claimable excess
          expect(f1040.schedule3.excessSSTaxWithholdingFor(role)).toEqual(0)
        }
      }
      if (expectedExcess(w2s) > 0) {
        expect(ssRefund).toBeGreaterThan(0)
        expect(hasAttachment(forms, Schedule3)).toEqual(true)
      } else {
        expect(ssRefund).toEqual(0)
      }
      return Promise.resolve()
    })
  })

  it('should give SS refund figured separately for each person', async () => {
    await testKit.with1040Assert((forms) => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (hasSSRefund(f1040)) {
        const ssRefund = f1040.schedule3.l11()
        expect(displayRound(ssRefund)).not.toBeUndefined()
        expect(ssRefund).toBeCloseTo(expectedExcess(f1040.validW2s()), 2)
      } else {
        fc.pre(false)
      }

      return Promise.resolve()
    })
  })

  it('should not give a refund if each person has less than the max', () => {
    const testInfo: ValidatedInformation = {
      ...sampleInfo,
      w2s: [
        {
          ...sampleW2,
          personRole: PersonRole.SPOUSE,
          ssWithholding: fica.maxSSTax
        },
        {
          ...sampleW2,
          personRole: PersonRole.PRIMARY,
          ssWithholding: fica.maxSSTax
        }
      ]
    }

    const f1040 = run(testKit.builder.build(testInfo, []).f1040())
      .map(commonTests.findF1040OrFail)
      .orThrow()

    expect(f1040.schedule3.claimableExcessSSTaxWithholding()).toEqual(0)
  })

  it('should give a refund if a person has more than the max if they have two w2s', () => {
    const testInfo: ValidatedInformation = {
      ...sampleInfo,
      w2s: [
        {
          ...sampleW2,
          personRole: PersonRole.SPOUSE,
          ssWages: fica.maxIncomeSSTaxApplies,
          ssWithholding: fica.maxSSTax
        },
        {
          ...sampleW2,
          employer: { EIN: '222222222', employerName: 'second employer' },
          personRole: PersonRole.SPOUSE,
          ssWages: 16130,
          // This person has already contributed to the max for their other w2 so the refund should equal this amount
          ssWithholding: 1000
        },
        {
          ...sampleW2,
          personRole: PersonRole.PRIMARY,
          ssWithholding: fica.maxSSTax
        }
      ]
    }

    const f1040 = run(testKit.builder.build(testInfo, []).f1040())
      .map(commonTests.findF1040OrFail)
      .orThrow()
    expect(f1040.schedule3.claimableExcessSSTaxWithholding()).toBeCloseTo(
      1000,
      2
    )
  })

  it('should still allow the excess from other employers when one withheld over the max', () => {
    const testInfo: ValidatedInformation = {
      ...sampleInfo,
      w2s: [
        {
          ...sampleW2,
          ssWages: fica.maxIncomeSSTaxApplies,
          ssWithholding: fica.maxSSTax + 500
        },
        {
          ...sampleW2,
          employer: { EIN: '222222222', employerName: 'second employer' },
          ssWages: 20000,
          ssWithholding: 3000
        }
      ]
    }

    const f1040 = run(testKit.builder.build(testInfo, []).f1040())
      .map(commonTests.findF1040OrFail)
      .orThrow()
    expect(f1040.schedule3.l11()).toBeCloseTo(3000, 2)
  })

  it('should add Additional Medicare Tax form 8959', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      const filingStatus = f1040.info.taxPayer.filingStatus
      // Should add Additional Medicare Tax if medicare wages over threshold
      if (
        f1040.medicareWages() >
        fica.additionalMedicareTaxThreshold(filingStatus)
      ) {
        expect(hasAdditionalMedicareTax(f1040)).toEqual(true)

        // Should attach both S2 and F8959 to return
        expect(hasAttachment(forms, Schedule2)).toEqual(true)
        expect(hasAttachment(forms, F8959)).toEqual(true)
      } else {
        const selfEmploymentWages = f1040.scheduleSE.l6() ?? 0
        const hasTax =
          f1040.medicareWages() + selfEmploymentWages >
          fica.additionalMedicareTaxThreshold(filingStatus)
        expect(hasAdditionalMedicareTax(f1040)).toEqual(hasTax)
        expect(hasAttachment(forms, F8959)).toEqual(hasTax)
      }
      return Promise.resolve()
    })
  })

  it('should add Additional Medicare Tax based on filing status', async () => {
    await testKit.with1040Assert(async (forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (hasAdditionalMedicareTax(f1040)) {
        const filingStatus = f1040.info.taxPayer.filingStatus
        const selfEmploymentWages = f1040.scheduleSE.l6() ?? 0
        const incomeOverThreshold =
          f1040.medicareWages() +
          selfEmploymentWages -
          fica.additionalMedicareTaxThreshold(filingStatus)
        expect(incomeOverThreshold).toBeGreaterThan(0)

        // Adds the right amount of additional tax
        const s2l8 = f1040.f8959.l18()
        expect(s2l8).not.toBeUndefined()
        expect(Math.round(s2l8)).toEqual(
          Math.round(incomeOverThreshold * fica.additionalMedicareTaxRate)
        )

        // Also adds in the extra Medicare tax withheld to 1040 taxes already paid
        const medicareWithheld = f1040
          .validW2s()
          .map((w2) => w2.medicareWithholding)
          .reduce((l, r) => l + r, 0)

        const regularWithholding =
          fica.regularMedicareTaxRate * f1040.medicareWages()

        if (medicareWithheld > regularWithholding) {
          const f1040l25c = f1040.l25c()
          expect(f1040l25c).not.toBeUndefined()
          const additionalWithheld = medicareWithheld - regularWithholding
          expect(displayRound(f1040l25c ?? 0)).toEqual(
            displayRound(additionalWithheld)
          )
        } else {
          expect(displayRound(f1040.l25c() ?? 0) ?? 0).toEqual(0)
        }
      }
      return Promise.resolve()
    })
  })
})
