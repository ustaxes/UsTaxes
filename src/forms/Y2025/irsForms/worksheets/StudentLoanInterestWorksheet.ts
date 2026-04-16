import { F1098e, FilingStatus } from 'ustaxes/core/data'
import F1040 from '../../irsForms/F1040'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { studentLoanInterest } from '../../data/federal'

export default class StudentLoanInterestWorksheet {
  f1040: F1040
  f1098es: F1098e[]

  constructor(f1040: F1040, f1098es: F1098e[]) {
    this.f1040 = f1040
    this.f1098es = f1098es
  }

  private get fs(): FilingStatus {
    return this.f1040.info.taxPayer.filingStatus
  }

  // Can't take deduction if filling Married Filling Separately
  notMFS = (): boolean => this.fs !== FilingStatus.MFS

  // Can't take deduction if MFJ and spouse is a dependent
  isNotDependentSpouse = (): boolean =>
    this.fs !== FilingStatus.MFJ ||
    this.f1040.info.taxPayer.spouse === undefined ||
    !(this.f1040.info.taxPayer.spouse.isTaxpayerDependent ?? false)

  // Can't take deduction if someone else claims you as a dependent
  isNotDependentSelf = (): boolean =>
    !(this.f1040.info.taxPayer.primaryPerson.isTaxpayerDependent ?? false)

  isNotDependent = (): boolean =>
    this.isNotDependentSpouse() && this.isNotDependentSelf()

  // Sum interest capped at $2,500 per IRS instructions
  l1 = (): number =>
    Math.min(
      this.f1098es.map((f1098e) => f1098e.interest).reduce((l, r) => l + r, 0),
      studentLoanInterest.maxDeduction
    )

  l2 = (): number => this.f1040.l9()

  // MAGI modification: subtract Schedule 1 above-the-line deductions
  // (excluding student loan interest itself)
  l3 = (): number =>
    sumFields([
      this.f1040.schedule1.l11(),
      this.f1040.schedule1.l12(),
      this.f1040.schedule1.l13(),
      this.f1040.schedule1.l14(),
      this.f1040.schedule1.l15(),
      this.f1040.schedule1.l16(),
      this.f1040.schedule1.l17(),
      this.f1040.schedule1.l18(),
      this.f1040.schedule1.l19a(),
      this.f1040.schedule1.l20()
    ])

  // MAGI (income before these adjustments)
  l4 = (): number => Math.max(0, this.l2() - this.l3())

  // Phase-out start: $80,000 single / $165,000 MFJ (TY2025, Rev. Proc. 2024-40)
  l5 = (): number => studentLoanInterest.phaseOutStart(this.fs)

  // Amount of MAGI over the threshold
  l6 = (): number => Math.max(0, this.l4() - this.l5())

  // Reduction ratio: ranges over $15,000 (single) or $30,000 (MFJ)
  l7 = (): number =>
    Math.min(this.l6() / studentLoanInterest.phaseOutRange(this.fs), 1)

  // Reduction amount
  l8 = (): number => this.l1() * this.l7()

  // Deductible student loan interest (undefined if MFS or claimed as dependent)
  l9 = (): number | undefined =>
    this.notMFS() && this.isNotDependent()
      ? Math.max(0, this.l1() - this.l8())
      : undefined
}
