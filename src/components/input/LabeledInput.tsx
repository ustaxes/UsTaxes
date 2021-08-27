import React, { ReactElement } from 'react'
import { makeStyles, createStyles, TextField, Theme } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { Controller, useFormContext } from 'react-hook-form'
import { isNumeric, Patterns } from 'ustaxes/components/Patterns'
import _ from 'lodash'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      display: 'block',
      margin: `${theme.spacing(2)}px 0`
    }
  })
)

export function LabeledInput(props: LabeledInputProps): ReactElement {
  const classes = useStyles()
  const {
    strongLabel,
    label,
    patternConfig: patternConfigDefined,
    name,
    rules = {}
  } = props
  const { required = patternConfigDefined !== undefined } = props
  const { patternConfig = Patterns.plain } = props

  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()
  const error = _.get(errors, name)

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

  const input: ReactElement = (() => {
    if (isNumeric(patternConfig)) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <NumberFormat
              customInput={TextField}
              inputRef={ref}
              name={name}
              mask={patternConfig.mask}
              thousandSeparator={patternConfig.thousandSeparator}
              prefix={patternConfig.prefix}
              allowEmptyFormatting={true}
              format={patternConfig.format}
              isNumericString={false}
              onValueChange={(v) => onChange(v.value)}
              value={value ?? ''}
              error={error !== undefined}
              helperText={errorMessage}
              variant="filled"
            />
          )}
          rules={{
            ...rules,
            min: patternConfig.min,
            max: patternConfig.max,
            required: required ? 'Input is required' : undefined,
            pattern: {
              value: patternConfig.regexp ?? (required ? /.+/ : /.*/),
              message:
                patternConfig.description ??
                (required ? 'Input is required' : '')
            }
          }}
        />
      )
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextField
            {...register(name, {
              ...rules,
              required: required ? 'Input is required' : undefined,
              pattern: {
                value: patternConfig?.regexp ?? (required ? /.+/ : /.*/),
                message:
                  patternConfig?.description ??
                  (required ? 'Input is required' : '')
              }
            })}
            value={value ?? ''}
            onChange={onChange}
            fullWidth={patternConfig?.format === undefined}
            helperText={error?.message}
            error={error !== undefined}
            variant="filled"
            inputProps={{ 'aria-labelledby': `${name}-label` }}
          />
        )}
      />
    )
  })()

  return (
    <>
      <label id={`${name}-label`} className={classes.label}>
        <strong>{strongLabel}</strong>
        {label}
      </label>
      {input}
    </>
  )
}

export default LabeledInput
