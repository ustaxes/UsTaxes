import { AnyAction, Reducer } from 'redux'
import { download } from '.'
import { migrateEachYear, migrateAgeAndBlindness } from '../migration'
import {
  deserializeTransform,
  serializeTransform,
  USTSerializedState,
  USTState
} from '../store'
import { FSPersist, FSRecover } from './Actions'

type PersistActions = FSPersist | FSRecover<USTSerializedState>

/**
 * Extends a reducer to persist and load data
 * to/from an external JSON file.
 * This behaves like a Redux "Middleware", which
 * is basically just a function from reducer to reducer.
 * It will overwrite whatever state exists with whatever
 * state it finds, but needs none of its own state.
 */
const fsReducer = <S extends USTState, A extends AnyAction>(
  filename: string,
  reducer: Reducer<S, A>
): Reducer<S, A & PersistActions> => {
  return (state: S | undefined, action: A & PersistActions): S => {
    const newState = reducer(state, action)

    switch (action.type) {
      case 'fs/recover': {
        // we know now that the action is a FSRecover,
        // so we can safely cast it to a FSRecover<USTSerializedState>.
        return {
          ...newState,
          ...migrateAgeAndBlindness(
            migrateEachYear(
              deserializeTransform(
                (action as FSRecover<USTSerializedState>).data
              )
            )
          )
        }
      }
      case 'fs/persist': {
        download(filename, JSON.stringify(serializeTransform(newState)))
        return newState
      }
      default: {
        return newState
      }
    }
  }
}

export default fsReducer
