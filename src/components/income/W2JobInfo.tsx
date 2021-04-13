import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Actions, addW2, removeW2 } from '../../redux/actions'
import { PagerContext } from '../pager'
import { TaxesState, IncomeW2, Person, PersonRole } from '../../redux/data'
import DeleteIcon from '@material-ui/icons/Delete'
import { Currency, formatSSID, GenericLabeledDropdown, LabeledInput } from '../input'
import { Patterns } from '../Patterns'

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
      secondary={<div>Income: <Currency value={w2.income} /></div>}
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

interface IncomeW2UserInput {
  occupation: string
  income: string
  fedWithholding: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

const toIncomeW2 = (formData: IncomeW2UserInput): IncomeW2 => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  income: parseInt(formData.income),
  fedWithholding: parseInt(formData.fedWithholding)
})

export default function W2JobInfo (): ReactElement {
  const { register, errors, handleSubmit, control, reset } = useForm<IncomeW2UserInput>()
  const dispatch = useDispatch()

  const [adding, updateAdding] = useState(false)

  const clear = (): void => {
    reset()
    updateAdding(false)
  }

  const onAddW2 = handleSubmit((formData: IncomeW2UserInput): void => {
    dispatch(addW2(toIncomeW2(formData)))
    clear()
  })

  const people: Person[] = (
    useSelector((state: TaxesState) => ([
      state.information.taxPayer?.primaryPerson,
      state.information.taxPayer?.spouse
    ]))
      .filter((p) => p !== undefined)
      .map((p) => p as Person)
  )

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
          error={errors.occupation}
        />

        <LabeledInput
          strongLabel="Box 1 - "
          label="Wages, tips, other compensation"
          register={register}
          required={true}
          patternConfig={Patterns.currency(control)}
          name="income"
          error={errors.income}
        />

        <LabeledInput
          strongLabel="Box 2 - "
          label="Federal income tax withheld"
          register={register}
          required={true}
          name="fedWithholding"
          patternConfig={Patterns.currency(control)}
          error={errors.fedWithholding}
        />

        <GenericLabeledDropdown
          dropDownData={people}
          control={control}
          error={errors.personRole}
          label="Employee"
          required={true}
          valueMapping={(p, i) => [PersonRole.PRIMARY, PersonRole.SPOUSE][i]}
          name="personRole"
          keyMapping={(p, i) => i}
          textMapping={(p) => `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`}
          defaultValue={PersonRole.PRIMARY}
        />
        <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
          <Box paddingRight={2}>
            <Button type="button" onClick={onAddW2} variant="contained" color="secondary">
              Add
            </Button>
          </Box>
          <Button type="button" onClick={clear} variant="contained" color="secondary">
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
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <Box display="flex" justifyContent="center">
          <form onSubmit={onAdvance}>
            <Box display="flex" justifyContent="flex-start">
              <h2>Job Information</h2>
            </Box>

            <ListW2s />
            {form}
            { navButtons }
          </form>
        </Box>
      }
    </PagerContext.Consumer>
  )
}
