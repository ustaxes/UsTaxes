import React, { ReactElement } from 'react'
import { Box, FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core'
import { Controller } from 'react-hook-form'
import { LabeledRadioProps } from './types'
import useStyles from './styles'

export function LabeledRadio (props: LabeledRadioProps): ReactElement {
  const { label, name, control, defaultValue, values } = props

  const classes = useStyles()

  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) =>
        <div className={classes.root}>
          <FormControl component="fieldset">
            <Box display="flex" justifyContent="flex-start">
              {label}
            </Box>
            <RadioGroup name={name} value={value} onChange={onChange}>
              {values.map(([rowLabel, rowValue], i) =>
                <FormControlLabel key={i} value={rowValue} control={<Radio color="primary" />} label={rowLabel} />
              )}
            </RadioGroup>
          </FormControl>
        </div>
      }
      control={control}
    />
  )
}
