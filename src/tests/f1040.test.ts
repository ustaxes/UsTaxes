import fc from 'fast-check'
import { create1040 } from 'ustaxes/irsForms/Main'
import { isRight } from '../util'
import * as arbitraries from './arbitraries'

describe('f1040', () => {
  it('should be created in', () => {
    fc.assert(
      fc.property(arbitraries.information, (information) => {
        const f1040Res = create1040(information)
        if (isRight(f1040Res)) {
          const [f1040, forms] = f1040Res.right
          expect(f1040.errors()).toEqual([])
          expect(forms).not.toEqual([])
        } else {
          const errs = f1040Res.left
          expect(errs).not.toEqual([])
        }
      })
    )
  })

  it('should not create duplicate schedules in', () => {
    fc.assert(
      fc.property(arbitraries.information, (information) => {
        const f1040Res = create1040(information)
        if (isRight(f1040Res)) {
          const [, forms] = f1040Res.right
          expect(new Set(forms.map((a) => a.tag)).size).toEqual(forms.length)
          expect(new Set(forms.map((a) => a.sequenceIndex)).size).toEqual(
            forms.length
          )
        }
      })
    )
  })

  it('should arrange attachments according to sequence order', () => {
    fc.assert(
      fc.property(arbitraries.information, (information) => {
        const f1040Res = create1040(information)
        if (isRight(f1040Res)) {
          const [, forms] = f1040Res.right
          expect(
            forms.sort((a, b) => a.sequenceIndex - b.sequenceIndex)
          ).toEqual(forms)
        }
      })
    )
  })
})
