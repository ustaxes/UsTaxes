import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Grid, List, ListItem, Link } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { StateQuestionTagName, StateResponses } from 'ustaxes/core/data'
import { getRequiredStateQuestions } from 'ustaxes/core/data/stateQuestions'
import { LabeledCheckbox, LabeledInput, GenericLabeledDropdown } from './input'
import { answerStateQuestion } from 'ustaxes/redux/actions'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from './pager'
import _ from 'lodash'
import { intentionallyFloat } from 'ustaxes/core/util'

const emptyQuestions: StateResponses = {
  // oregon state questions
  // page 2
  OR_6A_TAXPAYER_SEVERELY_DISABLED: false,
  OR_6B_SPOUSE_SEVERELY_DISABLED: false,
  // page 5
  OR_32_OREGON_INCOME_TAX_WITHHELD: '',
  OR_33_AMOUNT_APPLIED_FROM_PRIOR_YEAR_REFUND: '',
  OR_34_ESTIMATED_TAX_PAYMENTS: '',
  OR_36_53_KICKER_OREGON_SURPLUS_CREDIT: '',
  OR_37_TOTAL_REFUNDABLE_CREDITS_FROM_OR_ASC: '',
  OR_41_PENALTY_FOR_FILING_LATE: '',
  OR_42_INTEREST_ON_UNDERPAYMENT_OF_EST_TAX: '',
  OR_42a_EXCEPTION_NUMBER: '',
  OR_42b_ANNUALIZED: false,
  // page 6
  OR_46_ESTIMATED_TAX: '',
  OR_47_CHARITABLE_CHECKOFF_DONATIONS: '',
  OR_48_POLITICAL_PARTY_3DOLLAR_CHECKOFF: '',
  OR_48a_TAXPAYER_POLITICAL_PARTY_CODE: '',
  OR_48b_SPOUSE_POLITICAL_PARTY_CODE: '',
  OR_49_529_COLLEGE_SAVINGS_PLAN_DEPOSITS: '',
  OR_53_DONATE_TO_STATE_SCHOOL_FUND: false
}

const OR10ExceptionNumbers = [
  {
    name: 'Exception 1: Two-thirds of your income is from farming or fishing.',
    code: '1'
  },
  {
    name: 'Exception 2: The tax on last year’s resident return was $0.',
    code: '2'
  },
  {
    name: 'Exception 3: You retired at age 62 or older or became disabled within the last two years and there was a reasonable cause for the underpayment.',
    code: '3'
  },
  {
    name: 'Exception 4: You underpaid due to unusual circumstances.',
    code: '4'
  },
  {
    name: 'Exception 5: You’re a shareholder of a corporation that recently made a Subchapter S election and you were a nonresident in 2021 or a part-year resident in 2020.',
    code: '5'
  }
]

const ORPoliticalParties = [
  { name: 'Constitution Party of Oregon', code: '500' },
  { name: 'Democratic Party of Oregon', code: '501' },
  { name: 'Independent Party of Oregon', code: '502' },
  { name: 'Libertarian Party of Oregon', code: '503' },
  { name: 'Oregon Republican Party', code: '504' },
  { name: 'Pacific Green Party of Oregon', code: '505' },
  { name: 'Progressive Party', code: '506' },
  { name: 'Working Families Party of Oregon', code: '507' }
]

const StateQuestions = (): ReactElement => {
  const information = useSelector((state: TaxesState) => state.information)
  const stateResidency = useSelector(
    (state: TaxesState) => state.information.stateResidencies[0].state
  )

  const stateAnswers: StateResponses = {
    ...emptyQuestions,
    ...information.stateQuestions
  }

  const methods = useForm<StateResponses>({ defaultValues: stateAnswers })

  const {
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty }
  } = methods

  const currentValues = getValues()

  const { navButtons, onAdvance } = usePager()

  const stateQuestions = getRequiredStateQuestions({
    ...information,
    stateQuestions: {
      ...information.stateQuestions,
      ...currentValues
    }
  })

  const currentAnswers: StateResponses = { ...emptyQuestions, ...currentValues }

  // This form can be rerendered because the global state was modified by
  // another control.
  useEffect(() => {
    if (!isDirty && !_.isEqual(currentAnswers, stateAnswers)) {
      reset(stateAnswers)
    }
  }, [])

  const dispatch = useDispatch()

  const onSubmit = (stateResponses: StateResponses): void => {
    // fix to remove unrequired answers:
    const qtags = stateQuestions.map((q) => q.tag)
    const unrequired = Object.keys(stateResponses).filter(
      (rtag) =>
        qtags.find((t) => t === (rtag as StateQuestionTagName)) === undefined
    )

    const newStateResponses = {
      ...stateResponses,
      ...Object.fromEntries(unrequired.map((k) => [k, undefined]))
    }

    dispatch(answerStateQuestion(newStateResponses))
    onAdvance()
  }

  const htmlDecode = (input: string): string => {
    const e = document.createElement('div')
    e.innerHTML = input
    const value = e.childNodes[0].nodeValue
    return e.childNodes.length === 0 || value === null ? '' : value
  }

  const page = (
    <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
      <Helmet>
        <title>State Questions | Results | UsTaxes.org</title>
      </Helmet>
      <h2>State Questions</h2>
      <div>
        {(() => {
          switch (stateResidency) {
            case 'OR': {
              return (
                <Link
                  href="https://www.oregon.gov/dor/forms/FormsPubs/form-or-40-inst_101-040-1_2021.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  2021 Oregon Income Tax - Form OR-40 Instructions
                </Link>
              )
            }
          }
        })()}
      </div>
      <Grid container spacing={2}>
        <List>
          {stateQuestions.map((q, i) => (
            <ListItem key={i}>
              <div>
                {q.description !== '' && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: htmlDecode(q.description)
                    }}
                  />
                )}
                {(() => {
                  let dropDownData: unknown[] = []

                  if (
                    q.tag === 'OR_48a_TAXPAYER_POLITICAL_PARTY_CODE' ||
                    q.tag === 'OR_48b_SPOUSE_POLITICAL_PARTY_CODE'
                  ) {
                    dropDownData = ORPoliticalParties
                  } else if (q.tag === 'OR_42a_EXCEPTION_NUMBER') {
                    dropDownData = OR10ExceptionNumbers
                  }

                  if (q.valueTag === 'boolean') {
                    return <LabeledCheckbox name={q.tag} label={q.text} />
                  } else if (q.valueTag === 'combobox') {
                    return (
                      <GenericLabeledDropdown
                        dropDownData={
                          dropDownData as unknown as {
                            name: string
                            code: string
                          }[]
                        }
                        label={q.text}
                        valueMapping={(p) => p.code}
                        name={q.tag}
                        keyMapping={(p) => p.code}
                        textMapping={(p) => p.name}
                      />
                    )
                  } else {
                    return <LabeledInput name={q.tag} label={q.text} />
                  }
                })()}
              </div>
            </ListItem>
          ))}
        </List>
      </Grid>
      {navButtons}
    </form>
  )
  return <FormProvider {...methods}>{page}</FormProvider>
}

export default StateQuestions
