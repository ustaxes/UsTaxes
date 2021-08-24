import { TaxPayer as TP } from 'ustaxes/redux/data'
import Form, { FormTag } from './Form'
import { computeField, displayNumber, sumFields } from './util'
import TaxPayer from 'ustaxes/redux/TaxPayer'
import F8959 from './F8959'

export default class Schedule2 implements Form {
  tag: FormTag = 'f1040s2'
  sequenceIndex: number = 2
  tp: TaxPayer
  f8959?: F8959

  constructor(tp: TP, f8959?: F8959) {
    this.tp = new TaxPayer(tp)
    this.f8959 = f8959
  }

  // Part I: Tax
  l1 = (): number | undefined => undefined // TODO: Alternative Minimum Tax (form 6251)
  l2 = (): number | undefined => undefined // TODO: excess advance premium tax credit repayment (form 8962)
  l3 = (): number | undefined =>
    displayNumber(computeField(this.l1()) + computeField(this.l2()))

  // Part II: Other Tax
  l4 = (): number | undefined => undefined // TODO: self-employment tax (schedule SE)
  l5 = (): number | undefined => undefined // TODO: unreported FICA tax
  l6 = (): number | undefined => undefined // TODO: additional tax on retirement accounts
  l7a = (): number | undefined => undefined // TODO: household employment taxes
  l7b = (): number | undefined => undefined // TODO: repayment of first-time homebuyer credit
  l8 = (): number | undefined => this.f8959?.l18()
  l9 = (): number | undefined => undefined // TODO: section 965 net tax liability
  l10 = (): number | undefined =>
    sumFields([
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7a(),
      this.l7b(),
      this.l8()
    ])

  fields = (): Array<string | number | boolean | undefined> => {
    return [
      this.tp.namesString(),
      this.tp.tp.primaryPerson?.ssid,

      this.l1(),
      this.l2(),
      this.l3(),

      this.l4(),
      undefined,
      undefined /* checkboxes */,
      this.l5(),
      this.l6(),
      this.l7a(),
      this.l7b(),
      this.f8959 !== undefined, // 8959 checkbox
      undefined,
      undefined,
      undefined, // Form 8960 checkbox and 'instructions' checkbox and textbox
      this.l8(),
      this.l9(),
      this.l10()
    ]
  }
}
