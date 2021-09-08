import { ReactElement, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import {
  TaxesState,
  IncomeW2,
  Person,
  PersonRole,
  Employer,
  Spouse,
  PrimaryPerson,
  FilingStatus,
  Information
} from 'ustaxes/redux/data'
import {
  Currency,
  formatSSID,
  GenericLabeledDropdown,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { Work } from '@material-ui/icons'
import { addW2, editW2, removeW2 } from 'ustaxes/redux/actions'
import { If } from 'react-if'
import { Alert } from '@material-ui/lab'

interface IncomeW2UserInput {
  employer?: Employer
  occupation: string
  income: string
  fedWithholding: string
  ssWithholding: string
  medicareWithholding: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

const toIncomeW2 = (formData: IncomeW2UserInput): IncomeW2 => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  income: parseInt(formData.income),
  fedWithholding: parseInt(formData.fedWithholding),
  ssWithholding: parseInt(formData.ssWithholding),
  medicareWithholding: parseInt(formData.medicareWithholding)
})

const toIncomeW2UserInput = (data: IncomeW2): IncomeW2UserInput => ({
  ...data,
  income: data.income.toString(),
  fedWithholding: data.fedWithholding.toString(),
  ssWithholding: data.ssWithholding.toString(),
  medicareWithholding: data.medicareWithholding.toString()
})

export default function W2JobInfo(): ReactElement {
  const dispatch = useDispatch()

  const methods = useForm<IncomeW2UserInput>({
    defaultValues: {
      employer: { employerName: '' },
      occupation: '',
      income: '',
      fedWithholding: '',
      ssWithholding: '',
      medicareWithholding: '',
      personRole: PersonRole.PRIMARY
    }
  })
  const { handleSubmit } = methods

  const { navButtons, onAdvance } = usePager()

  const information: Information = useSelector(
    (state: TaxesState) => state.information
  )

  const spouse: Spouse | undefined = information.taxPayer?.spouse

  const primary: PrimaryPerson | undefined = information.taxPayer?.primaryPerson

  const filingStatus: FilingStatus | undefined =
    information.taxPayer.filingStatus

  // People for employee selector
  const people: Person[] = [primary, spouse].flatMap((p) =>
    p !== undefined ? [p as Person] : []
  )

  const w2s: IncomeW2[] = information.w2s
  const spouseW2s = w2s.filter((w2) => w2.personRole === PersonRole.SPOUSE)

  const onSubmitAdd = (formData: IncomeW2UserInput): void => {
    dispatch(addW2(toIncomeW2(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: IncomeW2UserInput): void => {
      dispatch(editW2({ index, value: toIncomeW2(formData) }))
    }

  const w2sBlock = (
    <FormListContainer<IncomeW2UserInput>
      items={w2s.map((a) => toIncomeW2UserInput(a))}
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      removeItem={(i) => dispatch(removeW2(i))}
      icon={() => <Work />}
      primary={(w2: IncomeW2UserInput) =>
        w2.employer?.employerName ?? w2.occupation
      }
      secondary={(w2: IncomeW2UserInput) => (
        <span>
          Income: <Currency value={toIncomeW2(w2).income} />
        </span>
      )}
      grouping={(w2) => (w2.personRole === PersonRole.PRIMARY ? 0 : 1)}
      groupHeaders={[primary?.firstName, spouse?.firstName].map((x) =>
        x !== undefined ? <h2>{x}&apos; W2s</h2> : undefined
      )}
    >
      <p>Input data from W-2</p>
      <Grid container spacing={2}>
        <LabeledInput
          autofocus={true}
          label="Employer name"
          patternConfig={Patterns.name}
          name="employer.employerName"
          sizes={{ xs: 12 }}
        />
        <LabeledInput
          label="Occupation"
          patternConfig={Patterns.name}
          name="occupation"
          sizes={{ xs: 12 }}
        />
        <LabeledInput
          name="income"
          label={
            <>
              <strong>Box 1</strong> - Wages, tips, other compensation
            </>
          }
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="fedWithholding"
          label={
            <>
              <strong>Box 2</strong> - Federal income tax withheld
            </>
          }
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="ssWithholding"
          label={
            <>
              <strong>Box 4</strong> - Social security tax withheld
            </>
          }
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="medicareWithholding"
          label={
            <>
              <strong>Box 6</strong> - Medicare tax withheld
            </>
          }
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <GenericLabeledDropdown
          dropDownData={people}
          label="Employee"
          required={true}
          valueMapping={(p: Person, i: number) =>
            [PersonRole.PRIMARY, PersonRole.SPOUSE][i]
          }
          name="personRole"
          keyMapping={(p: Person, i: number) => i}
          textMapping={(p) =>
            `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`
          }
        />
      </Grid>
    </FormListContainer>
  )

  const spouseW2Message: ReactNode = (() => {
    if (spouse !== undefined && spouseW2s.length > 0) {
      return (
        <If condition={filingStatus === FilingStatus.MFS}>
          <Alert className="inner" severity="warning">
            Filing status is set to Married Filing Separately.{' '}
            <strong>{spouse.firstName}</strong>
            &apos;s W2s will not be added to the return.
          </Alert>
        </If>
      )
    }
  })()

  const form: ReactElement = (
    <>
      {w2sBlock}
      {spouseW2Message}
    </>
  )

  return (
    <FormProvider {...methods}>
      <form tabIndex={-1} onSubmit={handleSubmit(onAdvance)}>
        <Helmet>
          <title>Job Information | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Job Information</h2>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
