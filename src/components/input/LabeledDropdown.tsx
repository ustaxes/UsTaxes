import React, { ReactElement } from 'react'
import { Box, TextField } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import locationPostalCodes from '../../data/locationPostalCodes'
import { BaseDropdownProps, LabeledDropdownProps } from './types'
import _ from 'lodash'

export function GenericLabeledDropdown<A> (props: LabeledDropdownProps<A>): ReactElement {
  const { control, formState: { errors } } = useFormContext()
  const { strongLabel, label, dropDownData, valueMapping, keyMapping, textMapping, required = true, name } = props
  const error = _.get(errors, name)

  return (
    <div>
      <Box display="flex" justifyContent="flex-start">
        <p><strong>{strongLabel}</strong>{label}</p>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <Controller
          render={(({ field: { value, onChange } }) =>
            <TextField
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
            >
              <option value={''} />
              {dropDownData.map((dropDownItem: A, i: number) =>
                <option
                  value={valueMapping(dropDownItem, i)}
                  key={keyMapping(dropDownItem, i)}>
                  {textMapping(dropDownItem, i)}
                </option>
              )}
            </TextField>
          )}
          name={name}
          rules={{ required: required }}
          control={control}
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
export const LabeledDropdown = (props: BaseDropdownProps & {dropDownData: string[]}): ReactElement => (
  <GenericLabeledDropdown<string>
    {...props}
    valueMapping={(x) => x}
    keyMapping={(x, n) => n}
    textMapping={(x) => x}
  />
)

export const USStateDropDown = (props: BaseDropdownProps): ReactElement => (
  <GenericLabeledDropdown<[string, string]>
    {...props}
    dropDownData={locationPostalCodes}
    valueMapping={([,code], n) => code}
    keyMapping={([,code], n) => code}
    textMapping={([name, code], n) => `${code} - ${name}`}
  />
)

export default LabeledDropdown
