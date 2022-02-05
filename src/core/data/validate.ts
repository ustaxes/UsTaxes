import Ajv, { DefinedError, ValidateFunction } from 'ajv'
import * as schema from './validation.json'
import log from '../log'
import * as types from './index'

// We will simply throw a runtime error if the data does not
// validate against the schema.definitions.
export const checkType = <A>(data: A, validate: ValidateFunction<A>): A => {
  validate(data)
  if (validate.errors !== null) {
    // Taken from doc example: The type cast is needed to allow user-defined keywords and errors
    // You can extend this type to include your error types as needed.

    const errs = validate.errors as DefinedError[]

    for (const err of errs) {
      log.error(err.message)
    }

    log.error(validate.errors)
    log.error(data)

    throw new Error(
      'Validation Failed: ' +
        validate.errors
          ?.map((e) => `${e.instancePath}: ${e.message}`)
          .join('\n')
    )
  }

  return data
}

const ajv = new Ajv().addSchema(schema)

// Doing this seems to be necessary so that recursive self
// links (ref fields) are created properly. Without it we get
// undefined is not a function errors as refs are not present
export const personRole = ajv.getSchema<types.PersonRole>(
  '#/definitions/PersonRole'
)
export const contactInfo = ajv.getSchema<types.ContactInfo>(
  '#/definitions/ContactInfo'
)
export const address = ajv.getSchema<types.Address>('#/definitions/Address')
export const accountType = ajv.getSchema<types.AccountType>(
  '#/definitions/AccountType'
)
export const employer = ajv.getSchema<types.Employer>('#/definitions/Employer')
export const filingStatus = ajv.getSchema<types.FilingStatus>(
  '#/definitions/FilingStatus'
)
export const primaryPerson = ajv.getSchema<types.PrimaryPerson>(
  '#/definitions/PrimaryPerson'
)
export const spouse = ajv.getSchema<types.Spouse>('#/definitions/Spouse')
export const person = ajv.getSchema<types.Person>('#/definitions/Person')
export const dependent = ajv.getSchema<types.Dependent>(
  '#/definitions/Dependent'
)
export const intData = ajv.getSchema<types.F1099IntData>(
  '#/definitions/F1099IntData'
)
export const bData = ajv.getSchema<types.F1099BData>('#/definitions/F1099BData')
export const income1099Int = ajv.getSchema<types.Income1099Int>(
  '#/definitions/Income1099Int'
)
export const income1099B = ajv.getSchema<types.Income1099B>(
  '#/definitions/Income1099B'
)
export const supported1099 = ajv.getSchema<types.Supported1099>(
  '#/definitions/Supported1099'
)
export const incomeW2 = ajv.getSchema<types.IncomeW2>('#/definitions/IncomeW2')
export const estimatedTaxPayments = ajv.getSchema<types.EstimatedTaxPayments>(
  '#/definitions/EstimatedTaxPayments'
)
export const refund = ajv.getSchema<types.Refund>('#/definitions/Refund')
export const taxPayer = ajv.getSchema<types.TaxPayer>('#/definitions/TaxPayer')
export const information = ajv.getSchema<types.Information>(
  '#/definitions/Information'
)
export const property = ajv.getSchema<types.Property>('#/definitions/Property')
export const propertyType = ajv.getSchema<types.PropertyType>(
  '#/definitions/PropertyType'
)
export const f1098e = ajv.getSchema<types.F1098e>('#/definitions/F1098e')
export const responses = ajv.getSchema<types.Responses>(
  '#/definitions/Responses'
)
export const stateResidency = ajv.getSchema<types.StateResidency>(
  '#/definitions/StateResidency'
)

export const healthSavingsAccounts = ajv.getSchema<types.HealthSavingsAccount>(
  '#/definitions/HealthSavingsAccount'
)

export const individualRetirementArrangements =
  ajv.getSchema<types.Ira>('#/definitions/Ira')

export default ajv
