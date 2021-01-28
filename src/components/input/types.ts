import { Errors, BaseFormProps } from '../types'
import { Control } from 'react-hook-form'
import { PatternConfig } from '../Patterns'
export * from '../types'

export interface BaseDropdownProps {
  label: string
  required: boolean
  name: string
  errors?: Errors
  defaultValue?: string
  control?: Control<any>
}

export interface LabeledDropdownProps<A,> extends BaseDropdownProps {
  dropDownData: A[]
  valueMapping: (a: A, n: number) => string
  keyMapping: (a: A, n: number) => string | number
  textMapping: (a: A, n: number) => string
}

export interface LabeledInputProps extends BaseFormProps {
  strongLabel?: string
  patternConfig?: PatternConfig
  label: string
  required: boolean
  name: string
  defaultValue?: string
}

export interface LabeledCheckBoxProps {
  foreignAddress: boolean
  setforeignAddress: (v: boolean) => void
  control: Control<any>
  description: string
}
