import React, { ReactElement, useState } from 'react'

import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Patterns } from '../Patterns'
import { formatSSID, GenericLabeledDropdown } from '../input'
import { TaxesState, TaxPayer, Dependent, Spouse, PersonRole, FilingStatus, FilingStatusTexts, filingStatuses } from '../../redux/data'
import { addDependent, addSpouse, editDependent, removeDependent, removeSpouse, saveFilingStatusInfo } from '../../redux/actions'
import { PersonFields } from './PersonFields'
import { FormListContainer } from '../FormContainer'
import { PagerContext } from '../pager'
import { Person } from '@material-ui/icons'
import { field, Fields } from '../Fields'

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

const fields = [
  field('Relationship to Taxpayer', 'relationship', Patterns.name),
  field('Birth Year', 'birthYear', Patterns.year),
  field('How many months did you live together this year?', 'numberOfMonths', Patterns.numMonths),
  field('Is this person a full-time student?', 'isStudent', undefined, 'checkbox')
]

const spouseDependent = field('Check if your spouse is a dependent', 'isTaxpayerDependent', undefined, 'checkbox')

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
  const dependents = useSelector((state: TaxesState) =>
    state.information.taxPayer?.dependents ?? []
  )

  const [editing, doSetEditing] = useState<number | undefined>(undefined)
  const dispatch = useDispatch()

  const methods = useForm<UserDependentForm>()
  const { handleSubmit, reset } = methods

  const setEditing = (idx: number): void => {
    reset(toDependentForm(dependents[idx]))
    doSetEditing(idx)
  }

  const _onSubmit = (onSuccess: () => void) => (dependent: UserDependentForm): void => {
    if (editing !== undefined) {
      dispatch(editDependent({ index: editing, value: toDependent(dependent) }))
      clear()
    } else {
      dispatch(addDependent(toDependent(dependent)))
    }
    onSuccess()
    reset()
  }

  const clear = (): void => {
    doSetEditing(undefined)
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
      <PersonFields />
      <Fields fields={fields} />
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
      <PersonFields>
        <Fields fields={[spouseDependent]} />
      </PersonFields>
    </FormListContainer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

const SpouseAndDependent = (): ReactElement => {
  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const methods = useForm<{ filingStatus: FilingStatus }>({ defaultValues: { filingStatus: taxPayer.filingStatus } })
  const { handleSubmit } = methods
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const onSubmit = (onAdvance: () => void) => (formData: {filingStatus: FilingStatus}): void => {
    dispatch(saveFilingStatusInfo(formData.filingStatus))
    onAdvance()
  }

  const page = (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <h2>Family Information</h2>

          <strong><p>Spouse Information</p></strong>
          <SpouseInfo />

          <strong><p>Dependent Information</p></strong>
          <AddDependentForm />

          <GenericLabeledDropdown<FilingStatus>
            label=""
            strongLabel="Filing Status"
            dropDownData={filingStatuses(taxPayer)}
            valueMapping={(x, i) => x}
            keyMapping={(x, i) => i}
            textMapping={status => FilingStatusTexts[status]}
            name="filingStatus"
          />
          {navButtons}
        </form>
      }
    </PagerContext.Consumer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

export default SpouseAndDependent
