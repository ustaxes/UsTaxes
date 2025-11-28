import { FilingStatus } from 'ustaxes/core/data'

/**
 * Massachusetts tax parameters for 2024
 *
 * Massachusetts has a flat 5% tax rate on most income.
 * Part B income (wages, interest, dividends): 5%
 * Part C income (short-term capital gains): 12%
 * Part D income (long-term capital gains): 5%
 */
const parameters = {
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
  flatTaxRate: 0.05,           // 5% on Part B and Part D income
  shortTermCapitalGainsRate: 0.12,  // 12% on Part C income (short-term gains)
  longTermCapitalGainsRate: 0.05,   // 5% on Part D income (long-term gains)

  // Filing threshold
  filingThreshold: 8000,

  // No local income taxes in Massachusetts
  // (Unlike NYC or Philadelphia)
}

export default parameters
