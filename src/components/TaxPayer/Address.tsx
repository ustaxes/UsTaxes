import React, { Fragment, ReactElement } from 'react'
import { Address } from '../../redux/data'
import { LabeledCheckbox, LabeledInput, USStateDropDown } from '../input'
import { Patterns } from '../Patterns'
import { Errors } from '../types'

interface AddressProps {
  checkboxText: string
  address?: Address
  errors?: Errors<Address>
  isForeignCountry?: boolean
  allowForeignCountry?: boolean
}

export default function AddressFields (props: AddressProps): ReactElement {
  const {
    isForeignCountry = false,
    address,
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
            defaultValue={address?.state}
          />
          <LabeledInput
            label="Zip"
            error={errors?.zip}
            name="address.zip"
            patternConfig={Patterns.zip}
            required={!isForeignCountry}
            defaultValue={address?.zip}
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
          defaultValue={address?.province}
        />
        <LabeledInput
          name="address.postalCode"
          label="Postal Code"
          error={errors?.postalCode}
          required={isForeignCountry}
          defaultValue={address?.postalCode}
        />
        <LabeledInput
          name="address.foreignCountry"
          label="Country"
          error={errors?.foreignCountry}
          required={isForeignCountry}
          defaultValue={address?.foreignCountry}
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
        defaultValue={address?.address}
      />
      <LabeledInput
        label="Unit No"
        name="address.aptNo"
        required={false}
        error={errors?.aptNo}
        defaultValue={address?.aptNo}
      />
      <LabeledInput
        label="City"
        name="address.city"
        patternConfig={Patterns.name}
        required={true}
        error={errors?.city}
        defaultValue={address?.city}
      />
      {(() => {
        if (allowForeignCountry) {
          return (
            <LabeledCheckbox
              label={checkboxText}
              name="isForeignCountry"
              defaultValue={isForeignCountry}
            />
          )
        }
      })()}
      {csz}
    </Fragment>
  )
}
