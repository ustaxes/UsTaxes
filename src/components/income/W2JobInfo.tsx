import { ReactElement, ReactNode, useState } from 'react'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import {
  IncomeW2,
  Person,
  PersonRole,
  Employer,
  Spouse,
  PrimaryPerson,
  FilingStatus,
  Information,
  State,
  W2Box12Info,
  W2Box12Code,
  W2Box12CodeDescriptions
} from 'ustaxes/core/data'
import {
  boxLabel,
  Currency,
  formatSSID,
  GenericLabeledDropdown,
  LabeledInput,
  USStateDropDown
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid, Box, Button, Paper } from '@material-ui/core'
import { Work } from '@material-ui/icons'
import { addW2, editW2, removeW2 } from 'ustaxes/redux/actions'
import { Alert } from '@material-ui/lab'
import { enumKeys, parseFormNumberOrThrow } from 'ustaxes/core/util'

interface IncomeW2UserInput {
  employer?: Employer
  occupation: string
  income: string
  medicareIncome: string
  fedWithholding: string
  ssWithholding: string
  medicareWithholding: string
  personRole?: PersonRole.PRIMARY | PersonRole.SPOUSE
  state?: State
  stateWages: string
  stateWithholding: string
  box12: W2Box12Info
}

const blankW2UserInput: IncomeW2UserInput = {
  employer: {
    EIN: ''
  },
  occupation: '',
  income: '',
  medicareIncome: '',
  fedWithholding: '',
  ssWithholding: '',
  medicareWithholding: '',
  stateWages: '',
  stateWithholding: '',
  box12: {}
}

const toIncomeW2 = (formData: IncomeW2UserInput): IncomeW2 => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  income: parseFormNumberOrThrow(formData.income),
  medicareIncome: parseFormNumberOrThrow(formData.medicareIncome),
  fedWithholding: parseFormNumberOrThrow(formData.fedWithholding),
  ssWithholding: parseFormNumberOrThrow(formData.ssWithholding),
  medicareWithholding: parseFormNumberOrThrow(formData.medicareWithholding),
  state: formData.state,
  stateWages: parseFormNumberOrThrow(formData.stateWages),
  stateWithholding: parseFormNumberOrThrow(formData.stateWithholding),
  personRole: formData.personRole ?? PersonRole.PRIMARY
})

const toIncomeW2UserInput = (data: IncomeW2): IncomeW2UserInput => ({
  ...blankW2UserInput,
  ...data,
  income: data.income.toString(),
  medicareIncome: data.medicareIncome.toString(),
  fedWithholding: data.fedWithholding.toString(),
  ssWithholding: data.ssWithholding.toString(),
  medicareWithholding: data.medicareWithholding.toString(),
  state: data.state,
  stateWages: data.stateWages?.toString() ?? '',
  stateWithholding: data.stateWithholding?.toString() ?? ''
})

const Box12Data = (): ReactElement => {
  const [editBox12, setEditBox12] = useState(false)

  const { getValues } = useFormContext<IncomeW2UserInput>()

  const { box12 } = getValues()

  const box12Fields = (
    <>
      {enumKeys(W2Box12Code).map((code) => (
        <>
          <p>
            <strong>Code {code}</strong>: {W2Box12CodeDescriptions[code]}
          </p>
          <LabeledInput
            label={code}
            key={`box-12{$code}`}
            name={`box12.${code}`}
            patternConfig={Patterns.currency}
            required={false}
          />
        </>
      ))}
    </>
  )

  const openCloseButton = (
    <Button
      type="button"
      variant="contained"
      color={editBox12 ? 'secondary' : 'default'}
      onClick={() => setEditBox12(!editBox12)}
    >
      {editBox12 ? 'Done' : 'Edit'}
    </Button>
  )

  const box12Data = (
    <ul>
      {enumKeys(W2Box12Code)
        .filter((code) => box12[code] !== undefined)
        .map((code) => (
          <li key={`box-12-data-${code}`}>
            {code}: <Currency plain value={box12[code] as number} /> (
            {W2Box12CodeDescriptions[code]})
          </li>
        ))}
    </ul>
  )

  return (
    <Paper>
      <Box padding={2} paddingTop={2}>
        <h4>Box 12 Information</h4>
        {editBox12 ? box12Fields : box12Data}
        <Box paddingTop={1}>{openCloseButton}</Box>
      </Box>
    </Paper>
  )
}

export default function W2JobInfo(): ReactElement {
  const dispatch = useDispatch()

  const methods = useForm<IncomeW2UserInput>({
    defaultValues: blankW2UserInput
  })

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
          label={boxLabel('b', "Employer's Identification Number")}
          patternConfig={Patterns.ein}
          name="employer.EIN"
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
          label={boxLabel('1', ' Wages, tips, other compensation')}
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="fedWithholding"
          label={boxLabel('2', 'Federal income tax withheld')}
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="ssWithholding"
          label={boxLabel('4', 'Social security tax withheld')}
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="medicareIncome"
          label={boxLabel('5', 'Medicare Income')}
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="medicareWithholding"
          label={boxLabel('6', 'Medicare tax withheld')}
          patternConfig={Patterns.currency}
          sizes={{ xs: 12, lg: 6 }}
        />
        <USStateDropDown name="state" label={boxLabel('15', 'State')} />
        <Grid item xs={12} spacing={2}>
          <Box12Data />
        </Grid>
        <LabeledInput
          name="stateWages"
          label={boxLabel('16', 'State wages, tips, etc')}
          patternConfig={Patterns.currency}
          required={true}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="stateWithholding"
          label={boxLabel('17', 'State income tax')}
          patternConfig={Patterns.currency}
          required={true}
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
    if (
      spouse !== undefined &&
      spouseW2s.length > 0 &&
      filingStatus === FilingStatus.MFS
    ) {
      return (
        <div>
          <Box marginBottom={3}>
            <Alert className="inner" severity="warning">
              Filing status is set to Married Filing Separately.{' '}
              <strong>{spouse.firstName}</strong>
              &apos;s W2s will not be added to the return.
            </Alert>
          </Box>
        </div>
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
      <form tabIndex={-1} onSubmit={onAdvance}>
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
