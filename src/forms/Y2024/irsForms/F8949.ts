import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Asset, isSold, SoldAsset } from 'ustaxes/core/data'
import F1040Attachment from './F1040Attachment'
import F1040 from './F1040'
import { CURRENT_YEAR } from '../data/federal'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'

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

const toLine = (position: SoldAsset<Date>): Line => [
  position.name,
  showDate(position.openDate),
  showDate(position.closeDate),
  position.closePrice * position.quantity,
  position.openPrice * position.quantity,
  undefined,
  undefined,
  (position.closePrice - position.openPrice) * position.quantity
]

const NUM_SHORT_LINES = 14
const NUM_LONG_LINES = 14

const padUntil = <A, B>(xs: A[], v: B, n: number): (A | B)[] => {
  if (xs.length >= n) {
    return xs
  }
  return [...xs, ...Array.from(Array(n - xs.length)).map(() => v)]
}

export default class F8949 extends F1040Attachment {
  tag: FormTag = 'f8949'
  sequenceIndex = 12.1

  index = 0

  constructor(f1040: F1040, index = 0) {
    super(f1040)
    this.index = index
  }

  isNeeded = (): boolean => this.thisYearSales().length > 0

  copies = (): F8949[] => {
    if (this.index === 0) {
      const extraCopiesNeeded = Math.round(
        Math.max(
          this.thisYearShortTermSales().length / NUM_SHORT_LINES,
          this.thisYearLongTermSales().length / NUM_LONG_LINES
        )
      )
      return Array.from(Array(extraCopiesNeeded)).map(
        (_, i) => new F8949(this.f1040, i + 1)
      )
    }
    return []
  }

  // Assuming we're only handling non-reported transactions
  part1BoxA = (): boolean => false
  part1BoxB = (): boolean => false
  part1BoxC = (): boolean => true
  part2BoxD = (): boolean => false
  part2BoxE = (): boolean => false
  part2BoxF = (): boolean => true

  thisYearSales = (): SoldAsset<Date>[] =>
    this.f1040.assets.filter(
      (p) => isSold(p) && p.closeDate.getFullYear() === CURRENT_YEAR
    ) as SoldAsset<Date>[]

  thisYearLongTermSales = (): SoldAsset<Date>[] =>
    this.thisYearSales().filter((p) => this.isLongTerm(p))

  thisYearShortTermSales = (): SoldAsset<Date>[] =>
    this.thisYearSales().filter((p) => !this.isLongTerm(p))

  // in milliseconds
  oneDay = 1000 * 60 * 60 * 24

  isLongTerm = (p: Asset<Date>): boolean => {
    if (p.closeDate === undefined || p.closePrice === undefined) return false
    const milliInterval = p.closeDate.getTime() - p.openDate.getTime()
    return milliInterval / this.oneDay > 366
  }

  /**
   * Take the short term transactions that fit on this copy of the 8949
   */
  shortTermSales = (): SoldAsset<Date>[] =>
    this.thisYearShortTermSales().slice(
      this.index * NUM_SHORT_LINES,
      (this.index + 1) * NUM_SHORT_LINES
    )

  /**
   * Take the long term transactions that fit on this copy of the 8949
   */
  longTermSales = (): SoldAsset<Date>[] =>
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
      (acc, p) => acc + p.closePrice * p.quantity - (p.closeFee ?? 0),
      0
    )

  shortTermTotalCost = (): number =>
    this.shortTermSales().reduce(
      (acc, p) => acc + p.openPrice * p.quantity + p.openFee,
      0
    )

  shortTermTotalGain = (): number =>
    this.shortTermTotalProceeds() - this.shortTermTotalCost()

  // TODO: handle adjustments column.
  shortTermTotalAdjustments = (): number | undefined => undefined

  longTermTotalProceeds = (): number =>
    this.longTermSales().reduce(
      (acc, p) => acc + p.closePrice * p.quantity - (p.closeFee ?? 0),
      0
    )

  longTermTotalCost = (): number =>
    this.longTermSales().reduce(
      (acc, p) => acc + p.openPrice * p.quantity + p.openFee,
      0
    )

  longTermTotalGain = (): number =>
    this.longTermTotalProceeds() - this.longTermTotalCost()

  // TODO: handle adjustments column.
  longTermTotalAdjustments = (): number | undefined => undefined

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.part1BoxA(),
    this.part1BoxB(),
    this.part1BoxC(),
    ...this.shortTermLines().flat(),
    this.shortTermTotalProceeds(),
    this.shortTermTotalCost(),
    undefined, // greyed out field
    this.shortTermTotalAdjustments(),
    this.shortTermTotalGain(),
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
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

  fillInstructions = (): FillInstructions => {
    const rowInstructions = (
      lines: Line[],
      page: string,
      prefix: string
    ): FillInstructions =>
      lines.flatMap((line, rowIdx) => {
        const rowNum = rowIdx + 1
        // Row 1 starts at field index 3 (f_3..f_10), each subsequent row +8
        const fieldBase = 3 + rowIdx * 8
        return (line as (string | number | undefined)[]).map((val, colIdx) =>
          text(
            `topmostSubform[0].${page}.Table_Line1[0].Row${rowNum}[0].${prefix}_${
              fieldBase + colIdx
            }[0]`,
            val
          )
        )
      })

    return [
      // Page 1 (short-term) header
      text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_2[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      checkbox('topmostSubform[0].Page1[0].c1_1[0]', this.part1BoxA()),
      checkbox('topmostSubform[0].Page1[0].c1_1[1]', this.part1BoxB()),
      checkbox('topmostSubform[0].Page1[0].c1_1[2]', this.part1BoxC()),
      // Short-term transaction rows (14 rows × 8 columns = f1_3..f1_114)
      ...rowInstructions(this.shortTermLines(), 'Page1[0]', 'f1'),
      // Short-term totals
      text(
        'topmostSubform[0].Page1[0].f1_115[0]',
        this.shortTermTotalProceeds()
      ),
      text('topmostSubform[0].Page1[0].f1_116[0]', this.shortTermTotalCost()),
      text('topmostSubform[0].Page1[0].f1_117[0]', undefined),
      text(
        'topmostSubform[0].Page1[0].f1_118[0]',
        this.shortTermTotalAdjustments()
      ),
      text('topmostSubform[0].Page1[0].f1_119[0]', this.shortTermTotalGain()),
      // Page 2 (long-term) header
      text('topmostSubform[0].Page2[0].f2_1[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page2[0].f2_2[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      checkbox('topmostSubform[0].Page2[0].c2_1[0]', this.part2BoxD()),
      checkbox('topmostSubform[0].Page2[0].c2_1[1]', this.part2BoxE()),
      checkbox('topmostSubform[0].Page2[0].c2_1[2]', this.part2BoxF()),
      // Long-term transaction rows (14 rows × 8 columns = f2_3..f2_114)
      ...rowInstructions(this.longTermLines(), 'Page2[0]', 'f2'),
      // Long-term totals
      text(
        'topmostSubform[0].Page2[0].f2_115[0]',
        this.longTermTotalProceeds()
      ),
      text('topmostSubform[0].Page2[0].f2_116[0]', this.longTermTotalCost()),
      text('topmostSubform[0].Page2[0].f2_117[0]', undefined),
      text(
        'topmostSubform[0].Page2[0].f2_118[0]',
        this.longTermTotalAdjustments()
      ),
      text('topmostSubform[0].Page2[0].f2_119[0]', this.longTermTotalGain())
    ]
  }
}
