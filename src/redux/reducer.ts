/* eslint-disable indent */
import { combineReducers } from 'redux'
import { Information } from './data'
import {
  SAVE_EMPLOYEE_DATA,
  SAVE_EMPLOYER_DATA,
  SAVE_FAMILY_INFO,
  SAVE_W2_INFO,
  Actions
} from './actions'

function formReducer (state: Information | undefined, action: Actions): Information {
  const newState: Information = state ?? {}

  switch (action.type) {
    case SAVE_EMPLOYEE_DATA: {
      return { ...newState, w2EmployeeInfo: action.formData }
    }
    case SAVE_EMPLOYER_DATA: {
      return { ...newState, w2EmployerInfo: action.formData }
    }
    case SAVE_FAMILY_INFO: {
      return { ...newState, familyInfo: action.formData }
    }
    case SAVE_W2_INFO: {
      return { ...newState, w2Info: action.formData }
    }
    default: {
      return newState
    }
  }
}

const rootReducer = combineReducers({
  information: formReducer
})

export default rootReducer
