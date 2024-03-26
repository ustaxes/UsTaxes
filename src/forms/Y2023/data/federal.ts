import { FilingStatus } from 'ustaxes/core/data'
import { linear, Piecewise } from 'ustaxes/core/util'

export const CURRENT_YEAR = 2023

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
        brackets: [11000, 44725, 95375, 182100, 231250, 578125],
        deductions: [
          {
            name: 'Standard Deduction (Single)',
            amount: 13850
          },
          {
            name: 'Standard Deduction (Single) with 1 age or blindness allowance',
            amount: 15700
          },
          {
            name: 'Standard Deduction (Single) with 2 age or blindness allowances',
            amount: 17750
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
        brackets: [22000, 89450, 190750, 364200, 462500, 693750],
        deductions: [
          {
            name: 'Standard Deduction (Married)',
            amount: 27700
          },
          {
            name: 'Standard Deduction (Married) with 1 age or blindness allowance',
            amount: 29200
          },
          {
            name: 'Standard Deduction (Married) with 2 age or blindness allowances',
            amount: 30700
          },
          {
            name: 'Standard Deduction (Married) with 3 age or blindness allowances',
            amount: 32200
          },
          {
            name: 'Standard Deduction (Married) with 4 age or blindness allowances',
            amount: 33700
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
        brackets: [22000, 89450, 190750, 364200, 462500, 693750],
        deductions: [
          {
            name: 'Standard Deduction (Widowed)',
            amount: 27700
          },
          {
            name: 'Standard Deduction (Widowed) with 1 age or blindness allowance',
            amount: 29200
          },
          {
            name: 'Standard Deduction (Widowed) with 2 age or blindness allowances',
            amount: 30700
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
        brackets: [11000, 44725, 95375, 182100, 231250, 346875],
        deductions: [
          {
            name: 'Standard Deduction (Married Filing Separately)',
            amount: 13850
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 1 age or blindness allowance',
            amount: 15350
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 2 age or blindness allowances',
            amount: 16850
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 3 age or blindness allowances',
            amount: 18350
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 4 age or blindness allowances',
            amount: 19850
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
        brackets: [15700, 59850, 95350, 182100, 231250, 578100],
        deductions: [
          {
            name: 'Standard Deduction (Head of Household)',
            amount: 20800
          },
          {
            name: 'Standard Deduction (Head of Household) with 1 age or blindness allowance',
            amount: 22650
          },
          {
            name: 'Standard Deduction (Head of Household) with 2 age or blindness allowances',
            amount: 24500
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
        brackets: [44625, 492300]
      },
      [FilingStatus.MFJ]: {
        brackets: [89250, 553850]
      },
      [FilingStatus.W]: {
        brackets: [89250, 553850]
      },
      [FilingStatus.MFS]: {
        brackets: [44625, 276900]
      },
      [FilingStatus.HOH]: {
        brackets: [59750, 523050]
      }
    }
  }
}

export const fica = {
  maxSSTax: 9932.4,
  maxIncomeSSTaxApplies: 160200,

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
    'self-only': 3850,
    family: 7750
  }
}

export const amt = {
  excemption: (
    filingStatus: FilingStatus,
    income: number
  ): number | undefined => {
    switch (filingStatus) {
      case FilingStatus.S:
        if (income <= 578150) {
          return 81300
        }
        break
      case FilingStatus.MFJ:
        if (income <= 1156300) {
          return 126500
        }
        break
      case FilingStatus.MFS:
        if (income <= 578150) {
          return 63250
        }
    }
    // TODO: Handle "Exemption Worksheet"
    return undefined
  },

  cap: (filingStatus: FilingStatus): number => {
    if (filingStatus === FilingStatus.MFS) {
      return 110350
    }
    return 220700
  }
}

// https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/earned-income-and-earned-income-tax-credit-eitc-tables#EITC%20Tables
// line 11 caps based on step one in instructions
const line11Caps = [17640, 46450, 52918, 56838]
const line11MfjCaps = [24210, 53120, 59478, 63398]

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
// IRS Rev. Proc. 2022-38 for tax year 2023
// https://www.irs.gov/pub/irs-drop/rp-22-38.pdf
const unmarriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [
      [0, 0],
      [7840, 600],
      [9800, 600],
      [17640, 0]
    ], // 0
    [
      [0, 0],
      [11750, 3995],
      [21560, 3995],
      [46560, 0]
    ], // 1
    [
      [0, 0],
      [16510, 6604],
      [21560, 6604],
      [52918, 0]
    ], // 2
    [
      [0, 0],
      [16510, 7430],
      [21560, 7430],
      [56838, 0]
    ] // 3 or more
  ]
  return points.map((ps: Point[]) => toPieceWise(ps))
})()

const marriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [
      [0, 0],
      [7840, 600],
      [16370, 3995],
      [24210, 0]
    ], // 0
    [
      [0, 0],
      [11750, 3995],
      [28120, 3995],
      [53120, 0]
    ], // 1
    [
      [0, 0],
      [16510, 6604],
      [28120, 6604],
      [59478, 0]
    ], // 2
    [
      [0, 0],
      [16510, 7430],
      [28120, 7430],
      [63398, 0]
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
  maxInvestmentIncome: 11000,
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

// TODO: update for Y2023
export const SSBenefits: SocialSecurityBenefitsDef = {
  caps: {
    [FilingStatus.S]: { l8: 25000, l10: 9000 },
    [FilingStatus.W]: { l8: 25000, l10: 9000 },
    [FilingStatus.HOH]: { l8: 25000, l10: 9000 },
    [FilingStatus.MFS]: { l8: 25000, l10: 9000 },
    [FilingStatus.MFJ]: { l8: 32000, l10: 12000 }
  }
}
