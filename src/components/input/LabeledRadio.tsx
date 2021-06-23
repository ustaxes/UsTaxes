import React, { ReactElement } from 'react'
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import { LabeledRadioProps } from './types'
import useStyles from './styles'

export function LabeledRadio (props: LabeledRadioProps): ReactElement {
  const { label, name, defaultValue, values } = props

  const classes = useStyles()
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      render={ ({ value, onChange }) =>
        <div className={classes.root}>
          <FormControl component="fieldset">
            {label}
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
