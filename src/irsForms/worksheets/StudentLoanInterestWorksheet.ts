import { F1098e, FilingStatus, TaxPayer as TP } from 'ustaxes/redux/data'
import TaxPayer from 'ustaxes/redux/TaxPayer'
import F1040 from 'ustaxes/irsForms/F1040'
import { computeField, displayNumber, sumFields } from '../util'

export default class StudentLoanInterestWorksheet {
  f1040: F1040
  tp: TaxPayer
  f1098es: F1098e[]

  constructor(f1040: F1040, tp: TP, f1098es: F1098e[]) {
    this.f1040 = f1040
    this.tp = new TaxPayer(tp)
    this.f1098es = f1098es
  }

  // Can't take deduction if filling Married Filling Seperate
  notMFS = (): boolean => this.f1040.filingStatus !== FilingStatus.MFS

  // Can't take deduction if MFJ and spouse is a dependent
  isNotDependentSpouse = (): boolean =>
    this.f1040.filingStatus !== FilingStatus.MFJ
      ? true
      : this.tp.tp.spouse === undefined
      ? true
      : !this.tp.tp.spouse?.isTaxpayerDependent

  // Can't take deduction if someone else claims you as a dependent
  isNotDependentSelf = (): boolean =>
    this.tp.tp.primaryPerson === undefined
      ? true
      : !this.tp.tp.primaryPerson?.isTaxpayerDependent

  isNotDependent = (): boolean =>
    this.isNotDependentSpouse() && this.isNotDependentSelf()

  // Sum interest, but maximum of 2500 can be deducted
  l1 = (): number | undefined =>
    Math.min(
      this.f1098es.map((f1098e) => f1098e.interest).reduce((l, r) => l + r, 0),
      2500
    )

  // Currently do not support unemployment compensation exclusion
  // TO DO: add unemployment compensation exclusion
  l2 = (): number | undefined => this.f1040.l9()

  // Schedule 1 deductions
  l3 = (): number | undefined =>
    sumFields([
      this.f1040.schedule1?.l10(),
      this.f1040.schedule1?.l11(),
      this.f1040.schedule1?.l12(),
      this.f1040.schedule1?.l13(),
      this.f1040.schedule1?.l14(),
      this.f1040.schedule1?.l15(),
      this.f1040.schedule1?.l16(),
      this.f1040.schedule1?.l17(),
      this.f1040.schedule1?.l18(),
      this.f1040.schedule1?.l19(),
      this.f1040.schedule1?.l22writeIn()
    ])

  l4 = (): number | undefined =>
    computeField(this.l2()) - computeField(this.l3())

  l5 = (): number =>
    this.f1040.filingStatus === FilingStatus.MFJ ? 140000 : 70000

  l6 = (): number | undefined =>
    computeField(this.l4()) > computeField(this.l5())
      ? computeField(this.l4()) - computeField(this.l5())
      : 0

  l7 = (): number | undefined => Math.min(computeField(this.l6()) / 15000, 1)

  l8 = (): number | undefined =>
    computeField(this.l1()) * computeField(this.l7())

  l9 = (): number | undefined =>
    this.notMFS() && this.isNotDependent()
      ? displayNumber(computeField(this.l1()) - computeField(this.l8()))
      : undefined
}
