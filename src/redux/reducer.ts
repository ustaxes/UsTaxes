/* eslint-disable indent */
import { combineReducers } from 'redux'
import { FilingStatus, Information } from './data'
import {
  ActionName,
  Actions
} from './actions'

export const blankState: Information = {
  f1099s: [],
  w2s: [],
  realEstate: [],
  taxPayer: { dependents: [] },
  questions: {}
}

function formReducer (state: Information | undefined, action: Actions): Information {
  const newState: Information = state ?? blankState

  switch (action.type) {
    case ActionName.SAVE_PRIMARY_PERSON_INFO: {
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          primaryPerson: action.formData
        }
      }
    }
    case ActionName.SAVE_CONTACT_INFO: {
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          ...action.formData
        }
      }
    }
    case ActionName.SAVE_FILING_STATUS_INFO: {
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          filingStatus: action.formData
        }
      }
    }
    case ActionName.ADD_DEPENDENT: {
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          dependents: [
            ...(newState.taxPayer?.dependents ?? []),
            action.formData
          ]
        }
      }
    }

    // Replace dependent by index with a new object.
    case ActionName.EDIT_DEPENDENT: {
      const newDependents = [...(newState.taxPayer?.dependents ?? [])]
      newDependents.splice(action.formData.index, 1, action.formData.value)

      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          dependents: newDependents
        }
      }
    }

    case ActionName.REMOVE_DEPENDENT: {
      const newDependents = [...(newState.taxPayer?.dependents ?? [])]
      newDependents.splice(action.formData, 1)

      const filingStatus = (() => {
        if (newDependents.length === 0 && newState.taxPayer.filingStatus === FilingStatus.HOH) {
          return undefined
        }
        return newState.taxPayer.filingStatus
      })()

      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          filingStatus,
          dependents: newDependents
        }
      }
    }
    case ActionName.SAVE_REFUND_INFO: {
      return {
        ...newState,
        refund: action.formData
      }
    }
    case ActionName.ADD_W2: {
      return {
        ...newState,
        w2s: [
          ...newState.w2s,
          action.formData
        ]
      }
    }
    case ActionName.EDIT_W2: {
      const newW2s = [...newState.w2s]
      newW2s.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        w2s: newW2s
      }
    }
    case ActionName.REMOVE_W2: {
      const newW2s = [...newState.w2s]
      newW2s.splice(action.formData, 1)
      return {
        ...newState,
        w2s: newW2s
      }
    }
    case ActionName.ADD_1099: {
      return {
        ...newState,
        f1099s: [
          ...newState.f1099s,
          action.formData
        ]
      }
    }
    case ActionName.EDIT_1099: {
      const new1099s = [...newState.f1099s]
      new1099s.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        f1099s: new1099s
      }
    }
    case ActionName.REMOVE_1099: {
      const new1099s = [...newState.f1099s]
      new1099s.splice(action.formData, 1)
      return {
        ...newState,
        f1099s: new1099s
      }
    }
    case ActionName.ADD_SPOUSE: {
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          spouse: action.formData
        }
      }
    }
    case ActionName.REMOVE_SPOUSE: {
      const filingStatus = (() => {
        const fs = newState.taxPayer.filingStatus
        if ([FilingStatus.MFS, FilingStatus.MFJ, undefined].includes(fs)) {
          return undefined
        }
        return fs
      })()

      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          filingStatus,
          spouse: undefined
        }
      }
    }
    case ActionName.ADD_PROPERTY: {
      return {
        ...newState,
        realEstate: [
          ...newState.realEstate,
          action.formData
        ]
      }
    }
    case ActionName.EDIT_PROPERTY: {
      const newProperties = [...newState.realEstate]
      newProperties.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        realEstate: newProperties
      }
    }
    case ActionName.REMOVE_PROPERTY: {
      const newProperties = [...newState.realEstate]
      newProperties.splice(action.formData, 1)
      return {
        ...newState,
        realEstate: newProperties
      }
    }
    case ActionName.ANSWER_QUESTION: {
      const newQuestions = {
        ...newState.questions,
        ...action.formData
      }
      return {
        ...newState,
        questions: newQuestions
      }
    }
    case ActionName.SET_ENTIRE_STATE: {
      return {
        ...newState,
        ...action.formData.information
      }
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
