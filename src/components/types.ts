import { DeepMap, FieldError, FieldValues, UseFormRegister } from 'react-hook-form'

export type Errors<T> = DeepMap<T, FieldError | undefined>

export interface BaseFormProps<A extends FieldValues> {
  register: UseFormRegister<A>
  error?: FieldError
}
