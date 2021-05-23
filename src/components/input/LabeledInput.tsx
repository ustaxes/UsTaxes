import React, { ReactElement } from 'react'
import { TextField } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { Controller } from 'react-hook-form'
import { isNumeric } from '../Patterns'

export function LabeledInput <A> (props: LabeledInputProps<A>): ReactElement {
  const { strongLabel, label, register, error, required = false, patternConfig, name, rules = {}, defaultValue = '' } = props

  const errorMessage: string | undefined = (() => {
    if (error?.message !== undefined && error?.message !== '') {
      return error?.message
    }
    if (patternConfig !== undefined && isNumeric(patternConfig)) {
      if (error?.type === 'max' && patternConfig.max !== undefined) {
        return `Input must be less than or equal to ${patternConfig.max}`
      }
      if (error?.type === 'min' && patternConfig.min !== undefined) {
        return `Input must be greater than or equal to ${patternConfig.min}`
      }
    }
  })()

  const requiredRegex: RegExp = patternConfig?.regexp ?? (required ? /.+/ : /.*/)
  const requiredMessage: string = patternConfig?.description ?? (required ? 'Input is required' : '')

  const input: ReactElement = ((): ReactElement => {
    if (patternConfig !== undefined && isNumeric(patternConfig)) {
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
            ...rules,
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
        {...register(name, {
          ...rules,
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
      <p><strong>{strongLabel}</strong>{label}</p>
      {input}
    </div>
  )
}

export default LabeledInput
