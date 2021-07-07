import { DeepMap, FieldError } from 'react-hook-form'

export type Errors<T> = DeepMap<T, FieldError | undefined>

export interface BaseFormProps {
  error?: FieldError
}
