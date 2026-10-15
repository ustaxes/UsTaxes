import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
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
import { PatternConfig } from 'ustaxes/components/Patterns'
import {
  estimateHealthInsurancePremiums,
  estimateProfitableSelfEmploymentIncome,
  estimateScheduleCNetProfit
} from 'ustaxes/core/selfEmployment'
import {
  computeForm7206DerivedLines,
  formatForm7206Ratio
} from 'ustaxes/core/form7206'
import { fica as fica2023 } from 'ustaxes/forms/Y2023/data/federal'
import { fica as fica2024 } from 'ustaxes/forms/Y2024/data/federal'
import { fica as fica2025 } from 'ustaxes/forms/Y2025/data/federal'

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

type WorksheetFieldName = keyof WorksheetForm

interface WorksheetFieldConfig {
  name: WorksheetFieldName
  label: string
  tooltip: string
  disabled?: boolean
  patternConfig?: PatternConfig
}

const ratioPattern = {
  ...Patterns.currency,
  regexp: /-?[0-9]+(\.[0-9]{1,6})?/,
  description: 'Input should be a numeric ratio such as 0.625',
  prefix: '',
  thousandSeparator: false,
  decimalScale: 6
}

const socialSecurityWageBaseByYear: Partial<
  Record<YearsTaxesState['activeYear'], number>
> = {
  Y2023: fica2023.maxIncomeSSTaxApplies,
  Y2024: fica2024.maxIncomeSSTaxApplies,
  Y2025: fica2025.maxIncomeSSTaxApplies
}

const sumRetirementContributions = (
  info: TaxesState['information']
): number | undefined => {
  const total = (info.selfEmployedIncome ?? []).reduce(
    (sum, income) =>
      sum +
      (toFiniteNumber(income.sepContributions) ?? 0) +
      (toFiniteNumber(income.simpleContributions) ?? 0),
    0
  )

  return total > 0 ? total : undefined
}

const estimateDeductibleSelfEmploymentTax = (
  info: TaxesState['information'],
  activeYear: YearsTaxesState['activeYear']
): number | undefined => {
  const scheduleCNetProfit = estimateScheduleCNetProfit(info) ?? 0
  const k1Income = info.scheduleK1Form1065s.reduce(
    (sum, k1) => sum + (toFiniteNumber(k1.selfEmploymentEarningsA) ?? 0),
    0
  )
  const netEarnings = scheduleCNetProfit + k1Income
  const taxableSelfEmploymentIncome =
    netEarnings > 0 ? netEarnings * 0.9235 : netEarnings

  if (taxableSelfEmploymentIncome < 400) {
    return undefined
  }

  const ssWages = info.w2s.reduce(
    (sum, w2) => sum + (toFiniteNumber(w2.ssWages) ?? 0),
    0
  )
  const wageBase = socialSecurityWageBaseByYear[activeYear]
  if (wageBase === undefined) {
    return undefined
  }
  const remainingSsBase = Math.max(0, wageBase - ssWages)
  const socialSecurityTax =
    Math.min(taxableSelfEmploymentIncome, remainingSsBase) * 0.124
  const medicareTax = taxableSelfEmploymentIncome * 0.029
  const totalTax = socialSecurityTax + medicareTax
  const deductibleTax = totalTax * 0.5

  return deductibleTax > 0 ? deductibleTax : undefined
}

const line2CapTextByYear: Partial<
  Record<YearsTaxesState['activeYear'], string>
> = {
  Y2023:
    '$480 if age 40 or younger, $890 if age 41 to 50, $1,790 if age 51 to 60, $4,770 if age 61 to 70, and $5,960 if age 71 or older',
  Y2024:
    '$470 if age 40 or younger, $880 if age 41 to 50, $1,760 if age 51 to 60, $4,710 if age 61 to 70, and $5,880 if age 71 or older',
  Y2025:
    '$480 if age 40 or younger, $900 if age 41 to 50, $1,800 if age 51 to 60, $4,810 if age 61 to 70, and $6,020 if age 71 or older'
}

const worksheetFieldsForYear = (
  activeYear: YearsTaxesState['activeYear']
): WorksheetFieldConfig[] => {
  const taxYear = activeYear.replace(/^Y/, '')
  const line2Caps =
    line2CapTextByYear[activeYear] ??
    line2CapTextByYear.Y2025 ??
    'the applicable annual IRS long-term care premium limits'

  return [
    {
      name: 'line1',
      label: 'Line 1 - Health insurance premiums',
      tooltip: `Enter the ${taxYear} health insurance premiums established under this business for you, your spouse, and dependents. Exclude months covered by an employer-subsidized plan, retired public safety officer amounts excluded from income, and qualified long-term care premiums.`
    },
    {
      name: 'line2',
      label: 'Line 2 - Qualified long-term care premiums',
      tooltip: `Enter the allowable long-term care premiums. For ${taxYear}, the per-person cap is ${line2Caps}.`
    },
    {
      name: 'line3',
      label: 'Line 3 - Total premiums',
      tooltip: 'Automatically calculated as line 1 plus line 2.',
      disabled: true
    },
    {
      name: 'line4',
      label: 'Line 4 - Net profit or earned income for this business',
      tooltip:
        'Enter the net profit and any other earned income from the trade or business under which the insurance plan is established. If the plan is under an S corporation, leave this blank and use line 11 instead.'
    },
    {
      name: 'line5',
      label: 'Line 5 - Total profitable self-employment income',
      tooltip:
        'Enter the total of all profitable Schedule C, Schedule F, and partnership self-employment income allocable to profitable businesses. Do not include net losses. UsTaxes suggests a default when it can.'
    },
    {
      name: 'line6',
      label: 'Line 6 - Allocation ratio',
      tooltip: 'Automatically calculated as line 4 divided by line 5.',
      disabled: true,
      patternConfig: ratioPattern
    },
    {
      name: 'line7',
      label: 'Line 7 - Deductible part of self-employment tax',
      tooltip:
        'Automatically calculated as Schedule 1 line 15 multiplied by the line 6 allocation ratio.',
      disabled: true
    },
    {
      name: 'line8',
      label: 'Line 8 - Net earnings after self-employment tax',
      tooltip: 'Automatically calculated as line 4 minus line 7.',
      disabled: true
    },
    {
      name: 'line9',
      label: 'Line 9 - SEP, SIMPLE, and qualified plan deductions',
      tooltip:
        'Enter the amount from Schedule 1 line 16 that is attributable to the same trade or business. UsTaxes suggests a default total from your self-employed retirement contributions.'
    },
    {
      name: 'line10',
      label: 'Line 10 - Remaining earned income',
      tooltip: 'Automatically calculated as line 8 minus line 9.',
      disabled: true
    },
    {
      name: 'line11',
      label: 'Line 11 - S corporation Medicare wages',
      tooltip:
        'If the insurance plan is established under an S corporation where you are a more-than-2% shareholder, enter your Medicare wages from Form W-2 box 5 here.'
    },
    {
      name: 'line12',
      label: 'Line 12 - Form 2555 line 45 amount',
      tooltip:
        'Enter the amount from Form 2555 line 45 attributable to the income on line 4 or line 11. UsTaxes suggests your saved foreign earned income exclusion amount when present.'
    },
    {
      name: 'line13',
      label: 'Line 13 - Income limit after Form 2555',
      tooltip:
        'Automatically calculated as line 10 minus line 12, or line 11 minus line 12 when line 11 applies.',
      disabled: true
    },
    {
      name: 'line14',
      label: 'Line 14 - Self-employed health insurance deduction',
      tooltip:
        'Automatically calculated as the smaller of line 3 or line 13. This amount flows to Schedule 1 line 17.',
      disabled: true
    }
  ]
}

const toFieldValue = (value: number | undefined): string | number => value ?? ''

const toFormValues = (
  worksheet?: SelfEmployedHealthInsuranceWorksheet,
  derivedLine1?: number,
  derivedLine4?: number,
  derivedLine5?: number,
  derivedLine9?: number,
  derivedLine12?: number,
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
    line5: worksheetLine('line5') ?? derivedLine5 ?? '',
    line6: worksheetLine('line6') ?? '',
    line7: worksheetLine('line7') ?? '',
    line8: worksheetLine('line8') ?? '',
    line9: worksheetLine('line9') ?? derivedLine9 ?? '',
    line10: worksheetLine('line10') ?? '',
    line11: worksheetLine('line11') ?? '',
    line12: worksheetLine('line12') ?? derivedLine12 ?? '',
    line13: worksheetLine('line13') ?? '',
    line14: worksheetLine('line14') ?? derivedLine14 ?? ''
  }
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
  const derivedLine5 = estimateProfitableSelfEmploymentIncome(info)
  const derivedLine9 = sumRetirementContributions(info)
  const derivedLine12 = toFiniteNumber(
    info.otherIncome?.foreignEarnedIncomeExclusion
  )
  const derivedLine14 = toFiniteNumber(
    adjustments?.selfEmployedHealthInsuranceDeduction
  )
  const deductibleSelfEmploymentTax = estimateDeductibleSelfEmploymentTax(
    info,
    activeYear
  )
  const worksheetFields = worksheetFieldsForYear(activeYear)

  const methods = useForm<WorksheetForm>({
    defaultValues: toFormValues(
      worksheet,
      derivedLine1,
      derivedLine4,
      derivedLine5,
      derivedLine9,
      derivedLine12,
      derivedLine14
    )
  })
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { dirtyFields }
  } = methods
  const { navButtons, onAdvance } = usePager()
  const dispatch = useDispatch()
  const [line1, line2, line4, line5, line9, line11, line12] = useWatch({
    control,
    name: ['line1', 'line2', 'line4', 'line5', 'line9', 'line11', 'line12']
  })

  const derivedLines = computeForm7206DerivedLines({
    line1,
    line2,
    line4,
    line5,
    line9,
    line11,
    line12,
    deductibleSelfEmploymentTax
  })
  const hasManualEdits =
    dirtyFields.line1 === true ||
    dirtyFields.line2 === true ||
    dirtyFields.line4 === true ||
    dirtyFields.line5 === true ||
    dirtyFields.line9 === true ||
    dirtyFields.line11 === true ||
    dirtyFields.line12 === true

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
      derivedLine5,
      derivedLine9,
      derivedLine12,
      derivedLine14
    )
    if (!hasManualEdits && !_.isEqual(methods.getValues(), nextValues)) {
      reset(nextValues)
    }
  }, [
    worksheet,
    derivedLine1,
    derivedLine4,
    derivedLine5,
    derivedLine9,
    derivedLine12,
    derivedLine14,
    hasManualEdits,
    reset,
    methods
  ])

  useEffect(() => {
    setValue('line3', toFieldValue(derivedLines.line3), {
      shouldDirty: false,
      shouldValidate: false
    })
    setValue('line6', formatForm7206Ratio(derivedLines.line6) ?? '', {
      shouldDirty: false,
      shouldValidate: false
    })
    setValue('line7', toFieldValue(derivedLines.line7), {
      shouldDirty: false,
      shouldValidate: false
    })
    setValue('line8', toFieldValue(derivedLines.line8), {
      shouldDirty: false,
      shouldValidate: false
    })
    setValue('line10', toFieldValue(derivedLines.line10), {
      shouldDirty: false,
      shouldValidate: false
    })
    setValue('line13', toFieldValue(derivedLines.line13), {
      shouldDirty: false,
      shouldValidate: false
    })
    setValue('line14', toFieldValue(derivedLines.line14 ?? derivedLine14), {
      shouldDirty: false,
      shouldValidate: false
    })
  }, [
    derivedLines.line3,
    derivedLines.line6,
    derivedLines.line7,
    derivedLines.line8,
    derivedLines.line10,
    derivedLines.line13,
    derivedLines.line14,
    derivedLine14,
    setValue,
    worksheet
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
        UsTaxes suggests defaults for lines 1, 4, 5, 9, and 12 when it can, and
        calculates lines 3, 6, 7, 8, 10, 13, and 14 automatically. Line 14 flows
        to Schedule 1, line 17.
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
        {worksheetFields.map((field) => (
          <LabeledInput
            key={field.name}
            label={field.label}
            tooltip={field.tooltip}
            name={field.name}
            patternConfig={field.patternConfig ?? Patterns.currency}
            required={false}
            disabled={field.disabled}
          />
        ))}
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
