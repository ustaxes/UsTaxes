/**
 * Massachusetts 2024 Tax Parameters
 */

import { FilingStatus } from 'ustaxes/core/data'

export interface MAParameters {
  taxRate: number
  exemptions: { [key in FilingStatus]: number }
}

const parameters: MAParameters = {
  // MA has a flat 5% tax rate (as of 2024)
  taxRate: 0.05,

  // Personal exemptions for 2024
  exemptions: {
    S: 4400, // Single
    MFJ: 8800, // Married Filing Jointly
    MFS: 4400, // Married Filing Separately
    HOH: 6800, // Head of Household
    W: 8800 // Widow(er)
  }
}

export default parameters
