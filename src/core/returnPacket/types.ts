import { PersonRole, TaxYear, State, FilingStatus } from 'ustaxes/core/data'

export type TaxReturnStatus = 'Draft' | 'Needs Review' | 'Ready to Sign'

export type DiagnosticLevel = 'error' | 'warning' | 'info'

export type Diagnostic = {
  id: string
  level: DiagnosticLevel
  message: string
  section?: string
}

export type Totals = {
  refundAmount?: number
  amountOwed?: number
  taxableIncome?: number
  totalIncome?: number
  totalTax?: number
  payments?: number
  credits?: number
}

export type Taxpayer = {
  firstName?: string
  lastName?: string
  ssid?: string
  dateOfBirth?: Date
}

export type Dependent = {
  firstName?: string
  lastName?: string
  ssid?: string
  relationship?: string
  dateOfBirth?: Date
  isStudent?: boolean
}

export type IncomeItem =
  | {
      type: 'W2'
      payerName?: string
      amount: number
      federalWithholding?: number
      personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
    }
  | {
      type: '1099'
      payerName?: string
      amount?: number
      federalWithholding?: number
      personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
    }
  | {
      type: '1099-NEC'
      payerName?: string
      amount?: number
      federalWithholding?: number
      personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
    }

export type ScheduleCItem = {
  businessName: string
  grossReceipts: number
  expenses: number
}

export type DeductionsCredits = {
  itemized?: boolean
  credits?: string[]
}

export type Document = {
  id: string
  name: string
  received: boolean
}

export type TaxReturn = {
  id: string
  taxYear: TaxYear
  state: State
  status: TaxReturnStatus
  createdAt: string
  updatedAt: string
  totals: Totals
}

export type TaxReturnPacket = {
  returnInfo: TaxReturn
  filingStatus?: FilingStatus
  taxpayer?: Taxpayer
  spouse?: Taxpayer
  dependents: Dependent[]
  incomes: IncomeItem[]
  scheduleC: ScheduleCItem[]
  estimatedPayments: number
  deductionsCredits: DeductionsCredits
  documents: Document[]
  auditLog: AuditLogEntry[]
}

export type AuditLogEntry = {
  id: string
  timestamp: string
  actor: string
  action: string
  year: TaxYear
  details?: string
}
