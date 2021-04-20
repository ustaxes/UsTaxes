import React, { ReactElement } from 'react'
import { TextField, Box } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { InputType } from '../Patterns'
import { Controller } from 'react-hook-form'

export function LabeledInput<A> (props: LabeledInputProps<A>): ReactElement {
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

  const requiredRegex: RegExp = patternConfig?.regexp ?? (required ? /.+/ : /.*/)
  const requiredMessage: string = patternConfig?.description ?? (required ? 'Input is required' : '')

  const input: ReactElement = (() => {
    if (patternConfig?.inputType === InputType.numeric) {
      return (
        <Controller<A>
          render={({ field: { onChange, value } }) =>
            <NumberFormat
              mask={patternConfig.mask}
              thousandSeparator={patternConfig.thousandSeparator}
              prefix={patternConfig.prefix}
              allowEmptyFormatting={true}
              format={patternConfig.format}
              customInput={TextField}
              isNumericString={false}
              onValueChange={(v) => onChange(v.value)}
            // NumberFormat requires a plain value, but here we're still
            // parameterized as PathValue<A, Path<A>> and it's unclear how to
            // derive directly
              value={value as number}
              error={error !== undefined}
              helperText={errorMessage}
              variant="filled"
            />
          }
          name={name}
          control={patternConfig.control}
          defaultValue={defaultValue}
          rules={{
            min: patternConfig.min,
            max: patternConfig.max,
            required: required ? 'Input is required' : undefined,
            pattern: {
              value: requiredRegex,
              message: requiredMessage
            }
          }}
        />
      )
    }

    return (
      <TextField
        defaultValue={defaultValue}
        fullWidth={patternConfig?.format === undefined}
        helperText={error?.message}
        error={error !== undefined}
        variant="filled"
        {...register(name, {
          required,
          pattern: {
            value: requiredRegex,
            message: requiredMessage
          }
        })}
      />
    )
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
