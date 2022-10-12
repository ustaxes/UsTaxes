import { PropsWithChildren, ReactElement } from 'react'
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction
} from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import {
  formatSSID,
  LabeledInput,
  LabeledCheckbox,
  DatePicker
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { removeDependent } from 'ustaxes/redux/actions'
import { Person } from 'ustaxes/core/data'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'

export const labels = {
  fname: 'First Name',
  initial: 'Initial',
  lname: 'Last Name',
  dateOfBirth: 'Date of Birth',
  ssn: 'SSN / TIN'
}

export const PersonFields = ({
  children,
  autofocus
}: PropsWithChildren<{ autofocus?: boolean }>): ReactElement => {
  return (
    <>
      <LabeledInput
        autofocus={autofocus}
        label={labels.fname}
        name="firstName"
        required={true}
      />
      <LabeledInput
        autofocus={autofocus}
        label={labels.initial}
        name="initial"
      />
      <LabeledInput label={labels.lname} name="lastName" required={true} />
      <LabeledInput
        label={labels.ssn}
        name="ssid"
        patternConfig={Patterns.ssn}
      />
      <LabeledCheckbox label="Is this person blind?" name="isBlind" />
      <DatePicker
        name="dateOfBirth"
        label={labels.dateOfBirth}
        required={true}
        minDate={new Date(1900, 0, 1)}
        maxDate={new Date()}
      />
      {children}
    </>
  )
}

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
    {(() => {
      if (editing) {
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

export function ListDependents({
  onEdit = () => {
    /* default do nothing */
  },
  editing
}: ListDependentsProps): ReactElement {
  const dependents = useSelector(
    (state: TaxesState) => state.information.taxPayer.dependents
  )

  const dispatch = useDispatch()

  const drop = (i: number): void => dispatch(removeDependent(i))

  return (
    <List dense={true}>
      {dependents.map((p, i) => (
        <PersonListItem
          key={i}
          remove={() => drop(i)}
          person={p}
          editing={editing === i}
          onEdit={() => onEdit(i)}
        />
      ))}
    </List>
  )
}
