import { Checkbox, FormControl, FormControlLabel, FormGroup, makeStyles } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { Controller } from 'react-hook-form'
import { LabeledCheckBoxProps } from './types'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    margin: theme.spacing(1, 3, 0, 0)
  }
}))

export function LabeledCheckBox (props: LabeledCheckBoxProps): ReactElement {
  const { label, name, value, setValue, control } = props

  const classes = useStyles()

  return (
    <Controller
      name={name}
      as={
        <div className={classes.root}>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                control={<Checkbox name={name} checked={value} onChange={() => setValue(!value)} color="primary" />}
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

export default LabeledCheckBox
