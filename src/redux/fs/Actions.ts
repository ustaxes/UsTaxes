type FSActionName = 'FSPersist' | 'FSRecover'

export interface FSAction<S> {
  type: FSActionName
  data: S
}

export const FSPersist = <S>(data: S): FSAction<S> => ({
  type: 'FSPersist',
  data
})

export const FSRecover = <S>(data: S): FSAction<S> => ({
  type: 'FSRecover',
  data
})
