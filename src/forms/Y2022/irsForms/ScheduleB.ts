import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { Field } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'

interface PayerAmount {
  payer?: string
  amount?: number
}

export default class ScheduleB extends F1040Attachment {
  tag: FormTag = 'f1040sb'
  sequenceIndex = 8
  readonly interestPayersLimit = 14
  readonly dividendPayersLimit = 15

  index = 0

  constructor(f1040: F1040, index = 0) {
    super(f1040)
    this.index = index
  }

  copies = (): ScheduleB[] => {
    if (this.index === 0) {
      const numInterestPayers = this.l1Fields().length
      const numDivPayers = this.l5Fields().length

      const extraCopiesNeeded = Math.floor(
        Math.max(
          numInterestPayers / this.interestPayersLimit,
          numDivPayers / this.dividendPayersLimit
        )
      )

      return Array.from(Array(extraCopiesNeeded)).map(
        (_, i) => new ScheduleB(this.f1040, i + 1)
      )
    } else {
      return []
    }
  }

  isNeeded = (): boolean =>
    this.l1Fields().length > 0 || this.l5Fields().length > 0

  l1Fields = (): PayerAmount[] =>
    this.f1040
      .f1099Ints()
      .map((v) => ({
        payer: v.payer,
        amount: v.form.income
      }))
      .concat(
        this.f1040.k1sWithInterest().map((v) => ({
          payer: v.partnershipName,
          amount: v.interestIncome
        }))
      )

  l1 = (): Array<string | undefined> => {
    const payerValues = this.l1Fields().slice(
      this.index * this.interestPayersLimit,
      (this.index + 1) * this.interestPayersLimit
    )
    const rightPad = 2 * (this.interestPayersLimit - payerValues.length)
    // ensure we return an array of length interestPayersLimit * 2.
    // This form may have multiple copies, only display the copies for this form
    return payerValues
      .flatMap(({ payer, amount }) => [payer, amount?.toString()])
      .concat(Array(rightPad).fill(undefined))
  }

  l2 = (): number => sumFields(this.f1040.f1099Ints().map((f) => f.form.income))

  // TODO: Interest from tax exempt savings bonds
  l3 = (): number | undefined => undefined

  l4 = (): number => this.l2() - (this.l3() ?? 0)

  /**
   * Total interest on all schedule Bs.
   */
  to1040l2b = (): number =>
    [this, ...this.copies()].reduce((acc, f) => acc + f.l4(), 0)

  l5Fields = (): PayerAmount[] =>
    this.f1040.f1099Divs().map((v) => ({
      payer: v.payer,
      amount: v.form.dividends
    }))

  l5 = (): Array<string | undefined | number> => {
    const payerValues = this.l5Fields().slice(
      this.index * this.dividendPayersLimit,
      (this.index + 1) * this.dividendPayersLimit
    )

    const rightPad = 2 * (this.dividendPayersLimit - payerValues.length)
    return payerValues
      .flatMap(({ payer, amount }) => [payer, amount])
      .concat(Array(rightPad).fill(undefined))
  }

  l6 = (): number => sumFields(this.l5Fields().map(({ amount }) => amount))

  /**
   * Total dividends on all schedule Bs.
   */
  to1040l3b = (): number =>
    [this, ...this.copies()].reduce((acc, f) => acc + f.l6(), 0)

  foreignAccount = (): boolean =>
    this.f1040.info.questions.FOREIGN_ACCOUNT_EXISTS ?? false
  fincenForm = (): boolean => this.f1040.info.questions.FINCEN_114 ?? false
  fincenCountry = (): string | undefined =>
    this.f1040.info.questions.FINCEN_114_ACCOUNT_COUNTRY
  foreignTrust = (): boolean =>
    this.f1040.info.questions.FOREIGN_TRUST_RELATIONSHIP ?? false

  l7a = (): [boolean, boolean] => [
    this.foreignAccount(),
    !this.foreignAccount()
  ]

  l7a2 = (): [boolean, boolean] => [this.fincenForm(), !this.fincenForm()]

  l7b = (): string | undefined => this.fincenCountry()

  l8 = (): [boolean, boolean] => [this.foreignTrust(), !this.foreignTrust()]

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    ...this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    ...this.l5(),
    this.l6(),
    ...this.l7a(),
    ...this.l7a2(),
    this.l7b(),
    undefined, // there are two separate fields for line 7b.
    ...this.l8()
  ]
}
