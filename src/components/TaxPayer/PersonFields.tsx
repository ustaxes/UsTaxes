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
import { Control, DeepMap, FieldError } from 'react-hook-form'

interface PersonFieldsProps<T extends Person> extends BaseFormProps {
  defaults?: T
  children?: ReactNode
  errors: DeepMap<Partial<Person>, FieldError>
  person?: Person
  control: Control
}

export const PersonFields = <T extends Person>({ register, control, errors, defaults, children, person }: PersonFieldsProps<T>): ReactElement => (
  <div>
    <LabeledInput
      label="First Name and Initial"
      register={register}
      name="firstName"
      patternConfig={Patterns.name}
      required={true}
      error={errors.firstName}
      defaultValue={person?.firstName ?? defaults?.firstName}
    />
    <LabeledInput
      label="Last Name"
      register={register}
      name="lastName"
      patternConfig={Patterns.name}
      required={true}
      error={errors.lastName}
      defaultValue={person?.lastName ?? defaults?.lastName}
    />
    <LabeledInput
      label="SSN / TIN"
      register={register}
      name="ssid"
      patternConfig={Patterns.ssn(control)}
      required={true}
      error={errors.ssid}
      defaultValue={person?.ssid ?? defaults?.ssid}
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
    {(() => {
      if (editing !== undefined) {
        return (
          <ListItemIcon>
            <IconButton onClick={onEdit} edge="end" aria-label="edit">
              <EditIcon />
            </IconButton>
          </ListItemIcon>
        )
      }
    })()}
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
