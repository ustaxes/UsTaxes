import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { saveTaxpayerInfo } from '../../redux/actions'
import { PagedFormProps } from '../pager'
import { PrimaryPerson, TaxesState, TaxPayer } from '../../redux/data'
import { PersonFields } from './PersonFields'
import { LabeledCheckBox, LabeledInput, USStateDropDown } from '../input'
import { Patterns } from '../Patterns'

export default function TaxPayerInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, control, errors } = useForm<PrimaryPerson>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const [isForeignCountry, updateForeignCountry] = useState<boolean>(
    taxPayer?.primaryPerson?.address.foreignCountry !== undefined
  )

  const onSubmit = (primaryPerson: PrimaryPerson): void => {
    console.log('formData: ', primaryPerson)
    dispatch(saveTaxpayerInfo({ primaryPerson }))
    onAdvance()
  }

  let csz
  if (!isForeignCountry) {
    csz = (
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
          patternConfig={Patterns.zip}
          required={!isForeignCountry}
          defaultValue={taxPayer?.primaryPerson?.address.zip}
        />
      </div>
    )
  } else {
    csz = (
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
      </div>
    )
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Taxpayer Information</h2>
        </Box>

        <h4>Primary Taxpayer Information</h4>
        <PersonFields
          register={register}
          errors={errors}
          defaults={taxPayer?.primaryPerson}
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
          required={true}
          error={errors.address?.aptNo}
          defaultValue={taxPayer?.primaryPerson?.address.aptNo}
        />
        <LabeledInput
          label="City"
          register={register}
          name="address.city"
          patternConfig={Patterns.name}
          required={true}
          error={errors.address?.city}
          defaultValue={taxPayer?.primaryPerson?.address.city}
        />
        <LabeledCheckBox
          label="Do you have a foreign address?"
          control={control}
          value={isForeignCountry}
          setValue={updateForeignCountry}
          name="isForeignCountry"
        />
        {csz}

        {navButtons}
      </form>
    </Box>
  )
}
