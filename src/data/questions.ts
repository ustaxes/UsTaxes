import { TaxesState } from '../redux/data'
import { Either, isLeft, isRight, left } from '../util'

export enum QuestionTag {
  CRYPTO
}

// type QuestionTagName = keyof typeof QuestionTag

export interface Question {
  text: string
  required: Either<boolean, (state: TaxesState) => boolean>
  tag: QuestionTag
}

// function q (tag: QuestionTag, text: string, required: ((s: TaxesState) => boolean)): Question {
//   return { text, tag, required: right(required) }
// }

function qr (tag: QuestionTag, text: string): Question {
  return { text, tag, required: left(true) }
}

export const questions: Question[] = [
  qr(QuestionTag.CRYPTO, 'Do you have any crypto-currency transactions?')
]

export const getRequiredQuestions = (state: TaxesState): Question[] => questions.filter((q) =>
  isLeft(q.required) || (isRight(q.required) && q.required.right(state))
)
