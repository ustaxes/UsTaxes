import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Grow } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import countries from '../data/countries'

import { LabeledInput, LabeledDropdown, LabeledCheckBox, USStateDropDown } from './labeledInput'
import { Patterns } from './Patterns'
import { saveEmployeeData } from '../redux/actions'
import { PagedFormProps } from './pager'
import { TaxesState, W2EmployeeInfo as W2Employee } from '../redux/data'

export default function W2EmployeeInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors, control } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData: (W2Employee | undefined) = useSelector((state: TaxesState) =>
    state.information.w2EmployeeInfo
  )

  const [foreignAddress, setforeignAddress] = useState(prevFormData?.foreignAddress ?? false)

  // component functions
  const onSubmit = (formData: W2Employee): void => {
    console.log('formData: ', formData)
    dispatch(saveEmployeeData(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Employee Information</h2>
        </Box>
        <Box display="flex" justifyContent="flex-start">
          <strong>Input data from W-2</strong>
        </Box>
        <LabeledInput
          strongLabel="Box A - "
          label="Employee's Social Security Number"
          register={register}
          required={true}
          patternConfig={Patterns.ssn}
          name="SSID"
          defaultValue={prevFormData?.SSID}
          errors={errors}
        />

        <LabeledInput
          strongLabel="Box E - "
          label="Employee's First Name and Initial"
          register={register}
          required={true}
          patternConfig={Patterns.name}
          name="employeeFirstName"
          defaultValue={prevFormData?.employeeFirstName}
          errors={errors}
        />
        <LabeledInput
          label="Employee's Last Name and Suffix"
          register={register}
          required={true}
          patternConfig={Patterns.name}
          name="employeeLastName"
          defaultValue={prevFormData?.employeeLastName}
          errors={errors}
        />

        <Box display="flex" justifyContent="flex-start">
          <p><strong>Box F - </strong>Employee&apos;s Address and Zip Code</p>
        </Box>

        <LabeledCheckBox
          foreignAddress={foreignAddress}
          setforeignAddress={setforeignAddress}
          control={control}
          description="Do you have a foreign address?"
        />

        <LabeledInput
          label="Employee's Address" register={register}
          required={true}
          name="employeeAddress"
          defaultValue={prevFormData?.employeeAddress}
          errors={errors}
        />

        {/* <LabeledInput
                    label="Apt Number" register={register}
                    required={false}
                    name="employeeAptNumber"
                    defaultValue={prevFormData["employeeAptNumber"]}
                    errors={errors}
                /> */}

        <LabeledInput
          label="Employee's City"
          register={register}
          required={true}
          name="employeeCity"
          defaultValue={prevFormData?.employeeCity}
          errors={errors}
        />
        <Grow in={!foreignAddress} style={{ display: !foreignAddress ? 'block' : 'none' }}>
          <div>
            <USStateDropDown
              label="Employee's State"
              control={control}
              required={!foreignAddress}
              name="employeeState"
              defaultValue={prevFormData?.employeeState}
              errors={errors}
            />

            <LabeledInput
              label="Employee's Zip Code"
              register={register}
              required={!foreignAddress}
              patternConfig={Patterns.zip}
              name="employeeZip"
              defaultValue={prevFormData?.employeeZip}
              errors={errors}
            />
          </div>
        </Grow>

        <Grow in={foreignAddress} style={{ display: foreignAddress ? 'block' : 'none' }}>
          <div>
            <LabeledInput
              label="Employee's Province or State"
              register={register}
              required={foreignAddress}
              patternConfig={Patterns.name}
              name="employeeProvince"
              defaultValue={prevFormData?.employeeProvince}
              errors={errors}
            />
            <LabeledDropdown
              label="Employee&apos;s Country"
              dropDownData={countries}
              control={control}
              required={foreignAddress}
              name="employeeCountry"
              defaultValue={prevFormData?.employeeCountry}
              errors={errors}
            />
            <LabeledInput
              label="Employee's Postal Code"
              register={register}
              required={foreignAddress}
              name="employeePostalCode"
              defaultValue={prevFormData?.employeePostalCode}
              errors={errors}
            />
          </div>
        </Grow>
        {navButtons}
      </form>
    </Box>
  )
}
