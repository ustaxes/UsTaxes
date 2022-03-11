/* eslint-disable @typescript-eslint/no-non-null-assertion */

import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import { Asset, TaxPayer as TP } from 'ustaxes/core/data'
import TaxPayer from 'ustaxes/core/data/TaxPayer'

type EmptyLine = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
]

type Line =
  | [string, string, string, number, number, undefined, undefined, number]
  | EmptyLine
const emptyLine: EmptyLine = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
]

const showDate = (date: Date): string =>
  `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

const toLine = (position: Asset<Date>): Line => [
  position.name,
  showDate(position.openDate),
  showDate(position.closeDate!),
  position.closePrice! * position.quantity,
  position.openPrice * position.quantity,
  undefined,
  undefined,
  (position.closePrice! - position.openPrice) * position.quantity
]

const NUM_SHORT_LINES = 14
const NUM_LONG_LINES = 14

const padUntil = <A, B>(xs: A[], v: B, n: number): (A | B)[] => {
  if (xs.length >= n) {
    return xs
  }
  return [...xs, ...Array.from(Array(n - xs.length)).map(() => v)]
}

export default class F8949 extends Form {
  tag: FormTag = 'f8949'
  sequenceIndex = 12.1
  assets: Asset<Date>[]
  tp: TP

  index = 0

  copies: F8949[] = []

  constructor(tp: TP, assets: Asset<Date>[], index = 0) {
    super()
    this.assets = assets
    this.tp = tp
    if (index === 0) {
      const extraCopiesNeeded = Math.round(
        Math.max(
          this.thisYearShortTermSales().length / NUM_SHORT_LINES,
          this.thisYearLongTermSales().length / NUM_LONG_LINES
        )
      )
      this.copies = Array.from(Array(extraCopiesNeeded)).map(
        (_, i) => new F8949(tp, assets, i + 1)
      )
    } else {
      this.copies = []
    }
    this.index = index
  }

  isNeeded = (): boolean => this.thisYearSales().length > 0

  // Assuming we're only handling non-reported transactions
  part1BoxA = (): boolean => false
  part1BoxB = (): boolean => false
  part1BoxC = (): boolean => true
  part2BoxD = (): boolean => false
  part2BoxE = (): boolean => false
  part2BoxF = (): boolean => true

  thisYearSales = (): Asset<Date>[] =>
    this.assets.filter(
      (p) => p.closeDate !== undefined && p.closeDate.getFullYear() === 2021
    )

  thisYearLongTermSales = (): Asset<Date>[] =>
    this.thisYearSales().filter(
      (p) => p.closeDate !== undefined && this.isLongTerm(p)
    )

  thisYearShortTermSales = (): Asset<Date>[] =>
    this.thisYearSales().filter(
      (p) => p.closeDate !== undefined && !this.isLongTerm(p)
    )

  // in milliseconds
  oneDay = 1000 * 60 * 60 * 24

  isLongTerm = (p: Asset<Date>): boolean => {
    if (p.closeDate === undefined) return false
    const milliInterval = p.closeDate.getTime() - p.openDate.getTime()
    return milliInterval / this.oneDay > 366
  }

  /**
   * Take the short term transactions that fit on this copy of the 8949
   */
  shortTermSales = (): Asset<Date>[] =>
    this.thisYearShortTermSales().slice(
      this.index * NUM_SHORT_LINES,
      (this.index + 1) * NUM_SHORT_LINES
    )

  /**
   * Take the long term transactions that fit on this copy of the 8949
   */
  longTermSales = (): Asset<Date>[] =>
    this.thisYearLongTermSales().slice(
      this.index * NUM_LONG_LINES,
      (this.index + 1) * NUM_LONG_LINES
    )

  shortTermLines = (): Line[] =>
    padUntil(
      this.shortTermSales().map((p) => toLine(p)),
      emptyLine,
      NUM_SHORT_LINES
    )
  longTermLines = (): Line[] =>
    padUntil(
      this.longTermSales().map((p) => toLine(p)),
      emptyLine,
      NUM_LONG_LINES
    )

  shortTermTotalProceeds = (): number =>
    this.shortTermSales().reduce(
      (acc, p) => acc + p.closePrice! * p.quantity,
      0
    )

  shortTermTotalCost = (): number =>
    this.shortTermSales().reduce((acc, p) => acc + p.openPrice! * p.quantity, 0)

  shortTermTotalGain = (): number =>
    this.shortTermTotalProceeds() - this.shortTermTotalCost()

  // TODO: handle adjustments column.
  shortTermTotalAdjustments = (): number | undefined => undefined

  longTermTotalProceeds = (): number =>
    this.longTermSales().reduce((acc, p) => acc + p.closePrice! * p.quantity, 0)

  longTermTotalCost = (): number =>
    this.longTermSales().reduce((acc, p) => acc + p.openPrice! * p.quantity, 0)

  longTermTotalGain = (): number =>
    this.longTermTotalProceeds() - this.longTermTotalCost()

  // TODO: handle adjustments column.
  longTermTotalAdjustments = (): number | undefined => undefined

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.tp)
    return [
      tp.namesString(),
      this.tp.primaryPerson?.ssid,
      this.part1BoxA(),
      this.part1BoxB(),
      this.part1BoxC(),
      ...this.shortTermLines().flat(),
      this.shortTermTotalProceeds(),
      this.shortTermTotalCost(),
      undefined, // greyed out field
      this.shortTermTotalAdjustments(),
      this.shortTermTotalGain(),
      tp.namesString(),
      this.tp.primaryPerson?.ssid,
      this.part2BoxD(),
      this.part2BoxE(),
      this.part2BoxF(),
      ...this.longTermLines().flat(),
      this.longTermTotalProceeds(),
      this.longTermTotalCost(),
      undefined, // greyed out field
      this.longTermTotalAdjustments(),
      this.longTermTotalGain()
    ]
  }
}
