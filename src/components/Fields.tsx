import React, { ReactElement, Fragment, PropsWithChildren } from 'react'
import { RegisterOptions } from 'react-hook-form'
import { LabeledCheckbox, LabeledInput, USStateDropDown } from './input'
import { CountryDropDown } from './input/LabeledDropdown'
import { PatternConfig } from './Patterns'

type FieldType = 'text' | 'country' | 'state' | 'checkbox'
type Rules = Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>

export interface FieldDef {
  label: string
  name: string
  patternConfig?: PatternConfig
  required?: boolean
  fieldType?: FieldType
  strongLabel?: string
  rules?: Rules
}

interface FieldsProps {
  fields: FieldDef[]
}

interface FieldProps {
  field: FieldDef
}

export const field = (
  label: string,
  name: string,
  patternConfig?: PatternConfig,
  fieldType?: FieldType,
  required?: boolean,
  strongLabel?: string,
  rules?: Rules
): FieldDef => (
  { label, name, patternConfig, required, fieldType, strongLabel, rules }
)

export const Field = ({ field: { fieldType, ...field }, children }: PropsWithChildren<FieldProps>): ReactElement => {
  switch (fieldType) {
    case 'checkbox': {
      return <LabeledCheckbox {...field} />
    }
    case 'state': {
      return <USStateDropDown {...field} />
    }
    case 'country': {
      return <CountryDropDown {...field} />
    }
    default: {
      return <LabeledInput {...field} />
    }
  }
}

export const Fields = ({ fields, children }: PropsWithChildren<FieldsProps>): ReactElement => (
  <Fragment>
    {fields.map((field, key) => <Field key={key} field={field} />)}
    {children}
  </Fragment>
)
