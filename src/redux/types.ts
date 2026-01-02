import { TaxYear } from 'ustaxes/core/data'

export type SaveStatus = 'idle' | 'saving' | 'saved'

export type AuditLogEntry = {
  id: string
  timestamp: string
  actor: string
  action: string
  year: TaxYear
  details?: string
}
