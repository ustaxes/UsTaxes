import { FilingStatus } from 'ustaxes/core/data'
import { CURRENT_YEAR } from '../data/federal'
import { computeOrdinaryTax } from '../irsForms/TaxTable'
import fs from 'fs/promises'
import { parseCsvOrThrow } from 'ustaxes/data/csvImport'

const getTaxTable = async (): Promise<number[][]> => {
  const path = './src/forms/Y2024/tests/taxTable.csv'
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
    expect(CURRENT_YEAR).toEqual(2024)
  })
  it('ordinary taxes for single status should be correct', async () => {
    const rows = await getTaxTable()
    rows.forEach(([min, lessThan, tax]) => {
      expectTaxUnder100KRange(FilingStatus.S, min, lessThan - 0.01, tax)
    })

    // Over $100,000
    const amounts = [
      [100000, 17053], // *0.22-4947.00
      [100001, 17053],
      [100525, 17169], // *0.24-6957.50
      [100526, 17169],
      [191950, 39111], // *0.32-22313.50
      [191951, 39111],
      [243725, 55679], // *0.35-29625.25
      [243726, 55679],
      [609350, 183647], // *0.37-41812.25
      [609351, 183648]
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
      [100000, 12106], // *0.22-9894.00
      [100001, 12106],
      [201050, 34337], // *0.24-13915.00
      [201051, 34337],
      [383900, 78221], // *0.32-44627.00
      [383901, 78221],
      [487450, 111357], // *0.35-59250.50
      [487451, 111357],
      [731200, 196670], // *0.37-73874.50
      [731201, 196670]
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
      [100000, 17053], // *0.22-4947.00
      [100001, 17053],
      [100525, 17169], // *0.24-6957.50
      [100526, 17169],
      [191950, 39111], // *0.32-22313.50
      [191951, 39111],
      [243725, 55679], // *0.35-29625.25
      [243726, 55679],
      [609350, 188522], // *0.37-36937.25
      [609351, 188523]
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
      [100000, 15359], // *0.22-6641.00
      [100001, 15359],
      [100500, 15469], // *0.24-8651.00
      [100501, 15469],
      [191950, 37417], // *0.32-24007.00
      [191951, 37417],
      [243700, 53977], // *0.35-31318.00
      [243701, 53977],
      [609350, 181955], // *0.37-43505.00
      [609351, 181955]
    ]
    amounts.forEach(([amount, tax]) => {
      expectTax(FilingStatus.HOH, amount, tax)
    })
  })
})
