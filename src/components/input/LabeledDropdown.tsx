import { ReactElement } from 'react'
import { Grid, TextField } from '@material-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import locationPostalCodes from 'ustaxes-core/data/locationPostalCodes'
import useStyles from './styles'
import { BaseDropdownProps, LabeledDropdownProps } from './types'
import _ from 'lodash'
import countries from 'ustaxes/data/countries'
import { State } from 'ustaxes-core/data'
import ConditionallyWrap from 'ustaxes/components/ConditionallyWrap'

export function GenericLabeledDropdown<A>(
  props: LabeledDropdownProps<A>
): ReactElement {
  const classes = useStyles()
  const {
    control,
    formState: { errors }
  } = useFormContext()
  const {
    label,
    dropDownData,
    valueMapping,
    keyMapping,
    textMapping,
    required = true,
    name,
    useGrid = true,
    sizes = { xs: 12 }
  } = props
  const error = _.get(errors, name)

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
        render={({ field: { name, onChange, ref, value } }) => (
          <TextField
            inputRef={ref}
            id={name}
            name={name}
            className={classes.root}
            label={label}
            select
            fullWidth
            variant="filled"
            helperText={error !== undefined ? 'Make a selection' : undefined}
            error={error !== undefined}
            SelectProps={{
              native: true,
              value,
              onChange
            }}
            InputLabelProps={{
              shrink: true
            }}
          >
            <option value={''} />
            {dropDownData.map((dropDownItem: A, i: number) => (
              <option
                value={valueMapping(dropDownItem, i)}
                key={keyMapping(dropDownItem, i)}
              >
                {textMapping(dropDownItem, i)}
              </option>
            ))}
          </TextField>
        )}
        name={name}
        rules={{ required: required }}
        control={control}
      />
    </ConditionallyWrap>
  )
}

/**
 * A specialized version of a dropdown that just handles an array of strings
 *
 * @param props
 */
export const LabeledDropdown = (
  props: BaseDropdownProps & { dropDownData: string[] }
): ReactElement => (
  <GenericLabeledDropdown<string>
    {...props}
    valueMapping={(x) => x}
    keyMapping={(x, n) => n}
    textMapping={(x) => x}
  />
)

export const USStateDropDown = (props: BaseDropdownProps): ReactElement => (
  <GenericLabeledDropdown<[string, State]>
    {...props}
    dropDownData={locationPostalCodes}
    valueMapping={([, code]) => code}
    keyMapping={([, code]) => code}
    textMapping={([name, code]) => `${code} - ${name}`}
  />
)

export const CountryDropDown = (props: BaseDropdownProps): ReactElement => (
  <GenericLabeledDropdown<string>
    {...props}
    dropDownData={countries}
    valueMapping={(name) => name}
    keyMapping={(_, idx) => idx}
    textMapping={(name) => name}
  />
)

export default LabeledDropdown
