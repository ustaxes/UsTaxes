import fc from 'fast-check'
import { fica } from 'ustaxes/data/federal'
import F1040 from 'ustaxes/irsForms/F1040'
import F8959 from 'ustaxes/irsForms/F8959'
import Form from 'ustaxes/irsForms/Form'
import { create1040 } from 'ustaxes/irsForms/Main'
import Schedule2 from 'ustaxes/irsForms/Schedule2'
import Schedule3 from 'ustaxes/irsForms/Schedule3'
import { isRight } from '../util'
import * as arbitraries from './arbitraries'

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
  it('should give refund SS tax overpayment only in some conditions', () => {
    fc.assert(
      fc.property(arbitraries.information, (information) => {
        const f1040Result = create1040(information)
        if (isRight(f1040Result)) {
          const [f1040, forms] = f1040Result.right
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
        }
      })
    )
  })

  it('should give SS refund based on filing status', () => {
    fc.assert(
      fc.property(arbitraries.f1040, ([f1040]) => {
        if (hasSSRefund(f1040)) {
          const s3l10 = f1040.schedule3?.l10()
          expect(s3l10).not.toBeUndefined()
          expect(s3l10).toBeGreaterThan(0)

          const ssWithheld = f1040
            .validW2s()
            .map((w2) => w2.ssWithholding)
            .reduce((l, r) => l + r, 0)
          expect(s3l10).toEqual(ssWithheld - fica.maxSSTax)
        }
      })
    )
  })

  it('should add Additional Medicare Tax form 8959', () => {
    fc.assert(
      fc.property(arbitraries.f1040, ([f1040, forms]) => {
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
          expect(hasAdditionalMedicareTax(f1040)).toEqual(false)
          expect(hasAttachment(forms, F8959)).toEqual(false)
        }
      })
    )
  })

  it('should add Additional Medicare Tax based on filing status', () => {
    fc.assert(
      fc.property(arbitraries.f1040, ([f1040]) => {
        if (f1040.info.taxPayer.filingStatus === undefined) {
          return
        }
        if (hasAdditionalMedicareTax(f1040)) {
          const filingStatus = f1040.info.taxPayer.filingStatus
          const incomeOverThreshold =
            f1040.medicareWages() -
            fica.additionalMedicareTaxThreshold(filingStatus)
          expect(incomeOverThreshold).toBeGreaterThan(0)

          // Adds the right amount of additional tax
          const s2l8 = f1040.f8959?.l18()
          expect(s2l8).not.toBeUndefined()
          expect(s2l8).toEqual(
            Math.round(incomeOverThreshold * fica.additionalMedicareTaxRate)
          )

          // Also adds in the extra Medicare tax withheld to 1040 taxes already paid
          const medicareWithheld = f1040
            .validW2s()
            .map((w2) => w2.medicareWithholding)
            .reduce((l, r) => l + r, 0)
          const regularWithholding = Math.round(
            fica.regularMedicareTaxRate * f1040.medicareWages()
          )
          if (medicareWithheld > regularWithholding) {
            const f1040l25c = f1040.l25c()
            expect(f1040l25c).not.toBeUndefined()
            const additionalWithheld = medicareWithheld - regularWithholding
            expect(f1040l25c).toEqual(additionalWithheld)
          } else {
            expect(f1040.l25c()).toBeUndefined()
          }
        }
      })
    )
  })
})
