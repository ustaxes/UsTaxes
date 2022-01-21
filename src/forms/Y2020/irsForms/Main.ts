import { Information, Asset } from 'ustaxes/core/data'
import { Either, left, right } from 'ustaxes/core/util'
import F1040 from './F1040'
import Form from 'ustaxes/core/irsForms/Form'
import { F1040Error } from 'ustaxes/forms/errors'

export function create1040(
  state: Information,
  assets: Asset<Date>[]
): Either<F1040Error[], [F1040, Form[]]> {
  const f1040 = new F1040(state, assets)

  if (f1040.errors().length > 0) {
    return left(f1040.errors())
  }

  return right([f1040, f1040.schedules()])
}
