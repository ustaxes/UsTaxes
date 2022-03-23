import { FormAction, FormGenActionName } from './actions'
import { Assignment, Form } from './data'

export interface FormsState {
  forms: Form[]
  assignments: Assignment[]
}

export const blankState: FormsState = {
  forms: [],
  assignments: []
}

export const formReducer = (
  state: FormsState | undefined,
  action: FormAction
): FormsState => {
  const newState = state === undefined ? blankState : state

  switch (action.type) {
    case FormGenActionName.ADD_FORM: {
      return {
        ...newState,
        forms: [...newState.forms, action.formData]
      }
    }

    case FormGenActionName.ASSIGN_FIELD: {
      return {
        ...newState,
        assignments: [...newState.assignments, action.formData]
      }
    }

    default: {
      return newState
    }
  }
}
