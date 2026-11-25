import type { IncomeW2 } from 'ustaxes/core/data'
import { PersonRole } from 'ustaxes/core/data'
import type { SSTaxLimits } from 'ustaxes/core/irsForms/excessSSTax'

// Test oracle: Pub. 505 excess social security worksheet, figured per person,
// written line by line rather than mirroring core/irsForms/excessSSTax:
//   1. For each employer, social security tax withheld, but not more than
//      the maximum.
//   2. Add the amounts on line 1.
//   3. Subtract the maximum; if zero or less, nothing is claimable.
// The credit also requires wages over the wage base, counting only W-2s with
// box 4 withholding (box 3, or box 5 if larger for tips; box 1 if both are
// blank).
const employerKey = (w2: IncomeW2, i: number): string =>
  w2.employer?.EIN ?? `unknown-${i}`

export const expectedExcessSSTaxFor = (
  w2s: IncomeW2[],
  role: PersonRole.PRIMARY | PersonRole.SPOUSE,
  limits: SSTaxLimits
): number => {
  const mine = w2s.filter(
    (w2) => w2.personRole === role && w2.ssWithholding > 0
  )

  let wages = 0
  for (const w2 of mine) {
    if (w2.ssWages === 0 && w2.medicareIncome === 0) wages += w2.income
    else wages += Math.max(w2.ssWages, w2.medicareIncome)
  }
  if (wages <= limits.maxIncomeSSTaxApplies) return 0

  const perEmployer = new Map<string, number>()
  mine.forEach((w2, i) => {
    const key = employerKey(w2, i)
    perEmployer.set(key, (perEmployer.get(key) ?? 0) + w2.ssWithholding)
  })
  let line2 = 0
  perEmployer.forEach((withheld) => {
    line2 += Math.min(withheld, limits.maxSSTax)
  })
  const line3 = line2 - limits.maxSSTax
  return line3 > 0 ? line3 : 0
}

export const expectedExcessSSTax = (
  w2s: IncomeW2[],
  limits: SSTaxLimits
): number =>
  expectedExcessSSTaxFor(w2s, PersonRole.PRIMARY, limits) +
  expectedExcessSSTaxFor(w2s, PersonRole.SPOUSE, limits)
