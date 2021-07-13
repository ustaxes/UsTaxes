import React, { PropsWithChildren, ReactElement, useState } from 'react'
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Box, Button, unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import { Delete, Edit } from '@material-ui/icons'
import { Else, If, Then } from 'react-if'

interface FormContainerProps {
  onDone: () => void
  onCancel: () => void
}

const theme = createMuiTheme({
  palette: {
    primary: red
  }
})

const FormContainer = ({ onDone, onCancel, children }: PropsWithChildren<FormContainerProps>): ReactElement => (
  <div>
    {children}
    <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
      <Box paddingRight={2}>
        <Button type="button" onClick={onDone} variant="contained" color="primary">
          Save
        </Button>
      </Box>
      <ThemeProvider theme={theme}>
        <Button type="button" onClick={onCancel} variant="contained" color="secondary">
          Close
        </Button>
      </ThemeProvider>
    </Box>
  </div>
)

interface MutableListItemProps {
  remove?: () => void
  onEdit?: () => void
  primary: string
  secondary?: string | ReactElement
  editing?: boolean
  icon?: ReactElement
}

export const MutableListItem = ({ icon, primary, secondary, remove, onEdit, editing = false }: MutableListItemProps): ReactElement => {
  const editAction = (() => {
    if (onEdit !== undefined && !editing) {
      return (
        <ListItemIcon>
          <IconButton onClick={onEdit} edge="end" aria-label="edit">
            <Edit />
          </IconButton>
        </ListItemIcon>
      )
    }
  })()

  const deleteAction = (() => {
    if (remove !== undefined && !editing) {
      return (
        <ListItemSecondaryAction>
          <IconButton onClick={remove} edge="end" aria-label="delete">
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      )
    }
  })()

  return (
    <ListItem className={editing ? 'active' : ''}>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={<strong>{primary}</strong>}
        secondary={secondary}
      />
      {editAction}
      {deleteAction}
    </ListItem>
  )
}

interface FormListContainerProps<A> {
  onDone: (f: (() => void)) => () => void
  onCancel: () => void
  items: A[]
  editItem?: (v: number) => void
  editing?: number
  disableEditing?: boolean
  removeItem?: (v: number) => void
  primary: (a: A) => string
  secondary?: (a: A) => string | ReactElement
  max?: number
  icon?: (a: A) => ReactElement
}

enum FormState {
  Adding,
  Editing,
  Closed
}

const FormListContainer = <A extends object>(props: PropsWithChildren<FormListContainerProps<A>>): ReactElement => {
  const { children, items, icon, max, primary, secondary, editItem, editing, disableEditing = false, removeItem, onDone, onCancel } = props
  const [formState, setFormState] = useState(FormState.Closed)

  const close = (): void => {
    setFormState(FormState.Closed)
  }

  const _onCancel = (): void => {
    onCancel()
    close()
  }

  const _onDone: (() => void) = onDone(close)

  const editAction = (() => {
    if (editItem !== undefined && !disableEditing && formState === FormState.Closed) {
      return (n: number) => () => {
        setFormState(FormState.Editing)
        editItem(n)
      }
    }
    return () => undefined
  })()

  const itemDisplay = (() => {
    if (items !== undefined && items.length > 0) {
      return (
        <List dense={true}>
          {
            items.map((item, i) =>
              <MutableListItem
                key={i}
                primary={primary(item)}
                secondary={secondary !== undefined ? secondary(item) : undefined}
                onEdit={editAction(i)}
                editing={editing === i}
                remove={removeItem !== undefined ? () => removeItem(i) : undefined}
                icon={icon !== undefined ? icon(item) : undefined}
              />
            )
          }
        </List>
      )
    }
  })()

  return (
    <div>
      {itemDisplay}
      <If condition={formState !== FormState.Closed}>
        <Then>
          <FormContainer
            onDone={_onDone}
            onCancel={_onCancel}
          >
            {children}
          </FormContainer>
        </Then>
        <Else>
          <If condition={max === undefined || items.length < max}>
            <Button type="button" onClick={() => setFormState(FormState.Adding)} variant="contained" color="secondary">
              Add
            </Button>
          </If>
        </Else>
      </If>
    </div>
  )
}

export default FormContainer
export {
  FormListContainer
}
