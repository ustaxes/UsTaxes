import React, { Fragment, ReactElement, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormProvider, useForm } from 'react-hook-form'
import { PagerContext } from '../pager'
import { TaxesState, IncomeW2, Person, PersonRole, Spouse, PrimaryPerson } from '../../redux/data'
import { Currency, formatSSID, GenericLabeledDropdown, LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { FormListContainer } from '../FormContainer'
import { Box } from '@material-ui/core'
import { Work } from '@material-ui/icons'
import { addW2, editW2, removeW2 } from '../../redux/actions'
import { Else, If, Then } from 'react-if'

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

  const spouse: Spouse | undefined = useSelector((state: TaxesState) =>
    state.information.taxPayer?.spouse
  )

  const primary: PrimaryPerson | undefined = useSelector((state: TaxesState) =>
    state.information.taxPayer?.primaryPerson
  )

  // People for employee selector
  const people: Person[] = [primary, spouse].flatMap((p) => p !== undefined ? [p as Person] : [])

  const w2s: Array<[IncomeW2, number]> = useSelector((state: TaxesState) =>
    state.information.w2s.map((w2, i) => [w2, i])
  )

  const primaryW2s = w2s.filter(([w2]) => w2.personRole === PersonRole.PRIMARY)
  const spouseW2s = w2s.filter(([w2]) => w2.personRole === PersonRole.SPOUSE)

  const setEditing = (idx: number): void => {
    reset(toIncomeW2UserInput(w2s[idx][0]))
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

  const showW2s = (_w2s: Array<[IncomeW2, number]>, omitAdd: boolean = false): ReactElement => (
    <FormListContainer<[IncomeW2, number]>
      items={_w2s}
      onDone={(onSuccess) => handleSubmit(onAddW2(onSuccess))}
      editing={_w2s.findIndex(([_, idx]) => idx === editing)}
      disableEditing={editing !== undefined}
      editItem={(idx) => setEditing(_w2s[idx][1])}
      removeItem={(i) => dispatch(removeW2(i))}
      icon={() => <Work />}
      primary={(w2: [IncomeW2, number]) => w2[0].employer?.employerName ?? w2[0].occupation }
      secondary={(w2: [IncomeW2, number]) => <span>Income: <Currency value={w2[0].income} /></span>}
      onCancel={clear}
      max={omitAdd ? 0 : undefined}
    >
      <strong>Input data from W-2</strong>
      <LabeledInput
        label="Occupation"
        required={true}
        name="occupation"
        error={errors.occupation}
      />

      <LabeledInput
        strongLabel="Box 1 - "
        label="Wages, tips, other compensation"
        required={true}
        patternConfig={Patterns.currency}
        name="income"
        error={errors.income}
      />

      <LabeledInput
        strongLabel="Box 2 - "
        label="Federal income tax withheld"
        required={true}
        name="fedWithholding"
        patternConfig={Patterns.currency}
        error={errors.fedWithholding}
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
      />
    </FormListContainer>
  )

  const form: ReactElement = (
    <Fragment>
      <If condition={spouse !== undefined}>
        <Then>
          <Box className="inner">
            <h3>{primary?.firstName ?? 'Primary'} {primary?.lastName ?? 'Taxpayer'}&apos;s W2s</h3>
            {showW2s(primaryW2s, true)}
          </Box>
        </Then><Else>
          {showW2s(primaryW2s, true)}
        </Else>
      </If>
      <If condition={spouse !== undefined && spouseW2s.length > 0}>
        <Box className="inner">
          <h3>{spouse?.firstName ?? 'Spouse'} {spouse?.lastName ?? 'Taxpayer'}&apos;s W2s</h3>
          {showW2s(spouseW2s, true)}
        </Box>
      </If>
      <If condition={editing === undefined}>
        {
          // just for Add button:
          showW2s([])
        }
      </If>
    </Fragment>
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
