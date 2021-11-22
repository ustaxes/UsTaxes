import {
  Dependent,
  IncomeW2,
  EstimatedTaxPayments,
  Supported1099,
  Property,
  F1098e,
  Information
} from 'ustaxes/forms/Y2020/data'

export interface ArrayItemEditAction<A> {
  index: number
  value: A
}

export enum TaxYears {
  Y2019 = 2019,
  Y2020 = 2020,
  Y2021 = 2021
}

export type TaxYear = keyof typeof TaxYears

/**
 * This is a simplified form of our global TaxesState
 * which allows TaxesState to be viewed as if if contained
 * data for a single year.
 */
export type TaxesState = { information: Information }

export type YearsTaxesState = Partial<{ [K in TaxYear]: Information }> & {
  activeYear: TaxYear
}

export type EditDependentAction = ArrayItemEditAction<Dependent>
export type EditW2Action = ArrayItemEditAction<IncomeW2>
export type EditEstimatedTaxesAction = ArrayItemEditAction<EstimatedTaxPayments>
export type Edit1099Action = ArrayItemEditAction<Supported1099>
export type EditPropertyAction = ArrayItemEditAction<Property>
export type Edit1098eAction = ArrayItemEditAction<F1098e>
