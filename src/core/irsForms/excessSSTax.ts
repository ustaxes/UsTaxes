import type { IncomeW2 } from 'ustaxes/core/data'
import { PersonRole } from 'ustaxes/core/data'
import { sumFields } from './util'

export interface SSTaxLimits {
  // Maximum social security tax for the year (wage base × 6.2%).
  maxSSTax: number
  // Social security wage base for the year.
  maxIncomeSSTaxApplies: number
}

// Excess social security tax withheld for one person (Form 1040 instructions,
// Schedule 3 line 11 / line 10 in 2020; Pub. 505 excess social security
// worksheet). If a person had more than one employer and total wages over the
// social security wage base, they can claim the social security tax withheld
// in excess of the maximum. Withholding is counted up to the maximum per
// employer; anything one employer withheld over the maximum can't be claimed
// on the return (the employer must refund it), but the excess from the other
// employers still can. Excess withholding is figured separately for each
// spouse.
//
// Wage test: only W-2s with social security withholding count. Each
// contributes the larger of box 3 (social security wages) and box 5 (Medicare
// wages), since box 3 omits social security tips (box 7), which we don't
// collect. W-2s without box 4 withholding are skipped so Medicare-only wages
// (e.g. some government jobs) aren't counted. If boxes 3 and 5 are both blank,
// box 1 is used instead.
//
// Employer test: W-2s are grouped by employer EIN, so one employer that
// issued several W-2s is treated as a single employer.
export const excessSSTaxWithholding = (
  w2s: IncomeW2[],
  role: PersonRole.PRIMARY | PersonRole.SPOUSE,
  limits: SSTaxLimits
): number => {
  const mine = w2s.filter(
    (w2) => w2.personRole === role && w2.ssWithholding > 0
  )

  const wagesFor = (w2: IncomeW2): number =>
    Math.max(w2.ssWages, w2.medicareIncome) || w2.income
  if (sumFields(mine.map(wagesFor)) <= limits.maxIncomeSSTaxApplies) return 0

  const withheldByEmployer = new Map<string, number>()
  mine.forEach((w2, i) => {
    const key = w2.employer?.EIN ?? `w2-${i}`
    withheldByEmployer.set(
      key,
      (withheldByEmployer.get(key) ?? 0) + w2.ssWithholding
    )
  })
  const countedWithholding = sumFields(
    Array.from(withheldByEmployer.values()).map((w) =>
      Math.min(w, limits.maxSSTax)
    )
  )

  return Math.max(0, countedWithholding - limits.maxSSTax)
}

// Total claimable excess for the return: primary and spouse figured
// separately, then added.
export const claimableExcessSSTax = (
  w2s: IncomeW2[],
  limits: SSTaxLimits
): number =>
  excessSSTaxWithholding(w2s, PersonRole.PRIMARY, limits) +
  excessSSTaxWithholding(w2s, PersonRole.SPOUSE, limits)
