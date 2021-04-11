import React, { ReactElement, ReactNode } from 'react'
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { Actions, removeDependent } from '../../redux/actions'
import { TaxesState, Person } from '../../redux/data'
import { BaseFormProps } from '../types'
import DeleteIcon from '@material-ui/icons/Delete'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'
import { Control, DeepMap, FieldError, Path } from 'react-hook-form'

export interface UserPersonForm {
  firstName: string
  lastName: string
  ssid: string
}

interface PersonFieldsProps<T extends UserPersonForm> extends BaseFormProps<T> {
  defaults?: UserPersonForm
  children?: ReactNode
  errors: DeepMap<Partial<Person>, FieldError>
  control: Control<T>
}

export const PersonFields = <T extends UserPersonForm>({ register, control, errors, defaults, children }: PersonFieldsProps<T>): ReactElement => (
  <div>
    <LabeledInput
      label="First Name and Initial"
      register={register}
      name={'firstName' as Path<T>}
      patternConfig={Patterns.name}
      required={true}
      error={errors.firstName}
      defaultValue={defaults?.firstName}
    />
    <LabeledInput<T>
      label="Last Name"
      register={register}
      name={'lastName' as Path<T>}
      patternConfig={Patterns.name}
      required={true}
      error={errors.lastName}
      defaultValue={defaults?.lastName}
    />
    <LabeledInput
      label="SSN / TIN"
      register={register}
    name={'ssid' as Path<T>}
      patternConfig={Patterns.ssn(control)}
      required={true}
      error={errors.ssid}
      defaultValue={defaults?.ssid}
    />
    {children}
  </div>
)

interface PersonListItemProps {
  person: Person
  remove: () => void
}

export const PersonListItem = ({ person, remove }: PersonListItemProps): ReactElement => (
  <ListItem>
    <ListItemIcon>
      <PersonIcon />
    </ListItemIcon>
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
