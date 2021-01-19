import React, { FormEvent, ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from './input'
import { Patterns } from './Patterns'
import { Actions, addDependent, addSpouse, removeDependent, removeSpouse, saveTaxpayerInfo } from '../redux/actions'
import { PagedFormProps } from './pager'
import { TaxesState, TaxPayer, Person } from '../redux/data'
import { BaseFormProps, Errors } from './types'
import DeleteIcon from '@material-ui/icons/Delete'
import ListItemText from '@material-ui/core/ListItemText'

interface PersonFieldsProps extends BaseFormProps {
  defaults?: Person
  namePrefix?: string
}

const PersonFields = ({ register, errors, defaults, namePrefix = '' }: PersonFieldsProps): ReactElement => (
  <div>
    <LabeledInput
      label="First Name and Initial"
      register={register}
      name={`${namePrefix}firstName`}
      patternConfig={Patterns.name}
      required={true}
      errors={errors}
      defaultValue={defaults?.firstName}
    />
    <LabeledInput
      label="Last Name"
      register={register}
      name={`${namePrefix}lastName`}
      patternConfig={Patterns.name}
      required={true}
      errors={errors}
      defaultValue={defaults?.lastName}
    />
    <LabeledInput
      label="SSN / TIN"
      register={register}
      name={`${namePrefix}ssid`}
      patternConfig={Patterns.ssn}
      required={true}
      errors={errors}
      defaultValue={defaults?.ssid}
    />
  </div>
)

interface AddPersonProps {
  onDone: (p: Person) => void
  onCancel: () => void
}

function AddOtherPerson ({ onDone, onCancel }: AddPersonProps): ReactElement {
  const { register, errors, getValues, reset } = useForm<Person>()

  const onSubmit = (e: FormEvent<any>): void => {
    onDone(getValues())
    reset()
  }

  const cancel = (): void => {
    reset()
    onCancel()
  }

  return (
    <div>
      <PersonFields register={register} errors={errors as Errors} />
      <Box paddingRight={2}>
        <Button type="button" onClick={onSubmit} variant="contained" color="secondary">
          Add
        </Button>
      </Box>
      <Button type="button" onClick={cancel} variant="contained" color="secondary">
        Close
      </Button>
    </div>
  )
}

interface PersonListItemProps {
  person: Person
  remove: () => void
}

const PersonListItem = ({ person, remove }: PersonListItemProps): ReactElement => (
  <ListItem>
    <ListItemAvatar>
      <Avatar>
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={`${person.firstName} ${person.lastName}`}
      secondary={person.ssid}
    />
    <ListItemSecondaryAction>
      <IconButton onClick={remove} edge="end" aria-label="delete">
        <DeleteIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
)

function ListDependents (): ReactElement {
  const dependents = useSelector((state: TaxesState) =>
    state.information.taxPayer?.dependents ?? []
  )

  const dispatch = useDispatch()

  const drop = (i: number): Actions => dispatch(removeDependent(i))

  return (
    <List dense={true}>
      {
        dependents.map((p, i) =>
          <PersonListItem key={i} remove={() => drop(i)} person={p} />
        )
      }
    </List>
  )
}

export default function TaxPayerInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const [editSpouse, updateEditSpouse] = useState(false)
  const [addingDependent, newDependent] = useState(false)

  let newDependentForm
  if (addingDependent) {
    newDependentForm = (
      <AddOtherPerson
        onDone={(newDep: Person) => dispatch(addDependent(newDep))}
        onCancel={() => newDependent(false)}
      />
    )
  } else {
    newDependentForm = (
      <Button type="button" onClick={() => newDependent(true)} variant="contained" color="secondary">
        Add
      </Button>
    )
  }

  // component functions
  const onSubmit = (formData: TaxPayer): void => {
    console.log('formData: ', formData)
    dispatch(saveTaxpayerInfo(formData))
    onAdvance()
  }

  let spouseInfo
  if (editSpouse) {
    spouseInfo = (
      <Box>
        <AddOtherPerson
          onDone={(newSpouse: Person) => {
            updateEditSpouse(false)
            dispatch(addSpouse(newSpouse))
          }}
          onCancel={() => updateEditSpouse(false)}
        />
      </Box>
    )
  } else if (prevFormData?.spouse !== undefined) {
    spouseInfo = (
      <Box>
        <PersonListItem
          person={prevFormData.spouse}
          remove={() => dispatch(removeSpouse)}
        />
      </Box>
    )
  } else {
    spouseInfo = (
      <Box>
        <Box>
          No spouse.
        </Box>
        <Button type="button" onClick={() => updateEditSpouse(true)} variant="contained" color="secondary">
          Add
        </Button>
      </Box>
    )
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Taxpayer Information</h2>
        </Box>

        <h4>Primary Taxpayer Information</h4>
        <PersonFields namePrefix="primaryPerson." register={register} errors={errors} defaults={prevFormData?.primaryPerson} />

        <h4>Spouse Taxpayer Information</h4>
        {spouseInfo}

        <h4>Dependent Information</h4>
        <ListDependents />
        {newDependentForm}

        <h4>Family Contact Information</h4>
        <LabeledInput
          label="Contact phone number"
          register={register}
          required={true}
          patternConfig={Patterns.usPhoneNumber}
          name="contactPhoneNumber"
          defaultValue={prevFormData?.contactPhoneNumber}
          errors={errors}
        />

        <LabeledInput
          label="Contact email address"
          register={register}
          required={true}
          name="contactEmail"
          defaultValue={prevFormData?.contactEmail}
          errors={errors}
        />

        <Box display="flex" justifyContent="flex-start">
          <h2>Filing Status</h2>
        </Box>

        {navButtons}
      </form>
    </Box>
  )
}
