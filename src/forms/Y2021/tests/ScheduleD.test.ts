import * as fc from 'fast-check'
import { testKit, commonTests } from '.'

describe('ScheduleD', () => {
  it('should never pass through more than allowed losses', async () => {
    await fc.assert(
      testKit.with1040Property((forms): Promise<void> => {
        const f1040 = commonTests.findF1040OrFail(forms)
        expect(Math.round(f1040.l7() ?? 0)).toBeGreaterThanOrEqual(
          -(f1040.scheduleD.l21Min() ?? Number.POSITIVE_INFINITY)
        )
        return Promise.resolve()
      })
    )
  })
})
