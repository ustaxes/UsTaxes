import { ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import { EstimatedTaxPayments } from 'ustaxes/redux/data'
import { CURRENT_YEAR } from 'ustaxes/data/federal'
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
import { TaxesState } from 'ustaxes/redux'

interface EstimatedTaxesUserInput {
  label: string
  payment: string
}

const blankUserInput: EstimatedTaxesUserInput = {
  label: '',
  payment: ''
}

const toPayments = (
  formData: EstimatedTaxesUserInput
): EstimatedTaxPayments => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  label: formData.label,
  payment: parseInt(formData.payment)
})

const toEstimatedTaxesUserInput = (
  data: EstimatedTaxPayments
): EstimatedTaxesUserInput => ({
  ...blankUserInput,
  ...data,
  label: data.label,
  payment: data.payment.toString()
})

export default function EstimatedTaxes(): ReactElement {
  const estimatedTaxes = useSelector(
    (state: TaxesState) => state.information.estimatedTaxes
  )

  const dispatch = useDispatch()

  const methods = useForm<EstimatedTaxesUserInput>()

  const { navButtons, onAdvance } = usePager()

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
      primary={(estimatedTaxes: EstimatedTaxesUserInput) =>
        estimatedTaxes.label
      }
      secondary={(estimatedTaxes: EstimatedTaxesUserInput) => (
        <span>
          Payment: <Currency value={toPayments(estimatedTaxes).payment} />
        </span>
      )}
    >
      <Grid container spacing={2}>
        <LabeledInput
          name="label"
          label="label or date of this payment"
          patternConfig={Patterns.plain}
          sizes={{ xs: 12, lg: 6 }}
        />
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
      <p>
        did you already make payments towards your {CURRENT_YEAR} taxes this
        year or last year?
      </p>
      <FormProvider {...methods}>{form}</FormProvider>
      {navButtons}
    </form>
  )
}
