import React, { PropsWithChildren, ReactElement } from 'react'
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { formatSSID } from '../input'
import { Patterns } from '../Patterns'
import { Actions, removeDependent } from '../../redux/actions'
import { TaxesState, Person } from '../../redux/data'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'
import { If } from 'react-if'
import { field, Fields } from '../Fields'

export const personFields = [
  field('First Name and Initial', 'firstName', Patterns.name),
  field('Last Name', 'lastName', Patterns.name),
  field('SSN / TIN', 'ssid', Patterns.ssn)
]

export const PersonFields = ({ children }: PropsWithChildren<{}>): ReactElement => (
  <Fields fields={personFields}>
    {children}
  </Fields>
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
