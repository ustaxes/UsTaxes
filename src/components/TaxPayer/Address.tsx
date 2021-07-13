import React, { Fragment, ReactElement } from 'react'
import { If } from 'react-if'
import { Address } from '../../redux/data'
import { LabeledCheckbox, LabeledInput, USStateDropDown } from '../input'
import { Patterns } from '../Patterns'
import { Errors } from '../types'

interface AddressProps {
  checkboxText: string
  errors?: Errors<Address>
  isForeignCountry?: boolean
  allowForeignCountry?: boolean
}

export default function AddressFields (props: AddressProps): ReactElement {
  const {
    isForeignCountry = false,
    errors,
    checkboxText = 'Check if you have a foreign address',
    allowForeignCountry = true
  } = props

  const csz: ReactElement = (() => {
    if (!allowForeignCountry || !isForeignCountry) {
      return (
        <div>
          <USStateDropDown
            label="State"
            name="address.state"
            error={errors?.state}
            required={!isForeignCountry}
          />
          <LabeledInput
            label="Zip"
            error={errors?.zip}
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
          error={errors?.province}
          required={isForeignCountry}
        />
        <LabeledInput
          name="address.postalCode"
          label="Postal Code"
          error={errors?.postalCode}
          required={isForeignCountry}
        />
        <LabeledInput
          name="address.foreignCountry"
          label="Country"
          error={errors?.foreignCountry}
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
        error={errors?.address}
      />
      <LabeledInput
        label="Unit No"
        name="address.aptNo"
        required={false}
        error={errors?.aptNo}
      />
      <LabeledInput
        label="City"
        name="address.city"
        patternConfig={Patterns.name}
        required={true}
        error={errors?.city}
      />
      <If condition={allowForeignCountry}>
        <LabeledCheckbox label={checkboxText} name="isForeignCountry" />
      </If>
      {csz}
    </Fragment>
  )
}
