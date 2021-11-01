import { ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import {
  TaxesState,
  HealthSavingsAccount,
  Person,
  PersonRole
} from 'ustaxes/redux/data'

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
import { addHSA, editHSA, removeHSA } from 'ustaxes/redux/actions'
import { CURRENT_YEAR } from 'ustaxes/data/federal'

import { format } from 'date-fns'

interface HSAUserInput {
  label: string
  coverageType: 'self-only' | 'family'
  contributions: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  startDate: Date
  endDate: Date
}

const blankUserInput: HSAUserInput = {
  label: '',
  coverageType: 'self-only',
  contributions: '',
  personRole: PersonRole.PRIMARY,
  startDate: new Date(CURRENT_YEAR, 0, 1),
  endDate: new Date(CURRENT_YEAR, 11, 31)
}

const toHSA = (formData: HSAUserInput): HealthSavingsAccount => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  label: formData.label,
  coverageType: formData.coverageType,
  contributions: parseInt(formData.contributions),
  personRole: formData.personRole,
  startDate: formData.startDate,
  endDate: formData.endDate
})

const toHSAUserInput = (data: HealthSavingsAccount): HSAUserInput => ({
  ...blankUserInput,
  ...data,
  coverageType: data.coverageType,
  contributions: data.contributions.toString(),
  startDate: data.startDate,
  endDate: data.endDate
})

export default function HealthSavingsAccounts(): ReactElement {
  const hsa = useSelector(
    (state: TaxesState) => state.information.healthSavingsAccounts
  )

  const people: Person[] = useSelector((state: TaxesState) => [
    state.information.taxPayer?.primaryPerson,
    state.information.taxPayer?.spouse
  ])
    .filter((p) => p !== undefined)
    .map((p) => p as Person)

  const dispatch = useDispatch()

  const methods = useForm<HSAUserInput>()

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
          coverage type: {hsa.coverageType}
          <br />
          coverage span: {format(hsa.startDate, 'MMMM do, yyyy')} to {format(hsa.endDate, 'MMMM do, yyyy')}
        </span>
      )}
    >
      <Grid container spacing={2}>
        <LabeledInput
          name="label"
          label="label for this account"
          patternConfig={Patterns.plain}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="contributions"
          label="Your total contributions to this account."
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledDropdown
          dropDownData={['self-only', 'family']}
          label="Coverage Type"
          name="coverageType"
        />
        <GenericLabeledDropdown
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
        <DatePicker name="startDate" label="Starting Month" />
        <DatePicker name="endDate" label="Ending Month" />
      </Grid>
    </FormListContainer>
  )

  const form: ReactElement = <>{hsaBlock}</>

  return (
    <form tabIndex={-1} onSubmit={onAdvance}>
      <h2>Health Savings Accounts (HSA)</h2>
      {/* <p>
        did you already make payments towards your {CURRENT_YEAR} taxes this
        year or last year?
      </p> */}
      <FormProvider {...methods}>{form}</FormProvider>
      {navButtons}
    </form>
  )
}
