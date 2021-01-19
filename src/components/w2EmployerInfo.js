import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Grow } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import countries from '../data/countries'

import { LabeledInput, LabeledDropdown, LabeledCheckBox, USStateDropDown } from './labeledInput'
import { saveEmployerData } from '../redux/actions'

export default function W2EmployerInfo ({ navButtons, onAdvance }) {
  const { register, handleSubmit, errors, control } = useForm()
  const dispatch = useDispatch()

  const prevFormData = useSelector(state => state.information.w2EmployerInfo ?? {})
  const [foreignAddress, setforeignAddress] = useState(prevFormData.foreignAddress === 'true')

  // component functions
  const onSubmit = formData => {
    console.log('formData: ', formData)
    dispatch(saveEmployerData(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Employer Information</h2>
        </Box>

        <LabeledInput
          strongLabel="Box B - "
          label="Employer Identification Number"
          register={register}
          required={true}
          mask="99-9999999"
          pattern={/[0-9]{2}-[0-9]{7}/}
          patternDescription="Input should be filled with 9 numbers"
          name="EIN"
          defaultValue={prevFormData.EIN}
          errors={errors}
        />

        <Box display="flex" justifyContent="flex-start">
          <p><strong>Box C - </strong>Employer&apos;s Name, Address, and Zip Code</p>
        </Box>

        <LabeledInput
          label="Employer's Name"
          register={register}
          required={true}
          name="employerName"
          defaultValue={prevFormData.employerName}
          errors={errors}
        />

        <LabeledCheckBox
          foreignAddress={foreignAddress}
          setforeignAddress={setforeignAddress}
          control={control}
          description="Does your employer have a foreign address?"
        />

        <LabeledInput
          label="Employer's Address" register={register}
          required={true}
          patternDescription="Input should only include letters and numbers"
          name="employerAddress"
          defaultValue={prevFormData.employerAddress}
          errors={errors}
        />

        <LabeledInput
          label="Employer's City"
          register={register}
          required={true}
          name="employerCity"
          defaultValue={prevFormData.employerCity}
          errors={errors}
        />
        <Grow in={!foreignAddress} style={{ display: !foreignAddress ? 'block' : 'none' }}>
          <div>
            <USStateDropDown
              label="Employer's State"
              control={control}
              required={!foreignAddress}
              name="employerState"
              defaultValue={prevFormData.employerState}
              errors={errors}
            />

            <LabeledInput
              label="Employer's Zip Code"
              register={register}
              required={!foreignAddress}
              mask="99999-9999"
              pattern={/[0-9]{5}-[0-9]{4}/}
              patternDescription="Input should be filled with 9 numbers"
              name="employerZip"
              defaultValue={prevFormData.employerZip}
              errors={errors}
            />
          </div>
        </Grow>

        <Grow in={foreignAddress} style={{ display: foreignAddress ? 'block' : 'none' }}>
          <div>
            <LabeledInput
              label="Employer's Province or State"
              register={register}
              required={foreignAddress}
              pattern={/^[A-Za-z]+$/i}
              patternDescription="Input should only include letters"
              name="employerProvince"
              defaultValue={prevFormData.employerProvince}
              errors={errors}
            />
            <LabeledDropdown
              label="Employer's Country"
              dropDownData={countries}
              control={control}
              required={foreignAddress}
              name="employerCountry"
              defaultValue={prevFormData.employerCountry}
              errors={errors}
            />
            <LabeledInput
              label="Employer's Postal Code"
              register={register}
              required={foreignAddress}
              name="employerPostalCode"
              defaultValue={prevFormData.employerPostalCode}
              errors={errors}
            />
          </div>
        </Grow>

        {navButtons}
      </form >
    </Box>
  )
}
