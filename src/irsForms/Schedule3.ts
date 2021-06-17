import { TaxPayer } from '../redux/data'

export default class Schedule3 {
  tp: TaxPayer

  constructor (tp: TaxPayer) {
    this.tp = tp
  }

  deductions = (): number => 0
  // TODO
  // Needed for Child Tax Deduction
  l1 = (): number | undefined => undefined
  l2 = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  // TODO
  l7 = (): number | undefined => undefined
  l10 = (): number | undefined => undefined
  l13 = (): number | undefined => undefined
}
