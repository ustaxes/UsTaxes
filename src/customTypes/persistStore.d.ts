/**
 * Provides type override for persistStore so that 
 * custom state and action types can be easily used.
 * This is taken from a PR that has not been merged, 
 * since the redux-persist project appears to be no
 * longer maintained since Sept 2019
 * 
 * https://github.com/rt2zz/redux-persist/pull/1085 
 */

declare module 'redux-persist/es/persistStore' {
  import { Store, Action, AnyAction } from 'redux'
  import { PersistorOptions, Persistor } from 'redux-persist/es/types'

  /**
   * @desc Creates a persistor for a given store.
   * @param store store to be persisted (or match an existent storage)
   * @param persistorOptions enhancers of the persistor
   * @param callback bootstrap callback of sort.
   */
  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function persistStore<S = any, A extends Action<any> = AnyAction> (store: Store<S, A>, persistorOptions?: PersistorOptions | null, callback?: () => any): Persistor
}

declare module 'redux-persist/lib/persistStore' {
//  export * from 'redux-persist/es/persistStore'
  export { default } from 'redux-persist/es/persistStore'
}
