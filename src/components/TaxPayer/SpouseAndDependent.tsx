import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Patterns } from '../Patterns'
import { LabeledInput, LabeledCheckbox, formatSSID } from '../input'
import { TaxesState, Dependent, Spouse, PersonRole } from '../../redux/data'
import { addDependent, addSpouse, editDependent, removeDependent, removeSpouse } from '../../redux/actions'
import { PersonFields } from './PersonFields'
import { FormListContainer } from '../FormContainer'
import { PagerContext } from '../pager'
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

export const AddDependentForm = (): ReactElement => {
  const { register, errors, handleSubmit, control, reset } = useForm<UserDependentForm>()

  const dependents = useSelector((state: TaxesState) =>
    state.information.taxPayer?.dependents ?? []
  )

  const [editing, setEditingIdx] = useState<number | undefined>(undefined)
  const dispatch = useDispatch()

  const defaultValues: UserDependentForm | undefined = (() => {
    if (editing !== undefined) {
      return toDependentForm(dependents[editing])
    }
  })()

  const _onSubmit = (onSuccess: () => void) => (dependent: UserDependentForm): void => {
    if (editing !== undefined) {
      dispatch(editDependent({ index: editing, value: toDependent(dependent) }))
      setEditingIdx(undefined)
    } else {
      dispatch(addDependent(toDependent(dependent)))
    }
    onSuccess()
    reset()
  }

  const clear = (): void => {
    setEditingIdx(undefined)
    reset()
  }

  return (
    <FormListContainer
      onDone={(onSuccess) => handleSubmit(_onSubmit(onSuccess))}
      onCancel={clear}
      items={dependents}
      primary={(a) => `${a.firstName} ${a.lastName}`}
      secondary={(a) => formatSSID(a.ssid)}
      editItem={setEditingIdx}
      editing={editing}
      icon={() => <Person />}
      removeItem={(i) => dispatch(removeDependent(i))}
    >
      <PersonFields
        register={register}
        errors={errors}
        control={control}
        defaults={defaultValues !== undefined ? toDependent(defaultValues) : undefined}
      />
      <LabeledInput
        label="Relationship to Taxpayer"
        register={register}
        name="relationship"
        required={true}
        patternConfig={Patterns.name}
        error={errors.relationship}
        defaultValue={defaultValues?.relationship}
      />
      <LabeledInput
        register={register}
        label="Birth Year"
        patternConfig={Patterns.year(control)}
        name="birthYear"
        required={true}
        error={errors.birthYear}
        defaultValue={defaultValues?.birthYear}
      />
      <LabeledInput
        register={register}
        label="How many months did you live together this year?"
        patternConfig={Patterns.numMonths(control)}
        name="numberOfMonths"
        required={true}
        error={errors.numberOfMonths}
        defaultValue={defaultValues?.numberOfMonths}
      />
      <LabeledCheckbox
        label="Is this person a full-time student?"
        name="isStudent"
        control={control}
        defaultValue={defaultValues?.isStudent ?? false}
      />
    </FormListContainer>
  )
}

export const SpouseInfo = (): ReactElement => {
  const { register, control, errors, handleSubmit, getValues } = useForm<UserSpouseForm>()
  const [editSpouse, setEditSpouse] = useState<boolean>(false)
  const dispatch = useDispatch()

  const spouse: Spouse | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  const onDisable = (): void => {
    setEditSpouse(false)
  }

  const onSubmit = (onSuccess: () => void) => (): void => {
    dispatch(addSpouse(toSpouse(getValues())))
    setEditSpouse(false)
    onSuccess()
  }

  return (
    <FormListContainer
      items={spouse !== undefined ? [spouse] : []}
      primary={(s) => `${s.firstName} ${s.lastName}`}
      secondary={(s) => formatSSID(s.ssid)}
      icon={() => <Person />}
      onDone={(onSuccess) => handleSubmit(onSubmit(onSuccess))}
      onCancel={onDisable}
      max={1}
      editItem={() => setEditSpouse(true)}
      editing={editSpouse ? 0 : undefined}
      removeItem={() => dispatch(removeSpouse)}
    >
      <PersonFields
        register={register}
        errors={errors}
        person={spouse}
        control={control}
      >
        <LabeledCheckbox
          label="Check if your spouse is a dependent"
          control={control}
          defaultValue={spouse?.isTaxpayerDependent ?? false}
          name="isTaxpayerDependent"
        />
      </PersonFields>
    </FormListContainer>
  )
}

const SpouseAndDependent = (): ReactElement => {
  return (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={onAdvance}>
          <h2>Spouse Information</h2>
          <SpouseInfo />
          <h2>Dependent Information</h2>
          <AddDependentForm />
          {navButtons}
        </form>
      }
    </PagerContext.Consumer>
  )
}

export default SpouseAndDependent
