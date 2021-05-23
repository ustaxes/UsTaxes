import React, { Fragment, ReactElement } from 'react'
import { Control, Path, UseFormRegister } from 'react-hook-form'
import { Address } from '../../redux/data'
import { LabeledCheckbox, LabeledInput, USStateDropDown } from '../input'
import Patterns from '../Patterns'
import { Errors } from '../types'

interface AddressProps<A extends {address?: Address, isForeignCountry: boolean}> {
  register: UseFormRegister<A>
  checkboxText: string
  control: Control<A>
  address?: Address
  errors?: Errors<Address>
  isForeignCountry?: boolean
  allowForeignCountry?: boolean
}

export default function AddressFields<A extends {address?: Address, isForeignCountry: boolean}> (props: AddressProps<A>): ReactElement {
  const {
    register,
    isForeignCountry = false,
    control,
    address,
    errors,
    checkboxText = 'Check if you have a foreign address',
    allowForeignCountry = true
  } = props
  const patterns = new Patterns(control)

  type AddressKey = keyof Address
  const path = (name: AddressKey): Path<A> => `address.${name}` as Path<A>

  const csz: ReactElement = (() => {
    if (!allowForeignCountry || !isForeignCountry) {
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
            name={path('zip')}
            patternConfig={patterns.zip}
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
          name={path('province')}
          register={register}
          error={errors?.province}
          required={isForeignCountry}
          defaultValue={address?.province}
        />
        <LabeledInput
          name={path('postalCode')}
          label="Postal Code"
          register={register}
          error={errors?.postalCode}
          required={isForeignCountry}
          defaultValue={address?.postalCode}
        />
        <LabeledInput
          name={path('foreignCountry')}
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
        name={path('address')}
        register={register}
        required={true}
        error={errors?.address}
        defaultValue={address?.address}
      />
      <LabeledInput
        label="Unit No"
        register={register}
        name={path('aptNo')}
        required={false}
        error={errors?.aptNo}
        defaultValue={address?.aptNo}
      />
      <LabeledInput
        label="City"
        register={register}
        name={path('city')}
        patternConfig={patterns.name}
        required={true}
        error={errors?.city}
        defaultValue={address?.city}
      />
      {(() => {
        if (allowForeignCountry) {
          return (
            <LabeledCheckbox
              label={checkboxText}
              control={control}
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
