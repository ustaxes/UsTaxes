import { fica } from '../data/federal'
import type F1040 from '../irsForms/F1040'
import F8959 from '../irsForms/F8959'
import type Form from 'ustaxes/core/irsForms/Form'
import { displayRound } from 'ustaxes/core/irsForms/util'
import Schedule2 from '../irsForms/Schedule2'
import Schedule3 from '../irsForms/Schedule3'
import { claimableExcessSSTaxWithholding } from 'ustaxes/forms/Y2020/irsForms/Schedule3'
import { testKit, commonTests } from '.'
import type { IncomeW2 } from 'ustaxes/core/data'
import { PersonRole } from 'ustaxes/core/data'
import { expectedExcessSSTax } from 'ustaxes/tests/excessSSTax'

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {
    // do nothing
  })
})

jest.setTimeout(30000)

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

const expectedExcess = (w2s: IncomeW2[]): number =>
  expectedExcessSSTax(w2s, fica)

const hasSSRefund = (f1040: F1040): boolean => f1040.schedule3.l10() > 0

const hasAdditionalMedicareTax = (f1040: F1040): boolean =>
  f1040.f8959.l18() > 0

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
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (expectedExcess(f1040.validW2s()) > 0) {
        expect(hasSSRefund(f1040)).toEqual(true)
        expect(hasAttachment(forms, Schedule3)).toEqual(true)
      } else {
        expect(hasSSRefund(f1040)).toEqual(false)
      }
      return Promise.resolve()
    })
  })

  it('should give SS refund figured separately for each person', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (hasSSRefund(f1040)) {
        const s3l10 = f1040.schedule3.l10()
        expect(displayRound(s3l10)).not.toBeUndefined()
        expect(s3l10).toBeCloseTo(expectedExcess(f1040.validW2s()), 2)
      }
      return Promise.resolve()
    })
  })

  it('should not give a refund if each person has less than the max', () => {
    expect(
      claimableExcessSSTaxWithholding([
        { ...sampleW2, personRole: PersonRole.SPOUSE },
        { ...sampleW2, personRole: PersonRole.PRIMARY }
      ])
    ).toEqual(0)
  })

  it('should give a refund if a person has more than the max if they have two w2s', () => {
    expect(
      claimableExcessSSTaxWithholding([
        {
          ...sampleW2,
          personRole: PersonRole.SPOUSE,
          ssWages: fica.maxIncomeSSTaxApplies
        },
        {
          ...sampleW2,
          employer: { EIN: '222222222', employerName: 'second employer' },
          personRole: PersonRole.SPOUSE,
          ssWages: 16130,
          // This person has already contributed to the max for their other w2 so the refund should equal this amount
          ssWithholding: 1000
        },
        { ...sampleW2, personRole: PersonRole.PRIMARY }
      ])
    ).toBeCloseTo(1000, 2)
  })

  it('should still allow the excess from other employers when one withheld over the max', () => {
    expect(
      claimableExcessSSTaxWithholding([
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
      ])
    ).toBeCloseTo(3000, 2)
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
        expect(hasAdditionalMedicareTax(f1040)).toEqual(false)
        expect(hasAttachment(forms, F8959)).toEqual(false)
      }
      return Promise.resolve()
    })
  })

  it('should add Additional Medicare Tax based on filing status', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (hasAdditionalMedicareTax(f1040)) {
        const filingStatus = f1040.info.taxPayer.filingStatus
        const incomeOverThreshold =
          f1040.medicareWages() -
          fica.additionalMedicareTaxThreshold(filingStatus)
        expect(incomeOverThreshold).toBeGreaterThan(0)

        // Adds the right amount of additional tax
        const s2l8 = f1040.f8959.l18()
        expect(s2l8).not.toBeUndefined()
        expect(displayRound(s2l8)).toEqual(
          displayRound(incomeOverThreshold * fica.additionalMedicareTaxRate)
        )

        // Also adds in the extra Medicare tax withheld to 1040 taxes already paid
        const medicareWithheld = f1040
          .validW2s()
          .reduce((sum, w2) => sum + w2.medicareWithholding, 0)
        const regularWithholding = Math.round(
          fica.regularMedicareTaxRate * f1040.medicareWages()
        )
        if (medicareWithheld > regularWithholding) {
          const f1040l25c = f1040.l25c()
          expect(f1040l25c).not.toBeUndefined()
          const additionalWithheld = medicareWithheld - regularWithholding
          expect(displayRound(f1040l25c ?? 0)).toEqual(
            displayRound(additionalWithheld)
          )
        } else {
          expect(displayRound(f1040.l25c() ?? 0)).toBeUndefined()
        }
      }
      return Promise.resolve()
    })
  })
})
