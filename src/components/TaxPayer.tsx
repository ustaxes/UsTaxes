import React, { FormEvent, ReactElement, useState } from 'react'
import { Control, useForm } from 'react-hook-form'
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { GenericLabeledDropdown, LabeledInput } from './input'
import { Patterns } from './Patterns'
import { Actions, addDependent, addSpouse, removeDependent, removeSpouse, saveTaxpayerInfo } from '../redux/actions'
import { PagedFormProps } from './pager'
import { TaxesState, TaxPayer, Person, filingStatuses, FilingStatusTexts, FilingStatus } from '../redux/data'
import { BaseFormProps, Errors } from './types'
import DeleteIcon from '@material-ui/icons/Delete'
import ListItemText from '@material-ui/core/ListItemText'
import { id } from './input/types'

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
      <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
        <Box paddingRight={2}>
          <Button type="button" onClick={onSubmit} variant="contained" color="secondary">
            Add
          </Button>
        </Box>
        <Button type="button" onClick={cancel} variant="contained" color="secondary">
          Close
        </Button>
      </Box>
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

const AddDependentForm = (): ReactElement => {
  const [addingDependent, newDependent] = useState(false)

  const dispatch = useDispatch()

  if (addingDependent) {
    return (
      <AddOtherPerson
        onDone={(newDep: Person) => dispatch(addDependent(newDep))}
        onCancel={() => newDependent(false)}
      />
    )
  } else {
    return (
      <Button type="button" onClick={() => newDependent(true)} variant="contained" color="secondary">
        Add
      </Button>
    )
  }
}

const SpouseInfo = (): ReactElement => {
  const [editSpouse, updateEditSpouse] = useState(false)
  const dispatch = useDispatch()

  const spouse: Person | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer?.spouse
  })

  if (editSpouse) {
    return (
      <AddOtherPerson
        onDone={(newSpouse: Person) => {
          updateEditSpouse(false)
          dispatch(addSpouse(newSpouse))
        }}
        onCancel={() => updateEditSpouse(false)}
      />
    )
  } else if (spouse !== undefined) {
    return (
      <PersonListItem
        person={spouse}
        remove={() => dispatch(removeSpouse)}
      />
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

interface HasControl {
  control: Control<any>
}

const FilingStatusDropdown = ({ control }: HasControl): ReactElement => {
  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  return (
    <GenericLabeledDropdown<FilingStatus>
      label="Filing Status"
      dropDownData={filingStatuses(taxPayer)}
      valueMapping={id}
      keyMapping={id}
      textMapping={status => FilingStatusTexts[status]}
      required={true}
      control={control}
      name="filingStatus"
      defaultValue={taxPayer?.filingStatus}
    />
  )
}

export default function TaxPayerInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors, control } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const onSubmit = (formData: TaxPayer): void => {
    console.log('formData: ', formData)
    dispatch(saveTaxpayerInfo(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Box display="flex" justifyContent="flex-start">
            <h2>Taxpayer Information</h2>
          </Box>

          <h4>Primary Taxpayer Information</h4>
          <PersonFields namePrefix="primaryPerson." register={register} errors={errors} defaults={taxPayer?.primaryPerson} />
        </div>
        <div>
          <Box display="flex" justifyContent="flex-start">
            <h4>Spouse Taxpayer Information</h4>
          </Box>
          <SpouseInfo />
          <Box display="flex" justifyContent="flex-start">
            <h4>Dependent Information</h4>
          </Box>
          <Box display="flex" justifyContent="flex-start">
            <ListDependents />
          </Box>
          <Box display="flex" justifyContent="flex-start">
            <AddDependentForm />
          </Box>
        </div>
        <div>
          <h4>Family Contact Information</h4>
          <LabeledInput
            label="Contact phone number"
            register={register}
            required={true}
            patternConfig={Patterns.usPhoneNumber}
            name="contactPhoneNumber"
            defaultValue={taxPayer?.contactPhoneNumber}
            errors={errors}
          />

          <LabeledInput
            label="Contact email address"
            register={register}
            required={true}
            name="contactEmail"
            defaultValue={taxPayer?.contactEmail}
            errors={errors}
          />
        </div>
        <div>

          <Box display="flex" justifyContent="flex-start">
            <h4>Filing Status</h4>
          </Box>
          <FilingStatusDropdown control={control} />

        </div>
        <div>
          {navButtons}
        </div>
      </form>
    </Box>
  )
}
