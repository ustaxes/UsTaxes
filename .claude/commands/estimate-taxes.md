---
name: estimate-taxes
description: "Estimate federal tax liability for planning purposes"
args:
  - name: income
    description: "Gross income amount (or 'from-return' to use current return data)"
    required: false
  - name: filingStatus
    description: "Filing status: single, mfj, mfs, or hoh"
    required: false
  - name: year
    description: "Tax year (default: 2024)"
    required: false
---

# Estimate Federal Taxes

Quick federal tax liability estimate for planning purposes. Does NOT use MCP server (no tax calculation MCP server implemented) - this is a standalone calculator.

## What This Command Does

This command:
- ✅ Calculates federal tax using 2024 tax brackets
- ✅ Applies standard deduction
- ✅ Shows marginal and effective tax rates
- ✅ Optionally uses data from your current return
- ✅ Provides quick planning estimates

## What This Command Does NOT Do

This command does NOT:
- ❌ Include itemized deductions (uses standard deduction only)
- ❌ Include tax credits
- ❌ Include self-employment tax
- ❌ Include state/local taxes
- ❌ Include alternative minimum tax (AMT)
- ❌ Replace actual tax calculation (for that, use `/prepare-return` and generate PDF)

## Tax Year 2024 Parameters

### Standard Deductions
- **Single**: $14,600
- **Married Filing Jointly**: $29,200
- **Married Filing Separately**: $14,600
- **Head of Household**: $21,900

### Tax Brackets

**Single:**
- 10%: $0 - $11,600
- 12%: $11,601 - $47,150
- 22%: $47,151 - $100,525
- 24%: $100,526 - $191,950
- 32%: $191,951 - $243,725
- 35%: $243,726 - $609,350
- 37%: $609,351+

**Married Filing Jointly:**
- 10%: $0 - $23,200
- 12%: $23,201 - $94,300
- 22%: $94,301 - $201,050
- 24%: $201,051 - $383,900
- 32%: $383,901 - $487,450
- 35%: $487,451 - $731,200
- 37%: $731,201+

**Married Filing Separately:**
- 10%: $0 - $11,600
- 12%: $11,601 - $47,150
- 22%: $47,151 - $100,525
- 24%: $100,526 - $191,950
- 32%: $191,951 - $243,725
- 35%: $243,726 - $365,600
- 37%: $365,601+

**Head of Household:**
- 10%: $0 - $16,550
- 12%: $16,551 - $63,100
- 22%: $63,101 - $100,500
- 24%: $100,501 - $191,950
- 32%: $191,951 - $243,700
- 35%: $243,701 - $609,350
- 37%: $609,351+

## Estimation Workflow

### Option 1: Quick Estimate

```typescript
const income = parseFloat(args.income) || 75000
const filingStatus = args.filingStatus || 'single'
const taxYear = args.year || 2024

// Get standard deduction
const standardDeductions = {
  'single': 14600,
  'mfj': 29200,
  'mfs': 14600,
  'hoh': 21900
}

const standardDeduction = standardDeductions[filingStatus.toLowerCase()]

// Calculate taxable income
const taxableIncome = Math.max(0, income - standardDeduction)

// Apply tax brackets
const brackets = getTaxBrackets(filingStatus)
let totalTax = 0
let remainingIncome = taxableIncome
let taxCalculationDetails = []

for (const bracket of brackets) {
  if (remainingIncome <= 0) break

  const amountInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
  const taxInBracket = amountInBracket * bracket.rate

  totalTax += taxInBracket
  remainingIncome -= amountInBracket

  if (amountInBracket > 0) {
    taxCalculationDetails.push({
      rate: bracket.rate * 100,
      amount: amountInBracket,
      tax: taxInBracket
    })
  }
}

// Calculate rates
const effectiveRate = (totalTax / income * 100).toFixed(2)
const marginalRate = taxCalculationDetails[taxCalculationDetails.length - 1]?.rate || 0

// Display results
console.log('='.repeat(60))
console.log('TAX ESTIMATE FOR 2024')
console.log('='.repeat(60))
console.log()
console.log(`Filing Status: ${getFilingStatusName(filingStatus)}`)
console.log(`Gross Income: $${income.toLocaleString()}`)
console.log()
console.log(`Standard Deduction: $${standardDeduction.toLocaleString()}`)
console.log(`Taxable Income: $${taxableIncome.toLocaleString()}`)
console.log()
console.log('Tax Calculation:')

taxCalculationDetails.forEach(detail => {
  console.log(`  ${detail.rate}% bracket: $${detail.amount.toLocaleString()} × ${detail.rate}% = $${detail.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`)
})

console.log()
console.log(`Total Federal Tax: $${totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`)
console.log()
console.log(`Effective Tax Rate: ${effectiveRate}%`)
console.log(`Marginal Tax Rate: ${marginalRate}%`)
console.log()
console.log(`Estimated Take-Home: $${(income - totalTax).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`)
console.log()
console.log('='.repeat(60))
```

### Option 2: Estimate from Current Return

```typescript
if (args.income === 'from-return') {
  const taxYear = args.year || 2024

  // Export current return state
  const exportPath = `/tmp/tax-state-${taxYear}.json`

  try {
    const exportResult = await mcp.ustaxes_export_state({
      year: taxYear,
      outputPath: exportPath
    })

    if (!exportResult.success) {
      console.log('❌ No tax return found for year', taxYear)
      console.log('Run /prepare-return first, or provide income manually')
      return
    }

    // Load exported state
    const stateData = JSON.parse(await fs.readFile(exportPath, 'utf-8'))

    // Calculate total income from W-2s and 1099s
    let totalIncome = 0

    if (stateData.w2s) {
      totalIncome += stateData.w2s.reduce((sum, w2) => sum + (w2.income || 0), 0)
    }

    if (stateData.f1099s) {
      totalIncome += stateData.f1099s.reduce((sum, f1099) => sum + (f1099.income || 0), 0)
    }

    if (stateData.realEstate) {
      const rentalIncome = stateData.realEstate.reduce((sum, prop) => {
        const rent = prop.rentReceived || 0
        const expenses = Object.values(prop.expenses || {}).reduce((e, val) => e + (val || 0), 0)
        return sum + (rent - expenses)
      }, 0)
      totalIncome += Math.max(0, rentalIncome)
    }

    const filingStatus = stateData.taxPayer?.filingStatus || 'S'
    const filingStatusMap = {
      'S': 'single',
      'MFJ': 'mfj',
      'MFS': 'mfs',
      'HOH': 'hoh',
      'W': 'single' // Widow(er) uses same brackets as MFJ but we'll use single as approximation
    }

    console.log('Using data from your current tax return:')
    console.log(`  Tax Year: ${taxYear}`)
    console.log(`  Filing Status: ${filingStatus}`)
    console.log(`  Total Income: $${totalIncome.toLocaleString()}`)
    console.log()

    // Now run the estimation with this data
    // [calculation code from Option 1 using totalIncome and filingStatusMap[filingStatus]]

  } catch (error) {
    console.log('❌ Error reading tax return:', error.message)
    console.log('Provide income manually instead')
  }
}
```

## Calculation Formula

### Step 1: Taxable Income
```
Taxable Income = Gross Income - Standard Deduction
```

### Step 2: Tax Calculation
Tax is calculated progressively through brackets:

For example, with $75,000 income (Married Filing Jointly):
```
Taxable Income: $75,000 - $29,200 = $45,800

Tax Calculation:
1. First $23,200 at 10% = $2,320
2. Next $22,600 at 12% = $2,712
   Total Tax = $5,032
```

### Step 3: Rates
```
Effective Rate = (Total Tax ÷ Gross Income) × 100
Marginal Rate = Highest Bracket Reached
```

## Example Estimates

### Example 1: Single Filer, $60,000

```
TAX ESTIMATE FOR 2024
============================================================

Filing Status: Single
Gross Income: $60,000

Standard Deduction: $14,600
Taxable Income: $45,400

Tax Calculation:
  10% bracket: $11,600 × 10% = $1,160.00
  12% bracket: $33,800 × 12% = $4,056.00

Total Federal Tax: $5,216.00

Effective Tax Rate: 8.69%
Marginal Tax Rate: 12%

Estimated Take-Home: $54,784.00
```

### Example 2: Married Filing Jointly, $150,000

```
TAX ESTIMATE FOR 2024
============================================================

Filing Status: Married Filing Jointly
Gross Income: $150,000

Standard Deduction: $29,200
Taxable Income: $120,800

Tax Calculation:
  10% bracket: $23,200 × 10% = $2,320.00
  12% bracket: $71,100 × 12% = $8,532.00
  22% bracket: $26,500 × 22% = $5,830.00

Total Federal Tax: $16,682.00

Effective Tax Rate: 11.12%
Marginal Tax Rate: 22%

Estimated Take-Home: $133,318.00
```

## Comparing Estimate vs Actual

After preparing your return, compare:

```bash
# Quick estimate
/estimate-taxes 75000 mfj

# Then prepare actual return
/prepare-return 2024

# Then validate (which generates PDF with actual tax calculation)
/validate-return 2024
```

The estimate will differ from actual tax because it doesn't include:
- Above-the-line deductions (IRA, HSA, student loan interest)
- Itemized deductions
- Tax credits (child tax credit, etc.)
- Other adjustments

## Use Cases

**Salary Negotiation:**
```bash
/estimate-taxes 100000 single   # Current salary
/estimate-taxes 120000 single   # Proposed salary
# Compare take-home pay
```

**Retirement Planning:**
```bash
/estimate-taxes 85000 mfj       # Before IRA contribution
/estimate-taxes 78000 mfj       # After $7,000 IRA contribution
# See tax savings
```

**Filing Status Decision:**
```bash
/estimate-taxes 100000 mfj      # Married filing jointly
/estimate-taxes 50000 mfs       # Married filing separately (each spouse)
# Compare which is better
```

## Limitations

This is a **simplified estimate** that:
- ✅ Good for: Quick planning, salary comparisons, rough estimates
- ❌ Not for: Actual filing, complex tax situations, precise calculations

**Does NOT include:**
- Itemized deductions
- Above-the-line deductions
- Tax credits
- Self-employment tax
- Capital gains calculations
- Alternative minimum tax (AMT)
- State and local taxes
- Medicare surtax on high earners
- Net investment income tax

**For accurate calculations:** Use `/prepare-return` and generate actual tax forms.

## Error Handling

**Invalid Income:**
```
❌ Income must be a positive number

Example: /estimate-taxes 75000 mfj
```

**Invalid Filing Status:**
```
❌ Filing status must be one of: single, mfj, mfs, hoh

Example: /estimate-taxes 75000 mfj
```

**Return Not Found:**
```
❌ No tax return found for year 2024

Run /prepare-return first, or provide income manually:
  /estimate-taxes 75000 single
```

## Example Usage

```bash
# Basic estimate
/estimate-taxes 75000 single

# Married filing jointly
/estimate-taxes 150000 mfj

# Head of household
/estimate-taxes 95000 hoh

# Use current return data
/estimate-taxes from-return

# Specify year
/estimate-taxes 75000 single 2024
```

## Next Steps

After getting estimate:
1. **For actual filing**: Run `/prepare-return` to create complete return
2. **For optimization**: Run `/optimize-deductions` to find savings
3. **For validation**: Run `/validate-return` to check for errors

---

**Important:** This is a simplified planning tool. It does NOT replace actual tax calculation. Always use the complete tax return workflow (`/prepare-return` + `/validate-return`) for filing.

---

*This command is a standalone calculator and does not use the UsTaxes MCP Server. For accurate tax calculations with all deductions and credits, use `/prepare-return` to create your complete return.*
