import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import { Grid } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { usePager } from 'ustaxes/components/pager'
import { LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { saveAdjustments } from 'ustaxes/redux/actions'
import { FormContainerProvider } from 'ustaxes/components/FormContainer/Context'
import { getSource } from 'ustaxes/core/data/sources'
import type {
  AdjustmentsToIncome,
  AdjustmentsToIncomeDateString,
  SelfEmployedHealthInsuranceWorksheet
} from 'ustaxes/core/data'
import { intentionallyFloat } from 'ustaxes/core/util'
import { YearsTaxesState } from 'ustaxes/redux'
import { useSelector as useReduxSelector } from 'react-redux'
import _ from 'lodash'

interface WorksheetForm {
  line1: string | number
  line2: string | number
  line3: string | number
  line4: string | number
  line5: string | number
  line6: string | number
  line7: string | number
  line8: string | number
  line9: string | number
  line10: string | number
  line11: string | number
  line12: string | number
  line13: string | number
  line14: string | number
}

const blankForm: WorksheetForm = {
  line1: '',
  line2: '',
  line3: '',
  line4: '',
  line5: '',
  line6: '',
  line7: '',
  line8: '',
  line9: '',
  line10: '',
  line11: '',
  line12: '',
  line13: '',
  line14: ''
}

const toFormValues = (
  worksheet?: SelfEmployedHealthInsuranceWorksheet
): WorksheetForm => ({
  ...blankForm,
  line1: worksheet?.line1 ?? '',
  line2: worksheet?.line2 ?? '',
  line3: worksheet?.line3 ?? '',
  line4: worksheet?.line4 ?? '',
  line5: worksheet?.line5 ?? '',
  line6: worksheet?.line6 ?? '',
  line7: worksheet?.line7 ?? '',
  line8: worksheet?.line8 ?? '',
  line9: worksheet?.line9 ?? '',
  line10: worksheet?.line10 ?? '',
  line11: worksheet?.line11 ?? '',
  line12: worksheet?.line12 ?? '',
  line13: worksheet?.line13 ?? '',
  line14: worksheet?.line14 ?? ''
})

const parseLine = (value: string | number): number | undefined =>
  value === '' ? undefined : Number(value)

const toWorksheet = (
  formData: WorksheetForm
): SelfEmployedHealthInsuranceWorksheet => ({
  line1: parseLine(formData.line1),
  line2: parseLine(formData.line2),
  line3: parseLine(formData.line3),
  line4: parseLine(formData.line4),
  line5: parseLine(formData.line5),
  line6: parseLine(formData.line6),
  line7: parseLine(formData.line7),
  line8: parseLine(formData.line8),
  line9: parseLine(formData.line9),
  line10: parseLine(formData.line10),
  line11: parseLine(formData.line11),
  line12: parseLine(formData.line12),
  line13: parseLine(formData.line13),
  line14: parseLine(formData.line14)
})

const hasWorksheetValues = (
  worksheet: SelfEmployedHealthInsuranceWorksheet
): boolean => Object.values(worksheet).some((value) => value !== undefined)

const toDateString = (value: Date | null | undefined): string | undefined =>
  value ? value.toISOString().split('T')[0] : undefined

const mergeAdjustments = (
  existing: AdjustmentsToIncome | undefined,
  worksheet: SelfEmployedHealthInsuranceWorksheet,
  hasWorksheet: boolean
): AdjustmentsToIncomeDateString => ({
  educatorExpenses: existing?.educatorExpenses,
  alimonyPaid: existing?.alimonyPaid,
  alimonyRecipientSsn: existing?.alimonyRecipientSsn,
  alimonyDivorceDate: toDateString(existing?.alimonyDivorceDate),
  selfEmployedHealthInsuranceDeduction: hasWorksheet
    ? worksheet.line14
    : existing?.selfEmployedHealthInsuranceDeduction,
  selfEmployedHealthInsuranceWorksheet: hasWorksheet ? worksheet : undefined
})

export default function SelfEmployedHealthInsuranceWorksheetInfo(): ReactElement {
  const adjustments = useSelector(
    (state: TaxesState) => state.information.adjustments
  )
  const sources = useSelector((state: TaxesState) => state.information.sources)
  const activeYear = useReduxSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const worksheet = adjustments?.selfEmployedHealthInsuranceWorksheet

  const methods = useForm<WorksheetForm>({
    defaultValues: toFormValues(worksheet)
  })
  const {
    handleSubmit,
    reset,
    formState: { isDirty }
  } = methods
  const { navButtons, onAdvance } = usePager()
  const dispatch = useDispatch()

  const onSubmit = (formData: WorksheetForm): void => {
    const nextWorksheet = toWorksheet(formData)
    const hasWorksheet = hasWorksheetValues(nextWorksheet)
    dispatch(
      saveAdjustments(
        mergeAdjustments(adjustments, nextWorksheet, hasWorksheet)
      )
    )
    onAdvance()
  }

  useEffect(() => {
    const nextValues = toFormValues(worksheet)
    if (!isDirty && !_.isEqual(methods.getValues(), nextValues)) {
      reset(nextValues)
    }
  }, [worksheet, isDirty, reset, methods])

  const sourceLookup = (fieldName: string) =>
    getSource(sources, [
      'adjustments',
      'selfEmployedHealthInsuranceWorksheet',
      fieldName
    ])

  const page = (
    <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
      <Helmet>
        <title>Form 7206 Worksheet | Deductions | UsTaxes.org</title>
      </Helmet>
      <h2>Form 7206 Worksheet</h2>
      {activeYear === 'Y2022' ? (
        <p>
          For tax year 2022 this worksheet is available for your calculations,
          but Form 7206 is not attached to the return.
        </p>
      ) : undefined}
      <p>
        Enter the worksheet lines as needed. Line 14 is used for Schedule 1,
        line 17.
      </p>
      <Grid container spacing={2}>
        <LabeledInput
          label="Line 1"
          name="line1"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 2"
          name="line2"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 3"
          name="line3"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 4"
          name="line4"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 5"
          name="line5"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 6"
          name="line6"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 7"
          name="line7"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 8"
          name="line8"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 9"
          name="line9"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 10"
          name="line10"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 11"
          name="line11"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 12"
          name="line12"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 13"
          name="line13"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Line 14 (Schedule 1 line 17)"
          name="line14"
          patternConfig={Patterns.currency}
          required={false}
        />
      </Grid>
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
