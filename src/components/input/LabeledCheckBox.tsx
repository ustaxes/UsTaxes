import { Box, Checkbox, FormControlLabel } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { Controller } from 'react-hook-form'
import { LabeledCheckBoxProps } from './types'

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

export default LabeledCheckBox
