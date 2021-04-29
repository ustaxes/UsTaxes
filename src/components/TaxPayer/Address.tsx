import React, { Fragment, ReactElement } from 'react'
import { Control } from 'react-hook-form'
import { Address } from '../../redux/data'
import { LabeledCheckbox, LabeledInput, USStateDropDown } from '../input'
import { Patterns } from '../Patterns'
import { Register, Errors } from '../types'

interface AddressProps {
  register: Register
  checkboxText: string
  control: Control
  address?: Address
  errors?: Errors<Address>
  isForeignCountry?: boolean | undefined
}

export default function AddressFields (props: AddressProps): ReactElement {
  const {
    register,
    isForeignCountry = false,
    control,
    address,
    errors,
    checkboxText = 'Check if you have a foreign address'
  } = props

  const csz: ReactElement = (() => {
    if (!isForeignCountry) {
      return (
        <div>
          <USStateDropDown
            label="State"
            name="address.state"
            control={control}
            error={errors?.state}
            required={!isForeignCountry}
            defaultValue={address?.state}
          />
          <LabeledInput
            label="Zip"
            register={register}
            error={errors?.zip}
            name="address.zip"
            patternConfig={Patterns.zip(control)}
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
          register={register}
          error={errors?.province}
          required={isForeignCountry}
          defaultValue={address?.province}
        />
        <LabeledInput
          name="address.postalCode"
          label="Postal Code"
          register={register}
          error={errors?.postalCode}
          required={isForeignCountry}
          defaultValue={address?.postalCode}
        />
        <LabeledInput
          name="address.foreignCountry"
          label="Country"
          register={register}
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
        register={register}
        required={true}
        error={errors?.address}
        defaultValue={address?.address}
      />
      <LabeledInput
        label="Unit No"
        register={register}
        name="address.aptNo"
        required={false}
        error={errors?.aptNo}
        defaultValue={address?.aptNo}
      />
      <LabeledInput
        label="City"
        register={register}
        name="address.city"
        patternConfig={Patterns.name}
        required={true}
        error={errors?.city}
        defaultValue={address?.city}
      />
      <LabeledCheckbox
        label={checkboxText}
        control={control}
        name="isForeignCountry"
        defaultValue={isForeignCountry}
      />
      {csz}
    </Fragment>
  )
}
