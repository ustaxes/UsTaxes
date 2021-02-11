import Ajv, { DefinedError, ValidateFunction } from 'ajv'
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

const ajv = (): Ajv => new Ajv().addSchema(schema)

export default ajv
