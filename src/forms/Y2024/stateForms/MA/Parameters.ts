/**
 * Massachusetts 2024 Tax Parameters
 */

import { FilingStatus } from 'ustaxes/core/data'

export interface MAParameters {
  personalExemptions2024: { [key in FilingStatus]: number }
  dependentExemption2024: number
  flatTaxRate: number
  shortTermCapitalGainsRate: number
  longTermCapitalGainsRate: number
  filingThreshold: number
  // Legacy interface support
  taxRate: number
  exemptions: { [key in FilingStatus]: number }
}

/**
 * Massachusetts has a flat 5% tax rate on most income.
 * Part B income (wages, interest, dividends): 5%
 * Part C income (short-term capital gains): 12%
 * Part D income (long-term capital gains): 5%
 */
const parameters: MAParameters = {
  // Personal exemptions by filing status (2024)
  personalExemptions2024: {
    [FilingStatus.S]: 4400,
    [FilingStatus.MFJ]: 8800,
    [FilingStatus.MFS]: 4400,
    [FilingStatus.HOH]: 6800,
    [FilingStatus.W]: 6800 // Qualifying surviving spouse uses HOH exemption
  },

  // Dependent exemption (2024)
  dependentExemption2024: 1000,

  // Tax rates
  flatTaxRate: 0.05, // 5% on Part B and Part D income
  shortTermCapitalGainsRate: 0.12, // 12% on Part C income (short-term gains)
  longTermCapitalGainsRate: 0.05, // 5% on Part D income (long-term gains)

  // Filing threshold
  filingThreshold: 8000,

  // Legacy interface support for MCP server
  taxRate: 0.05,
  exemptions: {
    S: 4400,
    MFJ: 8800,
    MFS: 4400,
    HOH: 6800,
    W: 8800
  }
}

export default parameters
