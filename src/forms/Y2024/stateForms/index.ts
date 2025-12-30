import F1040 from '../irsForms/F1040'
import { State } from 'ustaxes/core/data'
import StateForm from 'ustaxes/core/stateForms/Form'
import { Either } from 'ustaxes/core/util'
import { createStateReturn as createStateReturnF } from '../../StateForms'
import { StateFormError } from '../../StateForms'
// Import Y2021 IL forms as temporary implementation for Y2024
import il1040 from '../../Y2021/stateForms/IL/IL1040'
// Import Y2024 MA forms
import ma1 from './MA/MA1'

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  IL: il1040 as any, // Y2021 IL forms used for Y2024 (type incompatible)
  MA: ma1 // Y2024 MA forms
}

export const createStateReturn = (
  f1040: F1040
): Either<StateFormError[], StateForm[]> =>
  createStateReturnF<F1040>(noFilingRequirementStates, stateForms)(f1040)
