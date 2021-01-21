import React, { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from './labeledInput'
import { Patterns } from './Patterns'
import { saveRefundInfo } from '../redux/actions'

import { Refund, TaxesState } from '../redux/data'
import { PagedFormProps } from './pager'

export default function RefundBankAccount ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  // component functions
  const onSubmit = (formData: Refund): void => {
    console.log('formData: ', formData)
    dispatch(saveRefundInfo(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Refund Information</h2>
        </Box>

        <LabeledInput
          label="Bank Routing number"
          register={register}
          required={true}
          patternConfig={Patterns.bankRouting}
          name="routingNumber"
          defaultValue={prevFormData?.routingNumber}
          errors={errors}
        />

        <LabeledInput
          label="Bank Account number"
          register={register}
          required={true}
          patternConfig={Patterns.bankAccount}
          name="accountNumber"
          defaultValue={prevFormData?.accountNumber}
          errors={errors}
        />
        {navButtons}
      </form>
    </Box>
  )
}
