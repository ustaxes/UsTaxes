import Ajv, { DefinedError, ValidateFunction } from 'ajv-latest'
import schema from './validation.json'

// We will simply throw a runtime error if the data does not
// validate against the schema.definitions.
export const checkType = <A>(data: A, validate: ValidateFunction<A>): A => {
  validate(data)
  if (validate.errors !== null) {
    // Taken from doc example: The type cast is needed to allow user-defined keywords and errors
    // You can extend this type to include your error types as needed.

    const errs = validate.errors as DefinedError[]

    for (const err of errs) {
      console.error(err.message)
    }
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
ajv.getSchema('#/definitions/Person')
ajv.getSchema('#/definitions/Dependent')
ajv.getSchema('#/definitions/Income1099')
ajv.getSchema('#/definitions/IntData')
ajv.getSchema('#/definitions/BData')
ajv.getSchema('#/definitions/Income1099Int')
ajv.getSchema('#/definitions/Income1099B')
ajv.getSchema('#/definitions/Supported1099')
ajv.getSchema('#/definitions/IncomeW2')
ajv.getSchema('#/definitions/Refund')
ajv.getSchema('#/definitions/TaxPayer')
ajv.getSchema('#/definitions/Information')

export default ajv
