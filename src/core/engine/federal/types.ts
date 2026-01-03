import { Diagnostic } from 'ustaxes/core/returnPacket/types'

export type ComputedReturn = {
  adjustedGrossIncome: number
  taxableIncome: number
  federalTax: number
  credits: number
  payments: number
  refundAmount: number
  amountOwed: number
  selfEmploymentTax: number
  diagnostics: Diagnostic[]
}
