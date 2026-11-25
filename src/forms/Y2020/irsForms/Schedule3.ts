import type { IncomeW2 } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { claimableExcessSSTax } from 'ustaxes/core/irsForms/excessSSTax'
import type { FormTag } from 'ustaxes/core/irsForms/Form'
import { fica } from '../data/federal'
import F1040Attachment from './F1040Attachment'
import type { Field } from 'ustaxes/core/pdfFiller'

// Schedule 3 line 10: excess social security tax withheld, figured per
// person (see core/irsForms/excessSSTax).
export const claimableExcessSSTaxWithholding = (w2s: IncomeW2[]): number =>
  claimableExcessSSTax(w2s, fica)

export default class Schedule3 extends F1040Attachment {
  tag: FormTag = 'f1040s3'
  sequenceIndex = 3

  isNeeded = (): boolean =>
    claimableExcessSSTaxWithholding(this.f1040.validW2s()) > 0

  deductions = (): number => 0
  // Part I: Nonrefundable credits
  l1 = (): number | undefined => undefined
  l2 = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => undefined
  l6 = (): number | undefined => undefined // TODO: checkboxes
  l7 = (): number | undefined =>
    sumFields([this.l1(), this.l2(), this.l3(), this.l4(), this.l5()])

  // Part II: Other payments and refundable credits
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined
  l10 = (): number =>
    // TODO: also applies to RRTA tax
    claimableExcessSSTaxWithholding(this.f1040.validW2s())

  l11 = (): number | undefined => undefined

  l12a = (): number | undefined => undefined
  l12b = (): number | undefined => undefined
  l12c = (): number | undefined => undefined
  l12d = (): number | undefined => undefined // TODO: 'other' box
  l12e = (): number | undefined => undefined
  l12f = (): number | undefined =>
    sumFields([this.l12a(), this.l12b(), this.l12c(), this.l12d(), this.l12e()])

  l13 = (): number | undefined =>
    sumFields([this.l8(), this.l9(), this.l10(), this.l11(), this.l12f()])

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5(),

    ...Array<undefined>(4).fill(undefined), // TODO: checkboxes
    this.l6(),

    this.l7(),
    this.l8(),
    this.l9(),
    this.l10(),
    this.l11(),

    this.l12a(),
    this.l12b(),
    this.l12c(),
    undefined /* TODO: 'other' box */,
    this.l12d(),
    this.l12e(),

    this.l12f(),
    this.l13()
  ]
}
