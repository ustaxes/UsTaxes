/**
 * Type definitions for UsTaxes MCP Server
 */

// Re-export UsTaxes core types
export type {
  Information,
  TaxPayer,
  Person,
  Address,
  FilingStatus,
  IncomeW2,
  Supported1099,
  F1099Int,
  F1099Div,
  F1099B,
  F1099R,
  Property,
  F1098e,
  ItemizedDeductions,
  HealthSavingsAccount,
  Ira,
  Credit,
  Refund,
  Dependent,
  Spouse,
  State
} from 'ustaxes/core/data'

// Tax year type
export type TaxYear = 2019 | 2020 | 2021 | 2022 | 2023 | 2024

// Server state that holds multiple years
export interface ServerState {
  [year: number]: Information
  activeYear: TaxYear
}

// Tool result types
export interface ToolSuccess<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ToolError {
  success: false
  error: string
  details?: unknown
}

export type ToolResult<T = unknown> = ToolSuccess<T> | ToolError

// PDF generation options
export interface PDFGenerationOptions {
  year: TaxYear
  outputDir?: string
  includeState?: boolean
  state?: string
}

// Validation result
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error'
}

export interface ValidationWarning {
  field: string
  message: string
  severity: 'warning'
}

// Tax calculation result
export interface TaxCalculation {
  year: TaxYear
  filingStatus: string
  totalIncome: number
  adjustedGrossIncome: number
  taxableIncome: number
  totalTax: number
  totalCredits: number
  totalPayments: number
  refundOrOwed: number
  effectiveTaxRate: number
}

// Return summary for resources
export interface ReturnSummary {
  year: TaxYear
  taxpayer: {
    name: string
    filingStatus: string
  }
  federal: {
    agi: number
    taxableIncome: number
    totalTax: number
    refundOrOwed: number
  }
  state?: {
    [state: string]: {
      taxableIncome: number
      totalTax: number
      refundOrOwed: number
    }
  }
  completeness: number // 0-100%
  lastModified: Date
}
