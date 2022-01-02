import {
  createStore as reduxCreateStore,
  applyMiddleware,
  Store,
  CombinedState
} from 'redux'
import logger from 'redux-logger'
import rootReducer, { blankState } from './reducer'

import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { Information } from 'ustaxes/core/data'
import { blankYearTaxesState, YearsTaxesState } from '.'
import { Actions } from './actions'
import { PersistPartial } from 'redux-persist/es/persistReducer'
import { FSAction } from './fs/Actions'
import fsReducer from './fs/FSReducer'

const baseTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: Information) => {
    return inboundState
  },
  // transform state being rehydrated
  // Just ensure the state has all requisite root members
  (outboundState: Information): Information => {
    return {
      ...blankState,
      ...outboundState
    }
  },
  { whitelist: ['information'] }
)

const persistConfig = {
  key: 'root',
  storage,
  transforms: [baseTransform]
}

const persistedReducer = fsReducer(
  'ustaxes_save.json',
  persistReducer<CombinedState<YearsTaxesState>, Actions>(
    persistConfig,
    rootReducer
  )
)

export type InfoStore = Store<
  YearsTaxesState,
  FSAction<YearsTaxesState> & Actions
> & {
  dispatch: unknown
}

export type PersistedStore = Store<
  YearsTaxesState & PersistPartial,
  FSAction<YearsTaxesState> & Actions
> & {
  dispatch: unknown
}

export const createWholeStoreUnpersisted = (
  state: YearsTaxesState
): InfoStore => reduxCreateStore(rootReducer, state, undefined)

export const createStoreUnpersisted = (information: Information): InfoStore =>
  createWholeStoreUnpersisted({
    ...blankYearTaxesState,
    Y2020: information
  })

export const createStore = (): PersistedStore =>
  reduxCreateStore(persistedReducer, applyMiddleware(logger))

export const store = createStore()

export const persistor = persistStore(store)
