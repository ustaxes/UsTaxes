import React, { ReactElement, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Icon } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { add1099, edit1099, remove1099 } from '../../redux/actions'
import { PagerContext } from '../pager'
import {
  TaxesState,
  Person,
  PersonRole,
  Supported1099,
  Income1099Type,
  PlanType1099,
  PlanType1099Texts
} from '../../redux/data'
import {
  Currency,
  formatSSID,
  GenericLabeledDropdown,
  LabeledInput,
  LabeledDropdown
} from '../input'
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
          Long term: <Currency value={ltg} />
          <br />
          Short term: <Currency value={stg} />
        </span>
      )
    }
    case Income1099Type.DIV: {
      return <Currency value={a.form.dividends} />
    }
    case Income1099Type.R: {
      return (
        <span>
          Plan Type: {a.form.planType}
          <br />
          Gross Distribution: <Currency value={a.form.grossDistribution} />
          <br />
          Taxable Amount: <Currency value={a.form.taxableAmount} />
          <br />
          Federal Income Tax Withweld:{' '}
          <Currency value={a.form.federalIncomeTaxWithheld} />
        </span>
      )
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
  // R fields
  grossDistribution: string | number
  taxableAmount: string | number
  federalIncomeTaxWithheld: string | number
  RPlanType: PlanType1099
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
  qualifiedDividends: '',
  // R fields
  grossDistribution: '',
  taxableAmount: '',
  federalIncomeTaxWithheld: '',
  RPlanType: PlanType1099.IRA
}

const toUserInput = (f: Supported1099): F1099UserInput => ({
  ...blankUserInput,
  formType: f.type,
  payer: f.payer,
  personRole: f.personRole,

  ...(() => {
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
      case Income1099Type.R: {
        return f.form
      }
    }
  })()
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
    case Income1099Type.R: {
      return {
        payer: input.payer,
        personRole: input.personRole,
        type: input.formType,
        form: {
          grossDistribution: Number(input.grossDistribution),
          taxableAmount: Number(input.taxableAmount),
          federalIncomeTaxWithheld: Number(input.federalIncomeTaxWithheld),
          planType:
            input.RPlanType == 'IRA' ? PlanType1099.IRA : PlanType1099.Pension
        }
      }
    }
  }
}

export default function F1099Info(): ReactElement {
  const f1099s = useSelector((state: TaxesState) => state.information.f1099s)
  const [editing, doSetEditing] = useState<number | undefined>(undefined)

  const methods = useForm<F1099UserInput>()
  const { handleSubmit, reset, watch, setValue } = methods
  const selectedType: Income1099Type | undefined = watch('formType')

  const dispatch = useDispatch()

  const setEditing = (idx: number): void => {
    reset(toUserInput(f1099s[idx]))
    doSetEditing(idx)
  }

  const clear = (): void => {
    reset()
    setValue('formType', undefined)
    doSetEditing(undefined)
  }

  const onAdd1099 =
    (onSuccess: () => void) =>
    (formData: F1099UserInput): void => {
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

  const people: Person[] = useSelector((state: TaxesState) => [
    state.information.taxPayer?.primaryPerson,
    state.information.taxPayer?.spouse
  ])
    .filter((p) => p !== undefined)
    .map((p) => p as Person)

  const intFields = (
    <LabeledInput
      label="Box 1 - Interest Income"
      patternConfig={Patterns.currency}
      name="interest"
    />
  )

  const bFields = (
    <div>
      <h4>Long Term Covered Transactions</h4>
      <LabeledInput
        label="Proceeds"
        patternConfig={Patterns.currency}
        name="longTermProceeds"
      />
      <LabeledInput
        label="Cost basis"
        patternConfig={Patterns.currency}
        name="longTermCostBasis"
      />
      <h4>Short Term Covered Transactions</h4>
      <LabeledInput
        label="Proceeds"
        patternConfig={Patterns.currency}
        name="shortTermProceeds"
      />
      <LabeledInput
        label="Cost basis"
        patternConfig={Patterns.currency}
        name="shortTermCostBasis"
      />
    </div>
  )

  const divFields = (
    <div>
      <LabeledInput
        label="Total Dividends"
        patternConfig={Patterns.currency}
        name="dividends"
      />
      <LabeledInput
        label="Qualified Dividends"
        patternConfig={Patterns.currency}
        name="qualifiedDividends"
      />
    </div>
  )

  const rFields = (
    <div>
      <LabeledInput
        label="Box 1 - Gross Distribution"
        patternConfig={Patterns.currency}
        name="grossDistribution"
      />
      <LabeledInput
        label="Box 2a - Taxable Amount"
        patternConfig={Patterns.currency}
        name="taxableAmount"
      />
      <LabeledInput
        label="Box 4 - Federal Income Tax Withheld"
        patternConfig={Patterns.currency}
        name="federalIncomeTaxWithheld"
      />
      <GenericLabeledDropdown<PlanType1099>
        label=""
        strongLabel="Type of 1099-R"
        dropDownData={Object.values(PlanType1099)}
        valueMapping={(x, i) => x}
        keyMapping={(x, i) => i}
        textMapping={(status) => PlanType1099Texts[status]}
        name="RPlanType"
      />
    </div>
  )

  const specificFields = {
    [Income1099Type.INT]: intFields,
    [Income1099Type.B]: bFields,
    [Income1099Type.DIV]: divFields,
    [Income1099Type.R]: rFields
  }

  const titles = {
    [Income1099Type.INT]: '1099-INT',
    [Income1099Type.B]: '1099-B',
    [Income1099Type.DIV]: '1099-DIV',
    [Income1099Type.R]: '1099-R'
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
        label="Form Type"
        valueMapping={(v: Income1099Type) => v}
        name="formType"
        keyMapping={(_, i: number) => i}
        textMapping={(name: string) => `1099-${name}`}
      />

      <LabeledInput
        label="Enter name of bank, broker firm, or other payer"
        patternConfig={Patterns.name}
        name="payer"
      />

      {selectedType !== undefined ? specificFields[selectedType] : undefined}

      <GenericLabeledDropdown
        dropDownData={people}
        label="Recipient"
        valueMapping={(p: Person, i: number) =>
          [PersonRole.PRIMARY, PersonRole.SPOUSE][i]
        }
        name="personRole"
        keyMapping={(p: Person, i: number) => i}
        textMapping={(p: Person) =>
          `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`
        }
      />
    </FormListContainer>
  )

  return (
    <PagerContext.Consumer>
      {({ onAdvance, navButtons }) => (
        <form onSubmit={onAdvance}>
          <h2>1099 Information</h2>
          <FormProvider {...methods}>{form}</FormProvider>
          {navButtons}
        </form>
      )}
    </PagerContext.Consumer>
  )
}
