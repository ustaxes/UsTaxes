import { displayRound } from 'ustaxes/core/irsForms/util'
import { commonTests, testKit } from '.'

jest.setTimeout(40000)

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((x: string) => {
    if (!x.includes('Removing XFA form data as pdf-lib')) {
      console.warn(x)
    }
  })
})

describe('f1040', () => {
  commonTests.run()

  it('should never have higher AGI than total income', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040(forms)
      expect(f1040).not.toBeUndefined()
      if (f1040 !== undefined) {
        expect(displayRound(f1040.l11()) ?? 0).toBeLessThanOrEqual(
          // It is possible for losses to create negative income.
          displayRound(Math.max(0, f1040.l9())) ?? 0
        )
      }
      return Promise.resolve()
    })
  })

  it('should never produce higher tax than total income', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040(forms)
      expect(f1040).not.toBeUndefined()
      if (f1040 !== undefined) {
        // Remove line 7 for AMT
        expect(
          displayRound(f1040.l24() - (f1040.l17() ?? 0)) ?? 0
        ).toBeLessThanOrEqual(displayRound(Math.max(0, f1040.l9())) ?? 0)
      }
      return Promise.resolve()
    })
  })

  it('should never produce tax on taxable income higher than income', async () => {
    await testKit.with1040Assert((forms): Promise<void> => {
      const f1040 = commonTests.findF1040(forms)
      expect(f1040).not.toBeUndefined()
      if (f1040 !== undefined) {
        // tax on taxable income should be less than taxable income
        if (f1040.l15() > 0) {
          expect(f1040.l16() ?? 0).toBeLessThan(f1040.l15())
        } else {
          expect(f1040.l16() ?? 0).toEqual(0)
        }
      }
      return Promise.resolve()
    })
  })
})
