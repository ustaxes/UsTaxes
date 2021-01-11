import React from 'react'
import { TextField, Box, Checkbox, FormControlLabel } from '@material-ui/core'
import { Controller } from 'react-hook-form'
import InputMask from 'react-input-mask'
import locationPostalCodes from '../data/locationPostalCodes'

export function LabeledInput ({ strongLabel, label, register, required, mask, pattern, patternDescription, name, errors, defaultValue }) {
  let helperText = ''
  // fix error where pattern wouldn't match if input wasn't filled out even if required was set to false
  if (required === false) {
    pattern = null
  }
  if (errors[name]?.type === 'required') {
    helperText = 'Input is required'
  } else if (errors[name]?.type === 'pattern') {
    // Must have a regex pattern description so users can see what's going wrong *
    helperText = patternDescription
  }
  return (
        <div>
            <Box display="flex" justifyContent="flex-start">
                <p><strong>{strongLabel}</strong>{label}</p>
            </Box>
            {/* default regex pattern is to accept any input. Otherwise, use input pattern */}
            <Box display="flex" justifyContent="flex-start">
                {/* if there is a mask prop, create masked textfield rather than standard */}
                {mask
                  ? <InputMask
                        mask={mask}
                        alwaysShowMask={true}
                        maskChar=""
                        defaultValue={defaultValue}
                    >
                        {() => <TextField
                            error={!!errors[name]}
                            helperText={helperText}
                            inputRef={register({ submitFocusError: true, required: required, pattern: pattern || /.*?/ })}
                            name={name}
                            variant="filled"
                        />}
                    </InputMask>
                  : <TextField
                        error={!!errors[name]}
                        helperText={helperText}
                        fullWidth
                        inputRef={register({ submitFocusError: true, required: required, pattern: pattern || /.*?/ })}
                        name={name}
                        defaultValue={defaultValue}
                        variant="filled"
                    />
                }

            </Box>
        </div>
  )
}

export function LabeledDropdown ({ label, dropDownData, valueMapping, keyMapping, textMapping, control, required, name, errors, defaultValue }) {
  let helperText = ''
  if (errors[name]?.type === 'required') {
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
                            {dropDownData.map(dropDownItem =>
                                <option
                                    value={valueMapping ? valueMapping(dropDownItem) : dropDownItem}
                                    key={keyMapping ? keyMapping(dropDownItem) : dropDownItem}>
                                    {textMapping ? textMapping(dropDownItem) : dropDownItem}
                                </option>
                            )}
                        </TextField>
                    }
                    error={!!errors[name]}
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

export function USStateDropDown ({ label = 'State', control, required = false, name = 'employeeState', errors, defaultValue = '' }) {
  return (
    <LabeledDropdown
      label="Employee's State"
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

export function LabeledCheckBox ({ foreignAddress, setforeignAddress, control, description }) {
  const setForeignAddressFalse = () => setforeignAddress(false)
  const setForeignAddressTrue = () => setforeignAddress(true)
  return (
        <Controller
            name="foreignAddress"
            as={
                <Box display="flex" justifyContent="flex-start" paddingTop={1}>
                    <FormControlLabel
                        control={<Checkbox checked={!foreignAddress} onChange={setForeignAddressFalse} color="primary" />}
                        label="No"
                        ml={0}
                        value={false}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={foreignAddress} onChange={setForeignAddressTrue} color="primary" />}
                        label="Yes"
                        value={true}
                    />
                    <p>{description}</p>
                </Box>
            }
            control={control}
        />
  )
}
