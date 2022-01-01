import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import SchoolIcon from '@material-ui/icons/School'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { add1098e, edit1098e, remove1098e } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { Currency, LabeledInput } from 'ustaxes/components/input'
import { F1098e } from 'ustaxes/core/data'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'

const showInterest = (a: F1098e): ReactElement => {
  return <Currency value={a.interest} />
}

interface F1098EUserInput {
  lender: string
  interest: string | number
}

const blankUserInput: F1098EUserInput = {
  lender: '',
  interest: ''
}

const toUserInput = (f: F1098e): F1098EUserInput => ({
  ...blankUserInput,
  lender: f.lender,
  interest: f.interest
})

const toF1098e = (f: F1098EUserInput): F1098e => {
  return {
    lender: f.lender,
    interest: Number(f.interest)
  }
}

export default function F1098eInfo(): ReactElement {
  const f1098es = useSelector((state: TaxesState) => state.information.f1098es)

  const defaultValues: F1098EUserInput = blankUserInput

  const { onAdvance, navButtons } = usePager()

  const methods = useForm<F1098EUserInput>({ defaultValues })
  const { handleSubmit } = methods

  const dispatch = useDispatch()

  const onAdd1098e = (formData: F1098EUserInput): void => {
    dispatch(add1098e(toF1098e(formData)))
  }

  const onEdit1098e =
    (index: number) =>
    (formData: F1098EUserInput): void => {
      dispatch(edit1098e({ value: toF1098e(formData), index }))
    }

  const form: ReactElement | undefined = (
    <FormListContainer
      onSubmitAdd={onAdd1098e}
      onSubmitEdit={onEdit1098e}
      items={f1098es.map((a) => toUserInput(a))}
      removeItem={(i) => dispatch(remove1098e(i))}
      primary={(f) => f.lender}
      secondary={(f) => showInterest(toF1098e(f))}
      icon={() => <SchoolIcon />}
    >
      <p>Input data from 1098-E</p>
      <Grid container spacing={2}>
        <LabeledInput
          autofocus={true}
          label="Enter name of Lender"
          patternConfig={Patterns.name}
          name="lender"
        />
        <LabeledInput
          label="Student Interest Paid"
          patternConfig={Patterns.currency}
          name="interest"
        />
      </Grid>
    </FormListContainer>
  )

  return (
    <FormProvider {...methods}>
      <form tabIndex={-1} onSubmit={handleSubmit(onAdvance)}>
        <Helmet>
          <title>1098-E Information | Deductions | UsTaxes.org</title>
        </Helmet>
        <h2>1098-E Information</h2>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
