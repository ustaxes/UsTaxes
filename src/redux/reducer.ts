/* eslint-disable indent */
import { combineReducers } from 'redux'
import { Information } from './data'
import {
  SAVE_EMPLOYEE_DATA,
  SAVE_EMPLOYER_DATA,
  SAVE_FAMILY_INFO,
  Actions
} from './actions'
import { initialInformation } from './store'

function formReducer (state: Information, action: Actions): Information {
  const newState: Information = state === undefined ? initialInformation() : state

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
    default: {
      return newState
    }
  }
}

const rootReducer = combineReducers({
  information: formReducer
})

export default rootReducer
