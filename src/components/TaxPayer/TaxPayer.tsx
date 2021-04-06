import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { savePrimaryPersonInfo } from '../../redux/actions'
import { Address, PersonRole, PrimaryPerson, TaxesState, TaxPayer } from '../../redux/data'
import { PersonFields, UserPersonForm } from './PersonFields'
import { LabeledCheckBox, LabeledInput, USStateDropDown } from '../input'
import { Patterns } from '../Patterns'
import { PagerContext } from '../pager'
import { DevTool } from '@hookform/devtools'

interface TaxPayerUserForm extends UserPersonForm{
  address: Address
}

const asPrimaryPerson = (formData: TaxPayerUserForm): PrimaryPerson => ({
  address: formData.address,
  firstName: formData.firstName,
  lastName: formData.lastName,
  ssid: formData.ssid.replace(/-/g, ''),
  role: PersonRole.PRIMARY
})

export default function TaxPayerInfo (): ReactElement {
  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors
    }
  } = useForm<TaxPayerUserForm>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const [isForeignCountry, updateForeignCountry] = useState<boolean>(
    taxPayer?.primaryPerson?.address.foreignCountry !== undefined
  )

  const onSubmit = (onAdvance: () => void) => (primaryPerson: PrimaryPerson): void => {
    dispatch(savePrimaryPersonInfo(asPrimaryPerson(primaryPerson)))
    onAdvance()
  }

  const csz: ReactElement = (() => {
    if (!isForeignCountry) {
      return (
        <div>
          <USStateDropDown
            label="State"
            name="address.state"
            control={control}
            error={errors.address?.state}
            required={!isForeignCountry}
            defaultValue={taxPayer?.primaryPerson?.address.state}
          />
          <LabeledInput
            label="Zip"
            register={register}
            error={errors.address?.zip}
            name="address.zip"
            patternConfig={Patterns.zip(control)}
            required={!isForeignCountry}
            defaultValue={taxPayer?.primaryPerson?.address.zip}
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
          error={errors.address?.province}
          required={isForeignCountry}
          defaultValue={taxPayer?.primaryPerson?.address.province}
        />
        <LabeledInput
          name="address.postalCode"
          label="Postal Code"
          register={register}
          error={errors.address?.postalCode}
          required={isForeignCountry}
          defaultValue={taxPayer?.primaryPerson?.address.postalCode}
        />
        <LabeledInput
          name="address.foreignCountry"
          label="Country"
          register={register}
          error={errors.address?.foreignCountry}
          required={isForeignCountry}
          defaultValue={taxPayer?.primaryPerson?.address.foreignCountry}
        />
      </div>
    )
  })()

  return (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <Box display="flex" justifyContent="center">
          <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
            <Box display="flex" justifyContent="flex-start">
              <h2>Taxpayer Information</h2>
            </Box>

            <h4>Primary Taxpayer Information</h4>
            <PersonFields
              register={register}
              errors={errors}
              defaults={taxPayer?.primaryPerson}
              control={control}
            />
            <LabeledInput
              label="Address"
              name="address.address"
              register={register}
              required={true}
              error={errors.address?.address}
              defaultValue={taxPayer?.primaryPerson?.address.address}
            />
            <LabeledInput
              label="Unit No"
              register={register}
              name="address.aptNo"
              required={false}
              error={errors.address?.aptNo}
              defaultValue={taxPayer?.primaryPerson?.address.aptNo}
            />
            <LabeledInput<TaxPayerUserForm>
              label="City"
              register={register}
              name="address.city"
              patternConfig={Patterns.name}
              required={true}
              error={errors.address?.city}
              defaultValue={taxPayer?.primaryPerson?.address.city}
            />
            <LabeledCheckBox
              label="Check if you have a foreign address"
              control={control}
              value={isForeignCountry}
              setValue={updateForeignCountry}
              name="isForeignCountry"
            />
            {csz}
            {navButtons}
          </form>
          <DevTool control={control} />
        </Box>
      }
    </PagerContext.Consumer>
  )
}
