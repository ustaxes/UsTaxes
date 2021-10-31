import { ReactElement } from 'react'
import { FormControl, FormLabel, Grid } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import useStyles from './styles'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'
import {
  MuiPickersUtilsProvider,
  DatePicker as MuiDatePicker
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { LabeledFormProps } from './types'

import { CURRENT_YEAR } from 'ustaxes/data/federal'

export function DatePicker(props: LabeledFormProps): ReactElement {
  const { label, name, useGrid = true, sizes = { xs: 12 } } = props

  const classes = useStyles()
  const { control } = useFormContext()

  return (
    <ConditionallyWrap
      condition={useGrid}
      wrapper={(children) => (
        <Grid item {...sizes}>
          {children}
        </Grid>
      )}
    >
      <Controller
        name={name}
        render={({ field: { value, onChange } }) => (
          <div className={classes.root}>
            <FormControl component="fieldset">
              <FormLabel>{label}</FormLabel>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <MuiDatePicker
                  views={['date']}
                  minDate={new Date(CURRENT_YEAR, 0, 1)}
                  maxDate={new Date(CURRENT_YEAR, 11, 31)}
                  value={value}
                  onChange={onChange}
                />
              </MuiPickersUtilsProvider>
              {/* <RadioGroup name={name} value={value} onChange={onChange}>
                {values.map(([rowLabel, rowValue], i) => (
                  <FormControlLabel
                    key={i}
                    value={rowValue}
                    control={<Radio color="primary" />}
                    label={rowLabel}
                  />
                ))}
              </RadioGroup> */}
            </FormControl>
          </div>
        )}
        control={control}
      />
    </ConditionallyWrap>
  )
}
