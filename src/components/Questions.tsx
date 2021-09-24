import { ReactElement, useEffect } from 'react'
import { Grid, List, ListItem } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import {
  getRequiredQuestions,
  QuestionTagName,
  Responses
} from 'ustaxes/data/questions'
import { LabeledCheckbox, LabeledInput } from './input'
import { answerQuestion } from 'ustaxes/redux/actions'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from './pager'
import { Else, If, Then } from 'react-if'
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

  const stateQuestions = _.defaults(information.questions, emptyQuestions)

  const methods = useForm<Responses>({ defaultValues: stateQuestions })

  const {
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { isDirty }
  } = methods

  const currentValues = watch()

  const { navButtons, onAdvance } = usePager()

  const questions = getRequiredQuestions({
    ...information,
    questions: {
      ...information.questions,
      ...currentValues
    }
  })

  // This form rerenders because the user is editing it or because
  // the global state was modified by another control. We have to reset
  // the form values in the second case.
  useEffect(() => {
    if (
      !isDirty &&
      !_.isEqual(_.defaults(getValues(), emptyQuestions), stateQuestions)
    ) {
      reset(information.questions)
    }
  })

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
              <If condition={q.valueTag === 'boolean'}>
                <Then>
                  <LabeledCheckbox name={q.tag} label={q.text} />
                </Then>
                <Else>
                  <LabeledInput name={q.tag} label={q.text} />
                </Else>
              </If>
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
