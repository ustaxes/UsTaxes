import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Box, Button, List } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from '../input'
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
}

const toDependent = (formData: UserDependentForm): Dependent => ({
  ...formData,
  role: PersonRole.DEPENDENT
})

const toSpouse = (formData: UserPersonForm): Person => ({
  ...formData,
  role: PersonRole.SPOUSE
})

export const AddDependentForm = (): ReactElement => {
  const { register, control, errors, handleSubmit, getValues, reset } = useForm<UserDependentForm>()

  const [addingDependent, newDependent] = useState(false)

  console.log(getValues())

  const dispatch = useDispatch()

  const onSubmit = (): void => {
    dispatch(addDependent(toDependent(getValues())))
    reset()
  }

  if (addingDependent) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={() => newDependent(false)}
      >
        <PersonFields
          register={register}
          errors={errors}
          person={null}
          control={control}
        />
        <LabeledInput
          label="Relationship to taxpayer"
          register={register}
          name="relationship"
          required={true}
          error={errors.relationship}
        />
      </FormContainer>
    )
  } else {
    return (
      <Box display="flex" justifyContent="flex-start">
        <Button type="button" onClick={() => newDependent(true)} variant="contained" color="secondary">
          Add
        </Button>
      </Box>
    )
  }
}

export const SpouseInfo = (): ReactElement => {
  const { register, control, errors, handleSubmit, getValues } = useForm<UserPersonForm>()
  const [editSpouse, setEditSpouse] = useState<boolean>(false)
  const [createSpouse, setCreateSpouse] = useState<boolean>(false)
  const dispatch = useDispatch()

  const spouse: Person | undefined = useSelector((state: TaxesState) => {
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

  if (createSpouse) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={() => setCreateSpouse(false)}
      >
        <PersonFields
          register={register}
          errors={errors}
          person={editSpouse ? spouse : null}
          control={control}
        />
      </FormContainer>
    )
  } else if (!editSpouse && spouse !== undefined) {
    return (
      <List dense={true}>
        <PersonListItem
          person={spouse}
          edit={() => setEditSpouse(() => true)}
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
        <PersonFields
          register={register}
          errors={errors}
          person={spouse}
          control={control}
        />
      </FormContainer>
    )
  } else {
    return (
      <Box display="flex" flexDirection="flex-start">
        <Button type="button" onClick={() => setCreateSpouse(true)} variant="contained" color="secondary">
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
