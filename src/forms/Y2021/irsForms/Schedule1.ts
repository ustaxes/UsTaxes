import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import F1040 from './F1040'
import { Field } from 'ustaxes/core/pdfFiller'

export default class Schedule1 extends F1040Attachment {
  tag: FormTag = 'f1040s1'
  sequenceIndex = 1
  otherIncomeStrings: Set<string>

  constructor(f1040: F1040) {
    super(f1040)
    this.otherIncomeStrings = new Set<string>()
  }

  l1 = (): number | undefined => undefined
  l2a = (): number | undefined => undefined
  l2b = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => this.f1040.scheduleE?.l41()
  l6 = (): number | undefined => undefined
  l7 = (): number | undefined => undefined
  l8a = (): number | undefined => undefined
  l8b = (): number | undefined => undefined
  l8c = (): number | undefined => undefined
  l8d = (): number | undefined => undefined
  l8e = (): number | undefined =>
    sumFields([this.f1040.f8889?.l16(), this.f1040.f8889Spouse?.l16()])
  l8f = (): number | undefined => undefined
  l8g = (): number | undefined => undefined
  l8h = (): number | undefined => undefined
  l8i = (): number | undefined => undefined
  l8j = (): number | undefined => undefined
  l8k = (): number | undefined => undefined
  l8l = (): number | undefined => undefined
  l8m = (): number | undefined => undefined
  l8n = (): number | undefined => undefined
  l8o = (): number | undefined => undefined
  l8p = (): number | undefined => undefined
  l8q = (): number | undefined => undefined
  l8z = (): number => {
    if (
      (this.f1040.f8889?.l20() !== undefined && this.f1040.f8889?.l20() > 0) ||
      (this.f1040.f8889Spouse?.l20() !== undefined &&
        this.f1040.f8889Spouse?.l20() > 0)
    ) {
      this.otherIncomeStrings.add('HSA')
    }

    return sumFields([this.f1040.f8889?.l20(), this.f1040.f8889Spouse?.l20()])
  }

  l9 = (): number =>
    sumFields([
      this.l8a(),
      this.l8b(),
      this.l8c(),
      this.l8d(),
      this.l8e(),
      this.l8f(),
      this.l8g(),
      this.l8h(),
      this.l8i(),
      this.l8j(),
      this.l8k(),
      this.l8l(),
      this.l8m(),
      this.l8n(),
      this.l8o(),
      this.l8p(),
      this.l8q(),
      this.l8z()
    ])

  l10 = (): number =>
    sumFields([
      this.l1(),
      this.l2a(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l9()
    ])

  to1040Line8 = (): number => this.l10()

  l11 = (): number | undefined => undefined
  l12 = (): number | undefined => undefined
  l13 = (): number | undefined =>
    sumFields([this.f1040.f8889?.l13(), this.f1040.f8889Spouse?.l13()])
  l14 = (): number | undefined => undefined
  l15 = (): number | undefined => this.f1040.scheduleSE?.l13()
  l16 = (): number | undefined => undefined
  l17 = (): number | undefined => undefined
  l18 = (): number | undefined => undefined
  l19a = (): number | undefined => undefined
  l19b = (): string | undefined => undefined
  l19c = (): string | undefined => undefined
  l20 = (): number | undefined => undefined
  l21 = (): number | undefined => this.f1040.studentLoanInterestWorksheet?.l9()
  // Reserved for future use
  l22 = (): string | undefined => undefined
  l23 = (): number | undefined => undefined
  l24a = (): number | undefined => undefined
  l24b = (): number | undefined => undefined
  l24c = (): number | undefined => undefined
  l24d = (): number | undefined => undefined
  l24e = (): number | undefined => undefined
  l24f = (): number | undefined => undefined
  l24g = (): number | undefined => undefined
  l24h = (): number | undefined => undefined
  l24i = (): number | undefined => undefined
  l24j = (): number | undefined => undefined
  l24k = (): number | undefined => undefined
  l24zDesc = (): string | undefined => undefined
  l24zDesc2 = (): string | undefined => undefined
  l24z = (): number | undefined => undefined

  l25 = (): number =>
    sumFields([
      this.l24a(),
      this.l24b(),
      this.l24c(),
      this.l24d(),
      this.l24e(),
      this.l24f(),
      this.l24g(),
      this.l24h(),
      this.l24i(),
      this.l24j(),
      this.l24k(),
      this.l24z()
    ])

  l26 = (): number =>
    sumFields([
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16(),
      this.l17(),
      this.l18(),
      this.l19a(),
      this.l20(),
      this.l21(),
      this.l23(),
      this.l25()
    ])

  to1040Line10 = (): number => this.l26()

  fields = (): Field[] => [
    this.f1040.info.namesString(),
    this.f1040.info.taxPayer.primaryPerson?.ssid,
    this.l1(),
    this.l2a(),
    this.l2b(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.l8a(),
    this.l8b(),
    this.l8c(),
    this.l8d(),
    this.l8e(),
    this.l8f(),
    this.l8g(),
    this.l8h(),
    this.l8i(),
    this.l8j(),
    this.l8k(),
    this.l8l(),
    this.l8m(),
    this.l8n(),
    this.l8o(),
    this.l8p(),
    Array.from(this.otherIncomeStrings).join(' '),
    undefined,
    this.l8z(),
    this.l9(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17(),
    this.l18(),
    this.l19a(),
    this.l19b(),
    this.l19c(),
    this.l20(),
    this.l21(),
    this.l22(),
    this.l23(),
    this.l24a(),
    this.l24b(),
    this.l24c(),
    this.l24d(),
    this.l24e(),
    this.l24f(),
    this.l24g(),
    this.l24h(),
    this.l24i(),
    this.l24j(),
    this.l24k(),
    this.l24zDesc(),
    this.l24zDesc2(),
    this.l24z(),
    this.l25(),
    this.l26()
  ]
}
