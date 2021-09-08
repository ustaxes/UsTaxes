import { ReactElement } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { If } from 'react-if'
import {
  LabeledCheckbox,
  LabeledInput,
  USStateDropDown
} from 'ustaxes/components/input'
import { CountryDropDown } from 'ustaxes/components/input/LabeledDropdown'
import { Patterns } from 'ustaxes/components/Patterns'

interface AddressProps {
  autofocus?: boolean
  checkboxText: string
  allowForeignCountry?: boolean
}

export default function AddressFields(props: AddressProps): ReactElement {
  const {
    autofocus,
    checkboxText = 'Check if you have a foreign address',
    allowForeignCountry = true
  } = props

  const { control } = useFormContext<{ isForeignCountry: boolean }>()

  const isForeignCountry = useWatch({
    name: 'isForeignCountry',
    control
  })

  const csz: ReactElement = (() => {
    if (!allowForeignCountry || !isForeignCountry) {
      return (
        <>
          <USStateDropDown
            label="State"
            name="address.state"
            required={!isForeignCountry}
          />
          <LabeledInput
            label="Zip"
            name="address.zip"
            patternConfig={Patterns.zip}
            required={!isForeignCountry}
          />
        </>
      )
    }
    return (
      <>
        <LabeledInput
          label="Province"
          name="address.province"
          required={isForeignCountry}
        />
        <LabeledInput
          name="address.postalCode"
          label="Postal Code"
          required={isForeignCountry}
        />
        <CountryDropDown
          name="address.foreignCountry"
          label="Country"
          required={isForeignCountry}
        />
      </>
    )
  })()

  return (
    <>
      <LabeledInput
        autofocus={autofocus}
        label="Address"
        name="address.address"
        required={true}
      />
      <LabeledInput label="Unit No" name="address.aptNo" required={false} />
      <LabeledInput
        label="City"
        name="address.city"
        patternConfig={Patterns.name}
      />
      <If condition={allowForeignCountry}>
        <LabeledCheckbox label={checkboxText} name="isForeignCountry" />
      </If>
      {csz}
    </>
  )
}
