import { Information } from 'ustaxes/core/data'
import InformationMethods from 'ustaxes/core/data/methods'
import TaxPayer from 'ustaxes/core/data/TaxPayer'
import Form, { FormTag } from './Form'
import { sumFields } from './util'

interface PayerAmount {
  payer?: string
  amount?: number
}

export default class ScheduleB extends Form {
  tag: FormTag = 'f1040sb'
  sequenceIndex = 8
  state: InformationMethods
  readonly interestPayersLimit = 14
  readonly dividendPayersLimit = 16

  constructor(info: Information) {
    super()
    this.state = new InformationMethods(info)
  }

  l1Fields = (): PayerAmount[] =>
    this.state.f1099Ints().map((v) => ({
      payer: v.payer,
      amount: v.form.income
    }))

  l1 = (): Array<string | undefined> => {
    const payerValues = this.l1Fields()
    const rightPad = 2 * (this.interestPayersLimit - payerValues.length)
    // ensure we return an array of length interestPayersLimit * 2.
    return payerValues
      .flatMap(({ payer, amount }) => [payer, amount?.toString()])
      .concat(Array(rightPad).fill(undefined))
  }

  l2 = (): number => sumFields(this.state.f1099Ints().map((f) => f.form.income))

  l3 = (): number | undefined => undefined

  l4 = (): number | undefined => this.l2() - (this.l3() ?? 0)

  l5Fields = (): PayerAmount[] =>
    this.state.f1099Divs().map((v) => ({
      payer: v.payer,
      amount: v.form.dividends
    }))

  l5 = (): Array<string | undefined | number> => {
    const payerValues = this.l5Fields()
    const rightPad = 2 * (this.dividendPayersLimit - payerValues.length)
    return payerValues
      .flatMap(({ payer, amount }) => [payer, amount])
      .concat(Array(rightPad).fill(undefined))
  }

  l6 = (): number | undefined =>
    sumFields(this.l5Fields().map(({ amount }) => amount))

  foreignAccount = (): boolean =>
    this.state.questions.FOREIGN_ACCOUNT_EXISTS ?? false
  fincenForm = (): boolean => this.state.questions.FINCEN_114 ?? false
  fincenCountry = (): string | undefined =>
    this.state.questions.FINCEN_114_ACCOUNT_COUNTRY
  foreignTrust = (): boolean =>
    this.state.questions.FOREIGN_TRUST_RELATIONSHIP ?? false

  l7a = (): [boolean, boolean] => [
    this.foreignAccount(),
    !this.foreignAccount()
  ]

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
