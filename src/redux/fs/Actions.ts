type FSActionName = 'fs/persist' | 'fs/recover'

export interface FSAction {
  readonly type: FSActionName
}

export interface FSPersist extends FSAction {
  readonly type: 'fs/persist'
}

export interface FSRecover<S> extends FSAction {
  readonly type: 'fs/recover'
  data: S
}

export const fsPersist = (): FSPersist => ({
  type: 'fs/persist'
})

export const fsRecover = <S>(data: S): FSRecover<S> => ({
  type: 'fs/recover',
  data
})
