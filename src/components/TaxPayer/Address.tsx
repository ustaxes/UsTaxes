import React, { Fragment, ReactElement } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { If } from 'react-if'
import { LabeledCheckbox, LabeledInput, USStateDropDown } from '../input'
import { Patterns } from '../Patterns'

interface AddressProps {
  checkboxText: string
  allowForeignCountry?: boolean
}

export default function AddressFields (props: AddressProps): ReactElement {
  const {
    checkboxText = 'Check if you have a foreign address',
    allowForeignCountry = true
  } = props

  const { control } = useFormContext<{isForeignCountry: boolean }>()

  const isForeignCountry = useWatch({
    name: 'isForeignCountry',
    control
  })

  const csz: ReactElement = (() => {
    if (!allowForeignCountry || !isForeignCountry) {
      return (
        <div>
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
        </div>
      )
    }
    return (
      <div>
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
        <LabeledInput
          name="address.foreignCountry"
          label="Country"
          required={isForeignCountry}
        />
      </div>
    )
  })()

  return (
    <Fragment>
      <LabeledInput
        label="Address"
        name="address.address"
        required={true}
      />
      <LabeledInput
        label="Unit No"
        name="address.aptNo"
        required={false}
      />
      <LabeledInput
        label="City"
        name="address.city"
        patternConfig={Patterns.name}
      />
      <If condition={allowForeignCountry}>
        <LabeledCheckbox label={checkboxText} name="isForeignCountry" />
      </If>
      {csz}
    </Fragment>
  )
}
