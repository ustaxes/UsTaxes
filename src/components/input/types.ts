import { BaseFormProps } from '../types'
import { Control, FieldError, Path } from 'react-hook-form'
import { Pattern } from '../Patterns'
export * from '../types'

export interface BaseDropdownProps {
  label: string
  required?: boolean
  name: string
  error?: FieldError
  defaultValue?: string
  control?: Control<any>
}

export interface CurrencyProps {
  prefix?: string
  value: number
}

export interface LabeledDropdownProps<A> extends BaseDropdownProps {
  dropDownData: A[]
  valueMapping: (a: A, n: number) => string
  keyMapping: (a: A, n: number) => string | number
  textMapping: (a: A, n: number) => string
}

export interface LabeledInputProps<A> extends BaseFormProps<A> {
  strongLabel?: string
  patternConfig?: Pattern<A>
  label: string
  required?: boolean
  name: Path<A>
  defaultValue?: string
}

export interface LabeledFormProps<A> {
  name: string
  control: Control<any>
  label: string
  defaultValue?: A
}

export type LabeledCheckboxProps = LabeledFormProps<boolean>

export interface LabeledRadioProps extends LabeledFormProps<string> {
  values: Array<[string, string]>
}
