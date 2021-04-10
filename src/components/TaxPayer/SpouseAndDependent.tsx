import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Box, Button, List } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledCheckBox, LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { TaxesState, Dependent, Person, PersonRole } from '../../redux/data'
import { addDependent, addSpouse, removeSpouse } from '../../redux/actions'
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

const toSpouse = (formData: UserPersonForm): Person => ({
  ...formData,
  role: PersonRole.SPOUSE
})

export const AddDependentForm = (): ReactElement => {
  const { register, errors, handleSubmit, control, getValues, reset } = useForm<UserDependentForm>()

  const [adding, updateAdding] = useState(false)

  const dispatch = useDispatch()

  const [isStudent, updateIsStudent] = useState(false)

  const clear = (): void => {
    updateAdding(false)
    reset()
  }

  const onSubmit = (): void => {
    dispatch(addDependent(toDependent({ ...getValues(), isStudent })))
    clear()
  }

  if (adding) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={clear}
      >
        <PersonFields
          register={register}
          errors={errors}
          control={control}
        />
        <LabeledInput
          label="Relationship to taxpayer"
          register={register}
          name="relationship"
          required={true}
          error={errors.relationship}
        />
        <LabeledInput
          register={register}
          label="Birth year"
          patternConfig={Patterns.year(control)}
          name="birthYear"
          required={true}
          error={errors.birthYear}
        />
        <LabeledInput
          register={register}
          label="How many months did you live together this year?"
          patternConfig={Patterns.numMonths(control)}
          name="numberOfMonths"
          required={true}
          error={errors.numberOfMonths}
        />
        <LabeledCheckBox
          label="Is this person a full-time student"
          name="isStudent"
          control={control}
          value={isStudent}
          setValue={updateIsStudent}
        />
      </FormContainer>
    )
  } else {
    return (
      <Box display="flex" justifyContent="flex-start">
        <Button type="button" onClick={() => updateAdding(true)} variant="contained" color="secondary">
          Add
        </Button>
      </Box>
    )
  }
}

export const SpouseInfo = (): ReactElement => {
  const { register, control, errors, handleSubmit, getValues } = useForm<UserPersonForm>()
  const [editSpouse, updateEditSpouse] = useState(false)
  const dispatch = useDispatch()

  const spouse: Person | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  const onSubmit = (): void => {
    updateEditSpouse(false)
    dispatch(addSpouse(toSpouse(getValues())))
  }

  if (editSpouse) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={() => updateEditSpouse(false)}
      >
        <PersonFields
          register={register}
          errors={errors}
          control={control}
        />
      </FormContainer>
    )
  } else if (spouse !== undefined) {
    return (
      <List dense={true}>
        <PersonListItem
          person={spouse}
          remove={() => dispatch(removeSpouse)}
        />
      </List>
    )
  } else {
    return (
      <Box display="flex" flexDirection="flex-start">
        <Button type="button" onClick={() => updateEditSpouse(true)} variant="contained" color="secondary">
          Add
        </Button>
      </Box>
    )
  }
}

const SpouseAndDependent = (): ReactElement => (
  <PagerContext.Consumer>
    { ({ onAdvance, navButtons }) =>
      <Box display="flex" justifyContent="center">
        <form onSubmit={onAdvance}>
          <Box display="flex" justifyContent="flex-start">
            <h2>Spouse Information</h2>
          </Box>
          <SpouseInfo />
          <Box display="flex" justifyContent="flex-start">
            <h2>Dependent Information</h2>
          </Box>
          <ListDependents />
          <AddDependentForm />
          {navButtons}
        </form>
      </Box>
    }
  </PagerContext.Consumer>
)

export default SpouseAndDependent
