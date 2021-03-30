import F1040 from '../F1040'
import { FilingStatus } from '../../redux/data'
import { computeField, sumFields } from '../util'

export default class ChildTaxCreditWorksheet {
  f1040: F1040

  constructor (f1040: F1040) {
    this.f1040 = f1040
  }

  // worksheet line 1
  numberQualifyingChildren = (): number => this.f1040.dependents.reduce((total, dependent) => (dependent.isQualifiedForChildTaxCredit ? total + 1 : total), 0)

  l1 = (): number => this.numberQualifyingChildren() * 2000

  // worksheet line 2
  numberQualifyingOtherDependents = (): number => this.f1040.dependents.reduce((total, dependent) => (dependent.isQualifiedForOtherDependentTaxCredit ? total + 1 : total), 0)

  l2 = (): number => this.numberQualifyingOtherDependents() * 500

  // worksheet line 3
  l3 = (): number => this.l1() + this.l2()

  // worksheet line 4
  l4 = (): number => computeField(this.f1040.l11())

  // worksheet line 5
  l5 = (): number => this.f1040.filingStatus === FilingStatus.MFJ ? 400000 : 200000

  // worksheet line 6
  l6 = (): number | undefined => this.l4() > this.l5() ? this.l4() - this.l5() : undefined

  // worksheet line 7
  l7 = (): number => this.l6() !== undefined ? computeField(this.l6()) * 0.05 : 0

  // worksheet line 8
  l8 = (): number | undefined => this.l3() > this.l7() ? this.l3() - this.l7() : undefined

  // worksheet line 9
  l9 = (): number => computeField(this.f1040.l18())

  // worksheet line 10
  l10 = (): number => sumFields([this.f1040.schedule3?.l1(), this.f1040.schedule3?.l2(), this.f1040.schedule3?.l3(), this.f1040.schedule3?.l4(), this.f1040.f5695?.l30(), this.f1040.f8910?.l15(), this.f1040.f8936?.l23(), this.f1040.scheduleR?.l22()])
  // worksheet line 11
  // This maybe should be >= l9
  l11 = (): number | undefined => this.l10() === this.l9() ? undefined : this.l9() - this.l10()

  // worksheet line 13
  // if l11 is undefined, returns undefined since they can't take the deduction
  // if l8 > l11, returns l11 following instructions
  // Otherwise, returns l8, either because l8 is the deduction or because l8 is undefined and they can't take the deduction
  l12 = (): number | undefined => this.l11() !== undefined ? (computeField(this.l8()) > computeField(this.l11()) ? this.l11() : this.l8()) : undefined
}
