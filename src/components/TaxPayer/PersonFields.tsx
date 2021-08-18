import React, { Fragment, PropsWithChildren, ReactElement } from 'react'
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction
} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { formatSSID, LabeledInput } from 'usTaxes/components/input'
import { Patterns } from 'usTaxes/components/Patterns'
import { Actions, removeDependent } from 'usTaxes/redux/actions'
import { TaxesState, Person } from 'usTaxes/redux/data'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'
import { If } from 'react-if'

export const PersonFields = ({
  children
}: PropsWithChildren<{}>): ReactElement => (
  <Fragment>
    <LabeledInput
      label="First Name and Initial"
      name="firstName"
      patternConfig={Patterns.name}
    />
    <LabeledInput
      label="Last Name"
      name="lastName"
      patternConfig={Patterns.name}
    />
    <LabeledInput label="SSN / TIN" name="ssid" patternConfig={Patterns.ssn} />
    {children}
  </Fragment>
)

interface PersonListItemProps {
  person: Person
  remove: () => void
  onEdit?: () => void
  editing?: boolean
}

export const PersonListItem = ({
  person,
  remove,
  onEdit,
  editing = false
}: PersonListItemProps): ReactElement => (
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

export function ListDependents({
  onEdit,
  editing
}: ListDependentsProps): ReactElement {
  const dependents = useSelector(
    (state: TaxesState) => state.information.taxPayer?.dependents ?? []
  )

  const dispatch = useDispatch()

  const drop = (i: number): Actions => dispatch(removeDependent(i))

  return (
    <List dense={true}>
      {dependents.map((p, i) => (
        <PersonListItem
          key={i}
          remove={() => drop(i)}
          person={p}
          editing={editing === i}
          onEdit={() => (onEdit ?? (() => {}))(i)}
        />
      ))}
    </List>
  )
}
