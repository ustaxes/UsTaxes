import { with1040Assert } from './common/F1040'

describe('f1040', () => {
  it('should be created in', async () => {
    await with1040Assert(async ([f1040, forms]) => {
      expect(f1040.errors()).toEqual([])
      expect(forms).not.toEqual([])
    })
  })

  it('should not create duplicate schedules in', async () => {
    await with1040Assert(async ([, forms]) => {
      expect(new Set(forms.map((a) => a.tag)).size).toEqual(forms.length)
      expect(new Set(forms.map((a) => a.sequenceIndex)).size).toEqual(
        forms.length
      )
    })
  })

  it('should arrange attachments according to sequence order', async () => {
    await with1040Assert(async ([, forms]) => {
      expect(forms.sort((a, b) => a.sequenceIndex - b.sequenceIndex)).toEqual(
        forms
      )
    })
  })

  it('should never produce higher tax than income', async () => {
    await with1040Assert(async ([f1040]) => {
      // tax is less than taxable income
      if (f1040.l15() ?? 0 > 0) {
        expect(f1040.l24() ?? 0).toBeLessThan(f1040.l15() ?? 0)
      } else {
        expect(f1040.l24() ?? 0).toEqual(0)
      }
    })
  })
})
