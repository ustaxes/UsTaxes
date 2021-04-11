import React, { ReactElement, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Box, Button, List } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput, LabeledCheckbox } from '../input'
import { TaxesState, Dependent, Spouse, PersonRole } from '../../redux/data'
import { addDependent, addSpouse, removeSpouse } from '../../redux/actions'
import { ListDependents, PersonFields, PersonListItem, UserPersonForm } from './PersonFields'
import FormContainer from './FormContainer'
import { PagerContext } from '../pager'

interface UserDependentForm extends UserPersonForm {
  relationship: string
}

interface UserSpouseForm extends UserPersonForm {
  isTaxpayerDependent: boolean
}

const toDependent = (formData: UserDependentForm): Dependent => ({
  ...formData,
  role: PersonRole.DEPENDENT
})

const toSpouse = (formData: UserSpouseForm): Spouse => ({
  ...formData,
  role: PersonRole.SPOUSE
})

export const AddDependentForm = (): ReactElement => {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,

    formState: {
      errors
    }
  } = useForm<UserDependentForm>()

  const [adding, updateAdding] = useState(false)

  const dispatch = useDispatch()

  const clear = (): void => {
    updateAdding(false)
    reset()
  }

  const onSubmit = (): void => {
    dispatch(addDependent(toDependent(getValues())))
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
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: {
      errors
    }
  } = useForm<UserSpouseForm>()

  const [editSpouse, updateEditSpouse] = useState(false)
  const dispatch = useDispatch()

  const spouse: Spouse | undefined = useSelector((state: TaxesState) => {
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
