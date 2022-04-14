import { useEffect, useRef, ReactElement } from 'react'
import _ from 'lodash'
import { useForkRef } from 'rooks'
import { Grid, TextField } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import locationPostalCodes from 'ustaxes/core/data/locationPostalCodes'
import countries from 'ustaxes/core/data/countries'
import { State } from 'ustaxes/core/data'
import useStyles from './styles'
import { BaseDropdownProps, LabeledDropdownProps } from './types'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'

export function GenericLabeledDropdown<A, TFormValues>(
  props: LabeledDropdownProps<A, TFormValues>
): ReactElement {
  const classes = useStyles()
  const {
    control,
    formState: { errors }
  } = useFormContext<TFormValues>()
  const {
    autofocus,
    label,
    dropDownData,
    valueMapping,
    keyMapping,
    textMapping,
    noUndefined = false,
    required = true,
    name,
    useGrid = true,
    sizes = { xs: 12 }
  } = props

  const error: string | undefined = _.get(errors, name, undefined) as
    | string
    | undefined
  const inputRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (autofocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef.current])

  return (
    <ConditionallyWrap
      condition={useGrid}
      wrapper={(children) => (
        <Grid item {...sizes}>
          {children}
        </Grid>
      )}
    >
      <Controller
        render={({ field: { name, onChange, ref, value } }) => (
          <TextField
            inputRef={autofocus ? useForkRef(ref, inputRef) : ref}
            id={name}
            name={name}
            className={classes.root}
            label={label}
            select
            fullWidth
            variant="filled"
            helperText={error !== undefined ? 'Make a selection' : undefined}
            error={error !== undefined}
            SelectProps={{
              native: true,
              value,
              onChange
            }}
            InputLabelProps={{
              shrink: true
            }}
          >
            {(() => {
              if (!noUndefined) {
                return <option value={''} />
              }
            })()}
            {dropDownData.map((dropDownItem: A, i: number) => (
              <option
                value={valueMapping(dropDownItem, i)}
                key={keyMapping(dropDownItem, i)}
              >
                {textMapping(dropDownItem, i)}
              </option>
            ))}
          </TextField>
        )}
        name={name}
        rules={{ required: required }}
        control={control}
      />
    </ConditionallyWrap>
  )
}

/**
 * A specialized version of a dropdown that just handles an array of strings
 *
 * @param props
 */
export const LabeledDropdown = <TFormValues,>(
  props: BaseDropdownProps<TFormValues> & { dropDownData: string[] }
): ReactElement => (
  <GenericLabeledDropdown<string, TFormValues>
    {...props}
    valueMapping={(x) => x}
    keyMapping={(x, n) => n}
    textMapping={(x) => x}
  />
)

export const USStateDropDown = <TFormValues,>(
  props: BaseDropdownProps<TFormValues>
): ReactElement => (
  <GenericLabeledDropdown<[string, State], TFormValues>
    {...props}
    dropDownData={locationPostalCodes}
    valueMapping={([, code]) => code}
    keyMapping={([, code]) => code}
    textMapping={([name, code]) => `${code} - ${name}`}
  />
)

export const CountryDropDown = <TFormValues,>(
  props: BaseDropdownProps<TFormValues>
): ReactElement => (
  <GenericLabeledDropdown<string, TFormValues>
    {...props}
    dropDownData={countries}
    valueMapping={(name) => name}
    keyMapping={(_, idx) => idx}
    textMapping={(name) => name}
  />
)

export default LabeledDropdown
