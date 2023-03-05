import { ReactElement } from 'react'
import { Grid } from '@material-ui/core'
import { FormProvider, useForm } from 'react-hook-form'
import { Credit, CreditType, Person, PersonRole } from 'ustaxes/core/data'
import { useDispatch, useSelector } from 'ustaxes/redux'
import { addCredit, editCredit } from 'ustaxes/redux/actions'
import { FormListContainer } from '../FormContainer'
import { Currency, GenericLabeledDropdown, LabeledInput } from '../input'
import { usePager } from '../pager'
import { Patterns } from '../Patterns'

interface CreditUserInput {
  recipient: PersonRole
  amount: string
}

const blankCreditUserInput: Partial<CreditUserInput> = {
  amount: ''
}

const toCredit = (u: CreditUserInput): Credit => {
  const amount = parseFloat(u.amount)
  return {
    type: CreditType.AdvanceChildTaxCredit,
    amount,
    recipient: u.recipient
  }
}

const toCreditUserInput = (c: Credit): CreditUserInput => {
  return {
    ...blankCreditUserInput,
    ...c,
    amount: c.amount.toFixed(2)
  }
}

export const AdvanceChildTaxCredit = (): ReactElement => {
  const defaultValues = blankCreditUserInput
  const credits = useSelector(({ information }) => information.credits)
  const taxPayer = useSelector(({ information }) => information.taxPayer)
  const spouse = taxPayer.spouse

  const blank = { firstName: '', lastName: '' }
  const { firstName: primaryFirst, lastName: primaryLast } =
    taxPayer.primaryPerson ?? blank
  const { firstName: spouseFirst, lastName: spouseLast } =
    taxPayer.spouse ?? blank

  const primaryName = `${primaryFirst} ${primaryLast}`
  const spouseName = `${spouseFirst} ${spouseLast}`

  const { navButtons, onAdvance } = usePager()

  const advanceChildTaxCredits = credits
    .map<[number, Credit]>((c, i) => [i, c])
    .filter(([, c]) => c.type === CreditType.AdvanceChildTaxCredit)

  const dispatch = useDispatch()

  const methods = useForm<CreditUserInput>({
    defaultValues
  })

  const onSubmitAdd = (formData: CreditUserInput): void => {
    dispatch(addCredit(toCredit(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: CreditUserInput): void => {
      dispatch(editCredit({ index, value: toCredit(formData) }))
    }

  // People for recipient selector
  const people: Person[] = [taxPayer.primaryPerson, spouse].flatMap((p) =>
    p !== undefined ? [p as Person] : []
  )

  return (
    <FormProvider {...methods}>
      <h2>Advance Child Tax Credit Payments</h2>
      <p>
        Enter the advance Child Tax Credit payments you received, if any,
        indicated on Letter 6419.
      </p>
      <FormListContainer<CreditUserInput>
        defaultValues={defaultValues}
        primary={(c) =>
          c.recipient === PersonRole.PRIMARY ? primaryName : spouseName
        }
        secondary={(c) => <Currency value={parseFloat(c.amount)} />}
        items={advanceChildTaxCredits.map(([, c]) => toCreditUserInput(c))}
        onSubmitAdd={onSubmitAdd}
        onSubmitEdit={onSubmitEdit}
      >
        <Grid container direction="column" spacing={2}>
          <LabeledInput
            label="Amount"
            name="amount"
            patternConfig={Patterns.currency}
          />
          <GenericLabeledDropdown
            dropDownData={people}
            label="Recipient"
            required={true}
            valueMapping={(p: Person, i: number) =>
              [PersonRole.PRIMARY, PersonRole.SPOUSE][i]
            }
            name="recipient"
            keyMapping={(p: Person, i: number) => i}
            textMapping={(p) => `${p.firstName} ${p.initial} ${p.lastName}`}
          />
        </Grid>
      </FormListContainer>
      <form onSubmit={onAdvance}>{navButtons}</form>
    </FormProvider>
  )
}
