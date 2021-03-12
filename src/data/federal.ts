import { FilingStatus } from '../redux/data'

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

// line 11 caps based on step one in instructions
const line11Caps = [15820, 41756, 47440, 50954]
const line11MfjCaps = [21710, 47646, 53330, 56844]

interface EICDef {
  caps: {[k in FilingStatus]: number[] | undefined}
  questions: Array<[string, boolean]>
  maxInvestmentIncome: number
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
  // step 1 required questions
  questions: [
    [
      'Do you, and your spouse if filing a joint return, have a social security number issued on or before the due date of your 2020 return (including extensions) that allows you to work and is valid for EIC purposes (explained later under Definitions and Special Rules)?',
      true
    ],
    [
      'Are you filing Form 2555 (relating to foreign earned income)?',
      false
    ],
    [
      'Were you or your spouse a nonresident alien for any part of 2020?',
      false
    ]
  ],
  maxInvestmentIncome: 3650
}

export default federalBrackets
