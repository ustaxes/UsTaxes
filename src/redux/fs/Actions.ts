type FSActionName = 'fs/persist' | 'fs/recover'

export interface FSAction<S> {
  type: FSActionName
  data: S
}

export const FSPersist = <S>(data: S): FSAction<S> => ({
  type: 'fs/persist',
  data
})

export const FSRecover = <S>(data: S): FSAction<S> => ({
  type: 'fs/recover',
  data
})
