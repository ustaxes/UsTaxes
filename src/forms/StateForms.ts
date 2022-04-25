import { State } from 'ustaxes/core/data'
import StateForm from 'ustaxes/core/stateForms/Form'
import { Either, left, right } from 'ustaxes/core/util'
import F1040Base from './F1040Base'

export enum StateFormError {
  unsupportedTaxYear = 'Tax year not supported',
  NoResidency = 'No residency defined',
  StateFormsNotAvailable = 'No state forms available',
  NoFilingRequirement = 'No filing requirement'
}

type StateForms<F> = {
  [K in State]?: (f1040: F) => StateForm
}

export const createStateReturn =
  <F extends F1040Base>(noFilingStates: State[], stateForms: StateForms<F>) =>
  (f1040: F): Either<StateFormError[], StateForm[]> => {
    if (f1040.info.stateResidencies.length < 1) {
      return left([StateFormError.NoResidency])
    } else if (noFilingStates.includes(f1040.info.stateResidencies[0].state)) {
      return left([StateFormError.NoFilingRequirement])
    }

    const residency = f1040.info.stateResidencies[0]
    const form = stateForms[residency.state]?.call(undefined, f1040)
    if (form !== undefined) {
      return right(
        [form, ...form.attachments()].sort((a, b) => a.formOrder - b.formOrder)
      )
    }
    return left([StateFormError.StateFormsNotAvailable])
  }
