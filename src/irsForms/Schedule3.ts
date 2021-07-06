import { Information, IncomeW2 } from '../redux/data'
import { displayNumber, sumFields } from './util'
import Form, { FormTag } from './Form'
import { anArrayOf } from '../util'
import TaxPayer from '../redux/TaxPayer'

export const claimableExcessSSTaxWithholding = (w2s: IncomeW2[]): number => {
  const maxSSTax = 8537.40
  const maxIncomeSSTaxApplies = 137700
  // 1040 instructions:
  // If you had more than one employer and total wages of more than $137,700, too
  // much SS or RRTA tax may have been withheld. You can take a credit for the amount
  // withtheld in excess of $8,537.40.
  // If any one employer withheld more than $8,537.40, you can't claim the excess on
  // your return.
  if (w2s.length > 1 &&
    w2s.map((w2) => w2.income).reduce((l, r) => l + r, 0) > maxIncomeSSTaxApplies &&
    w2s.every((w2) => w2.ssWithholding <= maxSSTax)) {
    return w2s.map((w2) => w2.ssWithholding).reduce((l, r) => l + r, 0) - maxSSTax
  } else {
    return 0 // Cannot claim credit for excess SS tax
  }
}

export default class Schedule3 implements Form {
  tag: FormTag = 'f1040s3'
  state: Information

  constructor (state: Information) {
    this.state = state
  }

  deductions = (): number => 0
  // Part I: Nonrefundable credits
  l1 = (): number | undefined => undefined
  l2 = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => undefined
  l6 = (): number | undefined => undefined // TODO: checkboxes
  l7 = (): number | undefined => sumFields([
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5()
  ])

  // Part II: Other payments and refundable credits
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined
  l10 = (): number | undefined => displayNumber(
    claimableExcessSSTaxWithholding(this.state.w2s)
  ) // TODO: also applies to RRTA tax

  l11 = (): number | undefined => undefined

  l12a = (): number | undefined => undefined
  l12b = (): number | undefined => undefined
  l12c = (): number | undefined => undefined
  l12d = (): number | undefined => undefined // TODO: 'other' box
  l12e = (): number | undefined => undefined
  l12f = (): number | undefined => sumFields([
    this.l12a(),
    this.l12b(),
    this.l12c(),
    this.l12d(),
    this.l12e()
  ])

  l13 = (): number | undefined => sumFields([
    this.l8(),
    this.l9(),
    this.l10(),
    this.l11(),
    this.l12f()
  ])

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.state.taxPayer)
    return [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
      this.l1(),
      this.l2(),
      this.l3(),
      this.l4(),
      this.l5(),

      ...anArrayOf(4, undefined), // TODO: checkboxes
      this.l6(),

      this.l7(),
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),

      this.l12a(),
      this.l12b(),
      this.l12c(),
      undefined /* TODO: 'other' box */, this.l12d(),
      this.l12e(),

      this.l12f(),
      this.l13()
    ]
  }
}
