import F1040 from '../irsForms/F1040'
import { State, Information } from 'ustaxes/core/data'
import Form from 'ustaxes/core/stateForms/Form'
import { Either, left, right } from 'ustaxes/core/util'

export const stateForm: {
  [K in State]?: (info: Information, f1040: F1040) => Form
} = {}

enum StateFormError {
  NoResidency = 'No residency defined',
  StateFormsNotAvailable = 'No state forms available'
}

export const createStateReturn = (
  info: Information,
  f1040: F1040
): Either<StateFormError[], Form[]> => {
  if (info.stateResidencies !== undefined && info.stateResidencies.length < 1) {
    return left([StateFormError.NoResidency])
  }

  const residency = info.stateResidencies[0]
  const form = stateForm[residency.state]?.call(undefined, info, f1040)
  if (form !== undefined) {
    return right(
      [form, ...form?.attachments()].sort((a, b) => a.formOrder - b.formOrder)
    )
  }
  return left([StateFormError.StateFormsNotAvailable])
}
