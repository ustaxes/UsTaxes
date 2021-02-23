import federalBrackets from '../data/federal'
import { FilingStatus } from '../redux/data'

// Throws an error if bs is shorter than as, truncates if bs is larger.
const zip = <A, B>(as: A[], bs: B[]): Array<[A, B]> => as.map((a, i) => [a, bs[i]])
const zip3 = <A, B, C>(as: A[], bs: B[], cs: C[]): Array<[A, B, C]> => zip(as, zip(bs, cs)).map(([a, [b, c]]) => [a, b, c])

const computeTax = (brackets: (status: FilingStatus) => number[], rates: number[]) =>
  (filingStatus: FilingStatus, income: number): number =>
    zip3([0, ...brackets(filingStatus)], [...brackets(filingStatus), undefined], rates.map((r) => r / 100))
      .reduce((tax, [low, high, rate]) => {
        if (income < low) {
          return tax
        } else if (high === undefined) {
          return tax + (income - low) * rate
        } else if (income > high) {
          return tax + (high - low) * rate
        }
        return tax + (income - low) * rate
      },
      0
      )

export const computeOrdinaryTax = computeTax(
  status => federalBrackets.ordinary.status[status].brackets,
  federalBrackets.ordinary.rates
)

export const computeLongTermCapGainsTax = computeTax(
  status => federalBrackets.longTermCapGains.status[status].brackets,
  federalBrackets.longTermCapGains.rates
)
