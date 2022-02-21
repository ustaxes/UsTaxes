import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { TaxesState, useSelector, useDispatch } from 'ustaxes/redux'
import { addF3921, editF3921, removeF3921 } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Currency } from 'ustaxes/components/input'
import { Grid } from '@material-ui/core'
import { ShowChartOutlined as StockIcon } from '@material-ui/icons'
import { F3921 } from 'ustaxes/core/data'

interface F3921UserInput {
  name: string
  exercisePricePerShare?: string
  fmv?: string
  numShares?: string
}

const blankUserInput: F3921UserInput = {
  name: '',
  exercisePricePerShare: '',
  fmv: '',
  numShares: ''
}

const toUserInput = (f: F3921): F3921UserInput => ({
  ...blankUserInput,
  name: f.name,
  exercisePricePerShare: f.exercisePricePerShare.toString(),
  fmv: f.fmv.toString(),
  numShares: f.numShares.toString()
})

const toF3921 = (input: F3921UserInput): F3921 | undefined => {
  const { name, exercisePricePerShare, fmv, numShares } = input
  if (name === '') {
    return undefined
  }
  return {
    name,
    exercisePricePerShare: Number(exercisePricePerShare),
    fmv: Number(fmv),
    numShares: Number(numShares)
  }
}

export const StockOptions = (): ReactElement => {
  const f3921s = useSelector((state: TaxesState) => state.information.f3921s)

  const methods = useForm<F3921UserInput>()
  const { handleSubmit } = methods
  const dispatch = useDispatch()

  const { onAdvance, navButtons } = usePager()

  const onSubmitAdd = (formData: F3921UserInput): void => {
    const payload = toF3921(formData)
    if (payload !== undefined) {
      dispatch(addF3921(payload))
    }
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: F3921UserInput): void => {
      const payload = toF3921(formData)
      if (payload !== undefined) {
        dispatch(editF3921({ value: payload, index }))
      }
    }

  const form: ReactElement | undefined = (
    <FormListContainer<F3921UserInput>
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      items={f3921s.map((a) => toUserInput(a))}
      removeItem={(i) => dispatch(removeF3921(i))}
      icon={() => <StockIcon />}
      primary={(f) => f.name}
      secondary={(f) => {
        const f3921 = toF3921(f)
        if (f3921 === undefined) return ''
        return (
          <span>
            {f3921.numShares} shares @{' '}
            <Currency plain={true} value={f3921.exercisePricePerShare} />;{' '}
            <Currency plain={true} value={f3921.fmv} /> FMV
          </span>
        )
      }}
    >
      {' '}
      <Grid container spacing={2}>
        <h3>Manage Stock Options</h3>
        <LabeledInput label="Company name" name="name" />
        <LabeledInput
          label="Exercise price per share"
          patternConfig={Patterns.currency}
          name="exercisePricePerShare"
        />
        <LabeledInput
          label="Fair Market Value (FMV)"
          patternConfig={Patterns.currency}
          name="fmv"
        />
        <LabeledInput
          label="Number of shares transferred"
          patternConfig={Patterns.number}
          name="numShares"
        />
      </Grid>
    </FormListContainer>
  )

  return (
    <FormProvider {...methods}>
      <form tabIndex={-1} onSubmit={handleSubmit(onAdvance)}>
        <Helmet>
          <title>Stock Options | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Stock Options</h2>
        <p>If you received Form 3921, enter the information here.</p>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}

export default StockOptions
