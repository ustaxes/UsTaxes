import React, { ReactElement, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import SchoolIcon from '@material-ui/icons/School'
import { useDispatch, useSelector } from 'react-redux'
import { add1098e, edit1098e, remove1098e } from '../../redux/actions'
import { usePager } from '../pager'
import { Currency, LabeledInput } from '../input'
import { TaxesState, F1098e } from '../../redux/data'
import { Patterns } from '../Patterns'
import { FormListContainer } from '../FormContainer'

const showInterest = (a: F1098e): ReactElement => {
  return <Currency value={a.interest} />
}

interface F1098EUserInput {
  lender: string
  interest: string | number
}

const blankUserInput: F1098EUserInput = {
  lender: '',
  interest: ''
}

const toUserInput = (f: F1098e): F1098EUserInput => ({
  ...blankUserInput,
  lender: f.lender,
  interest: f.interest
})

const toF1098e = (f: F1098EUserInput): F1098e => {
  return {
    lender: f.lender,
    interest: Number(f.interest)
  }
}

export default function F1098eInfo(): ReactElement {
  const f1098es = useSelector((state: TaxesState) => state.information.f1098es)
  const [editing, setEditing] = useState<number | undefined>(undefined)

  const defaultValues: F1098EUserInput = (() => {
    if (editing !== undefined) {
      return toUserInput(f1098es[editing])
    }
    return blankUserInput
  })()

  const { onAdvance, navButtons } = usePager()

  const methods = useForm<F1098EUserInput>({ defaultValues })
  const { handleSubmit, reset } = methods

  const dispatch = useDispatch()

  const clear = (): void => {
    reset()
    setEditing(undefined)
  }

  const onAdd1098e =
    (onSuccess: () => void) =>
    (formData: F1098EUserInput): void => {
      const payload = toF1098e(formData)
      if (payload !== undefined) {
        if (editing === undefined) {
          console.log(payload)
          dispatch(add1098e(payload))
        } else {
          dispatch(edit1098e({ index: editing, value: payload }))
        }
        clear()
        onSuccess()
      }
    }

  const form: ReactElement | undefined = (
    <FormListContainer
      onDone={(onSuccess) => handleSubmit(onAdd1098e(onSuccess))}
      onCancel={clear}
      items={f1098es}
      removeItem={(i) => dispatch(remove1098e(i))}
      editing={editing}
      editItem={setEditing}
      primary={(f) => f.lender}
      secondary={(f) => showInterest(f)}
      icon={(f) => <SchoolIcon />}
    >
      <strong>Input data from 1098-E</strong>
      <LabeledInput
        label="Enter name of Lender"
        patternConfig={Patterns.name}
        name="lender"
      />
      <LabeledInput
        label="Student Interest Paid"
        patternConfig={Patterns.currency}
        name="interest"
      />
    </FormListContainer>
  )

  return (
    <form onSubmit={onAdvance}>
      <FormProvider {...methods}>
        <h2>1098-E Information</h2>
        {form}
        {navButtons}
      </FormProvider>
    </form>
  )
}
