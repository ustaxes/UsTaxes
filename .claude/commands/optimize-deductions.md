---
name: optimize-deductions
description: "Identify legitimate deduction opportunities and tax-saving strategies"
args:
  - name: year
    description: "Tax year to optimize (default: 2024)"
    required: false
  - name: focus
    description: "Focus area: itemized, retirement, credits, all (default: all)"
    required: false
---

# Optimize Deductions

Find legitimate deduction opportunities and tax-saving strategies by analyzing your tax return.

## What This Command Does

This command:
- ✅ Exports your current return data using `ustaxes_export_state`
- ✅ Analyzes missed deduction opportunities
- ✅ Compares itemized vs standard deduction
- ✅ Identifies retirement contribution opportunities
- ✅ Finds potential tax credits
- ✅ Calculates potential tax savings
- ✅ Provides actionable recommendations

## What This Command Does NOT Do

This command does NOT:
- ❌ Use a separate deduction-optimizer MCP server (not implemented)
- ❌ Automatically apply optimizations (you must update return manually)
- ❌ Guarantee all recommendations are applicable to your situation
- ❌ Replace professional tax advice for complex situations

## MCP Tools Used

- `ustaxes_export_state` - Export current return for analysis

## Optimization Workflow

### Phase 1: Export and Analyze Return Data

```typescript
const taxYear = args.year ?? 2024
const focus = args.focus ?? 'all'

console.log(`Analyzing ${taxYear} return for optimization opportunities...`)
console.log(`Focus area: ${focus}\n`)

// Export current return state
const exportPath = `/tmp/tax-state-${taxYear}.json`

try {
  const exportResult = await mcp.ustaxes_export_state({
    year: taxYear,
    outputPath: exportPath
  })

  if (!exportResult.success) {
    console.log('❌ No tax return found for year', taxYear)
    console.log('Run /prepare-return first to create a return to optimize')
    return
  }

  console.log(`✓ Exported tax state to ${exportPath}`)

  // Load exported state for analysis
  const stateData = JSON.parse(await fs.readFile(exportPath, 'utf-8'))

  console.log('\n' + '='.repeat(60))
  console.log('TAX OPTIMIZATION ANALYSIS')
  console.log('='.repeat(60))
  console.log()

} catch (error) {
  console.log('❌ Error exporting return:', error.message)
  return
}
```

### Phase 2: Calculate Current Tax Position

```typescript
// Calculate total income
let totalIncome = 0

if (stateData.w2s) {
  totalIncome += stateData.w2s.reduce((sum, w2) => sum + (w2.income || 0), 0)
}

if (stateData.f1099s) {
  totalIncome += stateData.f1099s.reduce((sum, f1099) => sum + (f1099.income || 0), 0)
}

// Calculate above-the-line deductions
let aboveTheLine = 0

if (stateData.healthSavingsAccounts) {
  const hsaDeduction = stateData.healthSavingsAccounts.reduce((sum, hsa) => {
    return sum + (hsa.totalContributions || 0) - (hsa.employerContributions || 0)
  }, 0)
  aboveTheLine += hsaDeduction
}

if (stateData.individualRetirementArrangements) {
  const iraDeduction = stateData.individualRetirementArrangements.reduce((sum, ira) => {
    return sum + (ira.contribution || 0)
  }, 0)
  aboveTheLine += iraDeduction
}

if (stateData.f1098es) {
  const studentLoan = stateData.f1098es.reduce((sum, f1098e) => {
    return sum + Math.min(f1098e.interest || 0, 2500) // Cap at $2,500
  }, 0)
  aboveTheLine += studentLoan
}

const agi = totalIncome - aboveTheLine

// Get filing status for calculations
const filingStatus = stateData.taxPayer?.filingStatus || 'S'
const standardDeductions = {
  'S': 14600,
  'MFJ': 29200,
  'MFS': 14600,
  'HOH': 21900,
  'W': 29200
}

const standardDeduction = standardDeductions[filingStatus]

// Calculate itemized deductions
let itemizedTotal = 0
const itemized = stateData.itemizedDeductions || {}

if (itemized.medicalAndDental) itemizedTotal += itemized.medicalAndDental
if (itemized.stateAndLocalTaxes) itemizedTotal += Math.min(itemized.stateAndLocalTaxes, 10000)
if (itemized.mortgageInterest) itemizedTotal += itemized.mortgageInterest
if (itemized.charitableCash) itemizedTotal += itemized.charitableCash
if (itemized.charitableNonCash) itemizedTotal += itemized.charitableNonCash

const usingItemized = itemizedTotal > standardDeduction

console.log('## Current Tax Position')
console.log()
console.log(`Filing Status: ${getFilingStatusName(filingStatus)}`)
console.log(`Total Income: $${totalIncome.toLocaleString()}`)
console.log(`Above-the-Line Deductions: $${aboveTheLine.toLocaleString()}`)
console.log(`Adjusted Gross Income (AGI): $${agi.toLocaleString()}`)
console.log()
console.log(`Standard Deduction: $${standardDeduction.toLocaleString()}`)
console.log(`Itemized Deductions: $${itemizedTotal.toLocaleString()}`)
console.log(`Using: ${usingItemized ? 'Itemized ✓' : 'Standard ✓'}`)
console.log()
```

### Phase 3: Analyze Retirement Contributions

```typescript
if (focus === 'all' || focus === 'retirement') {
  console.log('## Retirement Contribution Opportunities')
  console.log()

  // Check Traditional IRA
  const currentIRA = stateData.individualRetirementArrangements?.reduce((sum, ira) => {
    return sum + (ira.contribution || 0)
  }, 0) || 0

  const iraLimit = 7000 // 2024 limit (under 50)
  const iraOpportunity = iraLimit - currentIRA

  if (iraOpportunity > 0) {
    const savings = iraOpportunity * 0.22 // Assume 22% bracket

    console.log('### Traditional IRA ⭐ HIGH PRIORITY')
    console.log()
    console.log(`Current contribution: $${currentIRA.toLocaleString()}`)
    console.log(`2024 limit: $${iraLimit.toLocaleString()}`)
    console.log(`Additional available: $${iraOpportunity.toLocaleString()}`)
    console.log()
    console.log(`Tax Savings: ~$${savings.toLocaleString()} (assumes 22% bracket)`)
    console.log()
    console.log('**How to contribute:**')
    console.log('1. Open Traditional IRA if needed (Vanguard, Fidelity, Schwab)')
    console.log('2. Contribute before April 15, 2025')
    console.log('3. Update return using /prepare-return')
    console.log()
  } else {
    console.log('### Traditional IRA ✓ MAXIMIZED')
    console.log()
    console.log(`Current contribution: $${currentIRA.toLocaleString()} (at limit)`)
    console.log()
  }

  // Check HSA
  const currentHSA = stateData.healthSavingsAccounts?.reduce((sum, hsa) => {
    return sum + (hsa.totalContributions || 0) - (hsa.employerContributions || 0)
  }, 0) || 0

  const hsaLimit = 8300 // Family limit 2024
  const hsaOpportunity = hsaLimit - currentHSA

  if (currentHSA === 0) {
    console.log('### Health Savings Account (HSA)')
    console.log()
    console.log('**Not currently using HSA**')
    console.log()
    console.log('If you have a High-Deductible Health Plan (HDHP):')
    console.log(`- Family limit: $${hsaLimit.toLocaleString()}`)
    console.log(`- Individual limit: $4,150`)
    console.log(`- Tax savings: ~$1,826 (family) or ~$913 (individual) at 22% bracket`)
    console.log()
    console.log('**Benefits:**')
    console.log('- Triple tax advantage (deductible, tax-free growth, tax-free withdrawals)')
    console.log('- Rolls over year-to-year')
    console.log('- Can invest for long-term growth')
    console.log()
  } else if (hsaOpportunity > 0) {
    const savings = hsaOpportunity * 0.22

    console.log('### Health Savings Account (HSA) ⭐ HIGH PRIORITY')
    console.log()
    console.log(`Current contribution: $${currentHSA.toLocaleString()}`)
    console.log(`Family limit: $${hsaLimit.toLocaleString()}`)
    console.log(`Additional available: $${hsaOpportunity.toLocaleString()}`)
    console.log()
    console.log(`Tax Savings: ~$${savings.toLocaleString()} (assumes 22% bracket)`)
    console.log()
    console.log('**How to contribute:**')
    console.log('1. Contact your HSA provider')
    console.log('2. Make additional contribution before April 15, 2025')
    console.log('3. Update return using /prepare-return')
    console.log()
  } else {
    console.log('### HSA ✓ MAXIMIZED')
    console.log()
    console.log(`Current contribution: $${currentHSA.toLocaleString()} (at limit)`)
    console.log()
  }

  console.log('---')
  console.log()
}
```

### Phase 4: Analyze Itemized Deductions

```typescript
if (focus === 'all' || focus === 'itemized') {
  console.log('## Itemized Deduction Analysis')
  console.log()

  if (usingItemized) {
    const marginOver Standard = itemizedTotal - standardDeduction

    console.log(`Current itemized: $${itemizedTotal.toLocaleString()}`)
    console.log(`Standard deduction: $${standardDeduction.toLocaleString()}`)
    console.log(`Margin: $${marginOverStandard.toLocaleString()}`)
    console.log()

    if (marginOverStandard < 3000) {
      console.log('### Bunching Strategy 💡 RECOMMENDED')
      console.log()
      console.log('**Your itemized deductions barely exceed the standard deduction.**')
      console.log()
      console.log('**Strategy:** Bunch deductions every other year:')
      console.log('- Year 1: Bunch 2 years of deductions (itemize)')
      console.log('- Year 2: Take standard deduction')
      console.log()
      console.log('**Example tactics:**')
      console.log('- Prepay January mortgage payment in December')
      console.log('- Double up charitable donations in one year')
      console.log('- Schedule elective medical procedures in one year')
      console.log('- Prepay property taxes (if allowed by state)')
      console.log()
      console.log('**Estimated savings: $500-$2,000 over 2 years**')
      console.log()
    }

    // SALT analysis
    if (itemized.stateAndLocalTaxes) {
      const saltCurrent = itemized.stateAndLocalTaxes

      console.log('### State and Local Taxes (SALT)')
      console.log()
      console.log(`Current SALT: $${saltCurrent.toLocaleString()}`)

      if (saltCurrent >= 10000) {
        console.log(`SALT cap: $10,000 (you're at the cap)`)
        console.log()
        console.log('**No optimization available** - federal cap limits deduction')
      } else {
        console.log(`SALT cap: $10,000 (you have room)`)
      }
      console.log()
    }

    // Charitable analysis
    const totalCharity = (itemized.charitableCash || 0) + (itemized.charitableNonCash || 0)

    if (totalCharity > 0) {
      console.log('### Charitable Contributions')
      console.log()
      console.log(`Current donations: $${totalCharity.toLocaleString()}`)
      console.log()
      console.log('**Optimization: Donate Appreciated Stock**')
      console.log('Instead of cash:')
      console.log('- Donate stock that has increased in value')
      console.log('- Deduct full market value')
      console.log('- Avoid capital gains tax on appreciation')
      console.log('- **Tax savings: 15-20% on the appreciation**')
      console.log()
      console.log('**Example:**')
      console.log('- Stock cost: $2,000, worth: $5,000')
      console.log('- Cash donation: $5,000 deduction')
      console.log('- Stock donation: $5,000 deduction + avoid $450 capital gains tax')
      console.log('- **Extra savings: $450**')
      console.log()
    }

  } else {
    console.log('**Currently using standard deduction**')
    console.log()
    console.log(`Standard: $${standardDeduction.toLocaleString()}`)
    console.log(`Your itemized: $${itemizedTotal.toLocaleString()}`)
    console.log()
    console.log('To benefit from itemizing, you need additional:')
    console.log(`$${(standardDeduction - itemizedTotal + 1).toLocaleString()} in deductions`)
    console.log()
  }

  console.log('---')
  console.log()
}
```

### Phase 5: Analyze Tax Credits

```typescript
if (focus === 'all' || focus === 'credits') {
  console.log('## Tax Credit Opportunities')
  console.log()

  // Child tax credit
  const dependents = stateData.taxPayer?.dependents || []
  const qualifyingChildren = dependents.filter(dep => {
    const age = taxYear - (dep.birthYear || taxYear)
    return age < 17
  })

  if (qualifyingChildren.length > 0) {
    console.log('### Child Tax Credit ✓ AVAILABLE')
    console.log()
    console.log(`Qualifying children: ${qualifyingChildren.length}`)
    console.log(`Credit: $${(qualifyingChildren.length * 2000).toLocaleString()}`)
    console.log()
    console.log('**Status:** Should be automatically calculated in return')
    console.log()
  }

  // Child care credit
  console.log('### Child and Dependent Care Credit 💡 CHECK ELIGIBILITY')
  console.log()

  if (qualifyingChildren.length > 0 || dependents.length > 0) {
    console.log('**Do you pay for childcare to enable you to work?**')
    console.log()
    console.log('If yes:')
    console.log('- Maximum credit: $600-$1,050 (depending on AGI)')
    console.log('- Eligible expenses: Daycare, after-school care, summer camp')
    console.log('- Required: Provider name and Tax ID')
    console.log()
    console.log('**To claim:** Update return with childcare expenses using /prepare-return')
    console.log()
  }

  // Education credits
  console.log('### Education Credits 💡 CHECK ELIGIBILITY')
  console.log()
  console.log('**Did you or your spouse attend college in 2024?**')
  console.log()
  console.log('**American Opportunity Credit (AOTC):**')
  console.log('- Up to $2,500 per student')
  console.log('- First 4 years of college only')
  console.log('- Phase-out: $160K-$180K AGI (MFJ)')
  console.log()
  console.log('**Lifetime Learning Credit:**')
  console.log('- Up to $2,000 per return')
  console.log('- Any post-secondary education')
  console.log('- Phase-out: $160K-$180K AGI (MFJ)')
  console.log()

  if (agi > 180000) {
    console.log('⚠️  Your AGI ($' + agi.toLocaleString() + ') may be above phase-out range')
    console.log('   Consider IRA/HSA contributions to lower AGI')
  }

  console.log()

  // Energy credits
  console.log('### Energy Efficiency Credits 💡 CHECK ELIGIBILITY')
  console.log()
  console.log('**Did you install energy-efficient improvements in 2024?**')
  console.log()
  console.log('**Eligible improvements:**')
  console.log('- Heat pumps, insulation, windows, doors (up to $2,000 credit)')
  console.log('- Solar panels, solar water heaters (30% of cost, no cap)')
  console.log('- Battery storage, geothermal (30% of cost)')
  console.log()
  console.log('**Example savings:**')
  console.log('- $10,000 heat pump → $2,000 credit')
  console.log('- $25,000 solar panels → $7,500 credit')
  console.log()
  console.log('**To claim:** Gather receipts and manufacturer certifications')
  console.log()

  console.log('---')
  console.log()
}
```

### Phase 6: Summary and Recommendations

```typescript
console.log('## Summary & Action Plan')
console.log()

const opportunities = []
let totalSavings = 0

// Add identified opportunities
if (iraOpportunity > 0) {
  const savings = iraOpportunity * 0.22
  opportunities.push({
    priority: 1,
    name: 'Traditional IRA contribution',
    amount: iraOpportunity,
    savings: savings,
    deadline: 'April 15, 2025'
  })
  totalSavings += savings
}

if (hsaOpportunity > 0) {
  const savings = hsaOpportunity * 0.22
  opportunities.push({
    priority: 1,
    name: 'Additional HSA contribution',
    amount: hsaOpportunity,
    savings: savings,
    deadline: 'April 15, 2025'
  })
  totalSavings += savings
}

if (usingItemized && (itemizedTotal - standardDeduction) < 3000) {
  opportunities.push({
    priority: 2,
    name: 'Bunching strategy',
    amount: null,
    savings: 1000, // Estimate
    deadline: 'Year-end planning'
  })
}

// Display opportunities
if (opportunities.length > 0) {
  console.log('### Priority Actions')
  console.log()

  opportunities.sort((a, b) => a.priority - b.priority).forEach((opp, idx) => {
    console.log(`${idx + 1}. **${opp.name}**`)
    if (opp.amount) {
      console.log(`   Amount: $${opp.amount.toLocaleString()}`)
    }
    console.log(`   Est. savings: ~$${opp.savings.toLocaleString()}`)
    console.log(`   Deadline: ${opp.deadline}`)
    console.log()
  })

  console.log(`**Total Estimated Savings: ~$${totalSavings.toLocaleString()}**`)
  console.log()
} else {
  console.log('✓ Your return appears well-optimized!')
  console.log('No major optimization opportunities found.')
  console.log()
}

console.log('### Next Steps')
console.log()
console.log('1. Review opportunities above')
console.log('2. Make contributions before April 15, 2025')
console.log('3. Run /prepare-return to update return with contributions')
console.log('4. Run /validate-return to verify changes')
console.log()

console.log('---')
console.log()

console.log('## Disclaimers')
console.log()
console.log('- Tax savings estimates assume 22% marginal tax bracket')
console.log('- Actual savings depend on your complete tax situation')
console.log('- IRA contributions require earned income')
console.log('- HSA contributions require HDHP coverage')
console.log('- Credits require documentation and eligibility verification')
console.log('- This is optimization guidance, not professional tax advice')
console.log()

console.log('='.repeat(60))
console.log('OPTIMIZATION ANALYSIS COMPLETE')
console.log('='.repeat(60))
```

## Example Output

```
===========================================================
TAX OPTIMIZATION ANALYSIS
============================================================

## Current Tax Position

Filing Status: Married Filing Jointly
Total Income: $187,500
Above-the-Line Deductions: $1,200
Adjusted Gross Income (AGI): $186,300

Standard Deduction: $29,200
Itemized Deductions: $30,000
Using: Itemized ✓

## Retirement Contribution Opportunities

### Traditional IRA ⭐ HIGH PRIORITY

Current contribution: $0
2024 limit: $7,000
Additional available: $7,000

Tax Savings: ~$1,540 (assumes 22% bracket)

**How to contribute:**
1. Open Traditional IRA if needed (Vanguard, Fidelity, Schwab)
2. Contribute before April 15, 2025
3. Update return using /prepare-return

### Health Savings Account (HSA) ⭐ HIGH PRIORITY

Current contribution: $2,000
Family limit: $8,300
Additional available: $6,300

Tax Savings: ~$1,386 (assumes 22% bracket)

**How to contribute:**
1. Contact your HSA provider
2. Make additional contribution before April 15, 2025
3. Update return using /prepare-return

---

## Summary & Action Plan

### Priority Actions

1. **Traditional IRA contribution**
   Amount: $7,000
   Est. savings: ~$1,540
   Deadline: April 15, 2025

2. **Additional HSA contribution**
   Amount: $6,300
   Est. savings: ~$1,386
   Deadline: April 15, 2025

**Total Estimated Savings: ~$2,926**

### Next Steps

1. Review opportunities above
2. Make contributions before April 15, 2025
3. Run /prepare-return to update return with contributions
4. Run /validate-return to verify changes

============================================================
OPTIMIZATION ANALYSIS COMPLETE
============================================================
```

## Error Handling

**No Return Found:**
```
❌ No tax return found for year 2024

Run /prepare-return first to create a return to optimize
```

**Export Failed:**
```
❌ Error exporting return: [error message]

This may occur if:
- Return data is corrupted
- Year is invalid
- MCP server is not available

Solution: Try /prepare-return to rebuild return data
```

## Focus Areas

Use `--focus` to analyze specific categories:

**Retirement:**
```bash
/optimize-deductions --focus=retirement
```
Shows only IRA and HSA opportunities

**Itemized:**
```bash
/optimize-deductions --focus=itemized
```
Shows only itemized deduction analysis

**Credits:**
```bash
/optimize-deductions --focus=credits
```
Shows only tax credit opportunities

**All (default):**
```bash
/optimize-deductions
```
Comprehensive analysis of all categories

## Best Practices

1. **Run before filing** - Find opportunities before submission deadline
2. **Implement high-priority items first** - IRA/HSA have largest impact
3. **Verify eligibility** - Not all opportunities apply to everyone
4. **Keep documentation** - Required for all claimed deductions/credits
5. **Consult professional for complex situations** - Self-employment, investments, etc.

## Limitations

This optimization analysis:
- ✅ **Can** identify common missed opportunities
- ✅ **Can** calculate estimated tax savings
- ✅ **Can** provide implementation guidance
- ❌ **Cannot** guarantee all recommendations apply to your situation
- ❌ **Cannot** account for all edge cases and special situations
- ❌ **Cannot** replace professional tax advice for complex returns

**Estimates are based on standard assumptions** (22% bracket, full eligibility, etc.)
**Always verify eligibility and actual savings before implementing**

## Example Usage

```bash
# Full optimization analysis
/optimize-deductions

# Optimize specific year
/optimize-deductions 2023

# Focus on retirement
/optimize-deductions 2024 retirement

# Focus on credits
/optimize-deductions 2024 credits
```

## After Optimization

Once you've identified opportunities:
1. **Make contributions/changes** - IRA, HSA, etc.
2. **Update return** - Run `/prepare-return` with new data
3. **Validate** - Run `/validate-return` to verify
4. **File** - Generate PDFs and submit

---

**Important:** This analysis uses `ustaxes_export_state` to get your return data and provides optimization recommendations based on standard tax strategies. It does NOT use a separate deduction-optimizer MCP server. Recommendations are analytical guidance, not guaranteed savings.

---

*This command uses the real UsTaxes MCP Server's `ustaxes_export_state` tool to analyze return data. Optimization recommendations are provided by Claude based on standard tax planning strategies.*
