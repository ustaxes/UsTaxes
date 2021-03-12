import React, { ReactElement } from 'react'
import { TextField, Box } from '@material-ui/core'
import InputMask from 'react-input-mask'
import { LabeledInputProps } from './types'

export function LabeledInput (props: LabeledInputProps): ReactElement {
  const { strongLabel, label, register, error, required = false, patternConfig = {}, name, defaultValue } = props
  //  let helperText: string | undefined
  // fix error where pattern wouldn't match if input wasn't filled out even if required was set to false
  if (!required) {
    patternConfig.regexp = /.?/
  }

  /* default regex pattern is to accept any input. Otherwise, use input pattern */
  const textField = (
    <TextField
      fullWidth={patternConfig.mask === undefined}
      defaultValue={defaultValue}
      helperText={error?.message}
      type={patternConfig.type}
      inputRef={
        register({
          required: required ? 'Input is required' : undefined,
          pattern: {
            value: patternConfig.regexp ?? (required ? /.+/ : /.*/),
            message: patternConfig.description ?? (required ? 'Input is required' : '')
          }
        })
      }
      error={error !== undefined}
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
