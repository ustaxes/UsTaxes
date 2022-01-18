import F1040 from '../irsForms/F1040'
import { State, Information } from 'ustaxes/core/data'
import StateForm from 'ustaxes/core/stateForms/Form'
import or40 from './OR/OR40'
import { Either } from 'ustaxes/core/util'
import { createStateReturn as createStateReturnF } from '../../StateForms'
import { StateFormError } from '../../StateForms'

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
  [K in State]?: (info: Information, f1040: F1040) => StateForm
} = {
  OR: or40
}

export const createStateReturn = (
  info: Information,
  f1040: F1040
): Either<StateFormError[], StateForm[]> =>
  createStateReturnF<F1040>(noFilingRequirementStates, stateForms)(info, f1040)
