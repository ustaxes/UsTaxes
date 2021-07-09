import { FilingStatus } from '../redux/data'
import { linear, Piecewise } from '../util'

export const CURRENT_YEAR = 2020

interface TaggedAmount {
  name: string
  amount: number
}

interface Brackets {
  brackets: number[]
}

interface Deductions {
  deductions: TaggedAmount[]
  exemptions: TaggedAmount[]
}

interface Rates {
  rates: number[]
}

interface FederalBrackets {
  ordinary: Rates & {status: {[key in FilingStatus]: Brackets & Deductions}}
  longTermCapGains: Rates & {status: {[key in FilingStatus]: Brackets}}
}

const federalBrackets: FederalBrackets = {
  ordinary: {
    rates: [10, 12, 22, 24, 32, 35, 37],
    status: {
      [FilingStatus.S]: {
        brackets: [9875, 40125, 85525, 163300, 207350, 510300],
        deductions: [
          {
            name: 'Standard Deduction (Single)',
            amount: 12400
          }
        ],
        exemptions: [
          {
            name: 'Standard Exemption (Single)',
            amount: 0
          }
        ]
      },
      [FilingStatus.MFJ]: {
        brackets: [19750, 80250, 171050, 326600, 414700, 622050],
        deductions: [
          {
            name: 'Standard Deduction (Married)',
            amount: 24800
          }
        ],
        exemptions: [
          {
            name: 'Standard Exemption (Single)',
            amount: 0
          }
        ]
      },
      [FilingStatus.W]: {
        brackets: [19750, 80250, 171050, 326600, 414700, 622050],
        deductions: [
          {
            name: 'Standard Deduction (Married)',
            amount: 24800
          }
        ],
        exemptions: [
          {
            name: 'Standard Exemption (Single)',
            amount: 0
          }
        ]
      },
      [FilingStatus.MFS]: {
        brackets: [9875, 40125, 85525, 163300, 207350, 510300],
        deductions: [
          {
            name: 'Standard Deduction (Married Filing Separately)',
            amount: 12400
          }
        ],
        exemptions: [
          {
            name: 'Standard Exemption (Single)',
            amount: 0
          }
        ]
      },
      [FilingStatus.HOH]: {
        brackets: [19750, 80250, 171050, 326600, 414700, 622050],
        deductions: [
          {
            name: 'Standard Deduction (Head of Household)',
            amount: 18650
          }
        ],
        exemptions: [
          {
            name: 'Standard Exemption (Single)',
            amount: 0
          }
        ]
      }
    }
  },
  longTermCapGains: {
    rates: [0, 15, 20],
    status: {
      [FilingStatus.S]: {
        brackets: [40000, 441450]
      },
      [FilingStatus.MFJ]: {
        brackets: [80000, 496600]
      },
      [FilingStatus.W]: {
        brackets: [80000, 496600]
      },
      [FilingStatus.MFS]: {
        brackets: [40000, 248300]
      },
      [FilingStatus.HOH]: {
        brackets: [53600, 469050]
      }
    }
  }
}

export const fica = {
  maxSSTax: 8537.40,
  maxIncomeSSTaxApplies: 137700,

  additionalMedicareTaxThreshold: (filingStatus: FilingStatus) => {
    switch (filingStatus) {
      case FilingStatus.MFJ: {
        return 250000
      }
      case FilingStatus.MFS: {
        return 125000
      }
      default: {
        return 200000 // Single, Head of Household, Windower
      }
    }
  }
}

// line 11 caps based on step one in instructions
const line11Caps = [15820, 41756, 47440, 50954]
const line11MfjCaps = [21710, 47646, 53330, 56844]

type Point = [number, number]

// Provided a list of points, create a piecewise function
// that makes linear segments through the list of points.
const toPieceWise = (points: Point[]): Piecewise => (
  points
    .slice(0, points.length - 1)
    .map((point, idx) => [point, points[idx + 1]])
    .map(([[x1, y1], [x2, y2]]) => ({
      // starting point     slope              intercept
      lowerBound: x1,
      f: linear((y2 - y1) / (x2 - x1), y1 - x1 * (y2 - y1) / (x2 - x1))
    }))
)

// These points are taken directly from IRS publication
// IRS Rev. Proc. 2019-44 for tax year 2020
// https://www.irs.gov/pub/irs-drop/rp-19-44.pdf
const unmarriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [[0, 0], [7030, 538], [8790, 3584], [15820, 0]], // 0
    [[0, 0], [10540, 3584], [19330, 3584], [41756, 0]], // 1
    [[0, 0], [14800, 5920], [19330, 5920], [47440, 0]], // 2
    [[0, 0], [14800, 6660], [19330, 6660], [50954, 0]] // 3 or more
  ]
  return points.map((ps: Point[]) => toPieceWise(ps))
})()

const marriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [[0, 0], [7030, 538], [14680, 3584], [21710, 0]], // 0
    [[0, 0], [10540, 3584], [25220, 3584], [47646, 0]], // 1
    [[0, 0], [14800, 5920], [25220, 5920], [53330, 0]], // 2
    [[0, 0], [14800, 6660], [25220, 6660], [56844, 0]] // 3 or more
  ]
  return points.map((ps) => toPieceWise(ps))
})()

interface EICDef {
  caps: {[k in FilingStatus]: number[] | undefined}
  maxInvestmentIncome: number
  formulas: { [k in FilingStatus]: Piecewise[] | undefined }
}

export const QualifyingDependents = {
  childMaxAge: 17,
  qualifyingDependentMaxAge: 19,
  qualifyingStudentMaxAge: 24
}

export const EIC: EICDef = {
  // credit caps for number of children (0, 1, 2, 3 or more):
  // Step 1
  caps: {
    [FilingStatus.S]: line11Caps,
    [FilingStatus.W]: line11Caps,
    [FilingStatus.HOH]: line11Caps,
    [FilingStatus.MFS]: undefined,
    [FilingStatus.MFJ]: line11MfjCaps
  },
  maxInvestmentIncome: 3650,
  formulas: {
    [FilingStatus.S]: unmarriedFormulas,
    [FilingStatus.W]: unmarriedFormulas,
    [FilingStatus.HOH]: unmarriedFormulas,
    [FilingStatus.MFS]: undefined,
    [FilingStatus.MFJ]: marriedFormulas
  }
}

export default federalBrackets
