import React, { ReactElement } from 'react'
import { List, ListItem } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { getRequiredQuestions, QuestionTagName, Responses } from '../data/questions'
import { TaxesState } from '../redux/data'
import { answerQuestion } from '../redux/actions'
import { LabeledCheckbox, LabeledInput } from './input'
import { useForm } from 'react-hook-form'
import { PagerContext } from './pager'

const Questions = (): ReactElement => {
  const state = useSelector((state: TaxesState) => state)

  const { control, register, handleSubmit, watch } = useForm<Responses>()

  const currentValues = watch()

  const questions = getRequiredQuestions({
    information: {
      ...state.information,
      questions: {
        ...state.information.questions,
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

  return (
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
                            control={control}
                            defaultValue={state.information.questions[q.tag] as (boolean | undefined)}
                          />
                        )
                      }
                      default: {
                        return (
                          <LabeledInput
                            name={q.tag}
                            register={register}
                            label={q.text}
                            defaultValue={state.information.questions[q.tag] as (string | undefined)}
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
}

export default Questions
