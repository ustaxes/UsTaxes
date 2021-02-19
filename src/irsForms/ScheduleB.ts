import { Income1099, Income1099Type, Information } from '../redux/data'
import TaxPayer from '../redux/TaxPayer'
import Form from './Form'
import { computeField, displayNumber, sumFields } from './util'

interface PayerAmount {
  payer?: string
  amount?: number
}

export default class ScheduleB implements Form {
  state: Information

  constructor (info: Information) {
    this.state = info
  }

  f1099ints = (): Income1099[] =>
    this.state.f1099s.filter((f) => f.formType === Income1099Type.INT)

  l1 (): string[] {
    const ints = this.f1099ints()

    return (
      Array
        .from(Array(14))
        .flatMap((v, i) => {
          if (i < ints.length) {
            return [ints[i].payer, ints[i].income.toString()]
          }
          return ['', '']
        })
    )
  }

  l2 = (): number | undefined => {
    const ints = this.f1099ints()

    return sumFields(ints.map((f) => f.income))
  }

  l3 = (): number | undefined => undefined

  l4 = (): number | undefined => displayNumber(
    computeField(this.l2()) - computeField(this.l3())
  )

  // TODO - 1099 DIV results
  l5Fields = (): PayerAmount[] => Array.from(Array(16)).map(() => ({}))

  l5 = (): Array<string | undefined | number> => (
    this.l5Fields().flatMap(({ payer, amount }) => ([payer, amount]))
  )

  l6 = (): number | undefined => displayNumber(
    sumFields(this.l5Fields().map(({ amount }) => amount))
  )

  // TODO - FINCEN questions
  l7a = (): [boolean, boolean] => [false, false]

  l7a2 = (): [boolean, boolean] => [false, false]

  l7b = (): string | undefined => undefined

  l8 = (): [boolean, boolean] => [false, false]

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.state.taxPayer)

    const result = [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid ?? '',
      ...this.l1(),
      this.l2(),
      this.l3(),
      this.l4(),
      ...this.l5(),
      this.l6(),
      ...this.l7a(),
      ...this.l7a2(),
      this.l7b(),
      ...this.l8()
    ]

    return result
  }
}
