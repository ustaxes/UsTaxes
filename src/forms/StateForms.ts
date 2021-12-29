import { Information, State } from 'ustaxes/core/data'
import StateForm from 'ustaxes/core/stateForms/Form'
import { Either, left, right } from 'ustaxes/core/util'

export enum StateFormError {
  unsupportedTaxYear = 'Tax year not supported',
  NoResidency = 'No residency defined',
  StateFormsNotAvailable = 'No state forms available',
  NoFilingRequirement = 'No filing requirement'
}

type StateForms<F> = {
  [K in State]?: (info: Information, f1040: F) => StateForm
}

export const createStateReturn =
  <F>(noFilingStates: State[], stateForms: StateForms<F>) =>
  (info: Information, f1040: F): Either<StateFormError[], StateForm[]> => {
    if (
      info.stateResidencies !== undefined &&
      info.stateResidencies.length < 1
    ) {
      return left([StateFormError.NoResidency])
    } else if (noFilingStates.includes(info.stateResidencies[0].state)) {
      return left([StateFormError.NoFilingRequirement])
    }

    const residency = info.stateResidencies[0]
    const form = stateForms[residency.state]?.call(undefined, info, f1040)
    if (form !== undefined) {
      return right(
        [form, ...form?.attachments()].sort((a, b) => a.formOrder - b.formOrder)
      )
    }
    return left([StateFormError.StateFormsNotAvailable])
  }
