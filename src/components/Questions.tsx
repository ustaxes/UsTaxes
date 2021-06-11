import React, { ReactElement } from 'react'
import { List, ListItem } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { getRequiredQuestions, QuestionTag } from '../data/questions'
import { TaxesState } from '../redux/data'
import { answerQuestion } from '../redux/actions'
import { LabeledCheckbox } from './input'
import { useForm } from 'react-hook-form'
import { enumKeys } from '../util'
import { PagerContext } from './pager'

type Responses = {[k in keyof typeof QuestionTag]: boolean}

const Questions = (): ReactElement => {
  const state = useSelector((state: TaxesState) => state)
  const questions = getRequiredQuestions(state)

  const { control, handleSubmit } = useForm<Responses>({
    defaultValues: Object.fromEntries(enumKeys(QuestionTag).map((x) => [x, false])) as Responses
  })

  const dispatch = useDispatch()

  const onSubmit = (onAdvance: () => void) => (responses: Responses): void => {
    Object.entries(responses).forEach(([tag, value]) => {
      dispatch(answerQuestion({ tag: tag as keyof typeof QuestionTag, value }))
    })
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
                  <LabeledCheckbox
                    name={QuestionTag[q.tag]}
                    label={q.text}
                    control={control}
                  />
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
