import { FilingStatus } from 'ustaxes/core/data'
import { linear, Piecewise } from 'ustaxes/core/util'

export const CURRENT_YEAR = 2025

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
        brackets: [11925, 48475, 103350, 197300, 250525, 626350],
        deductions: [
          {
            name: 'Standard Deduction (Single)',
            amount: 15750
          },
          {
            name: 'Standard Deduction (Single) with 1 age or blindness allowance',
            amount: 17750
          },
          {
            name: 'Standard Deduction (Single) with 2 age or blindness allowances',
            amount: 19750
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
        brackets: [23850, 96950, 206700, 394600, 501050, 751600],
        deductions: [
          {
            name: 'Standard Deduction (Married)',
            amount: 31500
          },
          {
            name: 'Standard Deduction (Married) with 1 age or blindness allowance',
            amount: 33100
          },
          {
            name: 'Standard Deduction (Married) with 2 age or blindness allowances',
            amount: 34700
          },
          {
            name: 'Standard Deduction (Married) with 3 age or blindness allowances',
            amount: 36300
          },
          {
            name: 'Standard Deduction (Married) with 4 age or blindness allowances',
            amount: 37900
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
        brackets: [23850, 96950, 206700, 394600, 501050, 751600],
        deductions: [
          {
            name: 'Standard Deduction (Widowed)',
            amount: 31500
          },
          {
            name: 'Standard Deduction (Widowed) with 1 age or blindness allowance',
            amount: 33100
          },
          {
            name: 'Standard Deduction (Widowed) with 2 age or blindness allowances',
            amount: 34700
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
        brackets: [11925, 48475, 103350, 197300, 250525, 375800],
        deductions: [
          {
            name: 'Standard Deduction (Married Filing Separately)',
            amount: 15750
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 1 age or blindness allowance',
            amount: 17350
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 2 age or blindness allowances',
            amount: 18950
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 3 age or blindness allowances',
            amount: 20550
          },
          {
            name: 'Standard Deduction (Married Filing Separately) with 4 age or blindness allowances',
            amount: 22150
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
        brackets: [17000, 64850, 103350, 197300, 250500, 626350],
        deductions: [
          {
            name: 'Standard Deduction (Head of Household)',
            amount: 23625
          },
          {
            name: 'Standard Deduction (Head of Household) with 1 age or blindness allowance',
            amount: 25625
          },
          {
            name: 'Standard Deduction (Head of Household) with 2 age or blindness allowances',
            amount: 27625
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
        brackets: [48350, 533400]
      },
      [FilingStatus.MFJ]: {
        brackets: [96700, 600050]
      },
      [FilingStatus.W]: {
        brackets: [96700, 600050]
      },
      [FilingStatus.MFS]: {
        brackets: [48350, 300000]
      },
      [FilingStatus.HOH]: {
        brackets: [64750, 566700]
      }
    }
  }
}

export const fica = {
  maxSSTax: 10918.2,
  maxIncomeSSTaxApplies: 176100,

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

// OBBB Schedule 1-A deduction limits — signed July 4 2025
export const obbbDeductionLimits = {
  tips: {
    cap: 25000,
    phaseOutThreshold: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 300000 : 150000
  },
  overtime: {
    cap: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 25000 : 12500,
    phaseOutThreshold: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 300000 : 150000
  },
  carLoan: {
    cap: 10000,
    phaseOutThreshold: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 200000 : 100000,
    phaseOutRange: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 50000 : 25000
  },
  senior: {
    perPerson: 6000,
    phaseOutThreshold: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 150000 : 75000,
    phaseOutRange: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 100000 : 50000
  }
}

// OBBB SALT cap (Schedule A line 5e) — signed July 4 2025
// Base cap $40k (MFS: $20k); phases out 30c/$ above $500k (MFS: $250k);
// floors at $10k (MFS: $5k); fully phased at $600k (MFS: $300k).
export const saltCap = {
  base: (filingStatus: FilingStatus): number =>
    filingStatus === FilingStatus.MFS ? 20000 : 40000,
  floor: (filingStatus: FilingStatus): number =>
    filingStatus === FilingStatus.MFS ? 5000 : 10000,
  phaseOutThreshold: (filingStatus: FilingStatus): number =>
    filingStatus === FilingStatus.MFS ? 250000 : 500000,
  phaseOutRate: 0.3
}

export const healthSavingsAccounts = {
  contributionLimit: {
    'self-only': 4300,
    family: 8550
  },
  /** Additional catch-up contribution for HSA account holders age 55 or older. */
  catchUpContribution: 1000
}

/**
 * Traditional IRA contribution and deduction limits — TY2025.
 * Rev. Proc. 2024-40.
 *
 * Phase-out ranges apply only when covered by a workplace retirement plan.
 * "Not covered, spouse covered" range applies when filing MFJ and only the
 * spouse participates in a workplace plan.
 */
export const iraLimits = {
  /** Maximum annual contribution (under age 50 at year end). */
  contributionLimit: 7000,
  /** Catch-up contribution for taxpayers age 50 or older at year end. */
  catchUpContribution: 1000,

  /**
   * Phase-out threshold (lower bound of MAGI range) when the taxpayer
   * is an active retirement-plan participant.
   */
  activeParticipantPhaseOutStart: (filingStatus: FilingStatus): number => {
    switch (filingStatus) {
      case FilingStatus.MFJ:
      case FilingStatus.W:
        return 126000
      case FilingStatus.MFS:
        return 0
      default: // S, HOH
        return 79000
    }
  },

  /** Width of the phase-out range for active participants. */
  activeParticipantPhaseOutRange: (filingStatus: FilingStatus): number => {
    switch (filingStatus) {
      case FilingStatus.MFJ:
      case FilingStatus.W:
        return 20000
      case FilingStatus.MFS:
        return 10000
      default: // S, HOH
        return 10000
    }
  },

  /**
   * Phase-out threshold when filing MFJ, taxpayer is NOT an active
   * participant but spouse IS (Schedule 1 line 19a footnote).
   */
  spouseActivePhaseOutStart: 236000,
  spouseActivePhaseOutRange: 10000
}

/**
 * Student loan interest deduction phase-out MAGI thresholds — TY2025.
 * Rev. Proc. 2024-40.
 * Deduction is reduced ratably over a $15,000 range (single) or $30,000 (MFJ).
 */
export const studentLoanInterest = {
  maxDeduction: 2500,
  phaseOutStart: (filingStatus: FilingStatus): number =>
    filingStatus === FilingStatus.MFJ ? 165000 : 80000,
  phaseOutRange: (filingStatus: FilingStatus): number =>
    filingStatus === FilingStatus.MFJ ? 30000 : 15000
}

/** Educator expense deduction — TY2025. Capped per educator; $300 each, $600 max for MFJ both educators. */
export const educatorExpenseLimit = 300

/**
 * Education credits (Form 8863) — TY2025.
 * Phase-out amounts are not inflation-adjusted; same as prior years.
 * https://www.irs.gov/publications/p970
 */
export const educationCredits = {
  aotc: {
    /** Maximum qualified expenses per student considered for credit. */
    maxExpenses: 4000,
    /** Credit rate for first $2,000 of expenses. */
    rate1: 1.0,
    /** Additional credit rate for next $2,000 of expenses. */
    rate2: 0.25,
    /** Maximum credit per student ($2,000 + $500 = $2,500). */
    maxCredit: 2500,
    /** Refundable fraction of the AOTC credit. */
    refundableFraction: 0.4,
    /** MAGI where phase-out begins (single/HOH/W). */
    phaseOutStart: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 160000 : 80000,
    /** MAGI range over which credit is fully phased out. */
    phaseOutRange: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 20000 : 10000
  },
  llc: {
    /** Maximum qualified expenses considered across all students. */
    maxExpenses: 10000,
    /** Credit rate (20%). */
    rate: 0.2,
    /** Maximum LLC credit ($2,000). */
    maxCredit: 2000,
    /** MAGI where phase-out begins (single/HOH/W). */
    phaseOutStart: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 160000 : 80000,
    /** MAGI range over which credit is fully phased out. */
    phaseOutRange: (filingStatus: FilingStatus): number =>
      filingStatus === FilingStatus.MFJ ? 20000 : 10000
  }
}

/**
 * Federal Poverty Level percentage thresholds for the Premium Tax Credit
 * (Form 8962) — TY2025. Taxpayers with household income 100%–400% FPL
 * are generally eligible (ARPA extension allows above 400% for TY2025).
 * Actual FPL amounts by family size are from HHS poverty guidelines.
 */
export const ptcFplThresholds = {
  /** Lower FPL % bound for eligibility (100%). */
  lowerBound: 1.0,
  /** ARPA expanded upper bound — no cap for TY2025. */
  upperBound: Infinity,
  /** Maximum percentage of income a household pays for benchmark plan. */
  maxContributionRate: 0.085
}

/**
 * Retirement Savings Contributions Credit (Form 8880) AGI thresholds — TY2025.
 * Rev. Proc. 2024-40.
 * Each threshold pair [lower, upper] defines the bracket boundary;
 * contributions above the upper limit yield a 0% credit rate.
 */
export const saversCreditThresholds: {
  [k in FilingStatus]: { rate50: number; rate20: number; rate10: number }
} = {
  [FilingStatus.S]: { rate50: 23750, rate20: 25750, rate10: 39500 },
  [FilingStatus.MFS]: { rate50: 23750, rate20: 25750, rate10: 39500 },
  [FilingStatus.W]: { rate50: 23750, rate20: 25750, rate10: 39500 },
  [FilingStatus.HOH]: { rate50: 35625, rate20: 38625, rate10: 59250 },
  [FilingStatus.MFJ]: { rate50: 47500, rate20: 51500, rate10: 79000 }
}
// https://www.irs.gov/pub/irs-drop/rp-24-40.pdf (Rev. Proc. 2024-40, tax year 2025)
// https://www.irs.gov/instructions/i6251
// Exemption phases out at 25 cents per dollar over the income threshold.
export const amt = {
  excemption: (filingStatus: FilingStatus, income: number): number => {
    switch (filingStatus) {
      case FilingStatus.MFJ:
      case FilingStatus.W:
        return Math.max(0, 137000 - 0.25 * Math.max(0, income - 1252700))
      case FilingStatus.MFS:
        return Math.max(0, 68500 - 0.25 * Math.max(0, income - 626350))
      default: // S, HOH
        return Math.max(0, 88100 - 0.25 * Math.max(0, income - 626350))
    }
  },

  // Used for calculating Line 7 on form 6251. See instructions
  cap: (filingStatus: FilingStatus): number => {
    if (filingStatus === FilingStatus.MFS) {
      return 119550
    }
    return 239100
  }
}

// https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/earned-income-and-earned-income-tax-credit-eitc-tables#EITC%20Tables
// line 11 caps based on step one in instructions (Rev. Proc. 2024-40, tax year 2025)
const line11Caps = [19104, 50434, 57310, 61555]
const line11MfjCaps = [26214, 57554, 64430, 68675]

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

// These points are taken directly from IRS Rev. Proc. 2024-40 (tax year 2025)
// https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
const unmarriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [
      [0, 0],
      [8490, 649],
      [10620, 649],
      [19104, 0]
    ], // 0
    [
      [0, 0],
      [12730, 4328],
      [23350, 4328],
      [50434, 0]
    ], // 1
    [
      [0, 0],
      [17880, 7152],
      [23350, 7152],
      [57310, 0]
    ], // 2
    [
      [0, 0],
      [17880, 8046],
      [23350, 8046],
      [61555, 0]
    ] // 3 or more
  ]
  return points.map((ps: Point[]) => toPieceWise(ps))
})()

const marriedFormulas: Piecewise[] = (() => {
  const points: Point[][] = [
    [
      [0, 0],
      [8490, 649],
      [17730, 649],
      [26214, 0]
    ], // 0
    [
      [0, 0],
      [12730, 4328],
      [30470, 4328],
      [57554, 0]
    ], // 1
    [
      [0, 0],
      [17880, 7152],
      [30470, 7152],
      [64430, 0]
    ], // 2
    [
      [0, 0],
      [17880, 8046],
      [30470, 8046],
      [68675, 0]
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
  maxInvestmentIncome: 11950,
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

/** IRS social security benefits worksheet base amounts ($25k/$32k and $9k/$12k); not annual CPI adjustments. */
export const SSBenefits: SocialSecurityBenefitsDef = {
  caps: {
    [FilingStatus.S]: { l8: 25000, l10: 9000 },
    [FilingStatus.W]: { l8: 25000, l10: 9000 },
    [FilingStatus.HOH]: { l8: 25000, l10: 9000 },
    [FilingStatus.MFS]: { l8: 25000, l10: 9000 },
    [FilingStatus.MFJ]: { l8: 32000, l10: 12000 }
  }
}
