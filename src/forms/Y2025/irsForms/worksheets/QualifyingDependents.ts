import type F1040 from '../F1040'
import type { Dependent } from 'ustaxes/core/data'
import * as federal from '../../data/federal'

/**
 * As of TY2021, the Child Tax Credit worksheet
 * is no longer published. This just implements
 * the qualifying dependent logic.
 */
export default class QualifyingDependents {
  f1040: F1040
  year = federal.CURRENT_YEAR

  constructor(f1040: F1040) {
    this.f1040 = f1040
  }

  /** Age at the end of the tax year, from the year of birth. */
  ageAtYearEnd = (birthYear: number): number => this.year - birthYear

  qualifiesChild = (d: Dependent): boolean =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    d === undefined
      ? false
      : this.ageAtYearEnd(d.dateOfBirth.getFullYear()) <
        federal.QualifyingDependents.childMaxAge

  qualifiesOther = (d: Dependent): boolean =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    d !== undefined &&
    d.qualifyingInfo !== undefined &&
    !this.qualifiesChild(d) &&
    this.ageAtYearEnd(d.dateOfBirth.getFullYear()) <
      (d.qualifyingInfo.isStudent
        ? federal.QualifyingDependents.qualifyingDependentMaxAge
        : federal.QualifyingDependents.qualifyingStudentMaxAge)

  qualifyingChildren = (): Dependent[] =>
    this.f1040.info.taxPayer.dependents.filter((dep) =>
      this.qualifiesChild(dep)
    )
}
