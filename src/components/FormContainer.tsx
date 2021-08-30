import React, { PropsWithChildren, ReactElement, useState } from 'react'
import {
  createStyles,
  makeStyles,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Box,
  Button,
  unstable_createMuiStrictModeTheme as createMuiTheme,
  Theme,
  ThemeProvider
} from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import { Delete, Edit } from '@material-ui/icons'
import { Else, If, Then } from 'react-if'
import {
  SubmitHandler,
  UnpackNestedValue,
  useFormContext
} from 'react-hook-form'

interface FormContainerProps {
  onDone: () => void
  onCancel: () => void
}

const theme = createMuiTheme({
  palette: {
    primary: red
  }
})

const FormContainer = ({
  onDone,
  onCancel,
  children
}: PropsWithChildren<FormContainerProps>): ReactElement => (
  <div>
    {children}
    <Box
      display="flex"
      justifyContent="flex-start"
      marginTop={2}
      marginBottom={3}
    >
      <Box marginRight={2}>
        <Button
          type="button"
          onClick={onDone}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </Box>
      <ThemeProvider theme={theme}>
        <Button
          type="button"
          onClick={onCancel}
          variant="contained"
          color="secondary"
        >
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

export const MutableListItem = ({
  icon,
  primary,
  secondary,
  remove,
  onEdit,
  editing = false
}: MutableListItemProps): ReactElement => {
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
      <ListItemIcon>{icon}</ListItemIcon>
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
  onSubmitAdd: SubmitHandler<A>
  onSubmitEdit: (index: number) => SubmitHandler<A>
  onCancel?: () => void
  items: A[]
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    buttonList: {
      margin: `${theme.spacing(2)}px 0 ${theme.spacing(3)}px`
    }
  })
)

const FormListContainer = <A extends Record<string, any>>(
  props: PropsWithChildren<FormListContainerProps<A>>
): ReactElement => {
  const classes = useStyles()
  const {
    children,
    items,
    icon,
    max,
    primary,
    secondary,
    disableEditing = false,
    removeItem,
    onSubmitAdd,
    onSubmitEdit,
    onCancel = () => {}
  } = props
  const [formState, setFormState] = useState(FormState.Closed)

  const [editing, setEditing] = useState<number | undefined>(undefined)

  const close = (): void => {
    setFormState(FormState.Closed)
    reset({ values: undefined })
    setEditing(undefined)
  }

  // Note useFormContext here instead of useForm reuses the
  // existing form context from the parent.
  const { reset, handleSubmit } = useFormContext()

  const onClose = (): void => {
    onCancel()
    close()
  }

  const onSave: SubmitHandler<A> = (formData): void => {
    if (editing !== undefined) {
      onSubmitEdit(editing)(formData)
    } else {
      onSubmitAdd(formData)
    }
    close()
  }

  const openEditForm = (() => {
    if (!disableEditing && formState === FormState.Closed) {
      return (n: number) => () => {
        setFormState(FormState.Editing)
        setEditing(n)
        reset(items[n])
      }
    }
    return () => undefined
  })()

  const itemDisplay = (() => {
    if (items !== undefined && items.length > 0) {
      return (
        <List dense={true}>
          {items.map((item, i) => (
            <MutableListItem
              key={i}
              primary={primary(item)}
              secondary={secondary !== undefined ? secondary(item) : undefined}
              onEdit={openEditForm(i)}
              editing={editing === i}
              remove={
                removeItem !== undefined ? () => removeItem(i) : undefined
              }
              icon={icon !== undefined ? icon(item) : undefined}
            />
          ))}
        </List>
      )
    }
  })()

  return (
    <>
      {itemDisplay}
      <If condition={formState !== FormState.Closed}>
        <Then>
          <FormContainer onDone={handleSubmit(onSave)} onCancel={onClose}>
            {children}
          </FormContainer>
        </Then>
        <Else>
          <If condition={max === undefined || items.length < max}>
            <div className={classes.buttonList}>
              <Button
                type="button"
                onClick={() => setFormState(FormState.Adding)}
                variant="contained"
                color="secondary"
              >
                Add
              </Button>
            </div>
          </If>
        </Else>
      </If>
    </>
  )
}

export default FormContainer
export { FormListContainer }
