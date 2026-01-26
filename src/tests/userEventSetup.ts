import userEvent from '@testing-library/user-event'

type UserEventWithSetup = typeof userEvent & {
  setup?: () => typeof userEvent
}

const ensureSetup = (event: UserEventWithSetup): void => {
  if (typeof event.setup !== 'function') {
    event.setup = () => userEvent
  }
}

ensureSetup(userEvent)
