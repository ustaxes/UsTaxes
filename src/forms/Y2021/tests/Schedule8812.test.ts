import { commonTests } from '.'
import Schedule8812 from '../irsForms/Schedule8812'
import F1040 from '../irsForms/F1040'

const withSchedule8812 = async (
  f: (f1040: F1040, s8812: Schedule8812) => void
): Promise<void> =>
  await commonTests.withValid1040(
    (f1040: F1040): void => {
      if (f1040.schedule8812.isNeeded()) {
        f(f1040, f1040.schedule8812)
      }
    },
    // Add filter to info property so we're only testing in the domain
    // we care about.
    (info) => info.taxPayer.dependents.length > 0
  )

describe('Schedule 8812', () => {
  it('should be attached with qualifiying dependents', async () => {
    await commonTests.withValid1040((f1040) => {
      // If there are qualifying dependents, we must have a schedule 8812
      if (f1040.qualifyingDependents.qualifyingChildren().length > 0) {
        expect(f1040.schedule8812).not.toBe(undefined)
      }
    })
  })

  it('should not produce line 5 with no dependents', async () => {
    await withSchedule8812((f1040, s8812) => {
      // If Schedule A is attached, the deduction should be greater than the standard deduction
      if (s8812.l4a() === 0) {
        expect(s8812.l5()).toEqual(0)
      }
    })
  })

  it('should show a multiple of 1000 at l10', async () => {
    await withSchedule8812((f1040, s8812) => {
      expect(s8812.l10() % 1000).toEqual(0)
    })
  })
})
