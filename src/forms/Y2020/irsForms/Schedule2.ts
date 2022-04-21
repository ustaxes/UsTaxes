import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import F1040 from './F1040'
import { Field } from 'ustaxes/core/pdfFiller'

export default class Schedule2 extends F1040Attachment {
  tag: FormTag = 'f1040s2'
  sequenceIndex = 2
  otherIncomeStrings: Set<string>

  constructor(f1040: F1040) {
    super(f1040)
    this.otherIncomeStrings = new Set<string>()
  }

  isNeeded = (): boolean =>
    this.f1040.f8959?.isNeeded() || this.f1040.f8960?.isNeeded()

  // Part I: Tax
  l1 = (): number | undefined => undefined // TODO: Alternative Minimum Tax (form 6251)
  l2 = (): number | undefined => undefined // TODO: excess advance premium tax credit repayment (form 8962)
  l3 = (): number => sumFields([this.l1(), this.l2()])

  // Part II: Other Tax
  l4 = (): number | undefined => undefined // TODO: self-employment tax (schedule SE)
  l5 = (): number | undefined => undefined // TODO: unreported FICA tax
  l6 = (): number | undefined => undefined // TODO: additional tax on retirement accounts
  l7a = (): number | undefined => undefined // TODO: household employment taxes
  l7b = (): number | undefined => undefined // TODO: repayment of first-time homebuyer credit
  l8 = (): number | undefined => {
    if (
      this.f1040.f8889?.l17b() !== undefined ||
      this.f1040.f8889Spouse?.l17b() !== undefined
    ) {
      this.otherIncomeStrings.add('HSA')
    }
    if (this.f1040.f8889?.l21() !== undefined && this.f1040.f8889.l21() > 0) {
      this.otherIncomeStrings.add('HDHP')
    }

    if (
      this.f1040.f8889Spouse?.l21() !== undefined &&
      this.f1040.f8889Spouse.l21() > 0
    ) {
      this.otherIncomeStrings.add('HDHP')
    }

    return sumFields([
      this.f1040.f8959?.l18(),
      this.f1040.f8960?.l17(),
      this.f1040.f8889?.l17b(),
      this.f1040.f8889?.l21(),
      this.f1040.f8889Spouse?.l17b(),
      this.f1040.f8889Spouse?.l21()
    ])
  }
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

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,

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
    this.f1040.f8959 !== undefined, // Form 8959 checkbox
    this.f1040.f8960 !== undefined, // Form 8960 checkbox
    undefined, //others checkbox
    Array.from(this.otherIncomeStrings).join(' '), // others textbox
    this.l8(),
    this.l9(),
    this.l10()
  ]
}
