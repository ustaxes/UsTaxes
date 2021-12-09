import { ReactElement, useEffect } from 'react'
import { Grid, List, ListItem } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { QuestionTagName, Responses } from 'ustaxes-core/data'
import { getRequiredQuestions } from 'ustaxes-core/data/questions'
import { LabeledCheckbox, LabeledInput } from './input'
import { answerQuestion } from 'ustaxes/redux/actions'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from './pager'
import _ from 'lodash'

const emptyQuestions: Responses = {
  CRYPTO: false,
  FOREIGN_ACCOUNT_EXISTS: false,
  FINCEN_114: false,
  FINCEN_114_ACCOUNT_COUNTRY: '',
  FOREIGN_TRUST_RELATIONSHIP: false,
  LIVE_APART_FROM_SPOUSE: false
}

const Questions = (): ReactElement => {
  const information = useSelector((state: TaxesState) => state.information)

  const stateAnswers: Responses = {
    ...emptyQuestions,
    ...information.questions
  }

  const methods = useForm<Responses>({ defaultValues: stateAnswers })

  const { handleSubmit, getValues, reset } = methods

  const currentValues = getValues()

  const { navButtons, onAdvance } = usePager()

  const questions = getRequiredQuestions({
    ...information,
    questions: {
      ...information.questions,
      ...currentValues
    }
  })

  const currentAnswers: Responses = { ...emptyQuestions, ...currentValues }

  // This form can be rerendered because the global state was modified by
  // another control.
  useEffect(() => {
    if (!_.isEqual(currentAnswers, stateAnswers)) {
      reset(stateAnswers)
    }
  }, [])

  const dispatch = useDispatch()

  const onSubmit = (responses: Responses): void => {
    // fix to remove unrequired answers:
    const qtags = questions.map((q) => q.tag)
    const unrequired = Object.keys(responses).filter(
      (rtag) => qtags.find((t) => t === (rtag as QuestionTagName)) === undefined
    )

    const newResponses = {
      ...responses,
      ...Object.fromEntries(unrequired.map((k) => [k, undefined]))
    }

    dispatch(answerQuestion(newResponses))
    onAdvance()
  }

  const page = (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit)}>
      <h2>Informational Questions</h2>
      <p>
        Based on your prior responses, responses to these questions are
        required.
      </p>
      <Grid container spacing={2}>
        <List>
          {questions.map((q, i) => (
            <ListItem key={i}>
              {(() => {
                if (q.valueTag === 'boolean') {
                  return <LabeledCheckbox name={q.tag} label={q.text} />
                }
                return <LabeledInput name={q.tag} label={q.text} />
              })()}
            </ListItem>
          ))}
        </List>
      </Grid>
      {navButtons}
    </form>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

export default Questions
