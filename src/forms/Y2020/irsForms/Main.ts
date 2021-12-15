import { Information } from 'ustaxes/core/data'
import { Either, isRight, left, right } from 'ustaxes/core/util'
import F1040, { F1040Error } from './F1040'
import Form from './Form'

export function create1040(
  state: Information
): Either<F1040Error[], [F1040, Form[]]> {
  const f1040 = new F1040(state)

  if (f1040.errors().length > 0) {
    return left(f1040.errors())
  }

  return right([f1040, f1040.schedules()])
}

export const createForms = (
  state: Information
): Either<F1040Error[], Form[]> => {
  const res = create1040(state)
  if (isRight(res)) {
    return right(res.right.flat())
  } else {
    return res
  }
}
