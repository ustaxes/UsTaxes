import userEvent from '@testing-library/user-event'

type UserEventBase = typeof userEvent

export type UserEvent = {
  click: (...args: Parameters<UserEventBase['click']>) => Promise<void>
  clear: (...args: Parameters<UserEventBase['clear']>) => Promise<void>
  selectOptions: (
    ...args: Parameters<UserEventBase['selectOptions']>
  ) => Promise<void>
  type: (
    element: Element,
    text: string,
    options?: Parameters<UserEventBase['type']>[2]
  ) => Promise<void>
}

type UserEventWithSetup = UserEventBase & {
  setup?: () => UserEventBase
}

export const setupUserEvent = (): UserEvent => {
  const event = userEvent as UserEventWithSetup
  const baseEvent =
    typeof event.setup === 'function' ? event.setup() : userEvent
  return {
    click: async (...args) => {
      const result = baseEvent.click(...args)
      await Promise.resolve(result)
    },
    clear: async (...args) => {
      const result = baseEvent.clear(...args)
      await Promise.resolve(result)
    },
    selectOptions: async (...args) => {
      const result = baseEvent.selectOptions(...args)
      await Promise.resolve(result)
    },
    type: async (element, text, options) => {
      const result = baseEvent.type(
        element,
        text,
        options as Parameters<UserEventBase['type']>[2]
      )
      await Promise.resolve(result)
    }
  }
}
