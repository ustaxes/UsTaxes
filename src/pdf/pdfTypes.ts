export type PdfDiagnostic = {
  level: 'error' | 'warning' | 'info'
  message: string
}

export type PdfTotals = {
  refundAmount?: number
  amountOwed?: number
  adjustedGrossIncome?: number
  taxableIncome?: number
  totalTax?: number
  payments?: number
  credits?: number
}

export type ComputedSummary = {
  taxpayerDisplayName: string
  taxYear: string
  state: string
  filingStatus?: string
  status: string
  preparedAt: string
  totals: PdfTotals
  diagnostics: {
    federal: PdfDiagnostic[]
    state: PdfDiagnostic[]
  }
}
