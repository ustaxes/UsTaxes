import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import ScheduleE from './ScheduleE'
import { sumFields } from 'ustaxes/core/irsForms/util'
import F1040 from './F1040'
import F8889 from './F8889'
import { Field } from 'ustaxes/core/pdfFiller'

export default class Schedule1 extends F1040Attachment {
  tag: FormTag = 'f1040s1'
  sequenceIndex = 1
  scheduleE?: ScheduleE
  f8889?: F8889
  f8889Spouse?: F8889
  otherIncomeStrings: Set<string>

  constructor(f1040: F1040) {
    super(f1040)
    this.otherIncomeStrings = new Set<string>()
  }

  isNeeded = (): boolean =>
    this.f1040.studentLoanInterestWorksheet !== undefined &&
    this.f1040.studentLoanInterestWorksheet.notMFS() &&
    this.f1040.studentLoanInterestWorksheet.isNotDependent()

  l1 = (): number | undefined => undefined
  l2a = (): number | undefined => undefined
  l2b = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => this.scheduleE?.l41()
  l6 = (): number | undefined => undefined
  l7 = (): number | undefined => undefined
  l8 = (): number => {
    if (
      this.f8889?.l16() !== undefined ||
      this.f8889?.l20() !== undefined ||
      this.f8889Spouse?.l16() !== undefined ||
      this.f8889Spouse?.l20() !== undefined
    ) {
      this.otherIncomeStrings.add('HSA')
    }
    return sumFields([
      this.f8889?.l16(),
      this.f8889?.l20(),
      this.f8889Spouse?.l16(),
      this.f8889Spouse?.l20()
    ])
  }
  l9 = (): number =>
    sumFields([
      this.l1(),
      this.l2a(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l8()
    ])

  l10 = (): number | undefined => undefined
  l11 = (): number | undefined => undefined
  l12 = (): number | undefined =>
    sumFields([this.f8889?.l13(), this.f1040.f8889Spouse?.l13()])
  l13 = (): number | undefined => undefined
  l14 = (): number | undefined => undefined
  l15 = (): number | undefined => undefined
  l16 = (): number | undefined => undefined
  l17 = (): number | undefined => undefined
  l18 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined
  l20 = (): number | undefined => this.f1040.studentLoanInterestWorksheet?.l9()
  l21 = (): number | undefined => undefined
  // TO DO: Write in Deductions
  l22writeIn = (): number | undefined => undefined

  // TODO: adjustments to income
  l22 = (): number | undefined =>
    sumFields([
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16(),
      this.l17(),
      this.l18(),
      this.l19(),
      this.l20(),
      this.l21(),
      this.l22writeIn()
    ])

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
    this.l2a(),
    this.l2b(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    Array.from(this.otherIncomeStrings).join(' '), // Other income type textbox
    undefined, // Other income type 2
    this.l8(),
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
    undefined, // Alimony Recipient SSN
    undefined, // Date of Divorce/Seperation
    this.l19(),
    this.l20(),
    this.l21(),
    this.l22()
  ]
}
