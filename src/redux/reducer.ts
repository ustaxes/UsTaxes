/* eslint-disable indent */
import { CombinedState, combineReducers, Reducer } from 'redux'
import { Asset, FilingStatus, Information } from 'ustaxes/core/data'
import { TaxYear } from 'ustaxes/data'
import { YearsTaxesState } from '.'
import { ActionName, Actions } from './actions'

const DEFAULT_TAX_YEAR: TaxYear = 'Y2021'

export const blankState: Information = {
  f1099s: [],
  w2s: [],
  estimatedTaxes: [],
  realEstate: [],
  taxPayer: { dependents: [] },
  questions: {},
  f1098es: [],
  f3921s: [],
  scheduleK1Form1065s: [],
  itemizedDeductions: undefined,
  stateResidencies: [],
  healthSavingsAccounts: [],
  individualRetirementArrangements: []
}

const formReducer = (
  state: Information | undefined,
  action: Actions
): Information => {
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
    case ActionName.SAVE_STATE_RESIDENCY: {
      return {
        ...newState,
        stateResidencies: [action.formData]
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
        if (
          newDependents.length === 0 &&
          newState.taxPayer.filingStatus === FilingStatus.HOH
        ) {
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
        w2s: [...newState.w2s, action.formData]
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
    case ActionName.ADD_ESTIMATED_TAX: {
      return {
        ...newState,
        estimatedTaxes: [...newState.estimatedTaxes, action.formData]
      }
    }
    case ActionName.EDIT_ESTIMATED_TAX: {
      const newEstimatedTaxes = [...newState.estimatedTaxes]
      newEstimatedTaxes.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        estimatedTaxes: newEstimatedTaxes
      }
    }
    case ActionName.REMOVE_ESTIMATED_TAX: {
      const newEstimatedTaxes = [...newState.estimatedTaxes]
      newEstimatedTaxes.splice(action.formData, 1)
      return {
        ...newState,
        estimatedTaxes: newEstimatedTaxes
      }
    }
    case ActionName.ADD_1099: {
      return {
        ...newState,
        f1099s: [...newState.f1099s, action.formData]
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
        realEstate: [...newState.realEstate, action.formData]
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
      // must reset all questions
      return {
        ...newState,
        questions: action.formData
      }
    }
    case ActionName.ADD_1098e: {
      return {
        ...newState,
        f1098es: [...newState.f1098es, action.formData]
      }
    }
    case ActionName.EDIT_1098e: {
      const new1098es = [...newState.f1098es]
      new1098es.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        f1098es: new1098es
      }
    }
    case ActionName.REMOVE_1098e: {
      const new1098es = [...newState.f1098es]
      new1098es.splice(action.formData, 1)
      return {
        ...newState,
        f1098es: new1098es
      }
    }
    case ActionName.ADD_F3921: {
      return {
        ...newState,
        f3921s: [...newState.f3921s, action.formData]
      }
    }
    case ActionName.EDIT_F3921: {
      const newf3921s = [...newState.f3921s]
      newf3921s.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        f3921s: newf3921s
      }
    }
    case ActionName.REMOVE_F3921: {
      const newf3921s = [...newState.f3921s]
      newf3921s.splice(action.formData, 1)
      return {
        ...newState,
        f3921s: newf3921s
      }
    }
    case ActionName.ADD_SCHEDULE_K1_F1065: {
      return {
        ...newState,
        scheduleK1Form1065s: [...newState.scheduleK1Form1065s, action.formData]
      }
    }
    case ActionName.EDIT_SCHEDULE_K1_F1065: {
      const newK1s = [...newState.scheduleK1Form1065s]
      newK1s.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        scheduleK1Form1065s: newK1s
      }
    }
    case ActionName.REMOVE_SCHEDULE_K1_F1065: {
      const newK1s = [...newState.scheduleK1Form1065s]
      newK1s.splice(action.formData, 1)
      return {
        ...newState,
        scheduleK1Form1065s: newK1s
      }
    }
    case ActionName.SET_ITEMIZED_DEDUCTIONS: {
      return {
        ...newState,
        itemizedDeductions: action.formData
      }
    }
    case ActionName.SET_INFO: {
      return {
        ...newState,
        ...action.formData
      }
    }
    case ActionName.ADD_HSA: {
      return {
        ...newState,
        healthSavingsAccounts: [
          ...newState.healthSavingsAccounts,
          action.formData
        ]
      }
    }
    case ActionName.EDIT_HSA: {
      const newHsa = [...newState.healthSavingsAccounts]
      newHsa.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        healthSavingsAccounts: newHsa
      }
    }
    case ActionName.REMOVE_HSA: {
      const newHsa = [...newState.healthSavingsAccounts]
      newHsa.splice(action.formData, 1)
      return {
        ...newState,
        healthSavingsAccounts: newHsa
      }
    }
    case ActionName.ADD_IRA: {
      return {
        ...newState,
        individualRetirementArrangements: [
          ...newState.individualRetirementArrangements,
          action.formData
        ]
      }
    }
    case ActionName.EDIT_IRA: {
      const newIra = [...newState.individualRetirementArrangements]
      newIra.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        individualRetirementArrangements: newIra
      }
    }
    case ActionName.REMOVE_IRA: {
      const newIra = [...newState.individualRetirementArrangements]
      newIra.splice(action.formData, 1)
      return {
        ...newState,
        individualRetirementArrangements: newIra
      }
    }
    default: {
      return newState
    }
  }
}

const guardByYear =
  (year: TaxYear) =>
  (state: Information | undefined, action: Actions): Information => {
    const newState: Information = state ?? blankState

    if (action.year !== year) {
      return newState
    }

    return formReducer(newState, action)
  }

const activeYear = (state: TaxYear | undefined, action: Actions): TaxYear => {
  const newState = state ?? DEFAULT_TAX_YEAR

  switch (action.type) {
    case ActionName.SET_ACTIVE_YEAR: {
      return action.formData
    }
    default: {
      return newState
    }
  }
}

const assetReducer = (
  state: Asset<Date>[] | undefined,
  action: Actions
): Asset<Date>[] => {
  const newState = state ?? []

  switch (action.type) {
    case ActionName.ADD_ASSET: {
      return [...newState, action.formData]
    }
    case ActionName.EDIT_ASSET: {
      const newAssets = [...newState]
      newAssets.splice(action.formData.index, 1, action.formData.value)
      return newAssets
    }
    case ActionName.REMOVE_ASSET: {
      const newAssets = [...newState]
      newAssets.splice(action.formData, 1)
      return newAssets
    }
    default: {
      return newState
    }
  }
}

const rootReducer: Reducer<
  CombinedState<YearsTaxesState>,
  Actions
> = combineReducers({
  assets: assetReducer,
  Y2019: guardByYear('Y2019'),
  Y2020: guardByYear('Y2020'),
  Y2021: guardByYear('Y2021'),
  activeYear
}) as Reducer<CombinedState<YearsTaxesState>, Actions>

export default rootReducer
