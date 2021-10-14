import { ReactElement } from 'react'

import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Patterns } from 'ustaxes/components/Patterns'
import {
  LabeledInput,
  LabeledCheckbox,
  formatSSID,
  GenericLabeledDropdown
} from 'ustaxes/components/input'
import {
  TaxesState,
  TaxPayer,
  Dependent,
  Spouse,
  PersonRole,
  FilingStatus,
  FilingStatusTexts,
  filingStatuses
} from 'ustaxes/redux/data'
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
import { Grid } from '@material-ui/core'
import { Person } from '@material-ui/icons'

interface UserPersonForm {
  firstName: string
  lastName: string
  ssid: string
}

const blankUserPersonForm: UserPersonForm = {
  firstName: '',
  lastName: '',
  ssid: ''
}

interface UserDependentForm extends UserPersonForm {
  relationship: string
  birthYear: string
  isStudent: boolean
  numberOfMonths: string
}

const blankUserDependentForm: UserDependentForm = {
  ...blankUserPersonForm,
  relationship: '',
  birthYear: '',
  isStudent: false,
  numberOfMonths: ''
}

const toDependent = (formData: UserDependentForm): Dependent => {
  const { birthYear, numberOfMonths, isStudent, ...rest } = formData

  return {
    ...rest,
    role: PersonRole.DEPENDENT,
    qualifyingInfo: {
      birthYear: parseInt(birthYear),
      numberOfMonths: parseInt(numberOfMonths),
      isStudent
    }
  }
}

const toDependentForm = (dependent: Dependent): UserDependentForm => {
  const { qualifyingInfo, ...rest } = dependent

  return {
    ...rest,
    birthYear: qualifyingInfo?.birthYear.toString() ?? '',
    numberOfMonths: qualifyingInfo?.numberOfMonths.toString() ?? '',
    isStudent: qualifyingInfo?.isStudent ?? false
  }
}

interface UserSpouseForm extends UserPersonForm {
  isTaxpayerDependent: boolean
}

const blankUserSpouseForm = {
  ...blankUserPersonForm,
  isTaxpayerDependent: false
}

const toSpouse = (formData: UserSpouseForm): Spouse => ({
  ...formData,
  role: PersonRole.SPOUSE
})

const toSpouseForm = (spouse: Spouse): UserSpouseForm => ({
  ...spouse
})

export const AddDependentForm = (): ReactElement => {
  const dependents = useSelector(
    (state: TaxesState) => state.information.taxPayer?.dependents ?? []
  )

  const dispatch = useDispatch()

  const methods = useForm<UserDependentForm>({
    defaultValues: blankUserDependentForm
  })

  const onSubmitAdd = (formData: UserDependentForm): void => {
    dispatch(addDependent(toDependent(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: UserDependentForm): void => {
      dispatch(editDependent({ index, value: toDependent(formData) }))
    }

  const page = (
    <FormListContainer<UserDependentForm>
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
          label="Birth Year"
          patternConfig={Patterns.year}
          name="birthYear"
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
  const methods = useForm<UserSpouseForm>({
    defaultValues: blankUserSpouseForm
  })
  const { getValues } = methods
  const dispatch = useDispatch()

  const spouse: Spouse | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  const onSubmit = (): void => {
    dispatch(addSpouse(toSpouse(getValues())))
  }

  const onSubmitEdit = (): (() => void) => onSubmit

  const page = (
    <FormListContainer
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
        <PersonFields>
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

const SpouseAndDependent = (): ReactElement => {
  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const { onAdvance, navButtons } = usePager()

  const methods = useForm<{ filingStatus: FilingStatus }>({
    defaultValues: { filingStatus: taxPayer.filingStatus }
  })

  const { handleSubmit } = methods

  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const onSubmit =
    (onAdvance: () => void) =>
    (formData: { filingStatus: FilingStatus }): void => {
      dispatch(saveFilingStatusInfo(formData.filingStatus))
      onAdvance()
    }

  const page = (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit(onAdvance))}>
      <h2>Family Information</h2>
      <h3>Spouse Information</h3>
      <SpouseInfo />

      <h3>Dependent Information</h3>
      <AddDependentForm />

      <Grid container spacing={2}>
        <GenericLabeledDropdown<FilingStatus>
          label="Filing Status"
          dropDownData={filingStatuses(taxPayer)}
          valueMapping={(x) => x}
          keyMapping={(x, i) => i}
          textMapping={(status) => FilingStatusTexts[status]}
          name="filingStatus"
        />
      </Grid>
      {navButtons}
    </form>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

export default SpouseAndDependent
