import userEvent from '@testing-library/user-event'

type UserEventBase = typeof userEvent

type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K]
}

export type UserEvent = Asyncify<UserEventBase>

type UserEventWithSetup = UserEventBase & {
  setup?: () => UserEventBase
}

const asyncifyUserEvent = (event: UserEventBase): UserEvent => {
  const wrapped = {} as UserEvent
  ;(Object.keys(event) as Array<keyof UserEventBase>).forEach((key) => {
    const value = event[key]
    if (typeof value === 'function') {
      wrapped[key] = ((...args: unknown[]) =>
        Promise.resolve(
          (value as (...args: unknown[]) => unknown)(...args)
        )) as UserEvent[typeof key]
      return
    }
    wrapped[key] = value as UserEvent[typeof key]
  })
  return wrapped
}

export const setupUserEvent = (): UserEvent => {
  const event = userEvent as UserEventWithSetup
  const baseEvent =
    typeof event.setup === 'function' ? event.setup() : userEvent
  return asyncifyUserEvent(baseEvent)
}
