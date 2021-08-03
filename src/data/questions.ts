import { TaxesState } from '../redux/data'
import { Either, isLeft, isRight, left, right } from '../util'

// Defines usable tag names for each question later defined,
// and maps to a type which is the expected response type.
export interface QuestionTag {
  CRYPTO: boolean
  FOREIGN_ACCOUNT_EXISTS: boolean
  FINCEN_114: boolean
  FINCEN_114_ACCOUNT_COUNTRY: string
  FOREIGN_TRUST_RELATIONSHIP: boolean
}

export type QuestionTagName = keyof QuestionTag

// Typescript provides no way to access
// keys of an interface at runtime.
export const questionTagNames: QuestionTagName[] = [
  'CRYPTO',
  'FOREIGN_ACCOUNT_EXISTS',
  'FINCEN_114',
  'FINCEN_114_ACCOUNT_COUNTRY',
  'FOREIGN_TRUST_RELATIONSHIP'
]

type ValueTag = 'string' | 'boolean'

export interface Question {
  text: string
  required: Either<boolean, (state: TaxesState) => boolean>
  tag: QuestionTagName
  // This is repeated effort, as it has to mirror value type from QuestionTag:
  readonly valueTag: ValueTag
}

export type Responses = Partial<QuestionTag>

function q(
  tag: QuestionTagName,
  text: string,
  valueTag: ValueTag,
  required: (s: TaxesState) => boolean
): Question {
  return { text, tag, required: right(required), valueTag }
}

function qr(
  tag: QuestionTagName,
  text: string,
  valueTag: ValueTag = 'boolean'
): Question {
  return { text, tag, required: left(true), valueTag }
}

export const questions: Question[] = [
  qr('CRYPTO', 'Do you have any crypto-currency transactions?'),
  qr(
    'FOREIGN_ACCOUNT_EXISTS',
    'At any time in this year, did you have a financial interest in or signature authority over a financial account such as a bank account, securities account, or brokerage account) located in a foreign country?'
  ),
  q(
    'FINCEN_114',
    'Are you required to file FinCEN Form 114, Report of Foreign Bank and Financial Accounts (FBAR), to report that financial interest or signature authority? See FinCEN Form 114 and its instructions for filing requirements and exceptions to those requirements',
    'boolean',
    (s: TaxesState) => s.information.questions.FOREIGN_ACCOUNT_EXISTS ?? false
  ),
  q(
    'FINCEN_114_ACCOUNT_COUNTRY',
    'Enter the name of the foreign country where the financial account is located',
    'string',
    (s: TaxesState) => s.information.questions.FINCEN_114 ?? false
  ),
  qr(
    'FOREIGN_TRUST_RELATIONSHIP',
    'During this tax year, did you receive a distribution from, or were you the grantor of, or a transferor to, a foreign trust?'
  )
]

export const getRequiredQuestions = (state: TaxesState): Question[] =>
  questions.filter(
    (q) =>
      isLeft(q.required) || (isRight(q.required) && q.required.right(state))
  )
