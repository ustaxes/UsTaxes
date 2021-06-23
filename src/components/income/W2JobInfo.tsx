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

export default function W2JobInfo (): ReactElement {
  const methods = useForm<IncomeW2UserInput>()
  const { errors, handleSubmit, reset } = methods
  const dispatch = useDispatch()

  const [editing, setEditing] = useState<number | undefined>(undefined)

  const w2s = useSelector((state: TaxesState) =>
    state.information.w2s
  )

  const clear = (): void => {
    reset()
    setEditing(undefined)
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

  const defaultValues = (() => {
    if (editing !== undefined) {
      return w2s[editing]
    }
  })()

  const people: Person[] = (
    useSelector((state: TaxesState) => ([
      state.information.taxPayer?.primaryPerson,
      state.information.taxPayer?.spouse
    ]))
      .filter((p) => p !== undefined)
      .map((p) => p as Person)
  )

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
        required={true}
        name="occupation"
        error={errors.occupation}
        defaultValue={defaultValues?.occupation}
      />

      <LabeledInput
        strongLabel="Box 1 - "
        label="Wages, tips, other compensation"
        required={true}
        patternConfig={Patterns.currency}
        name="income"
        error={errors.income}
        defaultValue={defaultValues?.income.toString()}
      />

      <LabeledInput
        strongLabel="Box 2 - "
        label="Federal income tax withheld"
        required={true}
        name="fedWithholding"
        patternConfig={Patterns.currency}
        error={errors.fedWithholding}
        defaultValue={defaultValues?.fedWithholding.toString()}
      />

      <LabeledInput
        strongLabel="Box 4 - "
        label="Social security tax withheld"
        required={true}
        name="ssWithholding"
        patternConfig={Patterns.currency}
        error={errors.ssWithholding}
      />

      <LabeledInput
        strongLabel="Box 6 - "
        label="Medicare tax withheld"
        required={true}
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
        defaultValue={defaultValues?.personRole ?? PersonRole.PRIMARY}
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
