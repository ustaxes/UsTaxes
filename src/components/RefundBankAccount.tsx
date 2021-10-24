import { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput, LabeledRadio } from './input'
import { Patterns } from './Patterns'
import { saveRefundInfo } from 'ustaxes/redux/actions'

import { AccountType, Refund, TaxesState } from 'ustaxes/redux/data'
import { usePager } from './pager'
import { Grid } from '@material-ui/core'

interface UserRefundForm {
  routingNumber: string
  accountNumber: string
  accountType: AccountType
}

const toRefund = (formData: UserRefundForm): Refund => formData

export default function RefundBankAccount(): ReactElement {
  const defaultValues: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  const { navButtons, onAdvance } = usePager()

  const methods = useForm<UserRefundForm>({ defaultValues })
  const { handleSubmit } = methods
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  // component functions
  const onSubmit = (formData: UserRefundForm): void => {
    dispatch(saveRefundInfo(toRefund(formData)))
    onAdvance()
  }

  return (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <h2>Refund Information</h2>
        <Grid container spacing={2}>
          <LabeledInput
            label="Bank Routing number"
            patternConfig={Patterns.bankRouting}
            name="routingNumber"
          />

          <LabeledInput
            label="Bank Account number"
            patternConfig={Patterns.bankAccount}
            name="accountNumber"
          />
          <LabeledRadio
            label="Account Type"
            name="accountType"
            values={[
              ['Checking', 'checking'],
              ['Savings', 'savings']
            ]}
          />
        </Grid>
        {navButtons}
      </FormProvider>
    </form>
  )
}
