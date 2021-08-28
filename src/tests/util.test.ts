import * as fc from 'fast-check'
import { Arbitrary } from 'fast-check'

import { segments } from 'ustaxes/util'

const segmentsArbitrary: Arbitrary<[string[], number]> = fc
  .array(fc.char(), { minLength: 1 })
  .chain((xs) => fc.integer({ min: 1, max: xs.length }).map((n) => [xs, n]))

const boundlessSegmentsArbitrary: Arbitrary<[string[], number]> = fc
  .array(fc.char())
  .chain((xs) => fc.integer().map((n) => [xs, n]))

const segmentsProps = (f: (xs: string[], posN: number) => boolean): void =>
  fc.assert(fc.property(segmentsArbitrary, ([xs, n]) => f(xs, n)))

describe('segments', () => {
  it('should not crash for bad inputs', () => {
    fc.assert(
      fc.property(boundlessSegmentsArbitrary, ([xs, n]) => {
        if (n < 0 || xs.length === 0) {
          expect(segments(n, xs)).toEqual([xs])
        } else if (n >= xs.length) {
          const ss = segments(n, xs)
          expect(ss.length).toEqual(xs.length)
          expect(ss.flat()).toEqual(xs)
        }
      })
    )
  })

  it('should not change order or contents', () => {
    segmentsProps((xs, n) => {
      const ss = segments(n, xs)
      expect(ss.flat()).toEqual(xs)
      return true
    })
  })
  it('should have appropriate lengths', () => {
    segmentsProps((xs, n) => {
      const ss = segments(n, xs)
      ss.forEach((s, i) => {
        const expSegmentLength = Math.floor(xs.length / n)
        if (i === n - 1 && xs.length % n !== 0) {
          // last segment will have the remainder
          expect(s.length).toEqual(xs.length - expSegmentLength * (n - 1))
        } else {
          expect(s.length).toEqual(expSegmentLength)
        }
      })
      return true
    })
  })
})
