/* eslint @typescript-eslint/no-empty-function: "off" */

import * as federal from '../data/federal'
import { testKit, commonTests } from '.'

beforeAll(() => jest.spyOn(console, 'warn').mockImplementation(() => {}))

describe('ScheduleEIC', () => {
  it('should disallow EIC for income below threshold', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040OrFail(forms)
      const formula = federal.EIC.formulas[f1040.info.taxPayer.filingStatus]
      if (formula !== undefined && f1040.wages() < formula[0][1].lowerBound) {
        expect(f1040.scheduleEIC.allowed() ?? false).toBe(false)
        expect(f1040.scheduleEIC.credit() ?? 0).toBe(0)
      }
      return Promise.resolve()
    })
  })
})
