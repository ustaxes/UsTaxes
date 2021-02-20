import { Income1099, Income1099Type, Information } from '../redux/data'
import TaxPayer from '../redux/TaxPayer'
import Form from './Form'
import { computeField, displayNumber, sumFields, anArrayOf } from './util'

interface PayerAmount {
  payer?: string
  amount?: number
}

export default class ScheduleB implements Form {
  state: Information
  readonly interestPayersLimit = 14
  readonly dividendPayersLimit = 16

  constructor (info: Information) {
    this.state = info
  }

  f1099ints = (): Income1099[] =>
    this.state.f1099s.filter((f) => f.formType === Income1099Type.INT)

  l1Fields = (): PayerAmount[] => this.f1099ints().map((v) => ({
    payer: v.payer,
    amount: v.income
  }))

  l1 = (): Array<string | undefined> => {
    const payerValues = this.l1Fields()
    // ensure we return an array of length interestPayersLimit * 2.
    return payerValues
      .flatMap(({ payer, amount }) => ([payer, amount?.toString()]))
      .concat(anArrayOf((this.interestPayersLimit - payerValues.length) * 2, undefined))
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
  l5Fields = (): PayerAmount[] => anArrayOf(this.dividendPayersLimit, {})

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
