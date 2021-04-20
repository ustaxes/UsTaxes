import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Button, List } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Patterns } from '../Patterns'
import { LabeledInput, LabeledCheckbox } from '../input'
import { TaxesState, Dependent, Spouse, PersonRole } from '../../redux/data'
import { addDependent, addSpouse, editDependent, removeSpouse } from '../../redux/actions'
import { ListDependents, PersonFields, PersonListItem } from './PersonFields'
import FormContainer from './FormContainer'
import { PagerContext } from '../pager'

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

interface AddDependentFormProps {
  onSubmit: (d: Dependent) => void
  defaultValues?: UserDependentForm
  setOpen: (open: boolean) => void
  open: boolean
}

export const AddDependentForm = ({ defaultValues, onSubmit, setOpen, open = false }: AddDependentFormProps): ReactElement => {
  const { register, errors, handleSubmit, control, getValues, reset } = useForm<UserDependentForm>()

  const clear = (): void => {
    setOpen(false)
    reset()
  }

  const _onSubmit = (): void => {
    onSubmit(toDependent({ ...getValues() }))
    clear()
  }

  if (open) {
    return (
      <FormContainer
        onDone={handleSubmit(_onSubmit)}
        onCancel={clear}
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
      </FormContainer>
    )
  } else {
    return (
      <Button type="button" onClick={() => setOpen(true)} variant="contained" color="secondary">
        Add
      </Button>
    )
  }
}

export const SpouseInfo = (): ReactElement => {
  const { register, control, errors, handleSubmit, getValues } = useForm<UserSpouseForm>()
  const [editSpouse, setEditSpouse] = useState<boolean>(false)
  const [createSpouse, setCreateSpouse] = useState<boolean>(false)
  const dispatch = useDispatch()

  const spouse: Spouse | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  const onDisable = (): void => {
    setCreateSpouse(false)
    setEditSpouse(false)
  }

  const onSubmit = (): void => {
    dispatch(addSpouse(toSpouse(getValues())))
    setCreateSpouse(false)
    setEditSpouse(false)
  }

  const spouseFields = (
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
  )

  if (createSpouse) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={() => setCreateSpouse(false)}
      >
        {spouseFields}
      </FormContainer>
    )
  } else if (!editSpouse && spouse !== undefined) {
    return (
      <List dense={true}>
        <PersonListItem
          person={spouse}
          onEdit={() => setEditSpouse(() => true)}
          remove={() => dispatch(removeSpouse)}
        />
      </List>
    )
  } else if (editSpouse && spouse !== undefined) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={onDisable}
      >
        {spouseFields}
      </FormContainer>
    )
  }
  return (
    <Button type="button" onClick={() => setCreateSpouse(true)} variant="contained" color="secondary">
      Add
    </Button>
  )
}

const SpouseAndDependent = (): ReactElement => {
  const dependents = useSelector((state: TaxesState) =>
    state.information.taxPayer?.dependents ?? []
  )

  const [editing, setEditingIdx] = useState<number | undefined>(undefined)
  const [dependentOpen, setDependentOpen] = useState<boolean>(false)
  const dispatch = useDispatch()

  const onSubmit = (dependent: Dependent): void => {
    if (editing !== undefined) {
      dispatch(editDependent({ index: editing, dependent }))
      setEditingIdx(undefined)
    } else {
      dispatch(addDependent(dependent))
    }
  }

  const dependentsList: ReactElement | undefined = (() => {
    if (dependents.length > 0) {
      return (
        <ListDependents onEdit={(i) => { setDependentOpen(true); setEditingIdx(i) }} editing={editing} />
      )
    }
  })()

  return (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={onAdvance}>
          <h2>Spouse Information</h2>
          <SpouseInfo />
          <h2>Dependent Information</h2>
          {dependentsList}
          <AddDependentForm
            onSubmit={onSubmit}
            defaultValues={editing !== undefined ? toDependentForm(dependents[editing]) : undefined}
            open={dependentOpen}
            setOpen={(v) => { setDependentOpen(v); setEditingIdx(undefined) }}
          />
          {navButtons}
        </form>
      }
    </PagerContext.Consumer>
  )
}

export default SpouseAndDependent
