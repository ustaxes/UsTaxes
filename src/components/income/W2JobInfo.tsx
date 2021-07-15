import React, { ReactElement, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormProvider, useForm } from 'react-hook-form'
import { PagerContext } from '../pager'
import { TaxesState, IncomeW2, Person, PersonRole } from '../../redux/data'
import { Currency, formatSSID, GenericLabeledDropdown, LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { FormListContainer } from '../FormContainer'
import { Work } from '@material-ui/icons'
import { addW2, editW2, removeW2 } from '../../redux/actions'

interface IncomeW2UserInput {
  occupation: string
  income: string
  fedWithholding: string
  ssWithholding: string
  medicareWithholding: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

const toIncomeW2 = (formData: IncomeW2UserInput): IncomeW2 => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  income: parseInt(formData.income),
  fedWithholding: parseInt(formData.fedWithholding),
  ssWithholding: parseInt(formData.ssWithholding),
  medicareWithholding: parseInt(formData.medicareWithholding)
})

const toIncomeW2UserInput = (data: IncomeW2): IncomeW2UserInput => ({
  ...data,
  income: data.income.toString(),
  fedWithholding: data.fedWithholding.toString(),
  ssWithholding: data.ssWithholding.toString(),
  medicareWithholding: data.medicareWithholding.toString()
})

export default function W2JobInfo (): ReactElement {
  const dispatch = useDispatch()
  const [editing, doSetEditing] = useState<number | undefined>(undefined)

  const methods = useForm<IncomeW2UserInput>()
  const { formState: { errors }, handleSubmit, reset } = methods

  const people: Person[] = (
    useSelector((state: TaxesState) => ([
      state.information.taxPayer?.primaryPerson,
      state.information.taxPayer?.spouse
    ]))
      .filter((p) => p !== undefined)
      .map((p) => p as Person)
  )

  const w2s = useSelector((state: TaxesState) =>
    state.information.w2s
  )

  const setEditing = (idx: number): void => {
    reset(toIncomeW2UserInput(w2s[idx]))
    doSetEditing(idx)
  }

  const clear = (): void => {
    reset()
    doSetEditing(undefined)
  }

  const onAddW2 = (onSuccess: (() => void)) => (formData: IncomeW2UserInput): void => {
    dispatch((() => {
      if (editing !== undefined) {
        return editW2({ index: editing, value: toIncomeW2(formData) })
      }
      return addW2(toIncomeW2(formData))
    })())
    clear()
    onSuccess()
  }

  const form: ReactElement = (
    <FormListContainer<IncomeW2 >
      items={w2s}
      onDone={(onSuccess) => handleSubmit(onAddW2(onSuccess))}
      editing={editing}
      editItem={setEditing}
      removeItem={(i) => dispatch(removeW2(i))}
      icon={() => <Work />}
      primary={(w2: IncomeW2) => w2.occupation }
      secondary={(w2) => <span>Income: <Currency value={w2.income} /></span>}
      onCancel={clear}
    >
      <strong>Input data from W-2</strong>
      <LabeledInput
        label="Occupation"
        patternConfig={Patterns.name}
        name="occupation"
        error={errors.occupation}
      />

      <LabeledInput
        strongLabel="Box 1 - "
        label="Wages, tips, other compensation"
        patternConfig={Patterns.currency}
        name="income"
        error={errors.income}
      />

      <LabeledInput
        strongLabel="Box 2 - "
        label="Federal income tax withheld"
        name="fedWithholding"
        patternConfig={Patterns.currency}
        error={errors.fedWithholding}
      />

      <LabeledInput
        strongLabel="Box 4 - "
        label="Social security tax withheld"
        name="ssWithholding"
        patternConfig={Patterns.currency}
        error={errors.ssWithholding}
      />

      <LabeledInput
        strongLabel="Box 6 - "
        label="Medicare tax withheld"
        name="medicareWithholding"
        patternConfig={Patterns.currency}
        error={errors.medicareWithholding}
      />

      <GenericLabeledDropdown
        dropDownData={people}
        error={errors.personRole}
        label="Employee"
        required={true}
        valueMapping={(p: Person, i: number) => [PersonRole.PRIMARY, PersonRole.SPOUSE][i]}
        name="personRole"
        keyMapping={(p: Person, i: number) => i}
        textMapping={(p) => `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`}
      />
    </FormListContainer>
  )

  return (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <form onSubmit={onAdvance}>
          <h2>Job Information</h2>
          <FormProvider {...methods}>
            {form}
          </FormProvider>
          { navButtons }
        </form>
      }
    </PagerContext.Consumer>
  )
}
