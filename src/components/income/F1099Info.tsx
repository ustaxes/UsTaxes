import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Actions, add1099, remove1099 } from '../../redux/actions'
import { PagedFormProps } from '../pager'
import { Income1099, TaxesState, Person, PersonRole, Income1099Type, form1099Types } from '../../redux/data'
import DeleteIcon from '@material-ui/icons/Delete'
import { GenericLabeledDropdown, LabeledInput } from '../input'
import { Patterns } from '../Patterns'

interface F1099ListItemProps {
  form: Income1099
  remove: () => void
}

const F1099Item = ({ form, remove }: F1099ListItemProps): ReactElement => (
  <ListItem>
    <ListItemAvatar>
      <Avatar>
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary="todo"
      secondary={`Income: $${form.income}`}
    />
    <ListItemSecondaryAction>
      <IconButton onClick={remove} edge="end" aria-label="delete">
        <DeleteIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
)

function List1099s (): ReactElement {
  const f1099s = useSelector((state: TaxesState) =>
    state.information.f1099s
  )

  const dispatch = useDispatch()

  const drop = (i: number): Actions => dispatch(remove1099(i))

  return (
    <List dense={true}>
      {
        f1099s.map((f1099, i) =>
          <F1099Item key={i} remove={() => drop(i)} form={f1099} />
        )
      }
    </List>
  )
}

interface F1099UserInput {
  payer: string
  income: string
  formType: Income1099Type
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

const toF1099 = (formData: F1099UserInput): Income1099 => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  income: parseInt(formData.income)
})

export default function F1099Info ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, errors, handleSubmit, control, reset } = useForm<F1099UserInput>()
  const dispatch = useDispatch()

  const onAdd1099 = handleSubmit((formData: F1099UserInput): void => {
    dispatch(add1099(toF1099(formData)))
    reset()
  })

  const people: Person[] = (
    useSelector((state: TaxesState) => ([
      state.information.taxPayer?.primaryPerson,
      state.information.taxPayer?.spouse
    ]))
      .filter((p) => p !== undefined)
      .map((p) => p as Person)
  )

  const [adding, updateAdding] = useState(false)

  const cancel = (): void => {
    reset()
    updateAdding(false)
  }

  let form: ReactElement | undefined
  if (adding) {
    form = (
      <div>
        <Box display="flex" justifyContent="flex-start">
          <strong>Input data from 1099</strong>
        </Box>

        <GenericLabeledDropdown
          dropDownData={form1099Types}
          control={control}
          error={errors.formType}
          label="Form Type"
          required={true}
          valueMapping={(name: string, i: number) => form1099Types[i]}
          name="formType"
          keyMapping={(name: string, i: number) => i}
          textMapping={(name: string, i: number) => name}
          defaultValue={undefined}
        />

        <LabeledInput
          label="Enter name of bank, broker firm, or other payer"
          register={register}
          required={true}
          patternConfig={Patterns.name}
          name="payer"
          error={errors.payer}
        />

        <LabeledInput
          label="Box 1 - Interest Income"
          register={register}
          required={true}
          patternConfig={Patterns.currency}
          name="income"
          error={errors.income}
        />

        <GenericLabeledDropdown
          dropDownData={people}
          control={control}
          error={errors.personRole}
          label="Recipient"
          required={true}
          valueMapping={(p, i) => [PersonRole.PRIMARY, PersonRole.SPOUSE][i]}
          name="personRole"
          keyMapping={(p, i) => i}
          textMapping={(p) => `${p.firstName} ${p.lastName} (${p.ssid})`}
          defaultValue={PersonRole.PRIMARY}
        />
        <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
          <Box paddingRight={2}>
            <Button type="button" onClick={onAdd1099} variant="contained" color="secondary">
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
        <Button type="button" variant="contained" color="secondary" onClick={() => updateAdding(true)}>Add 1099</Button>
      </Box>
    )
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={onAdvance}>
        <Box display="flex" justifyContent="flex-start">
          <h2>1099 Information</h2>
        </Box>

        <List1099s />
        {form}
        { navButtons }
      </form>
    </Box>
  )
}
