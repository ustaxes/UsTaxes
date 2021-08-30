import React, { ReactElement, useState } from 'react'

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

interface UserDependentForm extends UserPersonForm {
  relationship: string
  birthYear: string
  isStudent: boolean
  numberOfMonths: string
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

  const [editing, doSetEditing] = useState<number | undefined>(undefined)
  const dispatch = useDispatch()

  const methods = useForm<UserDependentForm>()
  const { handleSubmit, reset } = methods

  const setEditing = (idx: number): void => {
    reset(toDependentForm(dependents[idx]))
    doSetEditing(idx)
  }

  const clear = (): void => {
    doSetEditing(undefined)
  }

  const _onSubmit =
    (onSuccess: () => void) =>
    (dependent: UserDependentForm): void => {
      if (editing !== undefined) {
        dispatch(
          editDependent({ index: editing, value: toDependent(dependent) })
        )
        clear()
      } else {
        dispatch(addDependent(toDependent(dependent)))
      }
      onSuccess()
      reset()
    }

  const page = (
    <FormListContainer
      onDone={(onSuccess) => handleSubmit(_onSubmit(onSuccess))}
      onCancel={clear}
      items={dependents}
      primary={(a) => `${a.firstName} ${a.lastName}`}
      secondary={(a) => formatSSID(a.ssid)}
      editItem={setEditing}
      editing={editing}
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
  const methods = useForm<UserSpouseForm>()
  const { handleSubmit, getValues, reset } = methods
  const [editing, doSetEditing] = useState<boolean>(false)
  const dispatch = useDispatch()

  const spouse: Spouse | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  const clear = (): void => {
    reset()
    doSetEditing(false)
  }

  const setEditing = (): void => {
    if (spouse !== undefined) {
      reset(toSpouseForm(spouse))
    }
    doSetEditing(true)
  }

  const onSubmit = (onSuccess: () => void) => (): void => {
    dispatch(addSpouse(toSpouse(getValues())))
    doSetEditing(false)
    onSuccess()
  }

  const page = (
    <FormListContainer
      items={spouse !== undefined ? [spouse] : []}
      primary={(s) => `${s.firstName} ${s.lastName}`}
      secondary={(s) => formatSSID(s.ssid)}
      icon={() => <Person />}
      onDone={(onSuccess) => handleSubmit(onSubmit(onSuccess))}
      onCancel={clear}
      max={1}
      editItem={() => setEditing()}
      editing={editing ? 0 : undefined}
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
    <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
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
