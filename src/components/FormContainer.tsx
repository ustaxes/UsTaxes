import { PropsWithChildren, ReactElement, useState } from 'react'
import {
  createStyles,
  makeStyles,
  useMediaQuery,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Box,
  Button,
  Theme
} from '@material-ui/core'
import { Delete, Edit } from '@material-ui/icons'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import _ from 'lodash'
import { ReactNode } from 'react'
import { FormContainerProvider } from './FormContainer/Context'
import { Prompt } from 'ustaxes/components/Prompt'

interface FormContainerProps {
  onDone: () => void
  onCancel: () => void
}

const FormContainer = ({
  onDone,
  onCancel,
  children
}: PropsWithChildren<FormContainerProps>): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <div>
      <FormContainerProvider onSubmit={onDone}>
        {children}
      </FormContainerProvider>
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
        <Button
          type="button"
          onClick={onCancel}
          color={prefersDarkMode ? 'default' : 'secondary'}
          variant="contained"
        >
          Discard
        </Button>
      </Box>
    </div>
  )
}

interface MutableListItemProps {
  remove?: () => void
  onEdit?: () => void
  primary: string
  secondary?: string | ReactElement
  editing?: boolean
  icon?: ReactElement
  disableEdit?: boolean
}

export const MutableListItem = ({
  icon,
  primary,
  secondary,
  remove,
  onEdit,
  editing = false,
  disableEdit = false
}: MutableListItemProps): ReactElement => {
  const canEdit = !editing && !disableEdit && onEdit !== undefined
  const canDelete = remove !== undefined && !editing

  const editAction = (() => {
    if (canEdit) {
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
    if (canDelete) {
      return (
        <ListItemSecondaryAction>
          <IconButton onClick={remove} edge="end" aria-label="delete">
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      )
    }
  })()

  const status = editing ? 'editing' : undefined

  return (
    <ListItem>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText
        primary={<strong>{primary}</strong>}
        secondary={secondary}
      />
      {editAction}
      {deleteAction}
      {status}
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
  grouping?: (a: A) => number
  groupHeaders?: (ReactNode | undefined)[]
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

const FormListContainer = <A,>(
  props: PropsWithChildren<FormListContainerProps<A>>
): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
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
    onCancel = () => {
      // default do nothing
    },
    grouping = () => 0,
    groupHeaders = []
  } = props
  const [formState, setFormState] = useState(FormState.Closed)
  const [editing, setEditing] = useState<number | undefined>(undefined)

  // Use the provided grouping function to split the input
  // array into an array of groups. Each group has a title
  // and a list of items, along with their original index.
  const groups: [ReactNode, [A, number][]][] = _.chain(items)
    .map<[A, number]>((x, n) => [x, n])
    .groupBy(([x]) => grouping(x))
    .toPairs()
    .map<[ReactNode, [A, number][]]>(([k, xs]) => [
      groupHeaders[parseInt(k)],
      xs
    ])
    .value()

  // Note useFormContext here instead of useForm reuses the
  // existing form context from the parent.
  const {
    reset,
    handleSubmit,
    formState: { isDirty, errors }
  } = useFormContext()

  const close = (): void => {
    setFormState(FormState.Closed)
    reset({})
    setEditing(undefined)
  }

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

  const openEditForm = (n: number): (() => void) | undefined => {
    if (!disableEditing && formState === FormState.Closed) {
      return () => {
        setFormState(FormState.Editing)
        setEditing(n)
        reset(items[n])
      }
    }
  }

  const openAddForm = () => {
    setFormState(FormState.Adding)
  }

  const itemDisplay = (() => {
    if (items.length > 0) {
      return (
        <List dense={true}>
          {groups.map(([title, group], i) => (
            <div key={`group-${i}`}>
              {title}
              {group.map(([item, originalIndex], k) => (
                <MutableListItem
                  key={k}
                  primary={primary(item)}
                  secondary={
                    secondary !== undefined ? secondary(item) : undefined
                  }
                  onEdit={openEditForm(originalIndex)}
                  disableEdit={formState !== FormState.Closed}
                  editing={editing === originalIndex}
                  remove={
                    removeItem !== undefined
                      ? () => removeItem(originalIndex)
                      : undefined
                  }
                  icon={icon !== undefined ? icon(item) : undefined}
                />
              ))}
            </div>
          ))}
        </List>
      )
    }
  })()

  return (
    <>
      <Prompt when={!_.isEmpty(errors) || isDirty} />
      {itemDisplay}
      {(() => {
        if (formState !== FormState.Closed) {
          return (
            <FormContainer onDone={handleSubmit(onSave)} onCancel={onClose}>
              {children}
            </FormContainer>
          )
        } else if (max === undefined || items.length < max) {
          return (
            <div className={classes.buttonList}>
              <Button
                type="button"
                onClick={openAddForm}
                color={prefersDarkMode ? 'default' : 'secondary'}
                variant="contained"
              >
                Add
              </Button>
            </div>
          )
        }
      })()}
    </>
  )
}

export default FormContainer
export { FormListContainer }
