import React, { ReactElement } from 'react'
import { TextField, Box } from '@material-ui/core'
import InputMask from 'react-input-mask'
import { LabeledInputProps, isError } from './types'

export function LabeledInput (props: LabeledInputProps): ReactElement {
  const { strongLabel, label, register, required, patternConfig = {}, name, errors, defaultValue } = props
  let helperText: string | undefined
  // fix error where pattern wouldn't match if input wasn't filled out even if required was set to false
  if (!required) {
    patternConfig.regexp = /.?/
  }
  if (errors[name]?.type === 'required') {
    helperText = 'Input is required'
  } else if (errors[name]?.type === 'pattern') {
    // Must have a regex pattern description so users can see what's going wrong *
    helperText = patternConfig.description
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

export default LabeledInput
