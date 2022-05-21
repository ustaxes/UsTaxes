import * as fc from 'fast-check'
import { testKit, commonTests } from '.'

describe('ScheduleD', () => {
  it('should never pass through more than allowed losses', async () => {
    await fc.assert(
      testKit.with1040Property(async (forms): Promise<void> => {
        const f1040 = commonTests.findF1040(forms)
        expect(f1040).not.toBeUndefined()
        if (f1040 !== undefined) {
          expect(Math.round(f1040.l7() ?? 0)).toBeGreaterThanOrEqual(
            -(f1040.scheduleD?.l21Min() ?? Number.POSITIVE_INFINITY)
          )
        }
        return Promise.resolve()
      })
    )
  })
})
