import { commonTests } from '.'
import * as fc from 'fast-check'

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
})
