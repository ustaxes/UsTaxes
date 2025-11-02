// Reference implementation for Schedule D Tax Worksheet
import { FilingStatus } from 'ustaxes/core/data'
import { computeOrdinaryTax } from '../../irsForms/TaxTable'

export interface TestData {
  qualDiv: number
  taxableIncome: number
  f4952l4g: number
  f4952l4e: number
  sdl15: number
  sdl16: number
  sdl18: number
  sdl19: number
  filingStatus: FilingStatus
}

type Bracket = [number, number, number]
type Cutoffs = { [key in FilingStatus]: Bracket }
const cutoffAmounts: Cutoffs = {
  [FilingStatus.S]: [40000, 163300, 441450],
  [FilingStatus.MFJ]: [80000, 326600, 496600],
  [FilingStatus.MFS]: [40000, 163300, 441450],
  [FilingStatus.W]: [80000, 326600, 496600],
  [FilingStatus.HOH]: [53600, 163300, 469050]
}

export default class LTCGQualDivReference {
  [k: string]: TestData | (() => number)
  data: TestData

  constructor(data: TestData) {
    this.data = data
  }

  // 1. Enter your taxable income from Form 1040, 1040-SR, or 1040-NR, line 15. (However, if you are filing Form 2555 (relating to foreign earned income), enter instead the amount from line 3 of the Foreign Earned Income Tax Worksheet in the instructions for Forms 1040 and 1040-SR, line 16)
  l1 = (): number => this.data.taxableIncome
  // 2. Enter your qualified dividends from Form 1040, 1040-SR, or 1040-NR, line 3a
  l2 = (): number => this.data.qualDiv
  // 3. Enter the amount from Form 4952 (used to figure investment interest expense deduction), line 4g
  l3 = (): number => this.data.f4952l4g
  // 4. Enter the amount from Form 4952, line 4e*
  l4 = (): number => this.data.f4952l4e
  // 5. Subtract line 4 from line 3. If zero or less, enter -0-
  l5 = (): number => Math.max(0, this.l3() - this.l4())
  // 6. Subtract line 5 from line 2. If zero or less, enter -0-**
  l6 = (): number => Math.max(0, this.l2() - this.l5())
  // 7. Enter the smaller of line 15 or line 16 of Schedule D
  l7 = (): number => Math.min(this.data.sdl15, this.data.sdl16)
  // 8. Enter the smaller of line 3 or line 4
  l8 = (): number => Math.min(this.l3(), this.l4())
  // 9. Subtract line 8 from line 7. If zero or less, enter -0-**
  l9 = (): number => Math.max(0, this.l7() - this.l8())
  // 10. Add lines 6 and 9
  l10 = (): number => this.l6() + this.l9()
  // 11. Add lines 18 and 19 of Schedule D**
  l11 = (): number => this.data.sdl18 + this.data.sdl19
  // 12. Enter the smaller of line 9 or line 11
  l12 = (): number => Math.min(this.l9(), this.l11())
  // 13. Subtract line 12 from line 10
  l13 = (): number => this.l10() - this.l12()
  // 14. Subtract line 13 from line 1. If zero or less, enter -0-
  l14 = (): number => Math.max(0, this.l1() - this.l13())
  // 15. Enter:
  l15 = (): number => cutoffAmounts[this.data.filingStatus][0]
  // 16. Enter the smaller of line 1 or line 15
  l16 = (): number => Math.min(this.l1(), this.l15())
  // 17. Enter the smaller of line 14 or line 16
  l17 = (): number => Math.min(this.l14(), this.l16())
  // 18. Subtract line 10 from line 1. If zero or less, enter -0-
  l18 = (): number => Math.max(0, this.l1() - this.l10())
  // 19. Enter the smaller of line 1 or [ltcg bracket 2]
  l19 = (): number =>
    Math.min(this.l1(), cutoffAmounts[this.data.filingStatus][1])
  // 20. Enter the smaller of line 14 or line 19
  l20 = (): number => Math.min(this.l14(), this.l19())
  // 21. Enter the larger of line 18 or line 20
  l21 = (): number => Math.max(this.l18(), this.l20())
  // 22. Subtract line 17 from line 16. This amount is taxed at 0%.
  l22 = (): number => Math.max(0, this.l16() - this.l17())
  // If lines 1 and 16 are the same, skip lines 23 through 43 and go to line 44. Otherwise, go to line 23.
  // 23. Enter the smaller of line 1 or line 13
  l23 = (): number => Math.min(this.l1(), this.l13())
  // 24. Enter the amount from line 22. (If line 22 is blank, enter -0-.)
  l24 = (): number => this.l22()
  // 25. Subtract line 24 from line 23. If zero or less, enter -0-
  l25 = (): number => Math.max(0, this.l23() - this.l24())
  // 26. Enter top bracket amount
  l26 = (): number => cutoffAmounts[this.data.filingStatus][1]
  // 27. Enter the smaller of line 1 or line 26
  l27 = (): number => Math.min(this.l1(), this.l26())
  // 28. Add lines 21 and 22
  l28 = (): number => this.l21() + this.l22()
  // 29. Subtract line 28 from line 27. If zero or less, enter -0-
  l29 = (): number => Math.max(0, this.l27() - this.l28())
  // 30. Enter the smaller of line 25 or line 29
  l30 = (): number => Math.min(this.l25(), this.l29())
  // 31. Multiply line 30 by 15% (0.15)
  l31 = (): number => this.l30() * 0.15
  // 32. Add lines 24 and 30
  l32 = (): number => this.l24() + this.l30()
  // If lines 1 and 32 are the same, skip lines 33 through 43 and go to line 44. Otherwise, go to line 33.
  // 33. Subtract line 32 from line 23
  l33 = (): number => Math.max(0, this.l23() - this.l32())
  // 34. Multiply line 33 by 20% (0.20)
  l34 = (): number => this.l33() * 0.2
  // If Schedule D, line 19, is zero or blank, skip lines 35 through 40 and go to line 41. Otherwise, go to line 35.
  // 35. Enter the smaller of line 9 above or Schedule D, line 19
  l35 = (): number => Math.min(this.l9(), this.data.sdl19)
  // 36. Add lines 10 and 21
  l36 = (): number => this.l10() + this.l21()
  // 37. Enter the amount from line 1 above
  l37 = (): number => this.l1()
  // 38. Subtract line 37 from line 36. If zero or less, enter -0-
  l38 = (): number => Math.max(0, this.l36() - this.l37())
  // 39. Subtract line 38 from line 35. If zero or less, enter -0-
  l39 = (): number => Math.max(0, this.l35() - this.l38())
  // 40. Multiply line 39 by 25% (0.25)
  l40 = (): number => this.l39() * 0.25
  // If Schedule D, line 18, is zero or blank, skip lines 41 through 43 and go to line 44. Otherwise, go to line 41.
  // 41. Add lines 21, 22, 30, 33, and 39
  l41 = (): number =>
    this.l21() + this.l22() + this.l30() + this.l33() + this.l39()
  // 42. Subtract line 41 from line 1
  l42 = (): number => Math.max(0, this.l1() - this.l41())
  // 43. Multiply line 42 by 28% (0.28)
  l43 = (): number => this.l42() * 0.28
  // 44. Figure the tax on the amount on line 21. If the amount on line 21 is less than $100,000, use the Tax Table to
  l44 = (): number => computeOrdinaryTax(this.data.filingStatus, this.l21())
  // 45. Add lines 31, 34, 40, 43, and 44
  l45 = (): number =>
    this.l31() + this.l34() + this.l40() + this.l43() + this.l44()
  // 46. Figure the tax on the amount on line 1. If the amount on line 1 is less than $100,000, use the Tax Table to
  l46 = (): number => computeOrdinaryTax(this.data.filingStatus, this.l1())
  // figure the tax. If the amount on line 1 is $100,000 or more, use the Tax Computation Worksheet
  // 47. Tax on all taxable income (including capital gains and qualified dividends). Enter the smaller of line 45
  // or line 46. Also, include this amount on Form 1040, 1040-SR, or 1040-NR, line 16. (If you are filing Form
  // 2555, don't enter this amount on Form 1040 or 1040-SR, line 16. Instead, enter it on line 4 of the Foreign
  // Earned Income Tax Worksheet in the Instructions for Forms 1040 and 1040-SR)
  l47 = (): number => Math.round(Math.min(this.l45(), this.l46()))
}

export const showReference = (r: LTCGQualDivReference): string =>
  Array.from(Array(47))
    .map((_, i) => `l${i + 1}`)
    .map((x) => [x, (r[x] as () => number)()])
    .map(([l, v]) => `${l}: ${v}`)
    .join('\n')
