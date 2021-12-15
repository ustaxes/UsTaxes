import {
  FilingStatus,
  Income1099Type,
  Information,
  QuestionTagName,
  ValueTag
} from '.'

export interface Question {
  text: string
  required?: (state: Information) => boolean
  tag: QuestionTagName
  // This is repeated effort, as it has to mirror value type from QuestionTag:
  readonly valueTag: ValueTag
}

function q(
  tag: QuestionTagName,
  text: string,
  valueTag: ValueTag,
  required: (s: Information) => boolean
): Question {
  return { text, tag, required, valueTag }
}

function qr(
  tag: QuestionTagName,
  text: string,
  valueTag: ValueTag = 'boolean'
): Question {
  return { text, tag, valueTag }
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
    (s: Information) => s.questions.FOREIGN_ACCOUNT_EXISTS ?? false
  ),
  q(
    'FINCEN_114_ACCOUNT_COUNTRY',
    'Enter the name of the foreign country where the financial account is located',
    'string',
    (s: Information) => s.questions.FINCEN_114 ?? false
  ),
  qr(
    'FOREIGN_TRUST_RELATIONSHIP',
    'During this tax year, did you receive a distribution from, or were you the grantor of, or a transferor to, a foreign trust?'
  ),
  q(
    'LIVE_APART_FROM_SPOUSE',
    `Did you live apart from your spouse for all of the year?`,
    'boolean',
    (s: Information) =>
      s.taxPayer.filingStatus == FilingStatus.MFS &&
      s.f1099s.some((i) => i.type == Income1099Type.SSA)
  )
]

export const getRequiredQuestions = (state: Information): Question[] =>
  questions.filter((q) => q.required === undefined || q.required(state))
