import React, { ReactElement } from 'react'
import { TextField } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { InputType } from '../Patterns'
import { Controller } from 'react-hook-form'

export function LabeledInput (props: LabeledInputProps): ReactElement {
  const { strongLabel, label, register, error, required = false, patternConfig, name, defaultValue = '' } = props

  const errorMessage: string | undefined = (() => {
    if (error?.message !== undefined && error?.message !== '') {
      return error?.message
    }
    if (error?.type === 'max' && patternConfig?.inputType === InputType.numeric && patternConfig.max !== undefined) {
      return `Input must be less than or equal to ${patternConfig.max}`
    }
    if (error?.type === 'min' && patternConfig?.inputType === InputType.numeric && patternConfig.min !== undefined) {
      return `Input must be greater than or equal to ${patternConfig.min}`
    }
  })()

  const input: ReactElement = (() => {
    if (patternConfig?.inputType === InputType.numeric) {
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
              isNumericString={false}
              onValueChange={(v) => onChange(v.value)}
              value={value}
              error={error !== undefined}
              helperText={errorMessage}
              variant="filled"
            />
          }
          name={name}
          control={patternConfig.control}
          required={required}
          defaultValue={defaultValue}
          rules={{
            min: patternConfig.min,
            max: patternConfig.max,
            required: required ? 'Input is required' : undefined,
            pattern: {
              value: patternConfig.regexp ?? (required ? /.+/ : /.*/),
              message: patternConfig.description ?? (required ? 'Input is required' : '')
            }
          }}
        />
      )
    }

    return (
      <TextField
        name={name}
        defaultValue={defaultValue}
        inputRef={register({
          required: required ? 'Input is required' : undefined,
          pattern: {
            value: patternConfig?.regexp ?? (required ? /.+/ : /.*/),
            message: patternConfig?.description ?? (required ? 'Input is required' : '')
          }
        })}
        fullWidth={patternConfig?.format === undefined}
        helperText={error?.message}
        error={error !== undefined}
        variant="filled"
      />
    )
  })()

  return (
    <div>
      <p><strong>{strongLabel}</strong>{label}</p>
      {input}
    </div>
  )
}

export default LabeledInput
