import React, { ReactElement } from 'react'
import {
  createStyles,
  makeStyles,
  Input,
  InputAdornment,
  Grid,
  TextField,
  Theme
} from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { Controller, useFormContext } from 'react-hook-form'
import { isNumeric, Patterns } from 'ustaxes/components/Patterns'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'
import _ from 'lodash'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiFormLabel-root': {
        color: 'rgba(0, 0, 0, 0.54)'
      }
    }
  })
)

export function LabeledInput(props: LabeledInputProps): ReactElement {
  const { label, patternConfig: patternConfigDefined, name, rules = {} } = props
  const { required = patternConfigDefined !== undefined } = props
  const {
    patternConfig = Patterns.plain,
    useGrid = true,
    sizes = { xs: 12 }
  } = props
  const classes = useStyles()

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
          render={({ field: { name, onChange, ref, value } }) => (
            <NumberFormat
              customInput={TextField}
              inputRef={ref}
              id={name}
              name={name}
              className={classes.root}
              label={label}
              mask={patternConfig.mask}
              thousandSeparator={patternConfig.thousandSeparator}
              // prefix={patternConfig.prefix}
              allowEmptyFormatting={true}
              format={patternConfig.format}
              isNumericString={false}
              onValueChange={(v) => onChange(v.value)}
              value={value ?? ''}
              error={error !== undefined}
              fullWidth
              helperText={errorMessage}
              variant="filled"
              InputLabelProps={{
                shrink: true
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {patternConfig.prefix}
                  </InputAdornment>
                )
              }}
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
        render={({ field: { onChange, value, name } }) => (
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
            id={name}
            name={name}
            className={classes.root}
            label={label}
            value={value ?? ''}
            onChange={onChange}
            fullWidth
            helperText={error?.message}
            error={error !== undefined}
            variant="filled"
            InputLabelProps={{
              shrink: true
            }}
          />
        )}
      />
    )
  })()

  return (
    <ConditionallyWrap
      condition={useGrid}
      wrapper={(children) => (
        <Grid item {...sizes}>
          {children}
        </Grid>
      )}
    >
      {input}
    </ConditionallyWrap>
  )
}

export default LabeledInput
