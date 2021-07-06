import React, { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput, LabeledRadio } from './input'
import { Patterns } from './Patterns'
import { saveRefundInfo } from '../redux/actions'

import { AccountType, Refund, TaxesState } from '../redux/data'
import { PagerContext } from './pager'

interface UserRefundForm {
  routingNumber: string
  accountNumber: string
  accountType: AccountType
}

const toRefund = (formData: UserRefundForm): Refund => formData

export default function RefundBankAccount (): ReactElement {
  const defaultValues: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  const methods = useForm<UserRefundForm>({ defaultValues })
  const { handleSubmit, formState: { errors } } = methods
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  // component functions
  const onSubmit = (onAdvance: () => void) => (formData: UserRefundForm): void => {
    dispatch(saveRefundInfo(toRefund(formData)))
    onAdvance()
  }

  return (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <FormProvider {...methods}>
            <h2>Refund Information</h2>

            <LabeledInput
              label="Bank Routing number"
              required={true}
              patternConfig={Patterns.bankRouting}
              name="routingNumber"
              error={errors.routingNumber}
            />

            <LabeledInput
              label="Bank Account number"
              required={true}
              patternConfig={Patterns.bankAccount}
              name="accountNumber"
              error={errors.accountNumber}
            />
            <LabeledRadio
              label="Account Type"
              name="accountType"
              values={[['Checking', 'checking'], ['Savings', 'savings']]}
            />
            {navButtons}
          </FormProvider>
        </form>
      }
    </PagerContext.Consumer>
  )
}
