import React from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from './labeledInput'
import { saveTaxpayerInfo } from '../redux/actions'

export default function TaxPayerInfo ({ navButtons, onAdvance }) {
  const { register, handleSubmit, errors } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData = useSelector(state => {
    return state.information.taxpayer ?? {}
  })

  // component functions
  const onSubmit = formData => {
    console.log('formData: ', formData)
    dispatch(saveTaxpayerInfo(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Taxpayer Information</h2>
        </Box>

        <LabeledInput
          label="Contact phone number"
          register={register}
          required={true}
          mask="999-999-9999"
          pattern={/[0-9]{3}-[0-9]{3}-[0-9]{4}/}
          patternDescription="Input should be filled with 10 numbers"
          name="contactPhoneNumber"
          defaultValue={prevFormData.contactPhoneNumber}
          errors={errors}
        />

        <LabeledInput
          label="Contact email address"
          register={register}
          required={true}
          name="contactEmail"
          defaultValue={prevFormData.contactEmail}
          errors={errors}
        />

        {navButtons}
      </form>
    </Box>
  )
}
