import federalBrackets from '../data/federal'
import { FilingStatus } from 'ustaxes/core/data'
import _ from 'lodash'

const computeTax =
  (brackets: (status: FilingStatus) => number[], rates: number[]) =>
  (filingStatus: FilingStatus, income: number): number =>
    _.chain([0, ...brackets(filingStatus)]) // Low end of each bracket
      .zipWith(
        [...brackets(filingStatus), undefined], // top end of each bracket
        rates.map((r) => r / 100), // rate for each bracket
        (low, high, rate) => {
          if (income < low) {
            // this bracket is above income, no tax here
            return 0
          } else if (high === undefined) {
            // This is the top bracket
            return Math.max(0, income - low) * rate
          } else if (income >= high) {
            // Taxable income is above the top of this bracket
            // so add the max tax for this bracket
            return (high - low) * rate
          }
          // Otherwise max income is inside this bracket,
          // add the tax on the amount falling in this bracket

          if (income < 5) {
            return 0
          }
          // If income is between $5 and $25, tax table computes rate at midpoint of $5 ranges
          if (income >= 5 && income < 25) {
            income = Math.floor(income)
            const over5 = income % 5
            income += 2.5 - over5
          }
          // If income is between $25 and $3,000, tax table computes rate at midpoint of $25 ranges
          else if (income >= 25 && income < 3000) {
            income = Math.floor(income)
            const over25 = income % 25
            income += 12.5 - over25
          }
          // If income is between $3,000 and $100,000, tax table computes rate at midpoint of $50 ranges
          else if (income >= 3000 && income < 100000) {
            income = Math.floor(income)
            const over50 = income % 50
            income += 25 - over50
          }
          return (income - low) * rate
        }
      )
      .sum()
      .value()

export const computeOrdinaryTax = computeTax(
  (status) => federalBrackets.ordinary.status[status].brackets,
  federalBrackets.ordinary.rates
)

export const computeLongTermCapGainsTax = computeTax(
  (status) => federalBrackets.longTermCapGains.status[status].brackets,
  federalBrackets.longTermCapGains.rates
)
