import { FilingStatus } from 'ustaxes/core/data'
import { filingStatus } from 'ustaxes/core/data/validate'
import { linear, Piecewise } from 'ustaxes/core/util'

export const CURRENT_YEAR = 2022

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

// Tax brackets can be most easily found via google
// The standard deduction amounts with the allowances can be most
// easily found at the end of 1040-SR
const federalBrackets: FederalBrackets = {
  ordinary: {
    rates: [10, 12, 22, 24, 32, 35, 37],
    status: {
      [FilingStatus.S]: {
        brackets: [10275, 41775, 89075, 170050, 215950, 539900],
        deductions: [
          {
            name: 'Standard Deduction (Single)',
            amount: 12950
          },
          {
            name: 'Standard Deduction (Single) with 1 age or blindness allowance',
            amount: 14700
          },
          {
            name: 'Standard Deduction (Single) with 2 age or blindness allowances',
            amount: 16450
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
        brackets: [20550, 83550, 178150, 340100, 431900, 647850],
        deductions: [
          {
            name: 'Standard Deduction (Married)',
            amount: 25900
          },
          {
            name: 'Standard Deduction (Married) with 1 age or blindness allowance',
            amount: 27300
          },
          {
            name: 'Standard Deduction (Married) with 2 age or blindness allowances',
            amount: 28700
          },
          {
            name: 'Standard Deduction (Married) with 3 age or blindness allowances',
            amount: 30100
          },
          {
            name: 'Standard Deduction (Married) with 4 age or blindness allowances',
            amount: 31500
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
        brackets: [20550, 83550, 178150, 340100, 431900, 647850],
        deductions: [
          {
            name: 'Standard Deduction (Widowed)',
            amount: 25900
          },
          {
            name: 'Standard Deduction (Widowed) with 1 age or blindness allowance',
            amount: 27300
          },
          {
            name: 'Standard Deduction (Widowed) with 2 age or blindness allowances',
            amount: 28700
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
        brackets: [10275, 41775, 89075, 170050, 215950, 323925],
        deductions: [
          {
            name: 'Standard Deduction (Married Filing Separately)',
            amount: 12950
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 1 age or blindness allowance',
            amount: 14350
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 2 age or blindness allowances',
            amount: 15750
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 3 age or blindness allowances',
            amount: 17150
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 4 age or blindness allowances',
            amount: 18550
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
        brackets: [14650, 55900, 89050, 170050, 215950, 539900],
        deductions: [
          {
            name: 'Standard Deduction (Head of Household)',
            amount: 19400
          },
          {
            name: 'Standard Deduction (Head of Household) with 1 age or blindness allowance',
            amount: 21150
          },
          {
            name: 'Standard Deduction (Head of Household) with 2 age or blindness allowances',
            amount: 22900
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
        brackets: [41675, 459750]
      },
      [FilingStatus.MFJ]: {
        brackets: [83350, 517200]
      },
      [FilingStatus.W]: {
        brackets: [83350, 517200]
      },
      [FilingStatus.MFS]: {
        brackets: [41675, 258600]
      },
      [FilingStatus.HOH]: {
        brackets: [55800, 488500]
      }
    }
  }
}

export const fica = {
  maxSSTax: 9114,
  maxIncomeSSTaxApplies: 147000,

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
    'self-only': 3650,
    family: 7300
  }
}

export const amt = {
  excemption: (
    filingStatus: FilingStatus,
    income: number
  ): number | undefined => {
    switch (filingStatus) {
      case FilingStatus.S:
        if (income <= 539900) {
          return 75900
        }
        break
      case FilingStatus.MFJ:
        if (income <= 1079800) {
          return 118100
        }
        break
      case FilingStatus.MFS:
        if (income <= 5399900) {
          return 59050
        } else {
          return 59050
        }
    }
    // TODO: Handle "Exemption Worksheet"
    return undefined
  },

  cap: (filingStatus: FilingStatus): number => {
    if (filingStatus === FilingStatus.MFS) {
      return 103050
    }
    return 206100
  }
}

// https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/earned-income-and-earned-income-tax-credit-eitc-tables#EITC%20Tables
// line 11 caps based on step one in instructions
const line11Caps = [16480, 43492, 49399, 53057]
const line11MfjCaps = [22610, 49622, 55529, 59187]

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
  maxInvestmentIncome: 10300,
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
