import React, { ReactElement } from 'react'
import { TextField, Box } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { InputType, Patterns } from '../Patterns'
import { Controller } from 'react-hook-form'

export function LabeledInput (props: LabeledInputProps): ReactElement {
  const { strongLabel, label, register, error, required = false, patternConfig = Patterns.name, name, defaultValue } = props

  const textFieldProps = {
    fullWidth: patternConfig?.format === undefined,
    defaultValue: defaultValue,
    helperText: error?.message,
    inputRef: register({
      required: required ? 'Input is required' : undefined,
      pattern: {
        value: patternConfig.regexp ?? (required ? /.+/ : /.*/),
        message: patternConfig.description ?? (required ? 'Input is required' : '')
      }
    }
    ),
    error: error !== undefined,
    name,
    variant: 'filled' as ('filled' | 'standard')
  }

  const input: ReactElement = (() => {
    if (patternConfig.inputType === InputType.numeric) {
      return (
        <Controller
          render={({ onChange, value }) =>
            <NumberFormat
              mask={patternConfig.mask}
              thousandSeparator={patternConfig.thousandSeparator}
              prefix={patternConfig.prefix}
              allowEmptyFormatting={true}
              format={patternConfig.format}
              customInput={TextField}
              isNumericString={true}
              onValueChange={(v) => onChange(v.value)}
              value={value}
              variant="filled"
              defaultValue={defaultValue}
            />
          }
          control={patternConfig.control}
          name={name}
        />
      )
    }

    return <TextField {...textFieldProps} />
  })()

  return (
    <div>
      <Box display="flex" justifyContent="flex-start">
        <p><strong>{strongLabel}</strong>{label}</p>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        {input}
      </Box>
    </div>
  )
}

export default LabeledInput
