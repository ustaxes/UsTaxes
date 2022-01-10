import Form from 'ustaxes/core/irsForms/Form'
import { TaxYear } from 'ustaxes/data'
import F1040For2020 from 'ustaxes/forms/Y2020/irsForms/F1040'
import F1040For2021 from 'ustaxes/forms/Y2021/irsForms/F1040'

interface Credit {
  name: string
  value?: number
  notes?: string
  allowed: boolean
}

export interface SummaryData {
  credits: Credit[]
}

interface SummaryCreator<A> {
  summary: (a: A) => SummaryData
}

const emptySummary = {
  credits: []
}

export const SummaryCreatorFor2020: SummaryCreator<F1040For2020> = {
  summary: (f: F1040For2020): SummaryData => ({
    credits: [
      {
        name: 'Earned Income Credit',
        value: f.scheduleEIC?.credit(f),
        allowed: f.scheduleEIC?.allowed(f) ?? false
      },
      {
        name: 'Children and Other Dependents',
        value: f.childTaxCreditWorksheet?.credit(),
        allowed: f.childTaxCreditWorksheet?.isAllowed() ?? false
      }
    ]
  })
}

export const SummaryCreatorFor2021: SummaryCreator<F1040For2021> = {
  summary: (f: F1040For2021): SummaryData => ({
    credits: [
      {
        name: 'Earned income credit',
        value: f.scheduleEIC?.credit(f),
        allowed: f.scheduleEIC?.allowed(f) ?? false
      }
    ]
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
