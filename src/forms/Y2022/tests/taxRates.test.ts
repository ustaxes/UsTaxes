import { FilingStatus } from 'ustaxes/core/data'
import { CURRENT_YEAR } from '../data/federal'
import { computeOrdinaryTax } from '../irsForms/TaxTable'
import fs from 'fs/promises'
import { parseCsvOrThrow } from 'ustaxes/data/csvImport'

const getTaxTable = async (): Promise<number[][]> => {
  const path = './src/forms/Y2022/tests/taxTable.csv'
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
    expect(CURRENT_YEAR).toEqual(2022)
  })
  it('ordinary taxes for single status should be correct', async () => {
    const rows = await getTaxTable()
    rows.forEach(([min, lessThan, tax]) => {
      expectTaxUnder100KRange(FilingStatus.S, min, lessThan - 0.01, tax)
    })

    // Over $100,000
    const amounts = [
      [100000, 18021],
      [164925, 33603],
      [164926, 33603],
      [209425, 47843],
      [209426, 47843],
      [523600, 157804],
      [523601, 157805]
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
      [100000, 13497],
      [172750, 29502],
      [172751, 29502],
      [329850, 67206],
      [329851, 67206],
      [418850, 95686],
      [418851, 95686],
      [628300, 168994],
      [628301, 168994]
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
      [100000, 18021],
      [164925, 33603],
      [164926, 33603],
      [209425, 47843],
      [209426, 47843],
      [314150, 84497],
      [314151, 84497]
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
      [100000, 16569],
      [164900, 32145],
      [164901, 32145],
      [209400, 46385],
      [209401, 46385],
      [523600, 156355],
      [523601, 156355]
    ]
    amounts.forEach(([amount, tax]) => {
      expectTax(FilingStatus.HOH, amount, tax)
    })
  })
})
