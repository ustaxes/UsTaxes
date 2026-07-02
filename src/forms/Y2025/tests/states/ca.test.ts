import * as fc from 'fast-check'
import { FilingStatus, Information } from 'ustaxes/core/data'
import { create1040 } from '../../irsForms/Main'
import { createStateReturn } from '../../stateForms'
import { isLeft, isRight } from 'ustaxes/core/util'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import parameters from '../../stateForms/CA/Parameters'
import CA540 from '../../stateForms/CA/CA540'

const A = new arbitraries.Arbitraries(2025)

/**
 * Rows sampled from the published 2025 California Tax Table
 * (https://www.ftb.ca.gov/forms/2025/2025-540-taxtable.pdf):
 * [at least, but not over, single/MFS, MFJ/QSS, HOH]
 */
const taxTableRows: [number, number, number, number, number][] = [
  [751, 850, 8, 8, 8],
  [851, 950, 9, 9, 9],
  [3651, 3750, 37, 37, 37],
  [7151, 7250, 72, 72, 72],
  [11051, 11150, 111, 111, 111],
  [13851, 13950, 167, 139, 139],
  [15751, 15850, 205, 158, 158],
  [16251, 16350, 215, 163, 163],
  [20351, 20450, 297, 204, 204],
  [27151, 27250, 452, 322, 322],
  [28051, 28150, 488, 340, 340],
  [33451, 33550, 704, 448, 448],
  [36051, 36150, 808, 500, 500],
  [41051, 41150, 1008, 600, 600],
  [45251, 45350, 1253, 684, 684],
  [50851, 50950, 1589, 796, 796],
  [52751, 52850, 1703, 840, 840],
  [54151, 54250, 1787, 896, 896],
  [62351, 62450, 2376, 1224, 1224],
  [65851, 65950, 2656, 1364, 1364],
  [71951, 72050, 3144, 1608, 1693],
  [72651, 72750, 3200, 1636, 1735],
  [77551, 77650, 3655, 1832, 2029],
  [79751, 79850, 3860, 1920, 2161],
  [91351, 91450, 4939, 2554, 3009]
]

describe('CA 2025 tax computation', () => {
  it('matches sampled rows of the published tax table', () => {
    taxTableRows.forEach(([lo, hi, s, mfj, hoh]) => {
      // both ends of the range fall in the same table row
      ;[lo, hi].forEach((ti) => {
        expect(parameters.computeTax(FilingStatus.S, ti)).toBe(s)
        expect(parameters.computeTax(FilingStatus.MFS, ti)).toBe(s)
        expect(parameters.computeTax(FilingStatus.MFJ, ti)).toBe(mfj)
        expect(parameters.computeTax(FilingStatus.W, ti)).toBe(mfj)
        expect(parameters.computeTax(FilingStatus.HOH, ti)).toBe(hoh)
      })
    })
  })

  it('matches the FTB rate schedule example (MFJ, $125,000 → $4,768)', () => {
    expect(parameters.computeTax(FilingStatus.MFJ, 125000)).toBe(4768)
  })

  it('uses the rate schedule above $100,000', () => {
    // Schedule X: 3201.97 + 9.3% × (150,000 − 72,724) = 10,388.64
    expect(parameters.computeTax(FilingStatus.S, 150000)).toBe(10389)
  })

  it('tax is monotonic in taxable income', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2000000 }),
        fc.integer({ min: 0, max: 1000 }),
        (ti, bump) => {
          const status = FilingStatus.S
          expect(
            parameters.computeTax(status, ti + bump)
          ).toBeGreaterThanOrEqual(parameters.computeTax(status, ti))
        }
      )
    )
  })
})

describe('CA 2025 exemption phaseout', () => {
  it('no reduction at or below the threshold', () => {
    expect(parameters.exemptionReductionPerCredit(FilingStatus.S, 252203)).toBe(
      0
    )
  })
  it('reduces $6 per $2,500 or fraction over the threshold', () => {
    expect(parameters.exemptionReductionPerCredit(FilingStatus.S, 252204)).toBe(
      6
    )
    expect(
      parameters.exemptionReductionPerCredit(FilingStatus.S, 252203 + 5000)
    ).toBe(12)
  })
})

const withCAReturn = (
  info: Information,
  logContext: fc.ContextValue,
  test: (ca540: CA540) => void
): void => {
  info.stateResidencies = [{ state: 'CA' }]
  info.w2s.forEach((w2) => {
    w2.state = 'CA'
  })
  const f1040Result = create1040(info, [])
  if (isLeft(f1040Result)) {
    logContext.log(f1040Result.left.join(';'))
    return
  }
  const [f1040] = f1040Result.right
  const stateReturn = createStateReturn(f1040)
  if (isLeft(stateReturn)) {
    throw new Error(stateReturn.left.join(';'))
  }
  const ca540 = stateReturn.right.find((f) => f.formName === '540')
  expect(ca540).not.toBeUndefined()
  test(ca540 as CA540)
}

describe('CA540', () => {
  it('produces a state return for CA residents', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
        withCAReturn(info, ctx, (ca540) => {
          expect(isRight(createStateReturn(ca540.f1040))).toBe(true)
        })
      })
    )
  })

  it('line 13 equals federal AGI and CA AGI follows the adjustments', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
        withCAReturn(info, ctx, (ca540) => {
          expect(ca540.l13()).toBe(ca540.f1040.l11b())
          expect(ca540.l17()).toBe(ca540.l15() + ca540.l16())
          expect(ca540.l19()).toBeGreaterThanOrEqual(0)
          expect(Number.isNaN(ca540.l64())).toBe(false)
          expect(Number.isNaN(ca540.l115())).toBe(false)
        })
      })
    )
  })

  it('withholding on line 71 sums CA W-2 state withholding', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
        withCAReturn(info, ctx, (ca540) => {
          const expected = info.w2s.reduce(
            (sum, w2) => sum + (w2.stateWithholding ?? 0),
            0
          )
          expect(ca540.l71()).toBe(expected)
        })
      })
    )
  })

  it('standard deduction applies when not itemizing', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
        info.itemizedDeductions = undefined
        withCAReturn(info, ctx, (ca540) => {
          expect(ca540.l18()).toBe(
            parameters.standardDeduction(ca540.filingStatus())
          )
        })
      })
    )
  })

  it('renter credit granted only under the CA AGI limit', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
        info.caStateInfo = { qualifiesForRentersCredit: true }
        withCAReturn(info, ctx, (ca540) => {
          const limit = parameters.rentersCredit.caAGILimit(
            ca540.filingStatus()
          )
          if (ca540.l17() <= limit) {
            expect(ca540.l46()).toBe(
              parameters.rentersCredit.amount(ca540.filingStatus())
            )
          } else {
            expect(ca540.l46()).toBeUndefined()
          }
        })
      })
    )
  })

  it('ISR penalty is zero with full-year coverage and bounded otherwise', () => {
    fc.assert(
      fc.property(
        A.information(),
        fc.integer({ min: 0, max: 12 }),
        fc.context(),
        (info, months, ctx) => {
          info.caStateInfo = { monthsWithoutHealthCoverage: months }
          withCAReturn(info, ctx, (ca540) => {
            if (months === 0) {
              expect(ca540.l92()).toBe(0)
              expect(ca540.fullYearCoverage()).toBe(true)
            } else {
              expect(ca540.l92()).toBeGreaterThanOrEqual(0)
              expect(ca540.l92()).toBeLessThanOrEqual(ca540.ca3853.bronzeCap())
            }
          })
        }
      )
    )
  })

  it('payments balance: refund and tax due are mutually exclusive', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
        withCAReturn(info, ctx, (ca540) => {
          if (ca540.l115() > 0) {
            expect(ca540.l111() ?? 0).toBe(0)
          }
        })
      })
    )
  })
})
