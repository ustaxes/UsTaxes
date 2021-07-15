import React, { ReactElement, ReactNode } from 'react'
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { formatSSID, LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { Actions, removeDependent } from '../../redux/actions'
import { TaxesState, Person } from '../../redux/data'
import { BaseFormProps } from '../types'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'
import { DeepMap, FieldError } from 'react-hook-form'
import { If } from 'react-if'

interface PersonFieldsProps extends BaseFormProps {
  children?: ReactNode
  errors: DeepMap<Partial<Person>, FieldError>
}

export const PersonFields = ({ errors, children }: PersonFieldsProps): ReactElement => (
  <div>
    <LabeledInput
      label="First Name and Initial"
      name="firstName"
      patternConfig={Patterns.name}
      error={errors.firstName}
    />
    <LabeledInput
      label="Last Name"
      name="lastName"
      patternConfig={Patterns.name}
      error={errors.lastName}
    />
    <LabeledInput
      label="SSN / TIN"
      name="ssid"
      patternConfig={Patterns.ssn}
      error={errors.ssid}
    />
    {children}
  </div>
)

interface PersonListItemProps {
  person: Person
  remove: () => void
  onEdit?: () => void
  editing?: boolean
}

export const PersonListItem = ({ person, remove, onEdit, editing = false }: PersonListItemProps): ReactElement => (
  <ListItem className={editing ? 'active' : ''}>
    <ListItemIcon>
      <PersonIcon />
    </ListItemIcon>
    <ListItemText
      primary={`${person.firstName} ${person.lastName}`}
      secondary={formatSSID(person.ssid)}
    />
    <If condition={editing !== undefined}>
      <ListItemIcon>
        <IconButton onClick={onEdit} edge="end" aria-label="edit">
          <EditIcon />
        </IconButton>
      </ListItemIcon>
    </If>
    <ListItemSecondaryAction>
      <IconButton onClick={remove} edge="end" aria-label="delete">
        <DeleteIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
)

interface ListDependentsProps {
  onEdit?: (index: number) => void
  editing?: number
}

export function ListDependents ({ onEdit, editing }: ListDependentsProps): ReactElement {
  const dependents = useSelector((state: TaxesState) =>
    state.information.taxPayer?.dependents ?? []
  )

  const dispatch = useDispatch()

  const drop = (i: number): Actions => dispatch(removeDependent(i))

  return (
    <List dense={true}>
      {
        dependents.map((p, i) =>
          <PersonListItem key={i} remove={() => drop(i)} person={p} editing={editing === i} onEdit={() => (onEdit ?? (() => { }))(i)} />
        )
      }
    </List>
  )
}
