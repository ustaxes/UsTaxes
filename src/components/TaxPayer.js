import React from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FinishPage } from './paging'
import { LabeledInput } from './labeledInput'
import { saveTaxpayerInfo } from '../redux/actions'

export default function TaxPayerInfo ({ nextUrl }) {
  const { register, handleSubmit, errors } = useForm()
  const history = useHistory()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData = useSelector(state => {
    return state.information.taxpayer ?? {}
  })

  // component functions
  const onSubmit = formData => {
    console.log('formData: ', formData)
    dispatch(saveTaxpayerInfo(formData))
    history.push('/w2employerinfo')
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Family Information</h2>
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

        <FinishPage />
      </form>
    </Box>
  )
}
