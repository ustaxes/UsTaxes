import type { Information } from 'ustaxes/core/data'
import type { YearsTaxesState } from './data'

export default class TaxesStateMethods {
  ts: YearsTaxesState

  constructor(ts: YearsTaxesState) {
    this.ts = ts
  }

  info = (): Information => this.ts[this.ts.activeYear]
}
