---
description: Estimate federal tax liability
argument-hint: [income] [filing-status]
model: haiku
---

Calculate estimated federal tax liability for $1 income with $2 filing status.

## Tax Year 2024 Parameters

Use the following 2024 tax brackets and standard deductions:

### Standard Deductions (2024)
- Single: $14,600
- Married Filing Jointly: $29,200
- Married Filing Separately: $14,600
- Head of Household: $21,900

### Tax Brackets (2024)

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

## Calculation Steps

1. **Determine Standard Deduction**
   - Use filing status to get standard deduction amount

2. **Calculate Taxable Income**
   ```
   Taxable Income = Gross Income - Standard Deduction
   ```

3. **Apply Tax Brackets**
   - Calculate tax using progressive bracket system
   - Each bracket is taxed at its rate, not all income at marginal rate

4. **Calculate Effective vs Marginal Rate**
   ```
   Effective Rate = Total Tax / Gross Income
   Marginal Rate = Highest bracket reached
   ```

## Output Format

Provide a clear summary:

```
Tax Estimate for 2024
=====================

Filing Status: [status]
Gross Income: $[amount]

Standard Deduction: $[deduction]
Taxable Income: $[taxable]

Tax Calculation:
- 10% bracket: $[amount] × 10% = $[tax]
- 12% bracket: $[amount] × 12% = $[tax]
[continue for each applicable bracket]

Total Federal Tax: $[total]

Effective Tax Rate: [percentage]%
Marginal Tax Rate: [percentage]%

Estimated Take-Home: $[income - tax]
```

## Assumptions

This estimate assumes:
- No itemized deductions (using standard deduction)
- No above-the-line deductions
- No tax credits
- No self-employment tax
- No alternative minimum tax
- No state/local taxes

## Important Notes

- This is a simplified estimate for planning purposes
- Actual tax liability may differ based on deductions, credits, and other factors
- Does not include state or local taxes
- Should not be used for actual tax filing
- Consult a tax professional for accurate calculations

## Example

For $75,000 income, Married Filing Jointly:

```
Tax Estimate for 2024
=====================

Filing Status: Married Filing Jointly
Gross Income: $75,000

Standard Deduction: $29,200
Taxable Income: $45,800

Tax Calculation:
- 10% bracket: $23,200 × 10% = $2,320
- 12% bracket: $22,600 × 12% = $2,712

Total Federal Tax: $5,032

Effective Tax Rate: 6.7%
Marginal Tax Rate: 12%

Estimated Take-Home: $69,968
```
