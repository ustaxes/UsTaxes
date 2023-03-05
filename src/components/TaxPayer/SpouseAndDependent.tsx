import { ReactElement, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { Patterns } from 'ustaxes/components/Patterns'
import {
  LabeledInput,
  LabeledCheckbox,
  formatSSID,
  GenericLabeledDropdown
} from 'ustaxes/components/input'
import {
  TaxPayer,
  Dependent,
  Spouse,
  PersonRole,
  FilingStatus,
  FilingStatusTexts,
  filingStatuses
} from 'ustaxes/core/data'
import {
  addDependent,
  addSpouse,
  editDependent,
  removeDependent,
  removeSpouse,
  saveFilingStatusInfo
} from 'ustaxes/redux/actions'
import { PersonFields } from './PersonFields'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { usePager } from 'ustaxes/components/pager'
import { Box, Grid } from '@material-ui/core'
import { Person } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { intentionallyFloat } from 'ustaxes/core/util'

interface UserPersonForm {
  firstName: string
  initial: string
  lastName: string
  ssid: string
  isBlind: boolean
  dateOfBirth?: Date
}

const blankUserPersonForm: UserPersonForm = {
  firstName: '',
  initial: '',
  lastName: '',
  ssid: '',
  isBlind: false,
  dateOfBirth: undefined
}

interface UserDependentForm extends UserPersonForm {
  relationship: string
  isStudent: boolean
  numberOfMonths: string
}

const blankUserDependentForm: UserDependentForm = {
  ...blankUserPersonForm,
  relationship: '',
  isStudent: false,
  numberOfMonths: ''
}

const toDependent = (formData: UserDependentForm): Dependent<string> => {
  const { isStudent, numberOfMonths, ...rest } = formData
  if (formData.dateOfBirth === undefined) {
    throw new Error('Called with undefined date of birth')
  }

  return {
    ...rest,
    role: PersonRole.DEPENDENT,
    qualifyingInfo: {
      numberOfMonths: parseInt(numberOfMonths),
      isStudent
    },
    dateOfBirth: formData.dateOfBirth.toISOString()
  }
}

const toDependentForm = (dependent: Dependent): UserDependentForm => {
  const { qualifyingInfo, dateOfBirth, ...rest } = dependent

  return {
    ...rest,
    numberOfMonths: qualifyingInfo?.numberOfMonths.toString() ?? '',
    isStudent: qualifyingInfo?.isStudent ?? false,
    dateOfBirth
  }
}

interface UserSpouseForm extends UserPersonForm {
  isTaxpayerDependent: boolean
}

const blankUserSpouseForm = {
  ...blankUserPersonForm,
  isTaxpayerDependent: false
}

const toSpouse = (formData: UserSpouseForm): Spouse<string> => {
  if (formData.dateOfBirth === undefined) {
    throw new Error('Called with undefined date of birth')
  }

  return {
    ...formData,
    role: PersonRole.SPOUSE,
    dateOfBirth: formData.dateOfBirth.toISOString()
  }
}

const toSpouseForm = (spouse: Spouse): UserSpouseForm => ({
  ...spouse,
  dateOfBirth: new Date(spouse.dateOfBirth)
})

export const AddDependentForm = (): ReactElement => {
  const dependents = useSelector(
    (state: TaxesState) => state.information.taxPayer.dependents
  )

  const defaultValues = blankUserDependentForm

  const dispatch = useDispatch()

  const methods = useForm<UserDependentForm>({
    defaultValues
  })

  const onSubmitAdd = (formData: UserDependentForm): void => {
    dispatch(addDependent(toDependent(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: UserDependentForm): void => {
      dispatch(
        editDependent({
          index,
          value: toDependent(formData)
        })
      )
    }

  const page = (
    <FormListContainer<UserDependentForm>
      defaultValues={defaultValues}
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      items={dependents.map((a) => toDependentForm(a))}
      primary={(a) => `${a.firstName} ${a.lastName}`}
      secondary={(a) => formatSSID(a.ssid)}
      icon={() => <Person />}
      removeItem={(i) => dispatch(removeDependent(i))}
    >
      <Grid container spacing={2}>
        <PersonFields />
        <LabeledInput
          label="Relationship to Taxpayer"
          name="relationship"
          patternConfig={Patterns.name}
        />
        <LabeledInput
          label="How many months did you live together this year?"
          patternConfig={Patterns.numMonths}
          name="numberOfMonths"
        />
        <LabeledCheckbox
          label="Is this person a full-time student?"
          name="isStudent"
        />
      </Grid>
    </FormListContainer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

export const SpouseInfo = (): ReactElement => {
  const defaultValues = blankUserSpouseForm
  const methods = useForm<UserSpouseForm>({
    defaultValues
  })
  const { getValues } = methods
  const dispatch = useDispatch()

  const spouse: Spouse | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer.spouse
  })

  const onSubmit = (): void => {
    dispatch(addSpouse(toSpouse(getValues())))
  }

  const onSubmitEdit = (): (() => void) => onSubmit

  const page = (
    <FormListContainer
      defaultValues={defaultValues}
      items={spouse !== undefined ? [toSpouseForm(spouse)] : []}
      primary={(s) => `${s.firstName} ${s.lastName}`}
      secondary={(s) => formatSSID(s.ssid)}
      icon={() => <Person />}
      onSubmitAdd={onSubmit}
      onSubmitEdit={onSubmitEdit}
      max={1}
      removeItem={() => dispatch(removeSpouse)}
    >
      <Grid container spacing={2}>
        <PersonFields autofocus={true}>
          <LabeledCheckbox
            label="Check if your spouse is a dependent"
            name="isTaxpayerDependent"
          />
        </PersonFields>
      </Grid>
    </FormListContainer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

export const FilingStatusDropdown = (): ReactElement => {
  const dispatch = useDispatch()

  const onSubmit = (formData: { filingStatus: FilingStatus }): void => {
    dispatch(saveFilingStatusInfo(formData.filingStatus))
    onAdvance()
  }
  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const allowedFilingStatuses = filingStatuses(taxPayer)

  const { onAdvance, navButtons } = usePager()

  const defaultValues: { filingStatus: FilingStatus | '' } = {
    filingStatus: (() => {
      if (
        taxPayer.filingStatus !== undefined &&
        allowedFilingStatuses.includes(taxPayer.filingStatus)
      ) {
        return taxPayer.filingStatus
      }
      return ''
    })()
  }

  const methods = useForm({
    defaultValues
  })

  const [error, setError] = useState<ReactElement | undefined>(undefined)

  const {
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { isDirty }
  } = methods

  const currentFilingStatus = getValues().filingStatus

  const newValue = watch()

  useEffect(() => {
    // Handle state updates outside this control
    if (!isDirty && currentFilingStatus !== defaultValues.filingStatus) {
      reset(defaultValues)
    }
    // Handle other state updates that cause current
    // value to be invalid
    else if (
      currentFilingStatus !== '' &&
      !allowedFilingStatuses.includes(currentFilingStatus)
    ) {
      reset({})
      setError(
        <Box paddingTop={2}>
          <Alert severity="warning">
            Filing status was set to {FilingStatusTexts[currentFilingStatus]}{' '}
            which is no longer allowed due to your inputs. Make another
            selection.
          </Alert>
        </Box>
      )
    } else if (currentFilingStatus !== '' || newValue.filingStatus !== '') {
      setError(undefined)
    }
  }, [defaultValues.filingStatus, currentFilingStatus])

  return (
    <FormProvider {...methods}>
      <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
        <Box marginBottom={2}>
          <GenericLabeledDropdown<FilingStatus, { filingStatus: FilingStatus }>
            label="Filing Status"
            dropDownData={allowedFilingStatuses}
            valueMapping={(x) => x}
            keyMapping={(x, i) => i}
            textMapping={(status) => FilingStatusTexts[status]}
            name="filingStatus"
          />
        </Box>
        {error}
        {navButtons}
      </form>
    </FormProvider>
  )
}

const SpouseAndDependent = (): ReactElement => (
  <>
    <Helmet>
      <title>Family Information | Personal | UsTaxes.org</title>
    </Helmet>
    <h2>Family Information</h2>
    <h3>Spouse Information</h3>
    <SpouseInfo />

    <h3>Dependent Information</h3>
    <AddDependentForm />

    <FilingStatusDropdown />
  </>
)

export default SpouseAndDependent
