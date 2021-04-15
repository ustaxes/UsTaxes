import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Box, Button, List } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Patterns } from '../Patterns'
import { LabeledInput, LabeledCheckbox } from '../input'
import { TaxesState, Dependent, Spouse, PersonRole } from '../../redux/data'
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

interface UserSpouseForm extends UserPersonForm {
  isTaxpayerDependent: boolean
}

const toSpouse = (formData: UserSpouseForm): Spouse => ({
  ...formData,
  role: PersonRole.SPOUSE
})

export const AddDependentForm = (): ReactElement => {
  const { register, errors, handleSubmit, control, getValues, reset } = useForm<UserDependentForm>()

  const [adding, updateAdding] = useState(false)

  const dispatch = useDispatch()

  const clear = (): void => {
    updateAdding(false)
    reset()
  }

  const onSubmit = (): void => {
    dispatch(addDependent(toDependent({ ...getValues() })))
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
        <LabeledCheckbox
          label="Is this person a full-time student"
          name="isStudent"
          control={control}
          defaultValue={false}
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
        >
          <LabeledCheckbox
            label="Check if your spouse is a dependent"
            control={control}
            defaultValue={spouse?.isTaxpayerDependent}
            name="isTaxpayerDependent"
          />
        </PersonFields>
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
