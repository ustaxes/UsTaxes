import { AnyAction, Reducer } from 'redux'
import { download } from '.'
import { FSAction } from './Actions'

/**
 * Extends a reducer to persist and load data
 * to/from an external JSON file.
 * This behaves like a Redux "Middleware", which
 * is basically just a function from reducer to reducer.
 * It will overwrite whatever state exists with whatever
 * state it finds, but needs none of its own state.
 */
const fsReducer = <S, A extends AnyAction>(
  filename: string,
  reducer: Reducer<S, A>
): Reducer<S, A & FSAction<S>> => {
  return (state: S | undefined, action: A & FSAction<S>): S => {
    const newState = { ...reducer(state, action as A) }

    switch (action.type) {
      case 'FSRecover': {
        return {
          ...newState,
          ...action.data
        }
      }
      case 'FSPersist': {
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
