import React, { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput, LabeledRadio } from './input'
import Patterns from './Patterns'
import { saveRefundInfo } from '../redux/actions'

import { AccountType, Refund, TaxesState } from '../redux/data'
import { PagerContext } from './pager'
import { DevTool } from '@hookform/devtools'

interface UserRefundForm {
  routingNumber: string
  accountNumber: string
  accountType: AccountType
}

const toRefund = (formData: UserRefundForm): Refund => formData

export default function RefundBankAccount (): ReactElement {
  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors
    }
  } = useForm<UserRefundForm>()
  const patterns = new Patterns(control)
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  // component functions
  const onSubmit = (onAdvance: () => void) => (formData: UserRefundForm): void => {
    dispatch(saveRefundInfo(toRefund(formData)))
    onAdvance()
  }

  return (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <div>
            <h2>Refund Information</h2>

            <LabeledInput
              label="Bank Routing number"
              register={register}
              required={true}
              patternConfig={patterns.bankRouting}
              name="routingNumber"
              defaultValue={prevFormData?.routingNumber}
              error={errors.routingNumber}
            />

            <LabeledInput
              label="Bank Account number"
              register={register}
              required={true}
              patternConfig={patterns.bankAccount}
              name="accountNumber"
              defaultValue={prevFormData?.accountNumber}
              error={errors.accountNumber}
            />
            <LabeledRadio
              label="Account Type"
              control={control}
              name="accountType"
              defaultValue={prevFormData?.accountType as string}
              values={[['Checking', 'checking'], ['Savings', 'savings']]}
            />
            {navButtons}
          </div>
          <DevTool control={control} placement="top-right"/>
        </form>
      }
    </PagerContext.Consumer>
  )
}
