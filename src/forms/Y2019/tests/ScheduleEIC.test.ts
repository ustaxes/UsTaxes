/* eslint @typescript-eslint/no-empty-function: "off" */

import * as federal from '../data/federal'
import { with1040Assert } from './common/F1040'

beforeAll(async () => jest.spyOn(console, 'warn').mockImplementation(() => {}))

describe('ScheduleEIC', () => {
  it('should disallow EIC for income below threshold', async () => {
    await with1040Assert(async ([f1040]) => {
      if (f1040.info.taxPayer.filingStatus !== undefined) {
        const formula = federal.EIC.formulas[f1040.info.taxPayer.filingStatus]
        if (formula !== undefined && f1040.wages() < formula[0][1].lowerBound) {
          expect(f1040.scheduleEIC?.allowed(f1040) ?? false).toBe(false)
          expect(f1040.scheduleEIC?.credit(f1040) ?? 0).toBe(0)
        }
      }
    })
  })
})
