---
name: deduction-optimizer
description: Identify legitimate deduction opportunities and tax optimization strategies. Automatically suggests when analyzing returns or gathering information.
---

# Deduction Optimizer

Automatically identify deduction opportunities during tax preparation.

## Automatic Activation
Invoke when:
- Reviewing expenses
- Comparing itemized vs standard deduction
- Analyzing business expenses
- Processing rental property
- Reviewing investment activity
- User completes major data entry
- Before final form generation

## Optimization Strategies

### 1. Itemized vs Standard Deduction Analysis

**Always Calculate Both:**
```
Standard Deduction (2024):
- Single: $14,600
- MFJ: $29,200
- MFS: $14,600
- HOH: $21,900

Itemized Deductions:
+ Medical expenses (over 7.5% AGI)
+ State/local taxes (SALT, capped at $10,000)
+ Mortgage interest
+ Charitable contributions
+ Casualty losses (federally declared disasters)
= Total Itemized

Recommendation: Use whichever is greater
```

**Bunching Strategy:**
If close to threshold, consider bunching deductions:
- Prepay property taxes
- Accelerate charitable giving
- Bunch medical procedures

### 2. Above-the-Line Deductions

**Always beneficial (reduce AGI):**

- **Traditional IRA:** Up to $7,000 ($8,000 if age 50+)
  - Phases out at higher income
  - Can contribute until April 15

- **HSA:** Up to $4,150 (self) / $8,300 (family)
  - Plus $1,000 catch-up if age 55+
  - Triple tax advantage

- **Student Loan Interest:** Up to $2,500
  - Phases out: $80K-$95K (single), $165K-$195K (MFJ)

- **Self-Employment Tax:** 50% deductible
  - Automatically calculated

- **Self-Employed Health Insurance:** 100% deductible
  - If not eligible for employer plan

- **Educator Expenses:** Up to $300
  - For K-12 teachers

### 3. Business Deductions (Schedule C)

**Home Office:**
- Simplified: $5/sq ft (max 300 sq ft = $1,500)
- Regular: Actual expenses × business %
- Must be regular and exclusive use

**Vehicle Expenses:**
- Standard mileage: 67¢/mile (2024)
- Actual expenses: Gas, repairs, depreciation
- Keep mileage log

**Supplies & Equipment:**
- Section 179: Up to $1,220,000 immediate expensing
- Bonus depreciation: Additional first-year deduction
- Regular depreciation: Spread over years

**Common Deductions:**
- Advertising and marketing
- Bank fees and credit card processing
- Business insurance
- Contract labor
- Legal and professional services
- Office supplies
- Rent or lease
- Repairs and maintenance
- Software and subscriptions
- Telephone and internet (business portion)
- Travel (excluding commuting)
- Meals (50% deductible)

### 4. Rental Property (Schedule E)

**Operating Expenses:**
- Mortgage interest
- Property taxes
- Insurance
- Repairs and maintenance
- Management fees
- Utilities
- HOA fees
- Advertising for tenants
- Legal and professional fees

**Depreciation:**
- Residential: 27.5 years
- Commercial: 39 years
- Must depreciate even if not claimed

**Passive Loss Limitations:**
- Up to $25,000 active participation exception
- Phases out: $100K-$150K AGI
- Excess losses carry forward

### 5. Investment Expenses

**Deductible:**
- Investment interest expense (up to investment income)
- Margin interest
- Safe deposit box (if hold investments)

**NOT Deductible (post-TCJA):**
- Investment advisory fees
- IRA custodial fees
- Tax preparation fees (unless business-related)

### 6. Medical Expenses

**Deductible if > 7.5% AGI:**
- Health insurance premiums (if not pre-tax)
- Doctor and dentist visits
- Prescription medications
- Medical equipment
- Long-term care insurance (limits apply)
- Mileage to medical appointments (21¢/mile)
- Lodging for medical care (up to $50/night per person)

**Strategy:** Bunch procedures in one year to exceed threshold

### 7. Charitable Contributions

**Cash Contributions:**
- Up to 60% of AGI
- Requires receipt for $250+
- Qualified organizations only

**Non-Cash Contributions:**
- Fair market value
- Up to 30% of AGI (appreciated property)
- Appraisal needed for $5,000+
- Form 8283 for non-cash

**Strategy:**
- Donate appreciated stock (avoid capital gains)
- Qualified Charitable Distribution from IRA (age 70½+)
- Donor-Advised Fund for bunching

### 8. Education Expenses

**American Opportunity Credit:**
- Up to $2,500 per student
- 40% refundable
- First 4 years of college
- Phases out: $80K-$90K (single), $160K-$180K (MFJ)

**Lifetime Learning Credit:**
- Up to $2,000 per return
- Any post-secondary education
- Same phase-out as AOTC
- Cannot claim both for same student

**Student Loan Interest Deduction:**
- Up to $2,500 (above-the-line)
- Phases out as noted above

### 9. Retirement Contributions

**Traditional IRA:**
- Deductible if within income limits
- Or if no workplace plan

**SEP-IRA:**
- Up to 25% of compensation
- Max $69,000 (2024)
- Self-employed calculation differs

**Solo 401(k):**
- Employee: Up to $23,000 ($30,500 if 50+)
- Employer: Up to 25% compensation
- Combined max: $69,000 ($76,500 if 50+)

### 10. Timing Strategies

**Accelerate Deductions:**
- Pay property tax in December (if itemizing)
- Make January mortgage payment in December
- Prepay state estimated taxes (subject to SALT cap)
- Bunch charitable contributions

**Defer Income:**
- Delay year-end bonuses
- Defer billing (self-employed)
- Harvest capital losses (offset gains)

**Year-End Planning:**
- Review estimated vs actual
- Assess itemized vs standard
- Consider Roth conversion
- Max out retirement contributions

## Analysis Output

```markdown
## Deduction Optimization Analysis

### Current Status
- Standard Deduction: $29,200
- Current Itemized Total: $24,500
- **Recommendation:** Use Standard Deduction

### Missed Opportunities

#### 1. IRA Contribution
- **Potential Deduction:** $7,000
- **Tax Savings:** ~$1,540 (22% bracket)
- **Action:** Contribute to Traditional IRA by April 15
- **Form:** Schedule 1, Line 20

#### 2. HSA Contribution
- **Current:** $2,000
- **Maximum:** $4,150
- **Additional Deduction:** $2,150
- **Tax Savings:** ~$473
- **Action:** Increase HSA contributions

#### 3. Home Office Deduction
- **Not Currently Claimed**
- **Estimated Value:** $1,500 (simplified method)
- **Requirements:** Exclusive business use of 300 sq ft
- **Action:** Measure office space and use Form 8829

### Total Potential Additional Savings: $2,013

### Strategies for Next Year

1. **Bunching Deductions**
   - Current itemized: $24,500
   - Need: $4,700 more to exceed standard
   - Strategy: Prepay 2025 property taxes in December 2024

2. **Charitable Giving**
   - Consider Donor-Advised Fund
   - Donate appreciated stock instead of cash

3. **Medical Expenses**
   - Current: $8,000
   - Threshold (7.5% of $120,000): $9,000
   - Strategy: Schedule elective procedures to bunch expenses
```

## Integration Points

Works with:
- **tax-liability-calculator:** Calculate tax impact of optimizations
- **irs-rule-lookup:** Verify deduction eligibility
- **form-filler:** Implement recommended deductions
- **question-asker:** Gather information for optimization

## Important Warnings

**Always Note:**
- Documentation requirements
- Substantiation rules
- Audit risk considerations
- Professional review recommendations

**Red Flags:**
- Round numbers (raises audit risk)
- 100% business use claims
- Excessive deductions relative to income
- Hobby loss rules (Schedule C)

## Follow-up Actions

After presenting optimizations:
1. Prioritize by tax savings
2. Identify documentation needed
3. Clarify eligibility questions
4. Offer to implement in return
5. Suggest timing strategies
