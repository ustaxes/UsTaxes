import { ReactElement } from 'react'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { LabeledCheckboxProps } from './types'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'

export function LabeledCheckbox(props: LabeledCheckboxProps): ReactElement {
  const { label, name, useGrid = true, sizes = { xs: 12 } } = props
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
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name={name}
                    checked={value}
                    onChange={(_, checked) => onChange(checked)}
                    color="primary"
                  />
                }
                label={label}
                value={value}
              />
            </FormGroup>
          </FormControl>
        )}
        control={control}
      />
    </ConditionallyWrap>
  )
}

export default LabeledCheckbox
