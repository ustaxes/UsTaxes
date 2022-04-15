/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { DefinedError, ValidateFunction } from 'ajv'
import log from '../log'
import * as fns from './validate-fns'
import * as types from 'ustaxes/core/data'

// We will simply throw a runtime error if the data does not
// validate against the schema.definitions.
export const checkType = <A>(data: A, validate: ValidateFunction<A>): A => {
  validate(data)
  if ((validate.errors ?? undefined) !== undefined) {
    // Taken from doc example: The type cast is needed to allow user-defined keywords and errors
    // You can extend this type to include your error types as needed.

    const errs = validate.errors as DefinedError[]

    for (const err of errs) {
      log.error(err.message)
    }

    log.error(validate.errors)
    log.error(data)

    const errorMessage =
      validate.errors
        ?.map((e) => `${e.instancePath}: ${e.message ?? ''}`)
        .join('\n') ?? 'Unknown error'

    throw new Error(`Validation Failed: ${errorMessage}`)
  }

  return data
}

export const index = fns.Index as ValidateFunction<number>
export const personRole = fns.PersonRole as ValidateFunction<types.PersonRole>
export const contactInfo =
  fns.ContactInfo as ValidateFunction<types.ContactInfo>
export const address = fns.Address as ValidateFunction<types.Address>
export const accountType =
  fns.AccountType as ValidateFunction<types.AccountType>
export const employer = fns.Employer as ValidateFunction<types.Employer>
export const filingStatus =
  fns.FilingStatus as ValidateFunction<types.FilingStatus>
export const primaryPerson =
  fns.PrimaryPerson as ValidateFunction<types.PrimaryPerson>
export const spouse = fns.Spouse as ValidateFunction<types.Spouse>
export const person = fns.Person as ValidateFunction<types.Person>
export const dependent = fns.Dependent as ValidateFunction<types.Dependent>
export const f1099IntData =
  fns.F1099IntData as ValidateFunction<types.F1099IntData>
export const f1099BData = fns.F1099BData as ValidateFunction<types.F1099BData>
export const income1099Int =
  fns.Income1099Int as ValidateFunction<types.Income1099Int>
export const income1099B =
  fns.Income1099B as ValidateFunction<types.Income1099B>
export const supported1099 =
  fns.Supported1099 as ValidateFunction<types.Supported1099>
export const incomeW2 = fns.IncomeW2 as ValidateFunction<types.IncomeW2>
export const estimatedTaxPayments =
  fns.EstimatedTaxPayments as ValidateFunction<types.EstimatedTaxPayments>
export const refund = fns.Refund as ValidateFunction<types.Refund>
export const taxPayer = fns.TaxPayer as ValidateFunction<types.TaxPayer>
export const information =
  fns.Information as ValidateFunction<types.Information>
export const property = fns.Property as ValidateFunction<types.Property>
export const propertyType =
  fns.PropertyType as ValidateFunction<types.PropertyType>
export const f1098e = fns.F1098e as ValidateFunction<types.F1098e>
export const itemizedDeductions =
  fns.ItemizedDeductions as ValidateFunction<types.ItemizedDeductions>
export const responses = fns.Responses as ValidateFunction<types.Responses>
export const stateResidency =
  fns.StateResidency as ValidateFunction<types.StateResidency>
export const healthSavingsAccount =
  fns.HealthSavingsAccount as ValidateFunction<types.HealthSavingsAccount>
export const ira = fns.Ira as ValidateFunction<types.Ira>
export const assetType = fns.AssetType as ValidateFunction<types.AssetType>
export const assetString =
  fns.AssetString as ValidateFunction<types.AssetString>
export const taxYear = fns.TaxYear as ValidateFunction<types.TaxYear>
export const credit = fns.Credit as ValidateFunction<types.Credit>

export const editIraAction =
  fns.EditIRAAction as ValidateFunction<types.EditIraAction>
export const editHSAAction =
  fns.EditHSAAction as ValidateFunction<types.EditHSAAction>
export const editCreditAction =
  fns.EditCreditAction as ValidateFunction<types.EditCreditAction>
