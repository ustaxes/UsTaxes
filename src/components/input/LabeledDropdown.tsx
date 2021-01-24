import { Box, TextField } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { Controller } from 'react-hook-form'
import locationPostalCodes from '../../data/locationPostalCodes'
import { BaseDropdownProps, isError, getError, LabeledDropdownProps, id } from './types'

export function GenericLabeledDropdown<A,> (props: LabeledDropdownProps<A>): ReactElement {
  const { label, dropDownData, valueMapping, keyMapping, textMapping, control, required, name, errors, defaultValue } = props
  let helperText = ''

  if (errors !== undefined && getError(errors, name) === 'required') {
    helperText = 'Input is required'
  }
  return (
    <div>
      <Box display="flex" justifyContent="flex-start">
        <p>{label}</p>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <Controller
          as={
            <TextField
              select
              helperText={helperText}
              defaultValue=""
              SelectProps={{
                native: true
              }}
            >
              <option value={undefined} />
              {dropDownData.map((dropDownItem: A) =>
                <option
                  value={valueMapping(dropDownItem)}
                  key={keyMapping(dropDownItem)}>
                  {textMapping(dropDownItem)}
                </option>
              )}
            </TextField>
          }
          error={errors !== undefined && isError(errors, name)}
          fullWidth
          name={name}
          defaultValue={defaultValue}
          rules={{ required: required }}
          control={control}
          variant="filled"
        />
      </Box>
    </div>
  )
}

/**
 * A specialized version of a dropdown that just handles an array of strings
 *
 * @param props
 */
export function LabeledDropdown (props: BaseDropdownProps & {dropDownData: string[]}): ReactElement {
  return GenericLabeledDropdown(
    {
      ...props,
      valueMapping: id,
      keyMapping: id,
      textMapping: id
    }
  )
}

export function USStateDropDown (props: BaseDropdownProps): ReactElement {
  const {
    label,
    required,
    name,
    errors,
    defaultValue,
    control
  } = props

  return (
    <GenericLabeledDropdown<[string, string]>
      label={label}
      dropDownData={locationPostalCodes}
      valueMapping={locality => locality[1]}
      keyMapping={locality => locality[1]}
      textMapping={locality => locality[1] + ' - ' + locality[0]}
      control={control}
      required={required}
      name={name}
      defaultValue={defaultValue}
      errors={errors}
    />
  )
}

export default LabeledDropdown
