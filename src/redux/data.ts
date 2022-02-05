import { TaxYear } from 'ustaxes/data'
import {
  Dependent,
  IncomeW2,
  EstimatedTaxPayments,
  Supported1099,
  Property,
  F1098e,
  Information,
  HealthSavingsAccount,
  Ira
} from 'ustaxes/core/data'
import { blankState } from './reducer'

export interface ArrayItemEditAction<A> {
  index: number
  value: A
}

/**
 * This is a simplified form of our global TaxesState
 * which allows TaxesState to be viewed as if if contained
 * data for a single year.
 */
export type TaxesState = { information: Information }

export type YearsTaxesState = { [K in TaxYear]: Information } & {
  activeYear: TaxYear
}

export const blankYearTaxesState: YearsTaxesState = {
  Y2019: blankState,
  Y2020: blankState,
  Y2021: blankState,
  activeYear: 'Y2020'
}

export type EditDependentAction = ArrayItemEditAction<Dependent>
export type EditW2Action = ArrayItemEditAction<IncomeW2>
export type EditEstimatedTaxesAction = ArrayItemEditAction<EstimatedTaxPayments>
export type Edit1099Action = ArrayItemEditAction<Supported1099>
export type EditPropertyAction = ArrayItemEditAction<Property>
export type Edit1098eAction = ArrayItemEditAction<F1098e>
export type EditHSAAction = ArrayItemEditAction<HealthSavingsAccount>
export type EditIraAction = ArrayItemEditAction<Ira>
