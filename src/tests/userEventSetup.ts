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
      baseEvent.click(...args)
    },
    clear: async (...args) => {
      baseEvent.clear(...args)
    },
    selectOptions: async (...args) => {
      baseEvent.selectOptions(...args)
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
