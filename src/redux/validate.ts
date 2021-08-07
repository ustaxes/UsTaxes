import Ajv, { DefinedError, ValidateFunction } from 'ajv'
import schema from './validation.json'
import log from '../log'

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
  }

  return data
}

const ajv = new Ajv().addSchema(schema)

// Doing this seems to be necessary so that recursive self
// links (ref fields) are created properly. Without it we get
// undefined is not a function errors as refs are not present
ajv.getSchema('#/definitions/PersonRole')
ajv.getSchema('#/definitions/Address')
ajv.getSchema('#/definitions/AccountType')
ajv.getSchema('#/definitions/Employer')
ajv.getSchema('#/definitions/FilingStatus')
ajv.getSchema('#/definitions/PrimaryPerson')
ajv.getSchema('#/definitions/Spouse')
ajv.getSchema('#/definitions/Person')
ajv.getSchema('#/definitions/Dependent')
ajv.getSchema('#/definitions/EditDependentAction')
ajv.getSchema('#/definitions/Income1099')
ajv.getSchema('#/definitions/IntData')
ajv.getSchema('#/definitions/BData')
ajv.getSchema('#/definitions/Income1099Int')
ajv.getSchema('#/definitions/Income1099B')
ajv.getSchema('#/definitions/Supported1099')
ajv.getSchema('#/definitions/Edit1099Action')
ajv.getSchema('#/definitions/IncomeW2')
ajv.getSchema('#/definitions/EditW2Action')
ajv.getSchema('#/definitions/Refund')
ajv.getSchema('#/definitions/TaxPayer')
ajv.getSchema('#/definitions/Information')
ajv.getSchema('#/definitions/Property')
ajv.getSchema('#/definitions/PropertyType')
ajv.getSchema('#/definitions/EditPropertyAction')
ajv.getSchema('#/definitions/F1098e')
ajv.getSchema('#/definitions/Edit1098eAction')
ajv.getSchema('#/definitions/TaxesState')
ajv.getSchema('#/definitions/Responses')
ajv.getSchema('#/definitions/StateResidency')

export default ajv
