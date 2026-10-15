import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Grid } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import { LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { intentionallyFloat, toFiniteNumber } from 'ustaxes/core/util'
import { saveOtherIncome } from 'ustaxes/redux/actions'
import _ from 'lodash'

interface Form2555Form {
  foreignEarnedIncomeExclusion: string | number
}

const toFormValues = (value: number | undefined): Form2555Form => ({
  foreignEarnedIncomeExclusion: toFiniteNumber(value) ?? ''
})

export default function F2555Info(): ReactElement {
  const information = useSelector((state: TaxesState) => state.information)
  const methods = useForm<Form2555Form>({
    defaultValues: toFormValues(
      information.otherIncome?.foreignEarnedIncomeExclusion
    )
  })
  const {
    handleSubmit,
    reset,
    formState: { isDirty }
  } = methods
  const { navButtons, onAdvance } = usePager()
  const dispatch = useDispatch()

  useEffect(() => {
    const nextValues = toFormValues(
      information.otherIncome?.foreignEarnedIncomeExclusion
    )
    if (!isDirty && !_.isEqual(methods.getValues(), nextValues)) {
      reset(nextValues)
    }
  }, [
    information.otherIncome?.foreignEarnedIncomeExclusion,
    isDirty,
    methods,
    reset
  ])

  const onSubmit = (formData: Form2555Form): void => {
    const foreignEarnedIncomeExclusion = toFiniteNumber(
      formData.foreignEarnedIncomeExclusion
    )

    dispatch(
      saveOtherIncome(
        foreignEarnedIncomeExclusion === undefined
          ? {}
          : {
              ...information.otherIncome,
              foreignEarnedIncomeExclusion
            }
      )
    )
    onAdvance()
  }

  return (
    <FormProvider {...methods}>
      <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
        <Helmet>
          <title>
            Form 2555 / Foreign Earned Income Exclusion | Deductions |
            UsTaxes.org
          </title>
        </Helmet>
        <h2>Form 2555 / Foreign Earned Income Exclusion</h2>
        <p>
          Enter the amount from Form 2555, line 45. UsTaxes uses this to fill
          Form 2555 and to calculate connected lines such as Form 7206 line 12
          and Schedule 1A line 2b.
        </p>
        <Grid container spacing={2}>
          <LabeledInput
            label="Foreign earned income exclusion (Form 2555, line 45)"
            name="foreignEarnedIncomeExclusion"
            patternConfig={Patterns.currency}
            required={false}
            tooltip="Enter your Form 2555 line 45 amount. Leave blank if you are not filing Form 2555."
          />
        </Grid>
        <p>
          This page currently captures the Form 2555 amount needed elsewhere on
          your return. Additional Form 2555 lines can be added later as more of
          the form is implemented.
        </p>
        {navButtons}
      </form>
    </FormProvider>
  )
}
