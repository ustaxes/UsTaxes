import { ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import {
  TaxesState,
  EstimatedTaxPayments,
  Information
} from 'ustaxes/redux/data'
import { Currency, LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { Work } from '@material-ui/icons'
import {
  addEstimatedPayment,
  editEstimatedPayment,
  removeEstimatedPayment
} from 'ustaxes/redux/actions'

interface EstimatedTaxesUserInput {
  payment: string
}

const blankUserInput: EstimatedTaxesUserInput = {
  payment: ''
}

const toPayments = (
  formData: EstimatedTaxesUserInput
): EstimatedTaxPayments => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  payment: parseInt(formData.payment)
})

const toEstimatedTaxesUserInput = (
  data: EstimatedTaxPayments
): EstimatedTaxesUserInput => ({
  ...blankUserInput,
  ...data,
  payment: data.payment.toString()
})

export default function EstimatedTaxes(): ReactElement {
  const estimatedTaxes = useSelector(
    (state: TaxesState) => state.information.estimatedTaxes
  )

  const dispatch = useDispatch()

  const methods = useForm<EstimatedTaxesUserInput>()

  const { navButtons, onAdvance } = usePager()

  const information: Information = useSelector(
    (state: TaxesState) => state.information
  )

  const onSubmitAdd = (formData: EstimatedTaxesUserInput): void => {
    dispatch(addEstimatedPayment(toPayments(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: EstimatedTaxesUserInput): void => {
      dispatch(editEstimatedPayment({ index, value: toPayments(formData) }))
    }

  const w2sBlock = (
    <FormListContainer<EstimatedTaxesUserInput>
      items={estimatedTaxes.map((a) => toEstimatedTaxesUserInput(a))}
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      removeItem={(i) => dispatch(removeEstimatedPayment(i))}
      icon={() => <Work />}
      primary={(f) => 'Estimated Taxes'}
      secondary={(estimatedTaxes: EstimatedTaxesUserInput) => (
        <span>
          Payment: <Currency value={toPayments(estimatedTaxes).payment} />
        </span>
      )}
    >
      <Grid container spacing={2}>
        <LabeledInput
          name="payment"
          label="Estimated tax payment"
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
      </Grid>
    </FormListContainer>
  )

  const form: ReactElement = <>{w2sBlock}</>

  return (
    <form tabIndex={-1} onSubmit={onAdvance}>
      <h2>Estimated Taxes</h2>
      <FormProvider {...methods}>{form}</FormProvider>
      {navButtons}
    </form>
  )
}
