// Reference implementation for ltcg and cap gains worksheet
import { WorksheetData } from 'ustaxes/components/SummaryData'
import { FilingStatus } from 'ustaxes/core/data'
import federalBrackets from '../../data/federal'
import { computeOrdinaryTax } from '../../irsForms/TaxTable'
import F1040 from '../F1040'

export interface TestData {
  qualDiv: number
  taxableIncome: number
  f1040l7: number | undefined
  sdl15: number | undefined
  sdl16: number | undefined
  sdl18: number | undefined
  sdl19: number | undefined
  filingStatus: FilingStatus
}

type Bracket = [number, number]
type Cutoffs = { [key in FilingStatus]: Bracket }
const cutoffAmounts: Cutoffs = {
  [FilingStatus.S]: [40400, 445850],
  [FilingStatus.MFJ]: [80800, 501600],
  [FilingStatus.MFS]: [40400, 250800],
  [FilingStatus.W]: [80800, 501600],
  [FilingStatus.HOH]: [54100, 473750]
}

export default class QualDivAndCGWorksheetReference {
  [k: string]: TestData | (() => number) | (() => WorksheetData)
  data: TestData

  constructor(f1040: F1040) {
    const filingStatus = f1040.info.taxPayer.filingStatus
    if (filingStatus === undefined) {
      throw new Error('Filing status is undefined')
    }
    this.data = {
      qualDiv: f1040.l3a() ?? 0,
      taxableIncome: f1040.l15(),
      f1040l7: f1040.l7(),
      sdl15: f1040.scheduleD?.l15(),
      sdl16: f1040.scheduleD?.l16(),
      sdl18: f1040.scheduleD?.l18(),
      sdl19: f1040.scheduleD?.l19(),
      filingStatus
    }
  }

  // 1. Enter the amount from Form 1040 or 1040-SR, line 15. However, if you are filing Form 2555 (relating to foreign earned income), enter the amount from line 3 of the Foreign Earned Income Tax Worksheet
  l1 = (): number => this.data.taxableIncome
  // 2. Enter the amount from Form 1040 or 1040-SR, line 3a*
  l2 = (): number => this.data.qualDiv
  // 3. Are you filing Schedule D?*
  // Yes. Enter the smaller of line 15 or 16 of Schedule D. If either line 15 or 16 is blank or a loss, enter -0-. 3.
  // No. Enter the amount from Form 1040 or 1040-SR, line 7.
  // Either way, it's the smaller of LTCG or total capital gain.
  l3 = (): number =>
    Math.min(
      Math.max(this.data.sdl15 ?? 0, 0),
      Math.max(this.data.sdl16 ?? 0, 0)
    )
  // 4. Add lines 2 and 3: LTCG + QDIV
  l4 = (): number => this.l2() + this.l3()
  // 5. Subtract line 4 from line 1. If zero or less, enter -0-
  l5 = (): number => Math.max(this.l1() - this.l4(), 0)
  // 6. Enter:
  // $40,400 if single or married filing separately,
  // $80,800 if married filing jointly or qualifying widow(er), $54,100 if head of household.
  l6 = (): number => cutoffAmounts[this.data.filingStatus][0]
  // 7. Enter the smaller of line 1 or line 6
  l7 = (): number => Math.min(this.l1(), this.l6())
  // 8. Enter the smaller of line 5 or line 7
  l8 = (): number => Math.min(this.l5(), this.l7())
  // 9. Subtract line 8 from line 7. This amount is taxed at 0%
  l9 = (): number => this.l7() - this.l8()
  // 10. Enter the smaller of line 1 or line 4
  l10 = (): number => Math.min(this.l1(), this.l4())
  // 11. Enter the amount from line 9
  l11 = (): number => this.l9()
  // 12. Subtract line 11 from line 10
  l12 = (): number => this.l10() - this.l11()
  // 13. Enter:
  // $445,850 if single, $250,800 if married filing separately, $501,600 if married filing jointly or qualifying widow(er), $473,750 if head of household.
  //
  l13 = (): number => cutoffAmounts[this.data.filingStatus][1]
  // 14. Enter the smaller of line 1 or line 13
  l14 = (): number => Math.min(this.l1(), this.l13())
  // 15. Add lines 5 and 9
  l15 = (): number => this.l5() + this.l9()
  // 16. Subtract line 15 from line 14. If zero or less, enter -0-
  l16 = (): number => Math.max(this.l14() - this.l15(), 0)
  // 17. Enter the smaller of line 12 or line 16
  l17 = (): number => Math.min(this.l12(), this.l16())
  // 18. Multiply line 17 by 15% (0.15)
  l18 = (): number =>
    (this.l17() * federalBrackets.longTermCapGains.rates[1]) / 100
  // 19. Add lines 9 and 17
  l19 = (): number => this.l9() + this.l17()
  // 20. Subtract line 19 from line 10
  l20 = (): number => this.l10() - this.l19()
  // 21. Multiply line 20 by 20% (0.20)
  l21 = (): number =>
    (this.l20() * federalBrackets.longTermCapGains.rates[2]) / 100
  // 22. Figure the tax on the amount on line 5. If the amount on line 5 is less than $100,000, use the Tax Table to figure the tax. If the amount on line 5 is $100,000 or more, use the Tax Computation Worksheet
  l22 = (): number => computeOrdinaryTax(this.data.filingStatus, this.l5())
  // 23. Add lines 18, 21, and 22
  l23 = (): number => this.l18() + this.l21() + this.l22()
  // 24. Figure the tax on the amount on line 1. If the amount on line 1 is less than $100,000, use the Tax Table to figure the tax. If the amount on line 1 is $100,000 or more, use the Tax Computation Worksheet
  l24 = (): number => computeOrdinaryTax(this.data.filingStatus, this.l1())
  // 25. Tax on all taxable income. Enter the smaller of line 23 or 24. Also include this amount on the entry space on Form 1040 or 1040-SR, line 16. If you are filing Form 2555, don’t enter this amount on the entry space on Form 1040 or 1040-SR, line 16. Instead, enter it on line 4 of the Foreign Earned Income Tax Worksheet
  l25 = (): number => Math.min(this.l23(), this.l24())

  tax = (): number => this.l25()

  getSummaryData = (): WorksheetData => {
    return {
      name: 'Qualified Dividends and Capital Gains Worksheet — Line 16',
      lines: [
        {
          line: 1,
          value: this.l1()
        },
        {
          line: 2,
          value: this.l2()
        },
        {
          line: 3,
          value: this.l3()
        },
        {
          line: 4,
          value: this.l4()
        },
        {
          line: 5,
          value: this.l5()
        },
        {
          line: 6,
          value: this.l6()
        },
        {
          line: 7,
          value: this.l7()
        },
        {
          line: 8,
          value: this.l8()
        },
        {
          line: 9,
          value: this.l9()
        },
        {
          line: 10,
          value: this.l10()
        },
        {
          line: 11,
          value: this.l11()
        },
        {
          line: 12,
          value: this.l12()
        },
        {
          line: 13,
          value: this.l13()
        },
        {
          line: 14,
          value: this.l14()
        },
        {
          line: 15,
          value: this.l15()
        },
        {
          line: 16,
          value: this.l16()
        },
        {
          line: 17,
          value: this.l17()
        },
        {
          line: 18,
          value: this.l18()
        },
        {
          line: 19,
          value: this.l19()
        },
        {
          line: 20,
          value: this.l20()
        },
        {
          line: 21,
          value: this.l21()
        },
        {
          line: 22,
          value: this.l22()
        },
        {
          line: 23,
          value: this.l23()
        },
        {
          line: 24,
          value: this.l24()
        },
        {
          line: 25,
          value: this.l25()
        }
      ]
    }
  }
}
