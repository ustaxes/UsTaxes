/* eslint-disable indent */
import { CombinedState, combineReducers, Reducer } from 'redux'
import { Asset, FilingStatus, Information, TaxYear } from 'ustaxes/core/data'
import { YearsTaxesState } from '.'
import { ActionName, Actions } from './actions'
import { stringToDateInfo } from './data'
import {
  remove1098Sources,
  remove1099Sources,
  removeDependentSources,
  removeW2Sources,
  set1098Sources,
  set1099Sources,
  setContactInfoSource,
  setDependentSources,
  setFilingStatusSource,
  setAdjustmentsSources,
  setPrimaryPersonSources,
  setSpouseSources,
  setStateResidencySource,
  setW2Sources
} from './sources'

const DEFAULT_TAX_YEAR: TaxYear = 'Y2025'

const toDate = (value: string | null | undefined): Date | undefined =>
  value !== undefined && value !== null ? new Date(value) : undefined

export const blankState: Information = {
  f1099s: [],
  w2s: [],
  estimatedTaxes: [],
  realEstate: [],
  businesses: [],
  taxPayer: { dependents: [] },
  questions: {},
  f1098s: [],
  f1098es: [],
  f3921s: [],
  scheduleK1Form1065s: [],
  itemizedDeductions: undefined,
  stateResidencies: [],
  healthSavingsAccounts: [],
  credits: [],
  individualRetirementArrangements: [],
  sources: {}
}

const formReducer = (
  state: Information | undefined,
  action: Actions
): Information => {
  const newState: Information = state ?? blankState

  switch (action.type) {
    case ActionName.SAVE_PRIMARY_PERSON_INFO: {
      const sources = setPrimaryPersonSources(
        newState.sources,
        {
          ...action.formData,
          dateOfBirth: toDate(action.formData.dateOfBirth)
        },
        'user'
      )
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          primaryPerson: {
            ...action.formData,
            dateOfBirth: toDate(action.formData.dateOfBirth)
          }
        },
        sources
      }
    }
    case ActionName.SAVE_CONTACT_INFO: {
      let sources = newState.sources
      if (action.formData.contactEmail !== undefined) {
        sources = setContactInfoSource(sources, 'contactEmail', 'user')
      }
      if (action.formData.contactPhoneNumber !== undefined) {
        sources = setContactInfoSource(sources, 'contactPhoneNumber', 'user')
      }
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          ...action.formData
        },
        sources
      }
    }
    case ActionName.SAVE_STATE_RESIDENCY: {
      const sources = setStateResidencySource(newState.sources, 'user')
      return {
        ...newState,
        stateResidencies: [action.formData],
        sources
      }
    }
    case ActionName.SAVE_FILING_STATUS_INFO: {
      const sources = setFilingStatusSource(newState.sources, 'user')
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          filingStatus: action.formData
        },
        sources
      }
    }
    case ActionName.ADD_DEPENDENT: {
      const sources = setDependentSources(
        newState.sources,
        newState.taxPayer.dependents.length,
        {
          ...action.formData,
          dateOfBirth: toDate(action.formData.dateOfBirth)
        },
        'user'
      )
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          dependents: [
            ...newState.taxPayer.dependents,
            {
              ...action.formData,
              dateOfBirth: toDate(action.formData.dateOfBirth)
            }
          ]
        },
        sources
      }
    }

    // Replace dependent by index with a new object.
    case ActionName.EDIT_DEPENDENT: {
      const newDependents = [...newState.taxPayer.dependents]
      newDependents.splice(action.formData.index, 1, {
        ...action.formData.value,
        dateOfBirth: toDate(action.formData.value.dateOfBirth)
      })

      const sources = setDependentSources(
        newState.sources,
        action.formData.index,
        {
          ...action.formData.value,
          dateOfBirth: toDate(action.formData.value.dateOfBirth)
        },
        'user'
      )

      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          dependents: newDependents
        },
        sources
      }
    }

    case ActionName.REMOVE_DEPENDENT: {
      const newDependents = [...newState.taxPayer.dependents]
      newDependents.splice(action.formData, 1)
      const sources = removeDependentSources(newState.sources, action.formData)

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
        },
        sources
      }
    }
    case ActionName.SAVE_REFUND_INFO: {
      return {
        ...newState,
        refund: action.formData
      }
    }
    case ActionName.ADD_W2: {
      const sources = setW2Sources(
        newState.sources,
        newState.w2s.length,
        action.formData,
        'user'
      )
      return {
        ...newState,
        w2s: [...newState.w2s, action.formData],
        sources
      }
    }
    case ActionName.EDIT_W2: {
      const newW2s = [...newState.w2s]
      newW2s.splice(action.formData.index, 1, action.formData.value)
      const sources = setW2Sources(
        newState.sources,
        action.formData.index,
        action.formData.value,
        'user'
      )
      return {
        ...newState,
        w2s: newW2s,
        sources
      }
    }
    case ActionName.REMOVE_W2: {
      const newW2s = [...newState.w2s]
      newW2s.splice(action.formData, 1)
      const sources = removeW2Sources(newState.sources, action.formData)
      return {
        ...newState,
        w2s: newW2s,
        sources
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
      const sources = set1099Sources(
        newState.sources,
        newState.f1099s.length,
        action.formData,
        'user'
      )
      return {
        ...newState,
        f1099s: [...newState.f1099s, action.formData],
        sources
      }
    }
    case ActionName.EDIT_1099: {
      const new1099s = [...newState.f1099s]
      new1099s.splice(action.formData.index, 1, action.formData.value)
      const sources = set1099Sources(
        newState.sources,
        action.formData.index,
        action.formData.value,
        'user'
      )
      return {
        ...newState,
        f1099s: new1099s,
        sources
      }
    }
    case ActionName.REMOVE_1099: {
      const new1099s = [...newState.f1099s]
      new1099s.splice(action.formData, 1)
      const sources = remove1099Sources(newState.sources, action.formData)
      return {
        ...newState,
        f1099s: new1099s,
        sources
      }
    }
    case ActionName.ADD_SPOUSE: {
      const sources = setSpouseSources(
        newState.sources,
        {
          ...action.formData,
          dateOfBirth: toDate(action.formData.dateOfBirth)
        },
        'user'
      )
      return {
        ...newState,
        taxPayer: {
          ...newState.taxPayer,
          spouse: {
            ...action.formData,
            dateOfBirth: toDate(action.formData.dateOfBirth)
          }
        },
        sources
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
        },
        sources: {
          ...(newState.sources ?? {}),
          taxPayer: {
            ...(newState.sources?.taxPayer as Record<string, unknown>),
            spouse: undefined
          }
        }
      }
    }
    case ActionName.ADD_BUSINESS: {
      return {
        ...newState,
        businesses: [...(newState.businesses ?? []), action.formData]
      }
    }
    case ActionName.EDIT_BUSINESS: {
      const newBusinesses = [...(newState.businesses ?? [])]
      newBusinesses.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        businesses: newBusinesses
      }
    }
    case ActionName.REMOVE_BUSINESS: {
      const newBusinesses = [...(newState.businesses ?? [])]
      newBusinesses.splice(action.formData, 1)
      return {
        ...newState,
        businesses: newBusinesses
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
    case ActionName.ADD_1098: {
      const sources = set1098Sources(
        newState.sources,
        newState.f1098s.length,
        action.formData,
        'user'
      )
      return {
        ...newState,
        f1098s: [...newState.f1098s, action.formData],
        sources
      }
    }
    case ActionName.EDIT_1098: {
      const new1098s = [...newState.f1098s]
      new1098s.splice(action.formData.index, 1, action.formData.value)
      const sources = set1098Sources(
        newState.sources,
        action.formData.index,
        action.formData.value,
        'user'
      )
      return {
        ...newState,
        f1098s: new1098s,
        sources
      }
    }
    case ActionName.REMOVE_1098: {
      const new1098s = [...newState.f1098s]
      new1098s.splice(action.formData, 1)
      const sources = remove1098Sources(newState.sources, action.formData)
      return {
        ...newState,
        f1098s: new1098s,
        sources
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
    case ActionName.SAVE_ADJUSTMENTS: {
      const worksheet = action.formData.selfEmployedHealthInsuranceWorksheet
      const hasWorksheet =
        worksheet !== undefined &&
        Object.values(worksheet).some((value) => value !== undefined)
      const hasAdjustments =
        action.formData.alimonyPaid !== undefined ||
        action.formData.alimonyRecipientSsn !== undefined ||
        action.formData.alimonyDivorceDate !== undefined ||
        action.formData.selfEmployedHealthInsuranceDeduction !== undefined ||
        hasWorksheet

      const sources = hasAdjustments
        ? setAdjustmentsSources(newState.sources, 'user')
        : newState.sources

      const adjustments = {
        ...action.formData,
        alimonyDivorceDate: toDate(action.formData.alimonyDivorceDate)
      }

      return {
        ...newState,
        adjustments: hasAdjustments ? adjustments : undefined,
        sources
      }
    }
    case ActionName.SET_INFO: {
      return {
        ...newState,
        ...stringToDateInfo(action.formData)
      }
    }
    case ActionName.ADD_HSA: {
      return {
        ...newState,
        healthSavingsAccounts: [
          ...newState.healthSavingsAccounts,
          {
            ...action.formData,
            endDate: new Date(action.formData.endDate),
            startDate: new Date(action.formData.startDate)
          }
        ]
      }
    }
    case ActionName.EDIT_HSA: {
      const newHsa = [...newState.healthSavingsAccounts]
      newHsa.splice(action.formData.index, 1, {
        ...action.formData.value,
        endDate: new Date(action.formData.value.endDate),
        startDate: new Date(action.formData.value.startDate)
      })
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
    case ActionName.ADD_CREDIT: {
      return {
        ...newState,
        credits: [...newState.credits, action.formData]
      }
    }
    case ActionName.EDIT_CREDIT: {
      const newCredits = [...newState.credits]
      newCredits.splice(action.formData.index, 1, action.formData.value)
      return {
        ...newState,
        credits: newCredits
      }
    }
    case ActionName.REMOVE_CREDIT: {
      const newCredits = [...newState.credits]
      newCredits.splice(action.formData, 1)
      return {
        ...newState,
        credits: newCredits
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
    case ActionName.ADD_ASSETS: {
      return [...newState, ...action.formData]
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
    case ActionName.REMOVE_ASSETS: {
      return newState.filter((_, i) => !action.formData.includes(i))
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
  Y2022: guardByYear('Y2022'),
  Y2023: guardByYear('Y2023'),
  Y2024: guardByYear('Y2024'),
  Y2025: guardByYear('Y2025'),
  activeYear
}) as Reducer<CombinedState<YearsTaxesState>, Actions>

export default rootReducer
