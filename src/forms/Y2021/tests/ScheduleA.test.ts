import { testKit, commonTests } from '.'
import federalBrackets from '../data/federal'
import * as fc from 'fast-check'
import F1040 from '../irsForms/F1040'
import { FilingStatus } from 'ustaxes/core/data'

const withValid1040 = async (
  f: (f1040: F1040, fs: FilingStatus) => void
): Promise<void> =>
  await fc.assert(
    testKit.with1040Property(async (forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      const fs = f1040.info.taxPayer.filingStatus
      if (fs === undefined) {
        throw new Error('Undefined filing status')
      }

      f(f1040, fs)
    })
  )

describe('ScheduleA', () => {
  it('should make deduction > standard deduction if Schedule A is attached', async () => {
    await withValid1040((f1040) => {
      // If Schedule A is attached, the deduction should be greater than the standard deduction
      if (f1040.scheduleA !== undefined) {
        expect(f1040.l12a() ?? 0).toBeGreaterThan(
          f1040.standardDeduction() ?? 0
        )
      }
    })
  })

  it('should be attached if deduction is more than standard', async () => {
    await withValid1040((f1040, fs) => {
      const standardDeduction =
        federalBrackets.ordinary.status[fs].deductions[0].amount

      // If the deduction is more than standard, we must have a schedule A
      // Note dependents of other taxpayers may still itemize.
      if (
        (f1040.l12a() ?? 0) >
        Math.min(standardDeduction, f1040.standardDeduction() ?? 0)
      ) {
        expect(f1040.scheduleA).not.toBe(undefined)
      }
    })
  })
})
