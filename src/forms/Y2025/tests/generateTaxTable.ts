/**
 * Regenerate taxTable.csv from the 2025 tax brackets in federal.ts.
 * Run: npx ts-node -r tsconfig-paths/register src/forms/Y2025/tests/generateTaxTable.ts
 *
 * For a new tax year: copy this file into Y<YEAR>/tests/, update Y<YEAR>/data/federal.ts
 * with the new brackets, run the script, then commit the resulting taxTable.csv.
 */
import * as fs from 'fs'
import * as path from 'path'
import { FilingStatus } from 'ustaxes/core/data'
import { computeOrdinaryTax } from '../irsForms/TaxTable'

// IRS-defined income range boundaries — these do not change year to year.
function buildRanges(): Array<[number, number]> {
  const ranges: Array<[number, number]> = []

  // $0–$5 in a single row
  ranges.push([0, 5])
  // $5–$25 in $10 increments
  for (let i = 5; i < 25; i += 10) {
    ranges.push([i, i + 10])
  }
  // $25–$3,000 in $25 increments
  for (let i = 25; i < 3000; i += 25) {
    ranges.push([i, i + 25])
  }
  // $3,000–$100,000 in $50 increments
  for (let i = 3000; i < 100000; i += 50) {
    ranges.push([i, i + 50])
  }

  return ranges
}

const rows: string[] = [
  'At Least,Less than,Single,Married Filing Jointly,Married Filing Separately,Head of Household'
]

for (const [min, lessThan] of buildRanges()) {
  const mid = (min + lessThan) / 2
  const s = Math.round(computeOrdinaryTax(FilingStatus.S, mid))
  const mfj = Math.round(computeOrdinaryTax(FilingStatus.MFJ, mid))
  const mfs = Math.round(computeOrdinaryTax(FilingStatus.MFS, mid))
  const hoh = Math.round(computeOrdinaryTax(FilingStatus.HOH, mid))
  rows.push(`${min},${lessThan},${s},${mfj},${mfs},${hoh}`)
}

const out = path.join(__dirname, 'taxTable.csv')
fs.writeFileSync(out, rows.join('\n') + '\n')
console.log('Wrote', out, rows.length - 1, 'data rows')
