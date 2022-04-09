import Form from 'ustaxes/core/irsForms/Form'
import { TaxYear } from 'ustaxes/core/data'
import F1040For2020 from 'ustaxes/forms/Y2020/irsForms/F1040'
import F1040For2021 from 'ustaxes/forms/Y2021/irsForms/F1040'

interface Credit {
  name: string
  value?: number
  notes?: string
  allowed: boolean
}

export interface WorksheetLine {
  line: number | string
  value: string | number | undefined
}
export interface WorksheetData {
  name: string
  lines: WorksheetLine[]
}

export interface SummaryData {
  credits: Credit[]
  worksheets: WorksheetData[]
  refundAmount?: number
  amountOwed?: number
}

interface SummaryCreator<A> {
  summary: (a: A) => SummaryData
}

const emptySummary = {
  credits: [],
  worksheets: []
}

export const SummaryCreatorFor2020: SummaryCreator<F1040For2020> = {
  summary: (f: F1040For2020): SummaryData => ({
    credits: [
      {
        name: 'Earned Income Credit',
        value: f.scheduleEIC?.credit(),
        allowed: f.scheduleEIC?.allowed() ?? false
      },
      {
        name: 'Children and Other Dependents',
        value: f.childTaxCreditWorksheet?.credit(),
        allowed: f.childTaxCreditWorksheet?.isAllowed() ?? false
      }
    ],
    worksheets: [],
    refundAmount: f.l35a(),
    amountOwed: f.l37()
  })
}

export const SummaryCreatorFor2021: SummaryCreator<F1040For2021> = {
  summary: (f: F1040For2021): SummaryData => ({
    credits: [
      {
        name: 'Earned income credit',
        value: f.scheduleEIC?.credit(),
        allowed: f.scheduleEIC?.allowed() ?? false
      }
    ],
    worksheets: [
      ...(f.qualifiedAndCapGainsWorksheet !== undefined
        ? [f.qualifiedAndCapGainsWorksheet.getSummaryData()]
        : [])
    ],
    refundAmount: f.l35a(),
    amountOwed: f.l37()
  })
}

export const createSummary = (
  year: TaxYear,
  forms: Form[]
): SummaryData | undefined => {
  const f1040 = forms.find((f) => f.tag === 'f1040')
  if (f1040 === undefined) {
    return undefined
  }

  if (year === 'Y2019') {
    return emptySummary
  } else if (year === 'Y2020') {
    return SummaryCreatorFor2020.summary(f1040 as F1040For2020)
  } else if (year === 'Y2021') {
    return SummaryCreatorFor2021.summary(f1040 as F1040For2021)
  }
}
