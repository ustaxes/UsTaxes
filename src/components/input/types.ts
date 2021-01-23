import { Control, RegisterOptions } from 'react-hook-form'
import { PatternConfig } from '../Patterns'

export interface BaseDropdownProps {
  label: string
  required: boolean
  name: string
  errors: Errors
  defaultValue?: string
  control?: Control<any>
}

export interface LabeledDropdownProps<A,> extends BaseDropdownProps {
  dropDownData: A[]
  valueMapping: (a: A) => string
  keyMapping: (a: A) => string
  textMapping: (a: A) => string
}

export interface Errors {
  [key: string]: {type: string}
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

type Register = (rules?: RegisterOptions) => any

export interface LabeledInputProps {
  strongLabel?: string
  patternConfig?: PatternConfig
  label: string
  register: Register
  required: boolean
  name: string
  errors: Errors
  defaultValue?: string
}

export interface LabeledCheckBoxProps {
  foreignAddress: boolean
  setforeignAddress: (v: boolean) => void
  control: Control<any>
  description: string
}

export const id = <A,>(a: A): A => a
