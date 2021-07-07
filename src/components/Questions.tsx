import React, { ReactElement } from 'react'
import { List, ListItem } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { getRequiredQuestions, QuestionTagName, Responses } from '../data/questions'
import { TaxesState } from '../redux/data'
import { answerQuestion } from '../redux/actions'
import { LabeledCheckbox, LabeledInput } from './input'
import { FormProvider, useForm } from 'react-hook-form'
import { PagerContext } from './pager'

const Questions = (): ReactElement => {
  const information = useSelector((state: TaxesState) => state.information)

  const methods = useForm<Responses>({ defaultValues: information.questions })
  const { handleSubmit, watch } = methods

  const currentValues = watch()

  const questions = getRequiredQuestions({
    information: {
      ...information,
      questions: {
        ...information.questions,
        ...currentValues
      }
    }
  })

  const dispatch = useDispatch()

  const onSubmit = (onAdvance: () => void) => (responses: Responses): void => {
    // fix to remove unrequired answers:
    const qtags = questions.map((q) => q.tag)
    const unrequired = Object.keys(responses).filter((rtag) => qtags.find((t) => t === rtag as QuestionTagName) === undefined)

    const newResponses = {
      ...responses,
      ...Object.fromEntries(unrequired.map((k) => [k, undefined]))
    }

    dispatch(answerQuestion(newResponses))
    onAdvance()
  }

  const page = (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <h2>Informational Questions</h2>
          <p>Based on your prior responses, reseponses to these questions are required.</p>
          <List>
            {
              questions.map((q, i) =>
                <ListItem key={i}>
                  {(() => {
                    switch (q.valueTag) {
                      case 'boolean': {
                        return (
                          <LabeledCheckbox
                            name={q.tag}
                            label={q.text}
                          />
                        )
                      }
                      default: {
                        return (
                          <LabeledInput
                            name={q.tag}
                            label={q.text}
                          />
                        )
                      }
                    }
                  })()}
                </ListItem>
              )
            }
          </List>
          {navButtons}
        </form>
      }
    </PagerContext.Consumer>
  )

  return (
    <FormProvider {...methods}>{page}</FormProvider>
  )
}

export default Questions
