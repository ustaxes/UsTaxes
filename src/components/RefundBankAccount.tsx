import { ReactElement, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { LabeledInput, LabeledRadio } from './input'
import { Patterns } from './Patterns'
import { saveRefundInfo } from 'ustaxes/redux/actions'
import _ from 'lodash'

import { Refund } from 'ustaxes/redux/data'
import { usePager } from './pager'
import { Grid } from '@material-ui/core'

export default function RefundBankAccount(): ReactElement {
  const defaultValues: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  const { navButtons, onAdvance } = usePager()

  const methods = useForm<Refund>({ defaultValues })
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
    getValues
  } = methods
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  // Form rerenders happen either because the user is editing the form
  // or because the global state has been updated by another control.
  // We have to reset the form only in the second case here:
  useEffect(() => {
    if (!isDirty && !_.isEqual(getValues(), defaultValues)) {
      return reset(defaultValues)
    }
  })

  // component functions
  const onSubmit = (formData: Refund): void => {
    dispatch(saveRefundInfo(formData))
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
