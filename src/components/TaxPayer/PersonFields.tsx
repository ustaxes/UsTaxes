import React, { ReactElement, ReactNode } from 'react'
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { Actions, removeDependent } from '../../redux/actions'
import { TaxesState, Person } from '../../redux/data'
import { BaseFormProps } from '../types'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'
import { DeepMap, FieldError } from 'react-hook-form'

interface PersonFieldsProps<T extends Person> extends BaseFormProps {
  defaults?: T
  children?: ReactNode
  errors: DeepMap<Partial<Person>, FieldError>
  person?: Person | null | undefined
}

export const PersonFields = <T extends Person>({ register, errors, defaults, children, person }: PersonFieldsProps<T>): ReactElement => (
  <div>
    <LabeledInput
      label="First Name and Initial"
      aria-label="First Name and Initial"
      register={register}
      name="firstName"
      patternConfig={Patterns.name}
      required={true}
      error={errors.firstName}
      defaultValue={(person !== null) ? person?.firstName : defaults?.firstName}
    />
    <LabeledInput
      label="Last Name"
      aria-label="Last Name"
      register={register}
      name="lastName"
      patternConfig={Patterns.name}
      required={true}
      error={errors.lastName}
      defaultValue={(person !== null) ? person?.lastName : defaults?.lastName}
    />
    <LabeledInput
      label="SSN / TIN"
      aria-label="Social Security Number or Tax Identification Number"
      register={register}
      name="ssid"
      patternConfig={Patterns.ssn}
      required={true}
      error={errors.ssid}
      defaultValue={(person !== null) ? person?.ssid : defaults?.ssid}
    />
    {children}
  </div>
)

interface PersonListItemProps {
  person: Person
  remove: () => void
  edit?: () => void
}

export const PersonListItem = ({ person, remove, edit }: PersonListItemProps): ReactElement => (
  <ListItem>
    <ListItemIcon>
      <PersonIcon />
    </ListItemIcon>
    <ListItemText
      primary={`${person.firstName} ${person.lastName}`}
      secondary={person.ssid}
    />
    <ListItemIcon>
      <IconButton onClick={edit} edge="end" aria-label="edit">
        <EditIcon />
      </IconButton>
    </ListItemIcon>
    <ListItemSecondaryAction>
      <IconButton onClick={remove} edge="end" aria-label="delete">
        <DeleteIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
)

export function ListDependents (): ReactElement {
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
