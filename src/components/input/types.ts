import { ReactElement } from 'react'
import { Path, RegisterOptions } from 'react-hook-form'
import { PatternConfig } from 'ustaxes/components/Patterns'
import { GridSize } from '@material-ui/core/Grid'
export interface BaseDropdownProps<TFormValues> {
  label: string | ReactElement
  required?: boolean
  name: Path<TFormValues>
}

export interface CurrencyProps {
  prefix?: string
  value: number
  plain?: boolean
}

interface SizeList {
  xs?: boolean | GridSize
  sm?: boolean | GridSize
  md?: boolean | GridSize
  lg?: boolean | GridSize
}

export interface LabeledDropdownProps<A, TFormValues>
  extends BaseDropdownProps<TFormValues> {
  autofocus?: boolean
  useGrid?: boolean
  sizes?: SizeList
  dropDownData: A[]
  valueMapping: (a: A, n: number) => string
  keyMapping: (a: A, n: number) => string | number
  textMapping: (a: A, n: number) => string
  noUndefined?: boolean
}

export interface LabeledInputProps<TFormValues> {
  autofocus?: boolean
  useGrid?: boolean
  sizes?: SizeList
  patternConfig?: PatternConfig
  label: string | ReactElement
  required?: boolean
  name: Path<TFormValues>
  defaultValue?: string
  rules?: Exclude<
    RegisterOptions<TFormValues>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs'
  >
}

export interface LabeledFormProps<TFormValues> {
  name: Path<TFormValues>
  label: string
  useGrid?: boolean
  sizes?: SizeList
}

export type LabeledCheckboxProps<TFormValues> = LabeledFormProps<TFormValues>

export interface LabeledRadioProps<TFormValues>
  extends LabeledFormProps<TFormValues> {
  values: Array<[string, string]>
}

export interface DatePickerProps<TFormValues>
  extends LabeledFormProps<TFormValues> {
  minDate?: Date
  maxDate: Date
}
