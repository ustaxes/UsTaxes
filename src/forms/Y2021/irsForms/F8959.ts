import F1040Attachment from './F1040Attachment'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { fica } from '../data/federal'
import { Field } from 'ustaxes/core/pdfFiller'

export default class F8959 extends F1040Attachment {
  tag: FormTag = 'f8959'
  sequenceIndex = 71

  isNeeded = (): boolean => {
    const filingStatus = this.f1040.info.taxPayer.filingStatus
    const totalW2Income = this.f1040.info.w2s
      .map((w2) => w2.medicareIncome)
      .reduce((l, r) => l + r, 0)
    return (
      fica.additionalMedicareTaxThreshold(filingStatus) <
      totalW2Income + (this.f1040.scheduleSE.l6() ?? 0)
    )
  }

  thresholdFromFilingStatus = (): number =>
    fica.additionalMedicareTaxThreshold(this.f1040.info.taxPayer.filingStatus)

  computeAdditionalMedicareTax = (compensation: number): number =>
    fica.additionalMedicareTaxRate * compensation

  // Part I: Additional Medicare Tax on Medicare Wages
  l1 = (): number => this.f1040.medicareWages()

  l2 = (): number | undefined => this.f1040.f4137?.l6()
  l3 = (): number | undefined => this.f1040.f8919?.l6()
  l4 = (): number => sumFields([this.l1(), this.l2(), this.l3()])

  l5 = (): number => this.thresholdFromFilingStatus()
  l6 = (): number => Math.max(0, this.l4() - this.l5())

  l7 = (): number | undefined => this.computeAdditionalMedicareTax(this.l6())

  // Part II: Additional Medicare Tax on Self-Employment Income
  l8 = (): number | undefined => this.f1040.scheduleSE.l6()
  l9 = (): number => this.thresholdFromFilingStatus()
  l10 = (): number => this.l4()
  l11 = (): number => Math.max(0, this.l9() - this.l10())

  l12 = (): number => Math.max(0, (this.l8() ?? 0) - this.l11())

  l13 = (): number | undefined => this.computeAdditionalMedicareTax(this.l12())

  // Part III: Additional Medicare Tax on Railroad Retirement Tax Act
  // (RRTA) Compensation
  l14 = (): number | undefined => undefined // TODO: RRTA in W2
  l15 = (): number => this.thresholdFromFilingStatus()
  l16 = (): number => Math.max(0, (this.l14() ?? 0) - this.l15())

  l17 = (): number => this.computeAdditionalMedicareTax(this.l16())

  // Part IV: Total Medicare Tax
  l18 = (): number => sumFields([this.l7(), this.l13(), this.l17()])

  // Part V: Withholding Reconciliation
  l19 = (): number =>
    this.f1040
      .validW2s()
      .map((w2) => w2.medicareWithholding)
      .reduce((l, r) => l + r, 0)

  l20 = (): number => this.l1()
  l21 = (): number => fica.regularMedicareTaxRate * this.l20()

  l22 = (): number => Math.max(0, this.l19() - this.l21())

  l23 = (): number | undefined => 0 // TODO: RRTA
  l24 = (): number => sumFields([this.l22(), this.l23()])

  toSchedule2l11 = (): number => this.l18()
  to1040l25c = (): number => this.l24()

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),

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

    this.l19(),
    this.l20(),
    this.l21(),
    this.l22(),
    this.l23(),
    this.l24()
  ]
}
