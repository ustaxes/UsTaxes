export default class DomMethods {
  dom: () => HTMLElement

  constructor(dom: () => HTMLElement) {
    this.dom = dom
  }
}
