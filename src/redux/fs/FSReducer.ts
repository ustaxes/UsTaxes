import { AnyAction, Reducer } from 'redux'
import { download } from '.'
import { FSAction } from './Actions'

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
