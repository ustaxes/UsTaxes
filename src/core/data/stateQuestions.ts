import {
  FilingStatus,
  Income1099Type,
  Information,
  StateQuestionTagName,
  ValueTag
} from '.'

export interface StateQuestion {
  text: string
  desc: string
  required?: (state: Information) => boolean
  tag: StateQuestionTagName
  // This is repeated effort, as it has to mirror value type from QuestionTag:
  readonly valueTag: ValueTag
}

function q(
  tag: StateQuestionTagName,
  text: string,
  desc: string,
  valueTag: ValueTag,
  required: (s: Information) => boolean
): StateQuestion {
  return { text, desc, tag, required, valueTag }
}

function qr(
  tag: StateQuestionTagName,
  text: string,
  desc: string,
  valueTag: ValueTag = 'boolean'
): StateQuestion {
  return { text, desc, tag, valueTag }
}

export const stateQuestions: StateQuestion[] = [
  q(
    'OR_TAXPAYER_SEVERELY_DISABLED',
    `Are you severely disabled?`,
    `<h2>blah blah blah</h2>`,
    'boolean',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  )
]

export const getRequiredStateQuestions = (
  state: Information
): StateQuestion[] =>
  stateQuestions.filter((q) => q.required === undefined || q.required(state))
