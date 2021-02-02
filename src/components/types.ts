import { DeepMap, FieldError, RegisterOptions } from 'react-hook-form'

export type Register = (rules?: RegisterOptions) => any

export type Errors<T> = DeepMap<T, FieldError | undefined>

export interface BaseFormProps {
  register: Register
  error?: FieldError
}
