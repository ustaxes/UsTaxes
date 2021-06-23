import React, { ReactElement } from 'react'
import { Checkbox, FormControl, FormControlLabel, FormGroup } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import { LabeledCheckboxProps } from './types'
import useStyles from './styles'

export function LabeledCheckbox (props: LabeledCheckboxProps): ReactElement {
  const { label, name, defaultValue } = props
  const { control } = useFormContext()

  const classes = useStyles()

  return (
    <Controller
      name={name}
      defaultValue={defaultValue ?? false}
      render={ ({ value, onChange }) =>
        <div className={classes.root}>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                control={<Checkbox name={name} checked={value} onChange={(_, checked) => onChange(checked)} color="primary" />}
                label={label}
                value={value}
              />
            </FormGroup>
          </FormControl>
        </div>
      }
      control={control}
    />
  )
}

export default LabeledCheckbox
