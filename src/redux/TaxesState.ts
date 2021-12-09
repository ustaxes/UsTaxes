import { Information } from 'ustaxes-core/data'
import { YearsTaxesState } from './data'

export default class TaxesStateMethods {
  ts: YearsTaxesState

  constructor(ts: YearsTaxesState) {
    this.ts = ts
  }

  info = (): Information | undefined => this.ts[this.ts.activeYear]
}
