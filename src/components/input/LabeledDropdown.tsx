import { Box, TextField } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { Controller } from 'react-hook-form'
import locationPostalCodes from '../../data/locationPostalCodes'
import { BaseDropdownProps, LabeledDropdownProps } from './types'

export function GenericLabeledDropdown<A> (props: LabeledDropdownProps<A>): ReactElement {
  const { label, dropDownData, valueMapping, error, keyMapping, textMapping, control, required = false, name, defaultValue } = props

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
              helperText={error !== undefined ? 'Make a selection' : undefined}
              error={error !== undefined}
              SelectProps={{
                native: true
              }}
            >
              <option value={undefined} />
              {dropDownData.map((dropDownItem: A, i: number) =>
                <option
                  value={valueMapping(dropDownItem, i)}
                  key={keyMapping(dropDownItem, i)}>
                  {textMapping(dropDownItem, i)}
                </option>
              )}
            </TextField>
          }
          error={error !== undefined}
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
