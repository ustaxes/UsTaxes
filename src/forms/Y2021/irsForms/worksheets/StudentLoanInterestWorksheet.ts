import { F1098e, FilingStatus } from 'ustaxes/core/data'
import F1040 from '../../irsForms/F1040'
import { sumFields } from 'ustaxes/core/irsForms/util'

export default class StudentLoanInterestWorksheet {
  f1040: F1040
  f1098es: F1098e[]

  constructor(f1040: F1040, f1098es: F1098e[]) {
    this.f1040 = f1040
    this.f1098es = f1098es
  }

  // Can't take deduction if filling Married Filling Seperate
  notMFS = (): boolean =>
    this.f1040.info.taxPayer.filingStatus !== FilingStatus.MFS

  // Can't take deduction if MFJ and spouse is a dependent
  isNotDependentSpouse = (): boolean =>
    this.f1040.info.taxPayer.filingStatus !== FilingStatus.MFJ ||
    this.f1040.info.taxPayer.spouse === undefined ||
    !this.f1040.info.taxPayer.spouse.isTaxpayerDependent

  // Can't take deduction if someone else claims you as a dependent
  isNotDependentSelf = (): boolean =>
    !this.f1040.info.taxPayer.primaryPerson.isTaxpayerDependent

  isNotDependent = (): boolean =>
    this.isNotDependentSpouse() && this.isNotDependentSelf()

  // Sum interest, but maximum of 2500 can be deducted
  l1 = (): number =>
    Math.min(
      this.f1098es.map((f1098e) => f1098e.interest).reduce((l, r) => l + r, 0),
      2500
    )

  // Currently do not support unemployment compensation exclusion
  // TO DO: add unemployment compensation exclusion
  l2 = (): number => this.f1040.l9()

  // Schedule 1 deductions
  l3 = (): number =>
    sumFields([
      this.f1040.l12b(),
      this.f1040.schedule1?.l11(),
      this.f1040.schedule1?.l12(),
      this.f1040.schedule1?.l13(),
      this.f1040.schedule1?.l14(),
      this.f1040.schedule1?.l15(),
      this.f1040.schedule1?.l16(),
      this.f1040.schedule1?.l17(),
      this.f1040.schedule1?.l18(),
      this.f1040.schedule1?.l19a(),
      this.f1040.schedule1?.l20()
      // TODO: missing write-in deduction ?
    ])

  l4 = (): number => Math.max(0, this.l2() - this.l3())

  l5 = (): number =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ ? 140000 : 70000

  l6 = (): number => Math.max(0, this.l4() - this.l5())

  l7 = (): number => Math.min(this.l6() / 15000, 1)

  l8 = (): number => this.l1() * this.l7()

  l9 = (): number | undefined =>
    this.notMFS() && this.isNotDependent()
      ? Math.max(0, this.l1() - this.l8())
      : undefined
}
