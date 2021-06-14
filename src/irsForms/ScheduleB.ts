import { Income1099Type, Information, Income1099Int, Income1099Div } from '../redux/data'
import TaxPayer from '../redux/TaxPayer'
import Form, { FormTag } from './Form'
import { computeField, displayNumber, sumFields } from './util'
import { anArrayOf } from '../util'

interface PayerAmount {
  payer?: string
  amount?: number
}

export default class ScheduleB implements Form {
  tag: FormTag = 'f1040sb'
  state: Information
  readonly interestPayersLimit = 14
  readonly dividendPayersLimit = 16

  constructor (info: Information) {
    this.state = info
  }

  f1099ints = (): Income1099Int[] =>
    this.state.f1099s
      .filter((f) => f.type === Income1099Type.INT)
      .map((f) => f as Income1099Int)

  f1099divs = (): Income1099Div[] =>
    this.state.f1099s
      .filter((f) => f.type === Income1099Type.DIV)
      .map((f) => f as Income1099Div)

  l1Fields = (): PayerAmount[] => this.f1099ints().map((v) => ({
    payer: v.payer,
    amount: v.form.income
  }))

  l1 = (): Array<string | undefined> => {
    const payerValues = this.l1Fields()
    const rightPad = 2 * (this.interestPayersLimit - payerValues.length)
    // ensure we return an array of length interestPayersLimit * 2.
    return payerValues
      .flatMap(({ payer, amount }) => ([payer, amount?.toString()]))
      .concat(anArrayOf(rightPad, undefined))
  }

  l2 = (): number | undefined => sumFields(this.f1099ints().map((f) => f.form.income))

  l3 = (): number | undefined => undefined

  l4 = (): number | undefined => displayNumber(
    computeField(this.l2()) - computeField(this.l3())
  )

  l5Fields = (): PayerAmount[] => this.f1099divs().map((v) => ({
    payer: v.payer,
    amount: v.form.dividends
  }))

  l5 = (): Array<string | undefined | number> => {
    const payerValues = this.l5Fields()
    const rightPad = 2 * (this.dividendPayersLimit - payerValues.length)
    return (
      payerValues
        .flatMap(({ payer, amount }) => ([payer, amount]))
        .concat(anArrayOf(rightPad, undefined))
    )
  }

  l6 = (): number | undefined => displayNumber(
    sumFields(this.l5Fields().map(({ amount }) => amount))
  )

  foreignAccount = (): boolean => this.state.questions.FOREIGN_ACCOUNT_EXISTS ?? false
  fincenForm = (): boolean => this.state.questions.FINCEN_114 ?? false
  fincenCountry = (): string | undefined => this.state.questions.FINCEN_114_ACCOUNT_COUNTRY
  foreignTrust = (): boolean => this.state.questions.FOREIGN_TRUST_RELATIONSHIP ?? false

  // TODO - FINCEN questions
  l7a = (): [boolean, boolean] => [this.foreignAccount(), !this.foreignAccount()]

  l7a2 = (): [boolean, boolean] => [this.fincenForm(), !this.fincenForm()]

  l7b = (): string | undefined => this.fincenCountry()

  l8 = (): [boolean, boolean] => [this.foreignTrust(), !this.foreignTrust()]

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
