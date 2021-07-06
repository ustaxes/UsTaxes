import { BaseFormProps } from '../types'
import { FieldError, RegisterOptions } from 'react-hook-form'
import { PatternConfig } from '../Patterns'
export * from '../types'

export interface BaseDropdownProps {
  label: string
  strongLabel?: string
  required?: boolean
  name: string
  error?: FieldError
}

export interface CurrencyProps {
  prefix?: string
  value: number
  plain?: boolean
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
  rules?: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>
}

export interface LabeledFormProps {
  name: string
  label: string
}

export type LabeledCheckboxProps = LabeledFormProps

export interface LabeledRadioProps extends LabeledFormProps {
  values: Array<[string, string]>
}
