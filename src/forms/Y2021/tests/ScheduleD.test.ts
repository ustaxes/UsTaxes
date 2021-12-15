import * as fc from 'fast-check'
import { with1040Property } from './common/F1040'

describe('ScheduleD', () => {
  it('should never pass through more than allowed losses', async () => {
    await fc.assert(
      with1040Property(async ([f1040]): Promise<void> => {
        expect(Math.round(f1040.l7() ?? 0)).toBeGreaterThanOrEqual(
          -(f1040.scheduleD?.l21Min() ?? Number.POSITIVE_INFINITY)
        )
      })
    )
  })
})
