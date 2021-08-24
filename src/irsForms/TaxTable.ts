import federalBrackets from 'ustaxes/data/federal'
import { FilingStatus } from 'ustaxes/redux/data'
import { zip3 } from 'ustaxes/util'

const computeTax =
  (brackets: (status: FilingStatus) => number[], rates: number[]) =>
  (filingStatus: FilingStatus, income: number): number =>
    zip3(
      [0, ...brackets(filingStatus)], // Low end of each bracket
      [...brackets(filingStatus), undefined], // top end of each bracket
      rates.map((r) => r / 100) // rate for each bracket
    ).reduce((tax, [low, high, rate]) => {
      if (income < low) {
        // this bracket is above income, no tax here
        return tax
      } else if (high === undefined) {
        // This is the top bracket
        return tax + Math.max(0, income - low) * rate
      } else if (income > high) {
        // Taxable income is above the top of this bracket
        // so add the max tax for this bracket
        return tax + (high - low) * rate
      }
      // Otherwise max income is inside this bracket,
      // add the tax on the amount falling in this bracket
      return tax + (income - low) * rate
    }, 0)

export const computeOrdinaryTax = computeTax(
  (status) => federalBrackets.ordinary.status[status].brackets,
  federalBrackets.ordinary.rates
)

export const computeLongTermCapGainsTax = computeTax(
  (status) => federalBrackets.longTermCapGains.status[status].brackets,
  federalBrackets.longTermCapGains.rates
)
