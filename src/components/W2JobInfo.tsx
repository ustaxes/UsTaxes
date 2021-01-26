import React, { FormEvent, ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Actions, addW2, removeW2 } from '../redux/actions'
import { PagedFormProps } from './pager'
import { TaxesState, IncomeW2, Person, PersonRole } from '../redux/data'
import DeleteIcon from '@material-ui/icons/Delete'
import { GenericLabeledDropdown, LabeledInput } from './input'
import { Patterns } from './Patterns'
import { Errors } from './types'

interface AddW2Item {
  onDone: (w2: IncomeW2) => void
}

function AddW2 ({ onDone }: AddW2Item): ReactElement {
  const { register, errors, control, getValues, reset } = useForm<IncomeW2>()

  const people: Person[] = (
    useSelector((state: TaxesState) => ([
      state.information.taxPayer?.primaryPerson,
      state.information.taxPayer?.spouse
    ]))
      .filter((p) => p !== undefined)
      .map((p) => p as Person)
  )

  const [adding, updateAdding] = useState(false)

  const onSubmit = (e: FormEvent<any>): void => {
    onDone(getValues())
    reset()
  }

  const cancel = (): void => {
    reset()
    updateAdding(false)
  }

  let form: ReactElement | undefined
  if (adding) {
    form = (
      <div>
        <Box display="flex" justifyContent="flex-start">
          <strong>Input data from W-2</strong>
        </Box>

        <LabeledInput
          label="Occupation"
          register={register}
          required={true}
          name="occupation"
          errors={errors as Errors}
        />

        <LabeledInput
          strongLabel="Box 1 - "
          label="Wages, tips, other compensation"
          register={register}
          required={true}
          patternConfig={Patterns.currency}
          name="income"
          errors={errors as Errors}
        />

        <LabeledInput
          strongLabel="Box 2 - "
          label="Federal income tax withheld"
          register={register}
          required={true}
          name="fedWithholding"
          patternConfig={Patterns.currency}
          errors={errors as Errors}
        />

        <GenericLabeledDropdown
          dropDownData={people}
          control={control}
          label="Employee"
          required={true}
          valueMapping={(p, i) => [PersonRole.PRIMARY, PersonRole.SPOUSE][i]}
          name="personRole"
          keyMapping={(p, i) => i}
          textMapping={(p) => `${p.firstName} ${p.lastName} (${p.ssid})`}
        />
        <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
          <Box paddingRight={2}>
            <Button type="button" onClick={onSubmit} variant="contained" color="secondary">
              Add
            </Button>
          </Box>
          <Button type="button" onClick={cancel} variant="contained" color="secondary">
            Close
          </Button>
        </Box>
      </div>
    )
  } else {
    form = (
      <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
        <Button type="button" variant="contained" color="secondary" onClick={() => updateAdding(true)}>Add W2</Button>
      </Box>
    )
  }

  return (
    <div>
      {form}
    </div>
  )
}

interface W2ListItemProps {
  w2: IncomeW2
  remove: () => void
}

const W2ListItem = ({ w2, remove }: W2ListItemProps): ReactElement => (
  <ListItem>
    <ListItemAvatar>
      <Avatar>
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={w2.occupation}
      secondary={`Income: $${w2.income}`}
    />
    <ListItemSecondaryAction>
      <IconButton onClick={remove} edge="end" aria-label="delete">
        <DeleteIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
)

function ListW2s (): ReactElement {
  const w2s = useSelector((state: TaxesState) =>
    state.information.w2s
  )

  const dispatch = useDispatch()

  const drop = (i: number): Actions => dispatch(removeW2(i))

  return (
    <List dense={true}>
      {
        w2s.map((w2, i) =>
          <W2ListItem key={i} remove={() => drop(i)} w2={w2} />
        )
      }
    </List>
  )
}

export default function W2JobInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { handleSubmit } = useForm()
  const dispatch = useDispatch()

  // component functions
  const onSubmit = (formData: IncomeW2): void => {
    console.log('formData: ', formData)
    onAdvance()
  }

  const sendW2 = (w2: IncomeW2): void => {
    dispatch(addW2(w2))
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Job Information</h2>
        </Box>

        <ListW2s />
        <AddW2 onDone={sendW2} />
        { navButtons }
      </form>
    </Box>
  )
}
