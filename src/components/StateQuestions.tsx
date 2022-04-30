import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Grid, List, ListItem } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { StateQuestionTagName, StateResponses } from 'ustaxes/core/data'
import { getRequiredStateQuestions } from 'ustaxes/core/data/stateQuestions'
import { LabeledCheckbox, LabeledInput } from './input'
import { answerStateQuestion } from 'ustaxes/redux/actions'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from './pager'
import _ from 'lodash'

const emptyQuestions: StateResponses = {
  OR_TAXPAYER_SEVERELY_DISABLED: false
}

const StateQuestions = (): ReactElement => {
  const information = useSelector((state: TaxesState) => state.information)

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

  const page = (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit)}>
      <Helmet>
        <title>State Questions | Results | UsTaxes.org</title>
      </Helmet>
      <h2>State Questions</h2>
      <p>
        Based on your prior responses, responses to these questions are
        required.
      </p>
      <Grid container spacing={2}>
        <List>
          {stateQuestions.map((q, i) => (
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

export default StateQuestions
