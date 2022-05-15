import { FilingStatus } from 'ustaxes/core/data'
import { linear, Piecewise } from 'ustaxes/core/util'

export const CURRENT_YEAR = 2021

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
  ordinary: Rates & { status: { [key in FilingStatus]: Brackets & Deductions } }
  longTermCapGains: Rates & { status: { [key in FilingStatus]: Brackets } }
}

const federalBrackets: FederalBrackets = {
  ordinary: {
    rates: [10, 12, 22, 24, 32, 35, 37],
    status: {
      [FilingStatus.S]: {
        brackets: [9950, 40525, 86375, 164925, 209425, 523600],
        deductions: [
          {
            name: 'Standard Deduction (Single)',
            amount: 12550
          },
          {
            name: 'Standard Deduction (Single) with 1 age or blindness allowance',
            amount: 14250
          },
          {
            name: 'Standard Deduction (Single) with 2 age or blindness allowances',
            amount: 15950
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
        brackets: [19900, 81050, 172750, 329850, 418850, 628300],
        deductions: [
          {
            name: 'Standard Deduction (Married)',
            amount: 25100
          },
          {
            name: 'Standard Deduction (Married) with 1 age or blindness allowance',
            amount: 26450
          },
          {
            name: 'Standard Deduction (Married) with 2 age or blindness allowances',
            amount: 27800
          },
          {
            name: 'Standard Deduction (Married) with 3 age or blindness allowances',
            amount: 29150
          },
          {
            name: 'Standard Deduction (Married) with 4 age or blindness allowances',
            amount: 30500
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
        brackets: [19900, 81050, 172750, 329850, 418850, 628300],
        deductions: [
          {
            name: 'Standard Deduction (Widowed)',
            amount: 24800
          },
          {
            name: 'Standard Deduction (Widowed) with 1 age or blindness allowance',
            amount: 26450
          },
          {
            name: 'Standard Deduction (Widowed) with 2 age or blindness allowances',
            amount: 27800
          }
        ],
        exemptions: [
          {
            name: 'Standard Exemption (Widowed)',
            amount: 0
          }
        ]
      },
      [FilingStatus.MFS]: {
        brackets: [9950, 40525, 86375, 164925, 209425, 314150],
        deductions: [
          {
            name: 'Standard Deduction (Married Filing Separately)',
            amount: 12550
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 1 age or blindness allowance',
            amount: 13900
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 2 age or blindness allowances',
            amount: 15250
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 3 age or blindness allowances',
            amount: 16600
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 4 age or blindness allowances',
            amount: 17950
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
        brackets: [14200, 54200, 86350, 164900, 209400, 523600],
        deductions: [
          {
            name: 'Standard Deduction (Head of Household)',
            amount: 18800
          },
          {
            name: 'Standard Deduction (Head of Household) with 1 age or blindness allowance',
            amount: 20500
          },
          {
            name: 'Standard Deduction (Head of Household) with 2 age or blindness allowances',
            amount: 22200
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
        brackets: [40400, 445850]
      },
      [FilingStatus.MFJ]: {
        brackets: [80800, 501600]
      },
      [FilingStatus.W]: {
        brackets: [80800, 501600]
      },
      [FilingStatus.MFS]: {
        brackets: [40400, 250800]
      },
      [FilingStatus.HOH]: {
        brackets: [54100, 473750]
      }
    }
  }
}

export const fica = {
  maxSSTax: 8853.6,
  maxIncomeSSTaxApplies: 142800,

  regularMedicareTaxRate: 1.45 / 100,
  additionalMedicareTaxRate: 0.9 / 100,
  additionalMedicareTaxThreshold: (filingStatus: FilingStatus): number => {
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

// Net Investment Income Tax calculated on form 8960
export const netInvestmentIncomeTax = {
  taxRate: 0.038, // 3.8%
  taxThreshold: (filingStatus: FilingStatus): number => {
    switch (filingStatus) {
      case FilingStatus.MFJ: {
        return 250000
      }
      case FilingStatus.W: {
        return 250000
      }
      case FilingStatus.MFS: {
        return 125000
      }
      default: {
        return 200000 // Single, Head of Household
      }
    }
  }
}

export const healthSavingsAccounts = {
  contributionLimit: {
    'self-only': 3600,
    family: 7200
  }
}

// line 11 caps based on step one in instructions
const line11Caps = [21430, 42158, 47915, 51464]
const line11MfjCaps = [27830, 48108, 53865, 57414]

type Point = [number, number]

// Provided a list of points, create a piecewise function
// that makes linear segments through the list of points.
const toPieceWise = (points: Point[]): Piecewise =>
  points
    .slice(0, points.length - 1)
    .map((point, idx) => [point, points[idx + 1]])
    .map(([[x1, y1], [x2, y2]]) => ({
      // starting point     slope              intercept
      lowerBound: x1,
      f: linear((y2 - y1) / (x2 - x1), y1 - (x1 * (y2 - y1)) / (x2 - x1))
    }))

// These points are taken directly from IRS publication
// IRS Rev. Proc. 2019-44 for tax year 2020
// https://www.irs.gov/pub/irs-drop/rp-19-44.pdf
const unmarriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [
      [0, 0],
      [7030, 538],
      [8790, 3584],
      [15820, 0]
    ], // 0
    [
      [0, 0],
      [10540, 3584],
      [19330, 3584],
      [41756, 0]
    ], // 1
    [
      [0, 0],
      [14800, 5920],
      [19330, 5920],
      [47440, 0]
    ], // 2
    [
      [0, 0],
      [14800, 6660],
      [19330, 6660],
      [50954, 0]
    ] // 3 or more
  ]
  return points.map((ps: Point[]) => toPieceWise(ps))
})()

const marriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [
      [0, 0],
      [7030, 538],
      [14680, 3584],
      [21710, 0]
    ], // 0
    [
      [0, 0],
      [10540, 3584],
      [25220, 3584],
      [47646, 0]
    ], // 1
    [
      [0, 0],
      [14800, 5920],
      [25220, 5920],
      [53330, 0]
    ], // 2
    [
      [0, 0],
      [14800, 6660],
      [25220, 6660],
      [56844, 0]
    ] // 3 or more
  ]
  return points.map((ps) => toPieceWise(ps))
})()

interface EICDef {
  caps: { [k in FilingStatus]: number[] | undefined }
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
  maxInvestmentIncome: 10000,
  formulas: {
    [FilingStatus.S]: unmarriedFormulas,
    [FilingStatus.W]: unmarriedFormulas,
    [FilingStatus.HOH]: unmarriedFormulas,
    [FilingStatus.MFS]: undefined,
    [FilingStatus.MFJ]: marriedFormulas
  }
}

export default federalBrackets

// Constants used in the social security benefits worksheet
interface SocialSecurityBenefitsDef {
  caps: { [k in FilingStatus]: { l8: number; l10: number } }
}

export const SSBenefits: SocialSecurityBenefitsDef = {
  caps: {
    [FilingStatus.S]: { l8: 25000, l10: 9000 },
    [FilingStatus.W]: { l8: 25000, l10: 9000 },
    [FilingStatus.HOH]: { l8: 25000, l10: 9000 },
    [FilingStatus.MFS]: { l8: 25000, l10: 9000 },
    [FilingStatus.MFJ]: { l8: 32000, l10: 12000 }
  }
}
