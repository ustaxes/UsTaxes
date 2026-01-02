import { Diagnostic, TaxReturnPacket } from 'ustaxes/core/returnPacket/types'

export type StateTotals = {
  taxDue?: number
  refund?: number
}

export type StateComputeResult = {
  stateTotals: StateTotals
  diagnostics: Diagnostic[]
}

export interface StateModule {
  id: string
  name: string
  eligibilityQuestions: (returnData: TaxReturnPacket) => string[]
  compute: (returnData: TaxReturnPacket) => StateComputeResult
  toPdfPayload: (returnData: TaxReturnPacket) => Record<string, unknown>
  diagnostics: (returnData: TaxReturnPacket) => Diagnostic[]
}
