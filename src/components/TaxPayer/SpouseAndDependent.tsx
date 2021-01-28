import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Box, Button, List } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from '../input'
import { Errors } from '../types'
import { Patterns } from '../Patterns'
import { TaxesState, Dependent, Person } from '../../redux/data'
import { addDependent, addSpouse, removeSpouse } from '../../redux/actions'
import { ListDependents, PersonFields, PersonListItem } from './PersonFields'
import FormContainer from './FormContainer'
import { PagedFormProps } from '../pager'

export const AddDependentForm = (): ReactElement => {
  const { register, errors, handleSubmit, getValues, reset } = useForm<Dependent>()

  const [addingDependent, newDependent] = useState(false)

  const dispatch = useDispatch()

  const onSubmit = (): void => {
    dispatch(addDependent(getValues()))
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
          errors={errors as Errors}
        />
        <LabeledInput
          label="Relationship to taxpayer"
          register={register}
          name="relationship"
          patternConfig={Patterns.name}
          required={true}
          errors={errors as Errors}
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
  const { register, errors, handleSubmit, getValues } = useForm<Person>()
  const [editSpouse, updateEditSpouse] = useState(false)
  const dispatch = useDispatch()

  const spouse: Person | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  const onSubmit = (): void => {
    updateEditSpouse(false)
    dispatch(addSpouse(getValues()))
  }

  if (editSpouse) {
    return (
      <FormContainer
        onDone={handleSubmit(onSubmit)}
        onCancel={() => updateEditSpouse(false)}
      >
        <PersonFields
          register={register}
          errors={errors as Errors}
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

export default function SpouseAndDependent ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  return (
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
  )
}
