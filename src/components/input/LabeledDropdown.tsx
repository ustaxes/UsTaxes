import React, { ReactElement } from 'react'
import {
  createStyles,
  makeStyles,
  Box,
  TextField,
  Theme
} from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import locationPostalCodes from 'ustaxes/data/locationPostalCodes'
import { BaseDropdownProps, LabeledDropdownProps } from './types'
import _ from 'lodash'
import countries from 'ustaxes/data/countries'
import { State } from 'ustaxes/redux/data'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      display: 'block',
      margin: `${theme.spacing(2)}px 0`
    }
  })
)

export function GenericLabeledDropdown<A>(
  props: LabeledDropdownProps<A>
): ReactElement {
  const classes = useStyles()
  const {
    control,
    formState: { errors }
  } = useFormContext()
  const {
    strongLabel,
    label,
    dropDownData,
    valueMapping,
    keyMapping,
    textMapping,
    required = true,
    name
  } = props
  const error = _.get(errors, name)

  return (
    <>
      <Box display="flex" justifyContent="flex-start">
        <label id={`${name}-label`} className={classes.label}>
          <strong>{strongLabel}</strong>
          {label}
        </label>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <Controller
          render={({ field: { value, onChange, ref } }) => (
            <TextField
              inputRef={ref}
              select
              fullWidth
              variant="filled"
              name={name}
              helperText={error !== undefined ? 'Make a selection' : undefined}
              error={error !== undefined}
              SelectProps={{
                native: true,
                value,
                onChange
              }}
              inputProps={{ 'aria-labelledby': `${name}-label` }}
            >
              <option value={''} />
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
      </Box>
    </>
  )
}

/**
 * A specialized version of a dropdown that just handles an array of strings
 *
 * @param props
 */
export const LabeledDropdown = (
  props: BaseDropdownProps & { dropDownData: string[] }
): ReactElement => (
  <GenericLabeledDropdown<string>
    {...props}
    valueMapping={(x) => x}
    keyMapping={(x, n) => n}
    textMapping={(x) => x}
  />
)

export const USStateDropDown = (props: BaseDropdownProps): ReactElement => (
  <GenericLabeledDropdown<[string, State]>
    {...props}
    dropDownData={locationPostalCodes}
    valueMapping={([, code], n) => code}
    keyMapping={([, code], n) => code}
    textMapping={([name, code], n) => `${code} - ${name}`}
  />
)

export const CountryDropDown = (props: BaseDropdownProps): ReactElement => (
  <GenericLabeledDropdown<string>
    {...props}
    dropDownData={countries}
    valueMapping={(name, _) => name}
    keyMapping={(_, idx) => idx}
    textMapping={(name, _) => name}
  />
)

export default LabeledDropdown
