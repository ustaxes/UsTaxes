import { BaseFormProps } from '../types'
import { Control, FieldError } from 'react-hook-form'
import { PatternConfig } from '../Patterns'
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

export interface LabeledInputProps extends BaseFormProps {
  strongLabel?: string
  patternConfig?: PatternConfig
  label: string
  required?: boolean
  name: string
  defaultValue?: string
}

export interface LabeledCheckBoxProps {
  name: string
  value: boolean
  setValue: (v: boolean) => void
  control: Control<any>
  label: string
}
