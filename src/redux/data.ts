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
  Ira,
  Asset,
  F3921,
  ScheduleK1Form1065
} from 'ustaxes/core/data'
import { blankState } from './reducer'
import { FormsState } from 'ustaxes/formgen/reducer'

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
  assets: Asset<Date>[]
  activeYear: TaxYear
  forms: FormsState
}

export const blankYearTaxesState: YearsTaxesState = {
  assets: [],
  Y2019: blankState,
  Y2020: blankState,
  Y2021: blankState,
  activeYear: 'Y2020',
  forms: {
    forms: [],
    assignments: []
  }
}

export type EditDependentAction = ArrayItemEditAction<Dependent>
export type EditW2Action = ArrayItemEditAction<IncomeW2>
export type EditEstimatedTaxesAction = ArrayItemEditAction<EstimatedTaxPayments>
export type Edit1099Action = ArrayItemEditAction<Supported1099>
export type EditPropertyAction = ArrayItemEditAction<Property>
export type Edit1098eAction = ArrayItemEditAction<F1098e>
export type EditHSAAction = ArrayItemEditAction<HealthSavingsAccount>
export type EditIraAction = ArrayItemEditAction<Ira>
export type EditAssetAction = ArrayItemEditAction<Asset<Date>>
export type EditF3921Action = ArrayItemEditAction<F3921>
export type EditScheduleK1Form1065Action =
  ArrayItemEditAction<ScheduleK1Form1065>
