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

interface FilingParams<A> {
  [FilingStatus.S]: A
  [FilingStatus.MFJ]: A
  [FilingStatus.MFS]: A
  [FilingStatus.HOH]: A
  [FilingStatus.W]: A
}

interface Rates {
  rates: number[]
}

interface FederalBrackets {
  ordinary: Rates & {status: FilingParams<Brackets & Deductions>}
  longTermCapGains: Rates & {status: FilingParams<Brackets>}
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
export default federalBrackets
