import { Box, Checkbox, FormControlLabel } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { Controller } from 'react-hook-form'
import { LabeledCheckBoxProps } from './types'

export function LabeledCheckBox (props: LabeledCheckBoxProps): ReactElement {
  const { label, name, value, setValue, control } = props

  return (
    <Controller
      name={name}
      as={
        <Box alignContent="left">
          <Box alignContent="left" display="block" paddingTop={2}>
            {label}
          </Box>
          <Box alignContent="left" display="block" paddingTop={2}>
            <FormControlLabel
              control={<Checkbox name={name} checked={value} onChange={() => setValue(!value)} color="primary" />}
              label={value ? 'Yes' : 'No'}
              value={value}
            />
          </Box>
        </Box>
      }
      control={control}
    />
  )
}

export default LabeledCheckBox
