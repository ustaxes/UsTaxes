/**
 * Regenerates the IRS tax table for a given year from that year's federal bracket data.
 *
 * Usage:
 *   npm run generate-tax-table -- <year>
 *   ts-node -r tsconfig-paths/register scripts/generateTaxTable.ts <year>
 *
 * Updates:
 *   - src/forms/Y<year>/tests/taxTable.csv      (under-$100K table)
 *   - src/forms/Y<year>/tests/taxRates.test.ts  (over-$100K hardcoded amounts)
 *
 * The IRS tax table covers $0–$99,999. For each $50 range (or $25/$5 at the low end)
 * the IRS publishes tax at the midpoint. TaxTable.ts applies that same midpoint snap
 * internally, so passing the lower bound of each range to computeOrdinaryTax is enough.
 *
 * The over-$100K section tests at $100,000/$100,001 and at each bracket boundary
 * (brackets[2..5]) and that boundary + 1, since those are where the rate steps change.
 */

import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { FilingStatus } from 'ustaxes/core/data'

const year = process.argv[2]
if (!year || !/^\d{4}$/.test(year)) {
  console.error(
    'Usage: ts-node -r tsconfig-paths/register scripts/generateTaxTable.ts <year>'
  )
  process.exit(1)
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { computeOrdinaryTax } = require(path.resolve(
  `src/forms/Y${year}/irsForms/TaxTable`
)) as { computeOrdinaryTax: (s: FilingStatus, income: number) => number }

interface FederalBrackets {
  ordinary: { status: { [k: string]: { brackets: number[] } } }
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: federalBrackets } = require(path.resolve(
  `src/forms/Y${year}/data/federal`
)) as { default: FederalBrackets }

const tax = (s: FilingStatus, income: number) =>
  Math.round(computeOrdinaryTax(s, income))

// ── CSV (under $100,000) ──────────────────────────────────────────────────────

const csvStatuses: FilingStatus[] = [
  FilingStatus.S,
  FilingStatus.MFJ,
  FilingStatus.MFS,
  FilingStatus.HOH
]

function csvRanges(): Array<[number, number]> {
  const result: Array<[number, number]> = [
    [0, 5],
    [5, 15],
    [15, 25]
  ]
  for (let i = 25; i < 3000; i += 25) result.push([i, i + 25])
  for (let i = 3000; i < 100000; i += 50) result.push([i, i + 50])
  return result
}

const csvLines: string[] = [
  'At Least,Less than,Single,Married Filing Jointly,Married Filing Separately,Head of Household'
]
for (const [min, max] of csvRanges()) {
  const taxes = csvStatuses.map((s) => tax(s, min))
  csvLines.push([min, max, ...taxes].join(','))
}

const csvPath = path.resolve(`src/forms/Y${year}/tests/taxTable.csv`)
writeFileSync(csvPath, csvLines.join('\n') + '\n')
console.log(`Updated ${csvPath}`)

// ── Test file (over $100,000 hardcoded amounts) ───────────────────────────────

// Each status's "Over $100,000" block tests at $100,000, $100,001, then at each
// upper bracket boundary (indices 2–5) and that boundary + 1.
const statusOrder: FilingStatus[] = [
  FilingStatus.S,
  FilingStatus.MFJ,
  FilingStatus.MFS,
  FilingStatus.HOH
]

function buildAmountsBlock(s: FilingStatus): string {
  const brackets = federalBrackets.ordinary.status[s].brackets
  const testPoints: number[] = [100000, 100001]
  for (let i = 2; i <= 5; i++) {
    testPoints.push(brackets[i], brackets[i] + 1)
  }
  const itemLines = testPoints
    .map((income, idx) => {
      const t = tax(s, income)
      const comma = idx < testPoints.length - 1 ? ',' : ''
      return `      [${income}, ${t}]${comma}`
    })
    .join('\n')
  return `    // Over $100,000\n    const amounts = [\n${itemLines}\n    ]`
}

const testFilePath = path.resolve(`src/forms/Y${year}/tests/taxRates.test.ts`)
let testSource = readFileSync(testFilePath, 'utf-8')

let occurrenceIdx = 0
testSource = testSource.replace(
  /    \/\/ Over \$100,000\n    const amounts = \[[\s\S]*?\n    \]/g,
  () => buildAmountsBlock(statusOrder[occurrenceIdx++])
)

writeFileSync(testFilePath, testSource)
console.log(`Updated ${testFilePath}`)
