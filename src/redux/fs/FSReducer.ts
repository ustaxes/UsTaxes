import { AnyAction, Reducer } from 'redux'
import { download } from '.'
import { YearsTaxesState } from '..'
import { migrateEachYear } from '../migration'
import { FSAction } from './Actions'

/**
 * Extends a reducer to persist and load data
 * to/from an external JSON file.
 * This behaves like a Redux "Middleware", which
 * is basically just a function from reducer to reducer.
 * It will overwrite whatever state exists with whatever
 * state it finds, but needs none of its own state.
 */
const fsReducer = <S extends YearsTaxesState, A extends AnyAction>(
  filename: string,
  reducer: Reducer<S, A>
): Reducer<S, A & FSAction<S>> => {
  return (state: S | undefined, action: A & FSAction<S>): S => {
    const newState = { ...reducer(state, action as A) }

    switch (action.type) {
      case 'fs/recover': {
        return {
          ...newState,
          ...migrateEachYear(action.data)
        }
      }
      case 'fs/persist': {
        download(filename, JSON.stringify(newState))
        return newState
      }
      default: {
        return newState
      }
    }
  }
}

export default fsReducer
