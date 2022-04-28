import {
  createStore as reduxCreateStore,
  applyMiddleware,
  Store,
  CombinedState
} from 'redux'
import logger from 'redux-logger'
import rootReducer from './reducer'
import _ from 'lodash'
import {
  persistStore,
  persistReducer,
  PersistedState,
  createMigrate
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { Asset, Information, TaxYear } from 'ustaxes/core/data'
import { blankYearTaxesState, YearsTaxesState } from '.'
import { Actions } from './actions'
import { PersistPartial } from 'redux-persist/es/persistReducer'
import { createTransform } from 'redux-persist'
import { FSAction } from './fs/Actions'
import { fsReducer } from './fs/FSReducer'
import { migrateEachYear, migrateAgeAndBlindness } from './migration'

type SerializedState = { [K in TaxYear]: Information } & {
  assets: Asset<string>[]
  activeYear: TaxYear
}

export type USTSerializedState = NonNullable<PersistedState> & SerializedState
export type USTState = NonNullable<PersistedState> & YearsTaxesState

/**
 * Redux-persist calls the transform function not for
 * the entire state, but for each reducer in our state.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// A key that must indicate a date value.
// eg: dateOfBirth, or openDate
const dateKey = /(^date)|(Date)/

const serializeDeserialize =
  (f: (d: Date | string) => Date | string) =>
  (s: any): any => {
    const recur = serializeDeserialize(f)
    if (_.isArray(s)) {
      return s.map((p) => recur(p))
    } else if (_.isObject(s)) {
      const ob = s as { [k: string]: any }
      return Object.keys(ob).reduce((acc, k) => {
        const newValue = (() => {
          if (dateKey.exec(k) !== null) {
            return f(ob[k] as Date | string)
          }
          return recur(ob[k])
        })()

        return {
          ...acc,
          [k]: newValue
        }
      }, {})
    } else {
      return s
    }
  }

/**
 * Look for all the Dates that need to be turned to strings
 */
export const serializeTransform: (s: any) => any = serializeDeserialize((d) =>
  (d as Date).toISOString()
)

/**
 * Look for all strings that need to be turned to Dates
 */
export const deserializeTransform: (s: any) => any = serializeDeserialize(
  (d) => new Date(d as string)
)

/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-unsafe-return */
/* eslint-enable @typescript-eslint/no-unsafe-call */

const dateStringTransform = createTransform(
  serializeTransform,
  deserializeTransform
)

//const migrate = async (state: USTState): Promise<USTState> =>
// migrateEachYear(state)

// Keys are the version numbers. They must be integers.
// Each version takes a state and applies a function that
// generates the state for that version from the previous
// version.

// The below migrations deal with types that don't exist in this
// project anymore, and the hope is that after applying the
// migrations to the user's data, the resulting data will match
// the YearsTaxesState<Date> type. But without maintaining
// type definititions for every possible version, we can't
// really say anything about the type of the incoming data.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
const migrations = {
  0: (state: any) => migrateEachYear(state),
  1: (state: any) => migrateAgeAndBlindness(state)
}
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-enable @typescript-eslint/no-explicit-any */

const persistedReducer = fsReducer(
  'ustaxes_save.json',
  persistReducer<CombinedState<YearsTaxesState>, Actions>(
    {
      key: 'root',
      // Changing the version here will set the version used
      // in the app. When the data is rehydrated the version
      // number will be compared and all migrations between
      // the persisted version and the version here will be
      // applied in order
      version: 1,
      storage,
      migrate: createMigrate(migrations, { debug: false }),
      transforms: [dateStringTransform]
    },
    rootReducer
  )
)

export type InfoStore = Store<YearsTaxesState, FSAction & Actions> & {
  dispatch: unknown
}

export type PersistedStore = Store<
  YearsTaxesState & PersistPartial,
  FSAction & Actions
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
