import { ReactElement } from 'react'
import { FormControl, FormLabel, Grid, TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'
import { DatePickerProps } from './types'
import { DesktopDateTimePicker as MuiDatePicker } from '@mui/lab'
import FormRoot from './styles'

export function DatePicker(props: DatePickerProps): ReactElement {
  const {
    label,
    name,
    minDate,
    maxDate,
    useGrid = true,
    sizes = { xs: 12 }
  } = props

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
          <FormRoot className="form-root">
            <FormControl component="fieldset">
              <FormLabel>{label}</FormLabel>
              <MuiDatePicker
                minDate={minDate}
                maxDate={maxDate}
                value={value}
                onChange={onChange}
                inputFormat="MM/dd/yyyy"
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </FormRoot>
        )}
        control={control}
      />
    </ConditionallyWrap>
  )
}
