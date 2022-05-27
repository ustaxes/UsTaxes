import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { useYearSelector, useYearDispatch } from 'ustaxes/redux/yearDispatch'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import {
  HealthSavingsAccount,
  Person,
  PersonRole,
  TaxYear,
  TaxYears
} from 'ustaxes/core/data'

import {
  Currency,
  LabeledInput,
  GenericLabeledDropdown,
  LabeledDropdown,
  formatSSID,
  DatePicker
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { Work } from '@material-ui/icons'
import { TaxesState } from 'ustaxes/redux'
import { addHSA, editHSA, removeHSA } from 'ustaxes/redux/actions'
import { YearsTaxesState } from 'ustaxes/redux'

import { format } from 'date-fns'
import { intentionallyFloat } from 'ustaxes/core/util'

interface HSAUserInput {
  label: string
  coverageType: 'self-only' | 'family'
  contributions: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  startDate: Date
  endDate: Date
  totalDistributions: string
  qualifiedDistributions: string
}

const blankUserInput: HSAUserInput = {
  label: '',
  coverageType: 'self-only',
  contributions: '',
  personRole: PersonRole.PRIMARY,
  startDate: new Date(),
  endDate: new Date(),
  totalDistributions: '',
  qualifiedDistributions: ''
}

const toHSA = (formData: HSAUserInput): HealthSavingsAccount<string> => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  label: formData.label,
  coverageType: formData.coverageType,
  contributions: parseInt(formData.contributions),
  personRole: formData.personRole,
  startDate: formData.startDate.toISOString(),
  endDate: formData.endDate.toISOString(),
  totalDistributions: parseInt(formData.totalDistributions),
  qualifiedDistributions: parseInt(formData.qualifiedDistributions)
})

const toHSAUserInput = (data: HealthSavingsAccount): HSAUserInput => ({
  ...blankUserInput,
  ...data,
  coverageType: data.coverageType,
  contributions: data.contributions.toString(),
  startDate: new Date(data.startDate),
  endDate: new Date(data.endDate),
  totalDistributions: data.totalDistributions.toString(),
  qualifiedDistributions: data.qualifiedDistributions.toString()
})

export default function HealthSavingsAccounts(): ReactElement {
  const defaultValues = blankUserInput
  const hsa = useYearSelector(
    (state: TaxesState) => state.information.healthSavingsAccounts
  )

  const people: Person[] = useYearSelector((state: TaxesState) => [
    state.information.taxPayer.primaryPerson,
    state.information.taxPayer.spouse
  ])
    .filter((p) => p !== undefined)
    .map((p) => p as Person)

  const dispatch = useYearDispatch()

  const methods = useForm<HSAUserInput>({ defaultValues })
  const { handleSubmit } = methods

  const activeYear: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const { navButtons, onAdvance } = usePager()

  const onSubmitAdd = (formData: HSAUserInput): void => {
    dispatch(addHSA(toHSA(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: HSAUserInput): void => {
      dispatch(editHSA({ index, value: toHSA(formData) }))
    }

  const hsaBlock = (
    <FormListContainer<HSAUserInput>
      defaultValues={defaultValues}
      items={hsa.map((a) => toHSAUserInput(a))}
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      removeItem={(i) => dispatch(removeHSA(i))}
      icon={() => <Work />}
      primary={(hsa: HSAUserInput) => hsa.label}
      secondary={(hsa: HSAUserInput) => (
        <span>
          contributions: <Currency value={toHSA(hsa).contributions} />
          <br />
          total distributions:{' '}
          <Currency value={toHSA(hsa).totalDistributions} />
          <br />
          qualified distributions:{' '}
          <Currency value={toHSA(hsa).qualifiedDistributions} />
          <br />
          coverage type: {hsa.coverageType}
          <br />
          coverage span: {format(hsa.startDate, 'MMMM do, yyyy')} to{' '}
          {format(hsa.endDate, 'MMMM do, yyyy')}
        </span>
      )}
    >
      <Grid container spacing={2}>
        <LabeledInput<HSAUserInput>
          name="label"
          label="label for this account"
          patternConfig={Patterns.plain}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput<HSAUserInput>
          name="contributions"
          label="Your total contributions to this account."
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput<HSAUserInput>
          name="totalDistributions"
          label="Total distributions from this account."
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput<HSAUserInput>
          name="qualifiedDistributions"
          label="Qualified medical distributions from this account."
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledDropdown<HSAUserInput>
          dropDownData={['self-only', 'family']}
          label="Coverage Type"
          name="coverageType"
        />
        <GenericLabeledDropdown<Person, HSAUserInput>
          dropDownData={people}
          label="Recipient"
          valueMapping={(p: Person, i: number) =>
            [PersonRole.PRIMARY, PersonRole.SPOUSE][i]
          }
          name="personRole"
          keyMapping={(p: Person, i: number) => i}
          textMapping={(p: Person) =>
            `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`
          }
        />
        <DatePicker
          name="startDate"
          label="Starting Date"
          sizes={{ xs: 12, lg: 6 }}
          minDate={new Date(TaxYears[activeYear], 0, 1)}
          maxDate={new Date(TaxYears[activeYear], 11, 31)}
        />
        <DatePicker
          name="endDate"
          label="Ending Date"
          sizes={{ xs: 12, lg: 6 }}
          minDate={new Date(TaxYears[activeYear], 0, 1)}
          maxDate={new Date(TaxYears[activeYear], 11, 31)}
        />
      </Grid>
    </FormListContainer>
  )

  const form: ReactElement = <>{hsaBlock}</>

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>
            Health Savings Accounts (HSA) | Savings Accounts | UsTaxes.org
          </title>
        </Helmet>
        <h2>Health Savings Accounts (HSA)</h2>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
