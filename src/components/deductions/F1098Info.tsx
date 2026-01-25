import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import HomeIcon from '@material-ui/icons/Home'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { add1098, edit1098, remove1098 } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { Currency, LabeledInput } from 'ustaxes/components/input'
import { F1098 } from 'ustaxes/core/data'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { intentionallyFloat } from 'ustaxes/core/util'

const showInterest = (a: F1098): ReactElement => {
  const total = a.interest + (a.points ?? 0)
  return <Currency value={total} />
}

interface F1098UserInput {
  lender: string
  interest: string | number
  points: string | number
  mortgageInsurancePremiums: string | number
}

const blankUserInput: F1098UserInput = {
  lender: '',
  interest: '',
  points: '',
  mortgageInsurancePremiums: ''
}

const toUserInput = (f: F1098): F1098UserInput => ({
  ...blankUserInput,
  lender: f.lender,
  interest: f.interest,
  points: f.points ?? '',
  mortgageInsurancePremiums: f.mortgageInsurancePremiums ?? ''
})

const toF1098 = (f: F1098UserInput): F1098 => ({
  lender: f.lender,
  interest: Number(f.interest),
  points: f.points === '' ? undefined : Number(f.points),
  mortgageInsurancePremiums:
    f.mortgageInsurancePremiums === ''
      ? undefined
      : Number(f.mortgageInsurancePremiums)
})

export default function F1098Info(): ReactElement {
  const f1098s = useSelector((state: TaxesState) => state.information.f1098s)

  const defaultValues: F1098UserInput = blankUserInput

  const { onAdvance, navButtons } = usePager()

  const methods = useForm<F1098UserInput>({ defaultValues })
  const { handleSubmit } = methods

  const dispatch = useDispatch()

  const onAdd1098 = (formData: F1098UserInput): void => {
    dispatch(add1098(toF1098(formData)))
  }

  const onEdit1098 =
    (index: number) =>
    (formData: F1098UserInput): void => {
      dispatch(edit1098({ value: toF1098(formData), index }))
    }

  const form: ReactElement | undefined = (
    <FormListContainer
      defaultValues={defaultValues}
      onSubmitAdd={onAdd1098}
      onSubmitEdit={onEdit1098}
      items={f1098s.map((a) => toUserInput(a))}
      removeItem={(i) => dispatch(remove1098(i))}
      primary={(f) => f.lender}
      secondary={(f) => showInterest(toF1098(f))}
      icon={() => <HomeIcon />}
    >
      <p>Input data from Form 1098</p>
      <Grid container spacing={2}>
        <LabeledInput
          autofocus={true}
          label="Enter name of Lender"
          required={true}
          name="lender"
        />
        <LabeledInput
          label="Mortgage interest"
          patternConfig={Patterns.currency}
          name="interest"
        />
        <LabeledInput
          label="Points reported on Form 1098"
          patternConfig={Patterns.currency}
          name="points"
          required={false}
        />
        <LabeledInput
          label="Mortgage insurance premiums"
          patternConfig={Patterns.currency}
          name="mortgageInsurancePremiums"
          required={false}
        />
      </Grid>
    </FormListContainer>
  )

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>Form 1098 Information | Deductions | UsTaxes.org</title>
        </Helmet>
        <h2>Form 1098 Information</h2>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
