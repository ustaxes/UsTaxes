import type { UserEvent } from '@testing-library/user-event'

export default class DomMethods {
  dom: () => HTMLElement
  user: UserEvent

  constructor(dom: () => HTMLElement, user: UserEvent) {
    this.dom = dom
    this.user = user
  }
}
