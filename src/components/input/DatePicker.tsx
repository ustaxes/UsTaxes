import { ReactElement } from 'react'
import { FormControl, FormLabel, Grid } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import useStyles from './styles'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker as MuiDatePicker
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { DatePickerProps } from './types'

export function DatePicker<TFormValues>(
  props: DatePickerProps<TFormValues>
): ReactElement {
  const {
    label,
    name,
    minDate,
    maxDate,
    useGrid = true,
    sizes = { xs: 12 }
  } = props

  const classes = useStyles()
  const { control } = useFormContext<TFormValues>()

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
                  minDate={minDate}
                  maxDate={maxDate}
                  value={(value as string | undefined) ?? ''}
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
