import { ReactElement, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { LabeledInput, LabeledRadio } from './input'
import { Patterns } from './Patterns'
import { saveRefundInfo } from 'ustaxes/redux/actions'
import _ from 'lodash'

import { Refund } from 'ustaxes-core/data'
import { usePager } from './pager'
import { Grid } from '@material-ui/core'

const blankFormData: Partial<Refund> = {
  routingNumber: '',
  accountNumber: '',
  accountType: undefined
}

export default function RefundBankAccount(): ReactElement {
  const refund: Partial<Refund> =
    useSelector((state: TaxesState) => {
      return state.information.refund
    }) ?? {}

  const defaultValues: Partial<Refund> = {
    ...blankFormData,
    ...refund
  }

  const { navButtons, onAdvance } = usePager()

  const methods = useForm<Refund>({ defaultValues })
  const {
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty }
  } = methods
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const currentValues = {
    ...blankFormData,
    ...getValues()
  }

  // This form can be rerendered because the global state was modified by
  // another control.
  useEffect(() => {
    if (!isDirty && !_.isEqual(currentValues, defaultValues)) {
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
