// To regenerate taxTable.csv: npx ts-node -r tsconfig-paths/register src/forms/Y2025/tests/generateTaxTable.ts
import { FilingStatus } from 'ustaxes/core/data'
import { CURRENT_YEAR } from '../data/federal'
import { computeOrdinaryTax } from '../irsForms/TaxTable'
import fs from 'fs/promises'
import { parseCsvOrThrow } from 'ustaxes/data/csvImport'

const getTaxTable = async (): Promise<number[][]> => {
  const path = './src/forms/Y2025/tests/taxTable.csv'
  const taxTableCsv = (await fs.readFile(path)).toString('utf-8')
  return parseCsvOrThrow(taxTableCsv, (r: string[], rowNum) =>
    // ignore heading row.
    rowNum > 0 ? [r.map((s) => Number(s))] : []
  )
}

const expectTax = (status: FilingStatus, amount: number, tax: number) => {
  const computedTax = Math.round(computeOrdinaryTax(status, amount))
  expect(computedTax).toEqual(tax)
}

const expectTaxUnder100KRange = (
  status: FilingStatus,
  min: number,
  max: number,
  tax: number
) => {
  const diff = max - min
  const quarter = Math.round((diff / 4) * 100) / 100
  expectTax(status, min, tax)
  expectTax(status, min + quarter, tax)
  expectTax(status, min + 2 * quarter, tax)
  expectTax(status, min + 3 * quarter, tax)
  expectTax(status, max, tax)
}

describe('Tax rates', () => {
  it('test should be updated for new year', () => {
    // WARNING! Do not just change the year. Also update the CSV and expected tax amounts below!
    expect(CURRENT_YEAR).toEqual(2025)
  })
  it('ordinary taxes for single status should be correct', async () => {
    const rows = await getTaxTable()
    rows.forEach(([min, lessThan, tax]) => {
      expectTaxUnder100KRange(FilingStatus.S, min, lessThan - 0.01, tax)
    })

    // Over $100,000
    const amounts = [
      [100000, 16914],
      [100001, 16914],
      [103350, 17651],
      [103351, 17651],
      [197300, 40199],
      [197301, 40199],
      [250525, 57231],
      [250526, 57231],
      [626350, 188770],
      [626351, 188770]
    ]
    amounts.forEach(([amount, tax]) => {
      expectTax(FilingStatus.S, amount, tax)
    })
  })

  it('ordinary taxes for married filing jointly status should be correct', async () => {
    const rows = await getTaxTable()
    rows.forEach(([min, lessThan, , tax]) => {
      expectTaxUnder100KRange(FilingStatus.MFJ, min, lessThan - 0.01, tax)
    })

    // Over $100,000
    const amounts = [
      [100000, 11828],
      [100001, 11828],
      [206700, 35302],
      [206701, 35302],
      [394600, 80398],
      [394601, 80398],
      [501050, 114462],
      [501051, 114462],
      [751600, 202155],
      [751601, 202155]
    ]
    amounts.forEach(([amount, tax]) => {
      expectTax(FilingStatus.MFJ, amount, tax)
    })
  })

  it('ordinary taxes for married filing separately status should be correct', async () => {
    const rows = await getTaxTable()
    rows.forEach(([min, lessThan, , , tax]) => {
      expectTaxUnder100KRange(FilingStatus.MFS, min, lessThan - 0.01, tax)
    })

    // Over $100,000
    const amounts = [
      [100000, 16914],
      [100001, 16914],
      [103350, 17651],
      [103351, 17651],
      [197300, 40199],
      [197301, 40199],
      [250525, 57231],
      [250526, 57231],
      [375800, 101077],
      [375801, 101078]
    ]
    amounts.forEach(([amount, tax]) => {
      expectTax(FilingStatus.MFS, amount, tax)
    })
  })

  it('ordinary taxes for head of household status should be correct', async () => {
    const rows = await getTaxTable()
    rows.forEach(([min, lessThan, , , , tax]) => {
      expectTaxUnder100KRange(FilingStatus.HOH, min, lessThan - 0.01, tax)
    })

    // Over $100,000
    const amounts = [
      [100000, 15175],
      [100001, 15175],
      [103350, 15912],
      [103351, 15912],
      [197300, 38460],
      [197301, 38460],
      [250500, 55484],
      [250501, 55484],
      [626350, 187032],
      [626351, 187032]
    ]
    amounts.forEach(([amount, tax]) => {
      expectTax(FilingStatus.HOH, amount, tax)
    })
  })
})
