type FSActionName = 'fs/persist' | 'fs/recover'

export interface FSAction {
  readonly type: FSActionName
}

export interface FSPersist extends FSAction {
  readonly type: 'fs/persist'
}

export interface FSRecover extends FSAction {
  readonly type: 'fs/recover'
  data: string
}

export const fsPersist = (): FSPersist => ({
  type: 'fs/persist'
})

export const fsRecover = (data: string): FSRecover => ({
  type: 'fs/recover',
  data
})
