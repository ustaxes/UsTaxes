import F1040 from '../F1040'
import { Dependent } from 'ustaxes/core/data'
import * as federal from '../../data/federal'

/**
 * As of TY2021, the Child Tax Credit worksheet
 * is no longer published. This just implements
 * the qualifying dependent logic.
 */
export default class QualifyingDependents {
  f1040: F1040
  year = 2021

  constructor(f1040: F1040) {
    this.f1040 = f1040
  }

  qualifiesChild = (d: Dependent): boolean =>
    d.qualifyingInfo !== undefined &&
    this.year - d.qualifyingInfo.birthYear <
      federal.QualifyingDependents.childMaxAge

  qualifiesOther = (d: Dependent): boolean =>
    d.qualifyingInfo !== undefined &&
    !this.qualifiesChild(d) &&
    this.year - d.qualifyingInfo.birthYear <
      (d.qualifyingInfo.isStudent
        ? federal.QualifyingDependents.qualifyingDependentMaxAge
        : federal.QualifyingDependents.qualifyingStudentMaxAge)

  qualifyingChildren = (): Dependent[] =>
    this.f1040.info.taxPayer.dependents.filter((dep) =>
      this.qualifiesChild(dep)
    )
}
