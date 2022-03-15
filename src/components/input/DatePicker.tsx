import { ReactElement } from 'react'
import { FormControl, FormLabel, Grid, TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { DesktopDatePicker as MuiDatePicker } from '@mui/material'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker as MuiDatePicker
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { DatePickerProps } from './types'

export function DatePicker(props: DatePickerProps): ReactElement {
  const {
    label,
    name,
    minDate,
    maxDate,
    useGrid = true,
    sizes = { xs: 12 }
  } = props

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
        render={({ field: { value = null, onChange } }) => (
          <div className={classes.root}>
            <FormControl component="fieldset">
              <FormLabel>{label}</FormLabel>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <MuiDatePicker
                  minDate={minDate}
                  maxDate={maxDate}
                  value={value}
                  onChange={onChange}
                  format="MM/dd/yyyy"
                  emptyLabel="mm/dd/yyyy"
                />
              </MuiPickersUtilsProvider>
            </FormControl>
          </div>
        )}
        control={control}
      />
    </ConditionallyWrap>
  )
}
