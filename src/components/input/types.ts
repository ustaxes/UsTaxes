import { ReactElement } from 'react'
import { RegisterOptions } from 'react-hook-form'
import { PatternConfig } from 'ustaxes/components/Patterns'
import { GridSize } from '@material-ui/core/Grid'
export interface BaseDropdownProps {
  label: string | ReactElement
  required?: boolean
  name: string
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

export interface LabeledDropdownProps<A> extends BaseDropdownProps {
  useGrid?: boolean
  sizes?: SizeList
  dropDownData: A[]
  valueMapping: (a: A, n: number) => string
  keyMapping: (a: A, n: number) => string | number
  textMapping: (a: A, n: number) => string
}

export interface LabeledInputProps {
  useGrid?: boolean
  sizes?: SizeList
  patternConfig?: PatternConfig
  label: string | ReactElement
  required?: boolean
  name: string
  defaultValue?: string
  rules?: Exclude<
    RegisterOptions,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs'
  >
}

export interface LabeledFormProps {
  name: string
  label: string
  useGrid?: boolean
  sizes?: SizeList
}

export type LabeledCheckboxProps = LabeledFormProps

export interface LabeledRadioProps extends LabeledFormProps {
  values: Array<[string, string]>
}
