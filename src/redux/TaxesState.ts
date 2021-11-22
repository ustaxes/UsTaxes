import { Information } from 'ustaxes/forms/Y2020/data'
import { YearsTaxesState } from './data'

export default class TaxesStateMethods {
  ts: YearsTaxesState

  constructor(ts: YearsTaxesState) {
    this.ts = ts
  }

  info = (): Information | undefined => this.ts[this.ts.activeYear]
}
