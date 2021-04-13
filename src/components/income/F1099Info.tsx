import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Actions, add1099, remove1099 } from '../../redux/actions'
import { PagerContext } from '../pager'
import { TaxesState, Person, PersonRole, Supported1099, Income1099Type } from '../../redux/data'
import DeleteIcon from '@material-ui/icons/Delete'
import { Currency, GenericLabeledDropdown, LabeledInput } from '../input'
import { Patterns } from '../Patterns'

const showIncome = (a: Supported1099): ReactElement => {
  switch (a.type) {
    case Income1099Type.INT: {
      return <Currency value={a.form.income} />
    }
    case Income1099Type.B: {
      const ltg = a.form.longTermProceeds - a.form.longTermCostBasis
      const stg = a.form.shortTermProceeds - a.form.shortTermCostBasis
      return (
        <span>
        Long term: <Currency value={ltg} /><br />
        Short term: <Currency value={stg} />
        </span>
      )
    }
    case Income1099Type.DIV: {
      return <Currency value={a.form.dividends} />
    }
  }
}

interface F1099ListItemProps {
  form: Supported1099
  remove: () => void
}

const F1099Item = ({ form, remove }: F1099ListItemProps): ReactElement => (
  <ListItem>
    <ListItemAvatar>
      <Avatar>
        {form.type}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={<strong>{form.payer}</strong>}
      secondary={showIncome(form)}
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
  formType: Income1099Type
  payer: string
  // Int fields
  interest: string
  // B Fields
  shortTermProceeds: string
  shortTermCostBasis: string
  longTermProceeds: string
  longTermCostBasis: string
  // Div fields
  dividends: string
  qualifiedDividends: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

const toF1099 = (input: F1099UserInput): Supported1099 => {
  switch (input.formType) {
    case Income1099Type.INT: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          income: parseInt(input.interest)
        }
      }
    }
    case Income1099Type.B: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          shortTermCostBasis: parseInt(input.shortTermCostBasis),
          shortTermProceeds: parseInt(input.shortTermProceeds),
          longTermCostBasis: parseInt(input.longTermCostBasis),
          longTermProceeds: parseInt(input.longTermProceeds)
        }
      }
    }
    case Income1099Type.DIV: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          dividends: parseInt(input.dividends),
          qualifiedDividends: parseInt(input.qualifiedDividends)
        }
      }
    }
  }
}

export default function F1099Info (): ReactElement {
  const { register, errors, handleSubmit, control, reset, watch, setValue } = useForm<F1099UserInput>()
  const dispatch = useDispatch()

  const [adding, updateAdding] = useState(false)
  const selectedType: Income1099Type = watch('formType')

  const clear = (): void => {
    reset()
    setValue('formType', undefined)
    updateAdding(false)
  }

  const onAdd1099 = handleSubmit((formData: F1099UserInput): void => {
    dispatch(add1099(toF1099(formData)))
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

  const intFields = (
    <LabeledInput
      label="Box 1 - Interest Income"
      register={register}
      required={true}
      patternConfig={Patterns.currency(control)}
      name="interest"
      error={errors.interest}
    />
  )

  const bFields = (
    <div>
      <Box display="flex" justifyContent="flex-start">
        <h4>Long Term Covered Transactions</h4>
      </Box>
      <LabeledInput
        label="Proceeds"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="longTermProceeds"
        error={errors.longTermProceeds}
      />
      <LabeledInput
        label="Cost basis"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="longTermCostBasis"
        error={errors.longTermCostBasis}
      />
      <Box display="flex" justifyContent="flex-start">
        <h4>Short Term Covered Transactions</h4>
      </Box>
      <LabeledInput
        label="Proceeds"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="shortTermProceeds"
        error={errors.shortTermProceeds}
      />
      <LabeledInput
        label="Cost basis"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="shortTermCostBasis"
        error={errors.shortTermCostBasis}
      />
    </div>
  )

  const divFields = (
    <div>
      <LabeledInput
        label="Total Dividends"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="dividends"
        error={errors.dividends}
      />
      <LabeledInput
        label="Qualified Dividends"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="qualifiedDividends"
        error={errors.qualifiedDividends}
      />
    </div>
  )

  const specificFields = {
    [Income1099Type.INT]: intFields,
    [Income1099Type.B]: bFields,
    [Income1099Type.DIV]: divFields
  }

  let form: ReactElement | undefined
  if (adding) {
    form = (
      <div>
        <Box display="flex" justifyContent="flex-start">
          <strong>Input data from 1099</strong>
        </Box>

        <GenericLabeledDropdown
          dropDownData={Object.values(Income1099Type)}
          control={control}
          error={errors.formType}
          label="Form Type"
          required={true}
          valueMapping={(v: Income1099Type) => v}
          name="formType"
          keyMapping={(_, i: number) => i}
          textMapping={(name: string) => `1099-${name}`}
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

        {specificFields[selectedType]}

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
          <Button type="button" onClick={clear} variant="contained" color="secondary">
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
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
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
      }
    </PagerContext.Consumer>
  )
}
