---
name: tax-liability-calculator
description: Calculate federal income tax liability using current tax brackets and rules. Automatically invoked when calculating taxes, estimating liability, or when income information is provided.
---

# Tax Liability Calculator

Automatically calculate federal income tax when sufficient information is available.

## Automatic Activation
Invoke when:
- User asks "what's my tax liability?"
- Income information is complete in state
- User asks for tax estimate
- Generating tax forms
- Reviewing completed data entry

## Calculation Process

### 1. Gather Required Information
- Filing Status (Single, MFJ, MFS, HOH, QW)
- Total Income (W-2s, 1099s, business income, etc.)
- Above-the-line deductions (IRA, HSA, student loan interest, etc.)
- Itemized deductions OR standard deduction
- Tax credits (child tax credit, EITC, education, etc.)
- Withholding and estimated payments

### 2. Calculate Adjusted Gross Income (AGI)
```
AGI = Total Income - Above-the-line Deductions

Above-the-line deductions include:
- Traditional IRA contributions
- HSA contributions
- Student loan interest (up to $2,500)
- Self-employment tax (50%)
- Self-employed health insurance
- Educator expenses ($300)
```

### 3. Calculate Taxable Income
```
Taxable Income = AGI - Greater of (Standard Deduction OR Itemized Deductions)
```

**Standard Deductions (2024):**
- Single: $14,600
- Married Filing Jointly: $29,200
- Married Filing Separately: $14,600
- Head of Household: $21,900
- Qualifying Widow(er): $29,200

**Additional Standard Deduction (Age 65+/Blind):**
- Single/HOH: +$1,950 per person
- MFJ/MFS/QW: +$1,550 per person

### 4. Apply Tax Brackets (2024)

Calculate ordinary income tax using progressive brackets (reference `tax-brackets-2024.json`):

**Example for Single filer with $100,000 taxable income:**
```
$11,600 × 10% = $1,160
$35,550 × 12% = $4,266
$53,375 × 22% = $11,743
$0 × 24% = $0
---
Total Ordinary Tax = $17,169
```

### 5. Add Qualified Dividends and Long-Term Capital Gains Tax

If applicable, use preferential rates:
- 0% rate: Below threshold
- 15% rate: Middle income
- 20% rate: High income

**2024 Thresholds (15% bracket starts):**
- Single: $47,026
- MFJ: $94,051
- MFS: $47,026
- HOH: $63,001

### 6. Add Additional Taxes

**Self-Employment Tax (Schedule SE):**
```
SE Tax = (Net SE Income × 92.35%) × 15.3%
(Subject to Social Security wage base: $168,600 for 2024)
```

**Net Investment Income Tax (NIIT) - Form 8960:**
```
IF Modified AGI > Threshold THEN:
  NIIT = Min(Net Investment Income, MAGI - Threshold) × 3.8%

Thresholds:
- Single/HOH: $200,000
- MFJ: $250,000
- MFS: $125,000
```

**Additional Medicare Tax - Form 8959:**
```
IF Wages/SE Income > Threshold THEN:
  Additional Medicare = Excess × 0.9%

Thresholds:
- Single/HOH: $200,000
- MFJ: $250,000
- MFS: $125,000
```

**Alternative Minimum Tax (AMT) - Form 6251:**
(Complex calculation - may need separate analysis)

### 7. Subtract Tax Credits

**Nonrefundable Credits:**
- Child Tax Credit ($2,000 per child under 17)
- Child and Dependent Care Credit
- Education Credits (American Opportunity, Lifetime Learning)
- Saver's Credit
- Residential Energy Credits
- Foreign Tax Credit

**Refundable Credits:**
- Additional Child Tax Credit
- Earned Income Credit
- American Opportunity Credit (partially refundable)
- Premium Tax Credit

### 8. Calculate Refund or Amount Owed

```
Total Tax After Credits = Ordinary Tax + Additional Taxes - Credits
Amount Owed/Refund = (Withholding + Estimated Payments) - Total Tax After Credits

If positive: Refund
If negative: Amount Owed
```

## Output Format

```json
{
  "filingStatus": "MFJ",
  "taxYear": 2024,
  "incomeBreakdown": {
    "w2Wages": 120000,
    "businessIncome": 0,
    "interestIncome": 450,
    "dividendIncome": 3250,
    "qualifiedDividends": 2800,
    "capitalGains": {
      "shortTerm": 3000,
      "longTerm": 7000
    },
    "totalIncome": 133700
  },
  "adjustments": {
    "iraContribution": 7000,
    "hsaContribution": 4150,
    "studentLoanInterest": 2500,
    "total": 13650
  },
  "agi": 120050,
  "deduction": {
    "type": "standard",
    "amount": 29200
  },
  "taxableIncome": 90850,
  "taxCalculation": {
    "ordinaryTax": 10793,
    "qualifiedDividendsTax": 420,
    "longTermCapitalGainsTax": 1050,
    "selfEmploymentTax": 0,
    "niit": 0,
    "additionalMedicare": 0,
    "amt": 0,
    "totalTaxBeforeCredits": 12263
  },
  "credits": {
    "childTaxCredit": 4000,
    "otherCredits": 0,
    "totalCredits": 4000
  },
  "taxAfterCredits": 8263,
  "payments": {
    "withholding": 10000,
    "estimatedPayments": 0,
    "totalPayments": 10000
  },
  "refundOrOwed": {
    "amount": 1737,
    "type": "refund"
  },
  "effectiveRate": 6.9,
  "marginalRate": 12
}
```

## Simplified Output for User

```
Tax Liability Calculation for 2024
==================================

Filing Status: Married Filing Jointly
Adjusted Gross Income: $120,050

Deduction: Standard ($29,200)
Taxable Income: $90,850

Tax Breakdown:
- Ordinary Income Tax: $10,793
- Qualified Dividends Tax: $420
- Long-Term Capital Gains Tax: $1,050
---
Total Tax Before Credits: $12,263

Tax Credits:
- Child Tax Credit: $4,000
---
Tax After Credits: $8,263

Payments:
- Federal Withholding: $10,000
---
Estimated Refund: $1,737

Effective Tax Rate: 6.9%
Marginal Tax Rate: 12%
```

## Integration with UsTaxes

This skill should:
1. Read Redux state to get all income and deduction data
2. Use existing form calculation logic where possible
3. Cross-reference with F1040 class calculations
4. Validate against actual form generation

Reference:
- `/src/forms/Y2024/irsForms/F1040.ts` - Main calculation logic
- `/src/forms/Y2024/irsForms/TaxTable.ts` - Bracket calculations
- `/src/forms/Y2024/irsForms/worksheets/` - Supporting calculations

## Accuracy Notes

- Uses UsTaxes existing calculation engine when possible
- Cross-validates against IRS tax tables
- Flags when AMT calculation needed
- Warns about state/local tax implications
- Notes that this is federal only

## When to Invoke

**DO invoke when:**
- User completes income entry
- User asks "what do I owe?"
- Reviewing entered data
- Before form generation

**DON'T invoke when:**
- Incomplete data (missing filing status, major income sources)
- User is still entering data
- Complex situations requiring deeper analysis

## Error Handling

If calculation impossible:
```
"I need more information to calculate your tax liability:
- Missing: Filing status
- Missing: W-2 income data
- Recommendation: Complete income section first"
```

If calculation uncertain:
```
"Based on the information provided, your estimated tax is $X,XXX.
However, the following may affect this:
- Alternative Minimum Tax (requires analysis)
- State taxes (not included)
- Additional credits you may qualify for"
```

## Next Steps After Calculation

1. Present summary to user
2. Highlight any unusual items
3. Suggest optimization opportunities
4. Offer to generate complete return
5. Recommend /validate-return for detailed audit
