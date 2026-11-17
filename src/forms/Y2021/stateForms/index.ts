import type F1040 from '../irsForms/F1040'
import type { State } from 'ustaxes/core/data'
import type StateForm from 'ustaxes/core/stateForms/Form'
import il1040 from './IL/IL1040'
import type { Either } from 'ustaxes/core/util'
import { createStateReturn as createStateReturnF } from '../../StateForms'
import type { StateFormError } from '../../StateForms'

export const noFilingRequirementStates: State[] = [
  'AK',
  'TN',
  'WY',
  'FL',
  'NH',
  'SD',
  'TX',
  'WA',
  'NV'
]

export const stateForms: {
  [K in State]?: (f1040: F1040) => StateForm
} = {
  IL: il1040
}

export const createStateReturn = (
  f1040: F1040
): Either<StateFormError[], StateForm[]> =>
  createStateReturnF<F1040>(noFilingRequirementStates, stateForms)(f1040)
