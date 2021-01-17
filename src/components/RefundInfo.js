import React from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FinishPage } from './paging'
import { LabeledInput } from './labeledInput'
import { saveRefundInfo } from '../redux/actions'

export default function RefundInfo ({ nextUrl }) {
  const { register, handleSubmit, errors } = useForm()
  const history = useHistory()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData = useSelector(state => {
    return state.information.refund ?? {}
  })

  // component functions
  const onSubmit = formData => {
    console.log('formData: ', formData)
    dispatch(saveRefundInfo(formData))
    history.push(nextUrl)
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Refund Instructions</h2>
        </Box>

        <LabeledInput
          label="Bank Routing number"
          register={register}
          required={true}
          mask="999999999"
          pattern={/[0-9]{9}/}
          patternDescription="Input should be filled with 10 numbers"
          name="routingNumber"
          defaultValue={prevFormData.routingNumber}
          errors={errors}
        />

        <LabeledInput
          label="Bank Account number"
          register={register}
          required={true}
          mask="999999999999"
          pattern={/[0-9]{10}|[0-9]{11}|[0-9]{12}/}
          patternDescription="Input should be filled with 10-12 numbers"
          name="accountNumber"
          defaultValue={prevFormData.accountNumber}
          errors={errors}
        />

        <FinishPage />
      </form>
    </Box>
  )
}
