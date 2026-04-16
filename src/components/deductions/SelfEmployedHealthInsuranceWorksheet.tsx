import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
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
import { intentionallyFloat, toFiniteNumber } from 'ustaxes/core/util'
import { YearsTaxesState } from 'ustaxes/redux'
import { useSelector as useReduxSelector } from 'react-redux'
import _ from 'lodash'
import { Currency } from 'ustaxes/components/input'
import { estimateScheduleCNetProfit } from 'ustaxes/core/selfEmployment'

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
  worksheet?: SelfEmployedHealthInsuranceWorksheet,
  derivedLine1?: number,
  derivedLine4?: number,
  derivedLine14?: number
): WorksheetForm => {
  const worksheetLine = (
    line: keyof SelfEmployedHealthInsuranceWorksheet
  ): number | undefined => toFiniteNumber(worksheet?.[line] as unknown)

  return {
    ...blankForm,
    line1: worksheetLine('line1') ?? derivedLine1 ?? '',
    line2: worksheetLine('line2') ?? '',
    line3: worksheetLine('line3') ?? '',
    line4: worksheetLine('line4') ?? derivedLine4 ?? '',
    line5: worksheetLine('line5') ?? '',
    line6: worksheetLine('line6') ?? '',
    line7: worksheetLine('line7') ?? '',
    line8: worksheetLine('line8') ?? '',
    line9: worksheetLine('line9') ?? '',
    line10: worksheetLine('line10') ?? '',
    line11: worksheetLine('line11') ?? '',
    line12: worksheetLine('line12') ?? '',
    line13: worksheetLine('line13') ?? '',
    line14: worksheetLine('line14') ?? derivedLine14 ?? ''
  }
}

const estimateHealthInsurancePremiums = (
  info: TaxesState['information']
): number | undefined => {
  const total = (info.selfEmployedIncome ?? []).reduce((sum, income) => {
    const premiums = toFiniteNumber(income.healthInsurancePremiums)
    return sum + (premiums ?? 0)
  }, 0)

  return total > 0 ? total : undefined
}

const parseLine = (value: string | number): number | undefined =>
  toFiniteNumber(value)

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
): boolean =>
  Object.values(worksheet).some((value) => toFiniteNumber(value) !== undefined)

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
  const info = useSelector((state: TaxesState) => state.information)
  const adjustments = useSelector(
    (state: TaxesState) => state.information.adjustments
  )
  const sources = useSelector((state: TaxesState) => state.information.sources)
  const activeYear = useReduxSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const worksheet = adjustments?.selfEmployedHealthInsuranceWorksheet
  const derivedLine1 = estimateHealthInsurancePremiums(info)
  const derivedLine4 = estimateScheduleCNetProfit(info)
  const derivedLine14 = toFiniteNumber(
    adjustments?.selfEmployedHealthInsuranceDeduction
  )

  const methods = useForm<WorksheetForm>({
    defaultValues: toFormValues(
      worksheet,
      derivedLine1,
      derivedLine4,
      derivedLine14
    )
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
    const nextValues = toFormValues(
      worksheet,
      derivedLine1,
      derivedLine4,
      derivedLine14
    )
    if (!isDirty && !_.isEqual(methods.getValues(), nextValues)) {
      reset(nextValues)
    }
  }, [
    worksheet,
    derivedLine1,
    derivedLine4,
    derivedLine14,
    isDirty,
    reset,
    methods
  ])

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
      {activeYear !== 'Y2023' &&
      activeYear !== 'Y2024' &&
      activeYear !== 'Y2025' ? (
        <p>
          This worksheet is available for your calculations, but the Form 7206
          PDF attachment is currently wired only for tax years 2023, 2024, and
          2025.
        </p>
      ) : undefined}
      <p>
        Enter or review the worksheet lines as needed. Line 14 is used for
        Schedule 1, line 17.
      </p>
      {derivedLine4 !== undefined ? (
        <p>
          Current Schedule C net profit estimate:{' '}
          <Currency value={derivedLine4} />. This amount is used as the default
          for line 4 unless you enter a more specific value.
        </p>
      ) : (
        <p>
          Enter line 4 from the business under which your health insurance plan
          is established, or fill out your Schedule C business page first to
          have UsTaxes suggest a default amount.
        </p>
      )}
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
