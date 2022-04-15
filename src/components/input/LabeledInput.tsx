import { useEffect, useRef, KeyboardEvent, ReactElement } from 'react'
import { useForkRef } from 'rooks'
import { InputAdornment, Grid, TextField } from '@material-ui/core'
import { LabeledInputProps } from './types'
import NumberFormat from 'react-number-format'
import { Controller, FieldError, useFormContext } from 'react-hook-form'
import { isNumeric, Patterns } from 'ustaxes/components/Patterns'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'
import useStyles from './styles'
import { useFormContainer } from 'ustaxes/components/FormContainer/Context'
import { getNestedValue } from 'ustaxes/core/util'

export function LabeledInput<TFormValues>(
  props: LabeledInputProps<TFormValues>
): ReactElement {
  const { onSubmit } = useFormContainer()
  const { label, patternConfig: patternConfigDefined, name, rules = {} } = props
  const { required = patternConfigDefined !== undefined } = props
  const {
    autofocus,
    patternConfig = Patterns.plain,
    useGrid = true,
    sizes = { xs: 12 }
  } = props
  const classes = useStyles()
  const inputRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (autofocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef.current])

  const {
    control,
    handleSubmit,
    register,
    formState: { errors }
  } = useFormContext<TFormValues>()

  const error: FieldError | undefined = getNestedValue(errors, name, undefined)

  const errorMessage: string | undefined = (() => {
    if (error?.message !== undefined && error.message !== '') {
      return error.message
    }
    if (isNumeric(patternConfig)) {
      if (error?.type === 'max' && patternConfig.max !== undefined) {
        return `Input must be less than or equal to ${
          patternConfig.prefix ?? ''
        }${patternConfig.max}`
      }
      if (error?.type === 'min' && patternConfig.min !== undefined) {
        return `Input must be greater than or equal to ${
          patternConfig.prefix ?? ''
        }${patternConfig.min}`
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
              inputRef={autofocus ? useForkRef(ref, inputRef) : ref}
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
              value={value as number}
              error={error !== undefined}
              fullWidth
              helperText={errorMessage}
              variant="filled"
              InputLabelProps={{
                shrink: true
              }}
              InputProps={{
                startAdornment: patternConfig.prefix ? (
                  <InputAdornment position="start">
                    {patternConfig.prefix}
                  </InputAdornment>
                ) : undefined,
                onKeyDown: (e: KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    onSubmit?.()
                    void handleSubmit(() => {
                      //do nothing
                    })()
                  }
                }
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
        render={({ field: { name, onChange, ref, value } }) => (
          <TextField
            {...register(name, {
              ...rules,
              required: required ? 'Input is required' : undefined,
              pattern: {
                value: patternConfig.regexp ?? (required ? /.+/ : /.*/),
                message:
                  patternConfig.description ??
                  (required ? 'Input is required' : '')
              }
            })}
            inputRef={autofocus ? useForkRef(ref, inputRef) : ref}
            id={name}
            name={name}
            className={classes.root}
            label={label}
            value={value}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSubmit(() => {
                  // do nothing
                })()
                onSubmit?.()
              }
            }}
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
