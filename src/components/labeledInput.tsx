import React, { ReactElement } from 'react'
import { TextField, Box, Checkbox, FormControlLabel } from '@material-ui/core'
import { Control, Controller, RegisterOptions } from 'react-hook-form'
import InputMask from 'react-input-mask'
import locationPostalCodes from '../data/locationPostalCodes'

interface Errors {
  [key: string]: {type: string}
}

type Register = (rules?: RegisterOptions) => any

interface PatternConfig {
  mask?: string
  regexp?: RegExp
  description?: string
}

interface LabeledInputProps {
  strongLabel?: string
  patternConfig?: PatternConfig
  label: string
  register: Register
  required: boolean
  name: string
  errors: Errors
  defaultValue: string
}

const getError = (errors: Errors, name: string): string | undefined => {
  let result
  if (Object.prototype.hasOwnProperty.call(errors, name)) {
    const r = errors[name]
    result = r.type
  }
  return result
}

const isError = (errors: Errors, name: string): boolean => getError(errors, name) !== undefined

export function LabeledInput (props: LabeledInputProps): ReactElement {
  const { strongLabel, label, register, required, patternConfig = {}, name, errors, defaultValue } = props
  let helperText = ''
  // fix error where pattern wouldn't match if input wasn't filled out even if required was set to false
  if (!required) {
    patternConfig.regexp = /.?/
  }
  if (errors[name]?.type === 'required') {
    helperText = 'Input is required'
  } else if (errors[name]?.type === 'pattern') {
    // Must have a regex pattern description so users can see what's going wrong *
    helperText = patternConfig.description ?? ''
  }

  /* default regex pattern is to accept any input. Otherwise, use input pattern */
  const textField = (
    <TextField
      error={isError(errors, name)}
      helperText={helperText}
      fullWidth={patternConfig.mask === undefined}
      defaultValue={defaultValue}
      inputRef={register({ required: required, pattern: patternConfig.regexp })}
      name={name}
      variant="filled"
    />
  )

  /* if there is a mask prop, create masked textfield rather than standard */
  let input = textField
  if (patternConfig.mask !== undefined) {
    input = (
      <InputMask
        mask={patternConfig.mask}
        alwaysShowMask={true}
        defaultValue={defaultValue}
      >
        {textField}
      </InputMask>
    )
  }

  return (
    <div>
      <Box display="flex" justifyContent="flex-start">
        <p><strong>{strongLabel}</strong>{label}</p>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        {input}
      </Box>
    </div>
  )
}

const id = <A,>(a: A): A => a

interface BaseDropdownProps {
  label: string
  required: boolean
  name: string
  errors: Errors
  defaultValue: string
  control?: Control<any>
}

interface LabeledDropdownProps<A,> extends BaseDropdownProps {
  dropDownData: A[]
  valueMapping: (a: A) => string
  keyMapping: (a: A) => string
  textMapping: (a: A) => string
}

export function GenericLabeledDropdown<A,> (props: LabeledDropdownProps<A>): ReactElement {
  const { label, dropDownData, valueMapping, keyMapping, textMapping, control, required, name, errors, defaultValue } = props
  let helperText = ''

  if (getError(errors, name) === 'required') {
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
          error={isError(errors, name)}
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

interface LabeledCheckBoxProps {
  foreignAddress: boolean
  setforeignAddress: (v: boolean) => void
  control: Control<any>
  description: string
}

export function LabeledCheckBox (props: LabeledCheckBoxProps): ReactElement {
  const { foreignAddress, setforeignAddress, control, description } = props

  const setForeignAddressFalse = (): void => setforeignAddress(false)
  const setForeignAddressTrue = (): void => setforeignAddress(true)

  return (
    <Controller
      name="foreignAddress"
      as={
        <Box display="flex" justifyContent="flex-start" paddingTop={1}>
          <FormControlLabel
            control={<Checkbox checked={!foreignAddress} onChange={setForeignAddressFalse} color="primary" />}
            label="No"
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

export const Patterns: {[name: string]: PatternConfig} = {
  name: {
    regexp: /^[A-Za-z ]+$/i,
    description: 'Input should only include letters and spaces'
  },
  zip: {
    regexp: /[0-9]{5}-[0-9]{4}/,
    description: 'Input should be filled with 9 numbers',
    mask: '99999-9999'
  },
  ssn: {
    mask: '999-99-9999',
    regexp: /[0-9]{3}-[0-9]{2}-[0-9]{4}/,
    description: 'Input should be filled with 9 numbers'
  },
  ein: {
    mask: '99-9999999',
    regexp: /[0-9]{2}-[0-9]{7}/,
    description: 'Input should be filled with 9 numbers'
  },
  currency: {
    mask: '$999999',
    regexp: /[0-9]*/,
    description: 'Input should be filled with numbers only'
  },
  bankAccount: {
    mask: '999999999999',
    regexp: /[0-9]{10}|[0-9]{11}|[0-9]{12}/,
    description: 'Input should be filled with 10-12 numbers'
  },
  bankRouting: {
    mask: '999999999',
    regexp: /[0-9]{9}/,
    description: 'Input should be filled with 10 numbers'
  },
  usPhoneNumber: {
    regexp: /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
    description: 'Input should be filled with 10 numbers',
    mask: '999-999-9999'
  }
}
