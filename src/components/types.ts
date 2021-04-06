import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form'

export type Errors<T> = DeepMap<T, FieldError | undefined>

export interface BaseFormProps<A> {
  register: UseFormRegister<A>
  error?: FieldError
}
