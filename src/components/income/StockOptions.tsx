import { ReactElement, ReactNode } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { TaxesState, useSelector, useDispatch } from 'ustaxes/redux'
import { addF3921, editF3921, removeF3921 } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import {
  LabeledInput,
  GenericLabeledDropdown,
  formatSSID
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Currency } from 'ustaxes/components/input'
import { Grid, Box } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ShowChartOutlined as StockIcon } from '@material-ui/icons'
import {
  F3921,
  FilingStatus,
  Information,
  Person,
  PersonRole,
  PrimaryPerson,
  Spouse
} from 'ustaxes/core/data'
import { intentionallyFloat } from 'ustaxes/core/util'

interface F3921UserInput {
  name: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  exercisePricePerShare?: string
  fmv?: string
  numShares?: string
}

const blankUserInput: F3921UserInput = {
  name: '',
  personRole: PersonRole.PRIMARY,
  exercisePricePerShare: '',
  fmv: '',
  numShares: ''
}

const toUserInput = (f: F3921): F3921UserInput => ({
  ...blankUserInput,
  name: f.name,
  personRole: f.personRole,
  exercisePricePerShare: f.exercisePricePerShare.toString(),
  fmv: f.fmv.toString(),
  numShares: f.numShares.toString()
})

const toF3921 = (input: F3921UserInput): F3921 | undefined => {
  const { name, personRole, exercisePricePerShare, fmv, numShares } = input
  if (name === '') {
    return undefined
  }
  return {
    name,
    personRole: personRole,
    exercisePricePerShare: Number(exercisePricePerShare),
    fmv: Number(fmv),
    numShares: Number(numShares)
  }
}

export const StockOptions = (): ReactElement => {
  const information: Information = useSelector(
    (state: TaxesState) => state.information
  )
  const f3921s = information.f3921s
  const spouseF3921s = f3921s.filter(
    (f3921) => f3921.personRole === PersonRole.SPOUSE
  )

  const spouse: Spouse | undefined = information.taxPayer?.spouse

  const primary: PrimaryPerson | undefined = information.taxPayer?.primaryPerson

  const filingStatus: FilingStatus | undefined =
    information.taxPayer.filingStatus

  // People for employee selector
  const people: Person[] = [primary, spouse].flatMap((p) =>
    p !== undefined ? [p as Person] : []
  )

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

  const spouseF3921Message: ReactNode = (() => {
    if (
      spouse !== undefined &&
      spouseF3921s.length > 0 &&
      filingStatus === FilingStatus.MFS
    ) {
      return (
        <div>
          <Box marginBottom={3}>
            <Alert className="inner" severity="warning">
              Filing status is set to Married Filing Separately.{' '}
              <strong>{spouse.firstName}</strong>
              &apos;s F3921s will not be added to the return.
            </Alert>
          </Box>
        </div>
      )
    }
  })()

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>Stock Options | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Stock Options</h2>
        <p>If you received Form 3921, enter the information here.</p>
        {form}
        {spouseF3921Message}
        {navButtons}
      </form>
    </FormProvider>
  )
}

export default StockOptions
