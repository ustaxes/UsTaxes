import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { FormProvider, useForm } from 'react-hook-form'
import { Grid } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { TaxYears } from 'ustaxes/core/data'
import type {
  AdjustmentsToIncome as AdjustmentsToIncomeData,
  AdjustmentsToIncomeDateString
} from 'ustaxes/core/data'
import { usePager } from 'ustaxes/components/pager'
import { LabeledInput, DatePicker } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { saveAdjustments } from 'ustaxes/redux/actions'
import { FormContainerProvider } from 'ustaxes/components/FormContainer/Context'
import { getSource } from 'ustaxes/core/data/sources'
import { YearsTaxesState } from 'ustaxes/redux'
import { useSelector as useReduxSelector } from 'react-redux'
import { intentionallyFloat } from 'ustaxes/core/util'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import Urls from 'ustaxes/data/urls'

interface AdjustmentsForm {
  educatorExpenses: string | number
  alimonyPaid: string | number
  alimonyRecipientSsn: string
  alimonyDivorceDate: Date | null
  selfEmployedHealthInsuranceDeduction: string | number
}

const blankForm: AdjustmentsForm = {
  educatorExpenses: '',
  alimonyPaid: '',
  alimonyRecipientSsn: '',
  alimonyDivorceDate: null,
  selfEmployedHealthInsuranceDeduction: ''
}

const toFormValues = (
  adjustments?: AdjustmentsToIncomeData
): AdjustmentsForm => ({
  ...blankForm,
  educatorExpenses: adjustments?.educatorExpenses ?? '',
  alimonyPaid: adjustments?.alimonyPaid ?? '',
  alimonyRecipientSsn: adjustments?.alimonyRecipientSsn ?? '',
  alimonyDivorceDate: adjustments?.alimonyDivorceDate ?? null,
  selfEmployedHealthInsuranceDeduction:
    adjustments?.selfEmployedHealthInsuranceDeduction ?? ''
})

const toAdjustments = (
  formData: AdjustmentsForm
): AdjustmentsToIncomeDateString => ({
  educatorExpenses:
    formData.educatorExpenses === ''
      ? undefined
      : Number(formData.educatorExpenses),
  alimonyPaid:
    formData.alimonyPaid === '' ? undefined : Number(formData.alimonyPaid),
  alimonyRecipientSsn:
    formData.alimonyRecipientSsn.trim() === ''
      ? undefined
      : formData.alimonyRecipientSsn.trim(),
  alimonyDivorceDate:
    formData.alimonyDivorceDate instanceof Date
      ? formData.alimonyDivorceDate.toISOString().split('T')[0]
      : undefined,
  selfEmployedHealthInsuranceDeduction:
    formData.selfEmployedHealthInsuranceDeduction === ''
      ? undefined
      : Number(formData.selfEmployedHealthInsuranceDeduction)
})

export default function AdjustmentsToIncome(): ReactElement {
  const adjustments = useSelector(
    (state: TaxesState) => state.information.adjustments
  )
  const sources = useSelector((state: TaxesState) => state.information.sources)
  const activeYear = useReduxSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const methods = useForm<AdjustmentsForm>({
    defaultValues: toFormValues(adjustments)
  })
  const {
    handleSubmit,
    reset,
    formState: { isDirty }
  } = methods
  const { navButtons, onAdvance } = usePager()
  const dispatch = useDispatch()

  const onSubmit = (formData: AdjustmentsForm): void => {
    dispatch(
      saveAdjustments({
        ...toAdjustments(formData),
        selfEmployedHealthInsuranceWorksheet:
          adjustments?.selfEmployedHealthInsuranceWorksheet
      })
    )
    onAdvance()
  }

  useEffect(() => {
    const nextValues = toFormValues(adjustments)
    if (!isDirty && !_.isEqual(methods.getValues(), nextValues)) {
      reset(nextValues)
    }
  }, [adjustments, isDirty, reset, methods])

  const sourceLookup = (fieldName: string) =>
    getSource(sources, ['adjustments', fieldName])

  const page = (
    <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
      <Helmet>
        <title>Adjustments to Income | Deductions | UsTaxes.org</title>
      </Helmet>
      <h2>Adjustments to Income</h2>
      <p>Enter alimony details for Schedule 1, line 19.</p>
      <Grid container spacing={2}>
        <LabeledInput
          label="Educator expenses (line 11)"
          name="educatorExpenses"
          patternConfig={Patterns.currency}
        />
        <LabeledInput
          label="Alimony paid (line 19a)"
          name="alimonyPaid"
          patternConfig={Patterns.currency}
        />
        <LabeledInput
          label="Recipient SSN (line 19b)"
          name="alimonyRecipientSsn"
          patternConfig={Patterns.ssn}
        />
        <DatePicker
          label="Date of original divorce or separation agreement (line 19c)"
          name="alimonyDivorceDate"
          minDate={new Date(1900, 0, 1)}
          maxDate={new Date(TaxYears[activeYear], 11, 31)}
        />
        <LabeledInput
          label="Self-employed health insurance deduction (line 17)"
          name="selfEmployedHealthInsuranceDeduction"
          patternConfig={Patterns.currency}
        />
      </Grid>
      <p>
        For tax years 2023 through 2025, line 17 is derived from Form 7206. You
        can enter the worksheet directly on the{' '}
        <Link to={Urls.deductions.selfEmployedHealthInsuranceWorksheet}>
          Form 7206 worksheet page
        </Link>
        . If you are looking for Schedule SE, visit the{' '}
        <Link to={Urls.income.scheduleSE}>Schedule SE page</Link> to see which
        inputs feed it.
      </p>
      {navButtons}
    </form>
  )

  return (
    <FormProvider {...methods}>
      <FormContainerProvider getSource={sourceLookup}>
        {page}
      </FormContainerProvider>
    </FormProvider>
  )
}
