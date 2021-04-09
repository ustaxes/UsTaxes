import React, { ReactElement } from 'react'
import { TextField, Box } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { InputType } from '../Patterns'
import { Controller } from 'react-hook-form'

export function LabeledInput<A> (props: LabeledInputProps<A>): ReactElement {
  const { strongLabel, label, register, error, required = false, patternConfig, name, defaultValue } = props

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
              helperText={error?.message}
              variant="filled"
            />
          }
          name={name}
          control={patternConfig.control}
          defaultValue={defaultValue}
          rules={{
            required,
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
