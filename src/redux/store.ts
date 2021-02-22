import { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'
import rootReducer, { blankState } from './reducer'

import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { Information } from './data'
import { Actions } from './actions'

const baseTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: Information, key) => {
    return inboundState
  },
  // transform state being rehydrated
  // Just ensure the state has all requisite root members
  (outboundState: Information, key: keyof Information): Information => {
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

const persistedReducer = persistReducer<{information: Information}, Actions>(persistConfig, rootReducer)

export const store = createStore(persistedReducer, applyMiddleware(logger))

export const persistor = persistStore(store)
