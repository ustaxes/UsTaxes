import React, { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledRadio } from './input'
import { Patterns } from './Patterns'
import { saveRefundInfo } from '../redux/actions'

import { AccountType, Refund, TaxesState } from '../redux/data'
import { PagerContext } from './pager'
import { field, FieldDef, Fields } from './Fields'

interface UserRefundForm {
  routingNumber: string
  accountNumber: string
  accountType: AccountType
}

const toRefund = (formData: UserRefundForm): Refund => formData

const fields: FieldDef[] = [
  field('Bank Routing number', 'routingNumber', Patterns.bankRouting),
  field('Bank Account number', 'accountNumber', Patterns.bankAccount)
]

export default function RefundBankAccount (): ReactElement {
  const defaultValues: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  const methods = useForm<UserRefundForm>({ defaultValues })
  const { handleSubmit } = methods
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

            <Fields fields={fields}>
              <LabeledRadio
                label="Account Type"
                name="accountType"
                values={[['Checking', 'checking'], ['Savings', 'savings']]}
              />
            </Fields>
            {navButtons}
          </FormProvider>
        </form>
      }
    </PagerContext.Consumer>
  )
}
