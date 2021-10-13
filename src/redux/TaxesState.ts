import { Information, TaxesState } from './data'

class TaxesStateMethods {
  ts: TaxesState

  constructor(ts: TaxesState) {
    this.ts = ts
  }

  info = (): Information | undefined => this.ts[this.ts.activeYear]
}

export default TaxesStateMethods
