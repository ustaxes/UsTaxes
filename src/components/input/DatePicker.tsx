import { ReactElement } from 'react'
import { FormControl, Grid } from '@material-ui/core'
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
    required = false,
    name,
    minDate = new Date(1900, 0, 1),
    maxDate,
    useGrid = true,
    sizes = { xs: 12 }
  } = props

  const classes = useStyles()
  const {
    control,
    formState: { isDirty, isSubmitted }
  } = useFormContext<TFormValues>()

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
        control={control}
        rules={{
          required: required ? 'Input is required' : false
        }}
        render={({ field: { value, onChange } }) => (
          <div className={classes.root}>
            <FormControl component="fieldset">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <MuiDatePicker
                  data-testid={name}
                  label={label}
                  InputProps={{
                    fullWidth: true
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  inputVariant="filled"
                  minDate={minDate}
                  maxDate={maxDate}
                  maxDateMessage={`Date cannot be after ${maxDate.toLocaleDateString()}`}
                  minDateMessage={`Date cannot be before ${minDate.toLocaleDateString()}`}
                  // invalid date message can be shown once user has attempted to submit
                  invalidDateMessage={
                    isDirty && isSubmitted ? 'Invalid date format' : ''
                  }
                  value={
                    (value as string | undefined) ?? null
                    // if user is working with the field, we should not display the empty label
                  }
                  placeholder="mm/dd/yyyy"
                  onChange={onChange}
                  format="MM/dd/yyyy"
                />
              </MuiPickersUtilsProvider>
            </FormControl>
          </div>
        )}
      />
    </ConditionallyWrap>
  )
}
