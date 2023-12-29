import { ReactElement } from 'react'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup
} from '@material-ui/core'
import { Controller, FieldValues, useFormContext } from 'react-hook-form'
import { LabeledRadioProps } from './types'
import useStyles from './styles'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'

export function LabeledRadio<A extends FieldValues>(
  props: LabeledRadioProps<A>
): ReactElement {
  const { label, name, values, useGrid = true, sizes = { xs: 12 } } = props

  const classes = useStyles()
  const { control } = useFormContext<A>()

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
              <RadioGroup name={name} value={value} onChange={onChange}>
                {values.map(([rowLabel, rowValue], i) => (
                  <FormControlLabel
                    key={i}
                    value={rowValue}
                    control={<Radio color="primary" />}
                    label={rowLabel}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
        )}
        control={control}
      />
    </ConditionallyWrap>
  )
}
