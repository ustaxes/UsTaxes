import { fica } from '../data/federal'
import F1040 from '../irsForms/F1040'
import F8959 from '../irsForms/F8959'
import Form from 'ustaxes/core/irsForms/Form'
import Schedule2 from '../irsForms/Schedule2'
import Schedule3 from '../irsForms/Schedule3'
import { displayRound } from 'ustaxes/core/irsForms/util'
import { testKit, commonTests } from '.'

jest.setTimeout(100000)

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {
    // do nothing
  })
})

function hasSSRefund(f1040: F1040): boolean {
  const s3 = f1040.schedule3
  const l10 = s3?.l10()
  return l10 !== undefined && l10 > 0
}

function hasAdditionalMedicareTax(f1040: F1040): boolean {
  const medicareTax = f1040.f8959?.l18()
  return medicareTax !== undefined && medicareTax > 0
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
    await testKit.with1040Assert(async (forms) => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (f1040.validW2s().length <= 1) {
        // Should never give SS refund with 1 or fewer W2s
        expect(hasSSRefund(f1040)).toEqual(false)
      } else {
        const ssWithheld = f1040
          .validW2s()
          .map((w2) => w2.ssWithholding)
          .reduce((l, r) => l + r, 0)
        if (
          f1040.wages() <= fica.maxIncomeSSTaxApplies ||
          f1040.validW2s().some((w2) => w2.ssWithholding > fica.maxSSTax) ||
          ssWithheld < fica.maxSSTax
        ) {
          // Should never give SS refund if W2 income below max threshold, some W2 has
          // withheld over the max, or there is no SS withholding to refund.
          expect(hasSSRefund(f1040)).toEqual(false)
        } else {
          // Otherwise, should always give SS refund, and attach schedule 3
          expect(hasSSRefund(f1040)).toEqual(true)
          expect(hasAttachment(forms, Schedule3)).toEqual(true)
        }
      }
    })
  })

  it('should give SS refund based on filing status', async () => {
    await testKit.with1040Assert(async (forms) => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (hasSSRefund(f1040)) {
        const s3l10 = f1040.schedule3?.l10()
        expect(displayRound(s3l10)).not.toBeUndefined()
        expect(s3l10).toBeGreaterThan(0)

        const ssWithheld = f1040
          .validW2s()
          .map((w2) => w2.ssWithholding)
          .reduce((l, r) => l + r, 0)
        expect(s3l10).toEqual(ssWithheld - fica.maxSSTax)
      }
    })
  })

  it('should add Additional Medicare Tax form 8959', async () => {
    await testKit.with1040Assert(async (forms) => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (f1040.info.taxPayer.filingStatus === undefined) {
        return
      }
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
        const selfEmploymentWages = f1040.scheduleSE?.l6() ?? 0
        const hasTax =
          f1040.medicareWages() + selfEmploymentWages >
          fica.additionalMedicareTaxThreshold(filingStatus)
        expect(hasAdditionalMedicareTax(f1040)).toEqual(hasTax)
        expect(hasAttachment(forms, F8959)).toEqual(hasTax)
      }
    })
  })

  it('should add Additional Medicare Tax based on filing status', async () => {
    await testKit.with1040Assert(async (forms) => {
      const f1040 = commonTests.findF1040OrFail(forms)
      if (f1040.info.taxPayer.filingStatus === undefined) {
        return
      }
      if (hasAdditionalMedicareTax(f1040)) {
        const filingStatus = f1040.info.taxPayer.filingStatus
        const selfEmploymentWages = f1040.scheduleSE?.l6() ?? 0
        const incomeOverThreshold =
          f1040.medicareWages() +
          selfEmploymentWages -
          fica.additionalMedicareTaxThreshold(filingStatus)
        expect(incomeOverThreshold).toBeGreaterThan(0)

        // Adds the right amount of additional tax
        const s2l8 = f1040.f8959?.l18()
        expect(s2l8).not.toBeUndefined()
        expect(Math.round(s2l8 ?? 0)).toEqual(
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
          expect(displayRound(f1040l25c)).toEqual(
            displayRound(additionalWithheld)
          )
        } else {
          expect(displayRound(f1040.l25c()) ?? 0).toEqual(0)
        }
      }
    })
  })
})
