import type { UserEvent } from 'ustaxes/tests/userEventSetup'

export default class DomMethods {
  dom: () => HTMLElement
  user: UserEvent

  constructor(dom: () => HTMLElement, user: UserEvent) {
    this.dom = dom
    this.user = user
  }
}
