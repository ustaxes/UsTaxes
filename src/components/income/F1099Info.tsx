import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Icon } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { add1099, edit1099, remove1099 } from '../../redux/actions'
import { PagerContext } from '../pager'
import { TaxesState, Person, PersonRole, Supported1099, Income1099Type } from '../../redux/data'
import { Currency, formatSSID, GenericLabeledDropdown, LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { FormListContainer } from '../FormContainer'

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

interface F1099UserInput {
  formType: Income1099Type | undefined
  payer: string
  // Int fields
  interest: string | number
  // B Fields
  shortTermProceeds: string | number
  shortTermCostBasis: string | number
  longTermProceeds: string | number
  longTermCostBasis: string | number
  // Div fields
  dividends: string | number
  qualifiedDividends: string | number
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

const blankUserInput: F1099UserInput = {
  formType: undefined,
  payer: '',
  personRole: PersonRole.PRIMARY,
  interest: '',
  // B Fields
  shortTermProceeds: '',
  shortTermCostBasis: '',
  longTermProceeds: '',
  longTermCostBasis: '',
  // Div fields
  dividends: '',
  qualifiedDividends: ''
}

const toUserInput = (f: Supported1099): F1099UserInput => ({
  ...blankUserInput,
  formType: f.type,
  payer: f.payer,
  personRole: f.personRole,

  ...((() => {
    switch (f.type) {
      case Income1099Type.INT: {
        return {
          interest: f.form.income
        }
      }
      case Income1099Type.B: {
        return f.form
      }
      case Income1099Type.DIV: {
        return f.form
      }
    }
  })())
})

const toF1099 = (input: F1099UserInput): Supported1099 | undefined => {
  switch (input.formType) {
    case Income1099Type.INT: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          income: Number(input.interest)
        }
      }
    }
    case Income1099Type.B: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          shortTermCostBasis: Number(input.shortTermCostBasis),
          shortTermProceeds: Number(input.shortTermProceeds),
          longTermCostBasis: Number(input.longTermCostBasis),
          longTermProceeds: Number(input.longTermProceeds)
        }
      }
    }
    case Income1099Type.DIV: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          dividends: Number(input.dividends),
          qualifiedDividends: Number(input.qualifiedDividends)
        }
      }
    }
  }
}

export default function F1099Info (): ReactElement {
  const f1099s = useSelector((state: TaxesState) =>
    state.information.f1099s
  )
  const [editing, setEditing] = useState<number | undefined>(undefined)

  const defaultValues: F1099UserInput = (() => {
    if (editing !== undefined) {
      return toUserInput(f1099s[editing])
    }
    return blankUserInput
  })()

  const { register, errors, handleSubmit, control, reset, watch, setValue } = useForm<F1099UserInput>({ defaultValues })
  const selectedType: Income1099Type | undefined = watch('formType')

  const dispatch = useDispatch()

  const clear = (): void => {
    reset()
    setValue('formType', undefined)
    setEditing(undefined)
  }

  const onAdd1099 = (onSuccess: () => void) => (formData: F1099UserInput): void => {
    const payload = toF1099(formData)
    if (payload !== undefined) {
      if (editing === undefined) {
        dispatch(add1099(payload))
      } else {
        dispatch(edit1099({ index: editing, value: payload }))
      }
      clear()
      onSuccess()
    }
  }

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
      <h4>Long Term Covered Transactions</h4>
      <LabeledInput
        label="Proceeds"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="longTermProceeds"
        error={errors.longTermProceeds}
        defaultValue={defaultValues?.longTermProceeds.toString()}
      />
      <LabeledInput
        label="Cost basis"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="longTermCostBasis"
        error={errors.longTermCostBasis}
        defaultValue={defaultValues?.longTermCostBasis.toString()}
      />
      <h4>Short Term Covered Transactions</h4>
      <LabeledInput
        label="Proceeds"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="shortTermProceeds"
        error={errors.shortTermProceeds}
        defaultValue={defaultValues?.shortTermProceeds.toString()}
      />
      <LabeledInput
        label="Cost basis"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="shortTermCostBasis"
        error={errors.shortTermCostBasis}
        defaultValue={defaultValues?.shortTermCostBasis.toString()}
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
        defaultValue={defaultValues?.dividends.toString()}
      />
      <LabeledInput
        label="Qualified Dividends"
        register={register}
        required={true}
        patternConfig={Patterns.currency(control)}
        name="qualifiedDividends"
        error={errors.qualifiedDividends}
        defaultValue={defaultValues?.qualifiedDividends.toString()}
      />
    </div>
  )

  const specificFields = {
    [Income1099Type.INT]: intFields,
    [Income1099Type.B]: bFields,
    [Income1099Type.DIV]: divFields
  }

  const titles = {
    [Income1099Type.INT]: '1099-INT',
    [Income1099Type.B]: '1099-B',
    [Income1099Type.DIV]: '1099-DIV'
  }

  const form: ReactElement | undefined = (
    <FormListContainer
      onDone={(onSuccess) => handleSubmit(onAdd1099(onSuccess))}
      onCancel={clear}
      items={f1099s}
      removeItem={(i) => dispatch(remove1099(i))}
      editing={editing}
      editItem={setEditing}
      primary={(f) => f.payer}
      secondary={(f) => showIncome(f)}
      icon={(f) => <Icon title={titles[f.type]}>{f.type}</Icon>}
    >
      <strong>Input data from 1099</strong>

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
        defaultValue={defaultValues?.formType}
      />

      <LabeledInput
        label="Enter name of bank, broker firm, or other payer"
        register={register}
        required={true}
        patternConfig={Patterns.name}
        name="payer"
        error={errors.payer}
        defaultValue={defaultValues?.payer}
      />

      {(() => {
        if (selectedType !== undefined) return specificFields[selectedType]
        else if (defaultValues?.formType !== undefined) return specificFields[defaultValues.formType]
      })()}

      <GenericLabeledDropdown
        dropDownData={people}
        control={control}
        error={errors.personRole}
        label="Recipient"
        required={true}
        valueMapping={(p: Person, i: number) => [PersonRole.PRIMARY, PersonRole.SPOUSE][i]}
        name="personRole"
        keyMapping={(p: Person, i: number) => i}
        textMapping={(p: Person) => `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`}
        defaultValue={defaultValues?.personRole ?? PersonRole.PRIMARY}
      />
    </FormListContainer>
  )

  return (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={onAdvance}>
          <h2>1099 Information</h2>
          {form}
          { navButtons }
        </form>
      }
    </PagerContext.Consumer>
  )
}
