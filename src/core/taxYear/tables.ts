import { FilingStatus, TaxYear } from 'ustaxes/core/data'
import federalBrackets2024 from 'ustaxes/forms/Y2024/data/federal'
import {
  federalBrackets2025,
  standardDeduction2025,
  childTaxCredit2025,
  socialSecurityWageBase2025
} from './2025'

type FederalTables = {
  rates: number[]
  brackets: number[]
  standardDeduction: number
  childTaxCredit: {
    maxPerChild: number
    qualifyingAge: number
  }
  socialSecurityWageBase: number
}

const standardDeduction2024 = (filingStatus: FilingStatus): number => {
  const deduction = federalBrackets2024.ordinary.status[filingStatus].deductions
  return deduction[0]?.amount ?? 0
}

export const getFederalTables = (
  taxYear: TaxYear,
  filingStatus: FilingStatus
): FederalTables => {
  if (taxYear === 'Y2025') {
    return {
      rates: federalBrackets2025.rates,
      brackets: federalBrackets2025.brackets[filingStatus],
      standardDeduction: standardDeduction2025(filingStatus),
      childTaxCredit: childTaxCredit2025,
      socialSecurityWageBase: socialSecurityWageBase2025
    }
  }

  return {
    rates: federalBrackets2024.ordinary.rates.map((rate) => rate / 100),
    brackets: federalBrackets2024.ordinary.status[filingStatus].brackets,
    standardDeduction: standardDeduction2024(filingStatus),
    childTaxCredit: {
      maxPerChild: 2000,
      qualifyingAge: 16
    },
    socialSecurityWageBase: 168600
  }
}
