import { RegisterOptions } from 'react-hook-form'

export type Register = (rules?: RegisterOptions) => any

export interface Errors {
  [key: string]: {type: string}
}

export interface BaseFormProps {
  register: Register
  errors: Errors
}

export const isError = (errors: Errors, name: string): boolean => getError(errors, name) !== undefined

export const getError = (errors: Errors, name: string): string | undefined => {
  let result
  if (Object.prototype.hasOwnProperty.call(errors, name)) {
    const r = errors[name]
    result = r.type
  }
  return result
}

export const id = <A,>(a: A): A => a
