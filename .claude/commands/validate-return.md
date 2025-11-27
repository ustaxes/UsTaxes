---
name: validate-return
description: "Audit and validate tax return for accuracy, compliance, and optimization before filing"
args:
  - name: year
    description: "Tax year to validate (default: 2024)"
    required: false
---

# Validate Tax Return

Perform comprehensive audit of completed tax return before filing.

## Overview

This command invokes the **tax-return-auditor** agent to:
- Verify all mathematical calculations
- Check IRS compliance
- Identify potential issues or errors
- Assess audit risk
- Suggest optimizations
- Generate detailed audit report

## When to Use

Run this command:
- **Before filing** - Always validate before submitting to IRS
- **After making changes** - Re-validate if you update any data
- **For peace of mind** - Double-check a return prepared elsewhere
- **Before professional review** - Clean up issues before paying for CPA time

## Validation Process

### Phase 1: Pre-Flight Checks

**Step 1: Verify Return Exists**
```typescript
const taxYear = args.year ?? 2024
const state = store.getState()
const yearState = state[`Y${taxYear}`]

if (!yearState) {
  throw new Error(`No ${taxYear} tax return found. Run /prepare-return first.`)
}

console.log(`Validating ${taxYear} tax return...`)
console.log(`Last modified: ${yearState.lastModified}`)
```

**Step 2: Check Completeness**
```typescript
// Minimum viable return check
const hasPersonal = yearState.taxPayer?.primaryPerson?.ssid
const hasIncome = yearState.w2s?.length > 0 || yearState.f1099s?.length > 0
const hasFilingStatus = yearState.taxPayer?.filingStatus

if (!hasPersonal || !hasIncome || !hasFilingStatus) {
  console.warn('⚠️  Return appears incomplete')
  console.log('Missing required information:')
  if (!hasPersonal) console.log('  - Personal information (name, SSN)')
  if (!hasIncome) console.log('  - Income sources (W-2 or 1099)')
  if (!hasFilingStatus) console.log('  - Filing status')
  console.log('\nContinuing with partial validation...')
}
```

### Phase 2: Invoke Tax Return Auditor

**Load Auditor Agent:**
```typescript
import { TaxReturnAuditorAgent } from '.claude/agents/tax-return-auditor'

const auditResult = await TaxReturnAuditorAgent.audit({
  taxYear,
  state: yearState,
  comprehensiveMode: true,
  checkOptimizations: true,
  assessAuditRisk: true
})
```

The auditor performs 6 comprehensive phases:
1. **Document Inventory** - Verify all required forms present
2. **Data Validation** - Check accuracy of all entries
3. **Mathematical Verification** - Validate all calculations
4. **Compliance Checks** - Ensure IRS requirements met
5. **Optimization Review** - Identify missed opportunities
6. **Audit Risk Assessment** - Evaluate audit probability

### Phase 3: Present Results

**Executive Summary:**
```markdown
# Tax Return Audit Report

**Taxpayer:** John & Jane Doe
**Filing Status:** Married Filing Jointly
**Tax Year:** 2024
**Audit Date:** 2025-11-27
**Forms Reviewed:** Form 1040, Schedule 1, Schedule A, Schedule B, Form 8812

---

## Executive Summary

**Overall Status:** ✅ PASS

**Key Findings:**
- 0 Critical Issues (must fix before filing)
- 2 Warnings (should review)
- 3 Optimization Opportunities

**Financial Summary:**
- **Total Tax Liability:** $24,450
- **Federal Withholding:** $30,000
- **Refund:** $1,550
- **Effective Tax Rate:** 13.7%
- **Marginal Tax Rate:** 22%

**Confidence Level:** HIGH (95%+ data quality)
**Audit Risk:** LOW

---
```

**Critical Issues Section:**
```markdown
## Critical Issues ❌

*No critical issues found.*

Your return is ready to file from a compliance perspective.

---
```

Or if issues exist:
```markdown
## Critical Issues ❌

### 1. Missing Spouse SSN

- **Location:** Form 1040, Line 2
- **Problem:** Spouse SSN is required for Married Filing Jointly status
- **Impact:** Return will be rejected by IRS e-file system
- **Resolution:** Provide spouse Social Security Number
- **Reference:** Form 1040 Instructions, Page 15

### 2. W-2 Income Mismatch

- **Location:** Form 1040, Line 1z
- **Problem:** Reported W-2 income ($120,000) doesn't match sum of provided W-2s ($175,000)
- **Impact:** IRS will receive mismatch notification from employers
- **Resolution:** Add missing W-2 or verify amounts
- **Reference:** IRS Publication 17, Chapter 4

**Action Required:** Fix these issues before filing. Run /prepare-return to update.

---
```

**Warnings Section:**
```markdown
## Warnings ⚠️

### 1. Large Charitable Deduction

- **Location:** Schedule A, Line 12
- **Concern:** $15,000 in charitable contributions (8.4% of income)
- **Risk Level:** Medium
- **Recommendation:** Ensure you have:
  - Receipts for all donations ≥$250
  - Written acknowledgment from charity for each gift ≥$250
  - Form 8283 for non-cash donations ≥$500
  - Appraisal for non-cash donations ≥$5,000
- **Reference:** IRS Publication 526, Recordkeeping

### 2. Home Office Deduction

- **Location:** Schedule C, Line 30
- **Concern:** Claiming $8,000 home office deduction
- **Risk Level:** Medium
- **Recommendation:** Audit red flag. Ensure:
  - Space used EXCLUSIVELY for business
  - Regular and consistent business use
  - Principal place of business OR client meeting place
  - Accurate square footage calculation
  - Keep photos and floor plan
- **Reference:** IRS Publication 587

**These warnings don't block filing but increase audit risk. Ensure documentation.**

---
```

### Phase 4: Mathematical Verification

**Income Verification:**
```markdown
## Mathematical Verification ✓

### Income Cross-Check

**W-2 Income:**
- W-2 #1 (Tech Company): $120,000 ✓
- W-2 #2 (School District): $55,000 ✓
- **Total W-2 (Line 1z):** $175,000 ✓

**Interest Income:**
- First National Bank: $450.25 ✓
- **Total Interest (Line 2b):** $450 ✓
  - *Rounded to nearest dollar per IRS instructions*

**Dividend Income:**
- Vanguard ordinary dividends: $3,250 ✓
- Vanguard qualified dividends: $2,800 ✓
- **Total Dividends (Line 3b):** $3,250 ✓
- **Qualified Dividends (Line 3a):** $2,800 ✓

**Capital Gains:**
- Schedule D total: $10,000 ✓
  - Short-term: $3,000
  - Long-term: $7,000
- **Capital Gain (Line 7):** $10,000 ✓

**Total Income (Line 9):** $188,700 ✓

---

### Adjustments to Income

**Schedule 1:**
- Student loan interest deduction: $1,200 ✓
  - *Verified against Form 1098-E*
  - *Within $2,500 limit*
  - *Income under phase-out threshold*

**Total Adjustments (Line 10):** $1,200 ✓

**Adjusted Gross Income (Line 11):** $187,500 ✓

---

### Deductions

**Itemized Deductions (Schedule A):**
- Medical expenses: $0 ✓
  - *Total expenses: $8,000*
  - *Threshold (7.5% AGI): $14,062*
  - *Below threshold - not deductible*

- State and local taxes: $10,000 ✓
  - *SALT cap applied correctly*

- Mortgage interest: $15,000 ✓
  - *Form 1098 verified*

- Charitable contributions: $5,000 ✓
  - *Cash contributions documented*

- **Total Itemized:** $30,000 ✓

**Standard Deduction Alternative:** $29,200
**Using Itemized:** $30,000 ✓ (saves $800 taxable income)

**Taxable Income (Line 15):** $157,500 ✓
  - AGI ($187,500) - Itemized ($30,000)

---

### Tax Calculation

**Tax on $157,500 (MFJ):**
- First $23,200 @ 10%: $2,320
- Next $70,100 @ 12%: $8,412
- Remaining $64,200 @ 22%: $14,124
- **Ordinary Income Tax:** $24,856 ✓

**Qualified Dividends & Capital Gains:**
- Qualified dividends: $2,800 @ 15%: $420 ✓
- Long-term capital gains: $7,000 @ 15%: $1,050 ✓
- **Investment Income Tax:** $1,470 ✓

**Total Tax Before Credits (Line 16):** $26,326 ✓

---

### Credits

**Child Tax Credit (Form 8812):**
- Qualifying child: Emily Doe (age 6) ✓
- Credit amount: $2,000 ✓
- Phase-out threshold (MFJ): $400,000
- Your AGI: $187,500 - No phase-out ✓
- **Credit claimed:** $2,000 ✓

**Total Credits (Line 19):** $2,000 ✓

**Tax After Credits (Line 24):** $24,326 ✓

---

### Payments & Refund

**Federal Withholding:**
- W-2 #1: $18,000 ✓
- W-2 #2: $8,250 ✓
- **Total Withholding (Line 25a):** $26,250 ✓

**Estimated Tax Payments:** $0

**Total Payments (Line 33):** $26,250 ✓

**Refund Calculation:**
- Total Payments: $26,250
- Tax Owed: $24,326
- **Refund (Line 34):** $1,924 ✓

---

**All calculations verified. No mathematical errors found.**
```

### Phase 5: Compliance Status

```markdown
## Compliance Status ✓

### Required Forms

- [✓] Form 1040 (main return)
- [✓] Schedule 1 (adjustments to income)
- [✓] Schedule A (itemized deductions)
- [✓] Schedule B (interest and dividends)
- [✓] Form 8812 (child tax credit)
- [✓] Form 8949 (investment sales)
- [✓] Schedule D (capital gains summary)

**All required forms present.**

---

### Personal Information Accuracy

- [✓] Primary taxpayer name matches SSN
- [✓] Spouse name matches SSN
- [✓] Dependent information complete (name, SSN, DOB, relationship)
- [✓] Address current and complete
- [✓] Filing status appropriate for household

**All personal information verified.**

---

### Required Disclosures

- [✓] Virtual currency question answered (No)
- [✓] Presidential election campaign fund selected
- [✓] Preparer information (if applicable)
- [✓] Signature and date fields present

**All disclosures complete.**

---

### State Tax Considerations

**State Residency:** California

- [✓] State withholding matches state return
- [⚠️] State return not yet prepared
  - **Recommendation:** Prepare California state return
  - **Command:** `/prepare-state-return CA 2024`

---

**Compliance Status: PASS**

Your return meets all IRS requirements and is ready to file.
```

### Phase 6: Optimization Opportunities

```markdown
## Optimization Opportunities 💡

### 1. Traditional IRA Contribution

**Current Situation:**
- No IRA contribution claimed
- You are eligible for Traditional IRA deduction

**Opportunity:**
- Maximum contribution: $7,000 ($8,000 if age 50+)
- Your contribution: $0
- **Additional deduction available: $7,000**

**Tax Impact:**
- Reduces AGI to $180,500
- Reduces taxable income to $150,500
- Tax savings: ~$1,540 (22% marginal rate)

**Action:**
- Contribute to Traditional IRA by April 15, 2025
- Amend return or file with contribution included

**Reference:** IRS Publication 590-A

---

### 2. Health Savings Account (HSA)

**Current Situation:**
- Your W-2 indicates HDHP coverage
- Current HSA contribution: $2,000 (from W-2 Box 12, Code W)

**Opportunity:**
- Maximum family contribution: $8,300
- Your contribution: $2,000
- **Additional contribution available: $6,300**

**Tax Impact:**
- Additional deduction: $6,300
- Tax savings: ~$1,386 (22% marginal rate)

**Action:**
- Make additional HSA contribution before April 15, 2025
- Triple tax benefit: deductible, tax-free growth, tax-free withdrawals

**Reference:** IRS Publication 969

---

### 3. Bunching Charitable Contributions

**Current Situation:**
- Itemized deductions: $30,000
- Standard deduction: $29,200
- Only $800 over standard

**Strategy for Next Year:**
- Alternate years: itemize one year, standard the next
- Bunch 2 years of donations into one year

**Example:**
- 2024: Donate $10,000 (itemize)
- 2025: Donate $0 (take standard)
- **Net savings over 2 years: ~$1,760**

**Action:**
- Consider Donor-Advised Fund for bunching
- Time large donations strategically

**Reference:** IRS Publication 526

---

### Summary

**Total Immediate Savings Available:** $2,926
- IRA contribution: $1,540
- HSA contribution: $1,386

**Action Required:**
Would you like to update your return to include these optimizations?
```

### Phase 7: Audit Risk Assessment

```markdown
## Audit Risk Assessment

**Overall Risk Rating:** 🟢 LOW (2.1% audit probability)

### Risk Factors

**Positive Factors (Low Risk):**
✓ W-2 income only (employer-reported)
✓ Standard deductions claimed (minimal Schedule A)
✓ Income level ($187K) below high-audit threshold
✓ All income third-party verified (W-2, 1099)
✓ Round numbers avoided
✓ No previous audit history
✓ No business losses

**Moderate Risk Factors:**
⚠️ Itemized deductions (slightly elevated risk)
⚠️ Charitable contribution ($5,000)
⚠️ Mortgage interest deduction

**High Risk Factors:**
❌ None identified

---

### Audit Probability by Income

**Your Income:** $187,500 AGI
**Historical Audit Rate:** 0.4% (IRS Data Book)

**Comparison:**
- Under $200K: 0.4%
- $200K-$500K: 1.0%
- $500K-$1M: 2.8%
- Over $1M: 8.0%

**Your return is in the lowest audit risk category.**

---

### Red Flags Avoided ✓

- [✓] No home office deduction
- [✓] No 100% business vehicle use
- [✓] No Schedule C losses
- [✓] No rental property losses
- [✓] No large cash business
- [✓] No offshore accounts
- [✓] No cryptocurrency gains
- [✓] No early retirement withdrawal

---

### Documentation Requirements

**Keep These Records (7 years):**

**Income:**
- [✓] W-2 from Tech Company Inc
- [✓] W-2 from School District
- [✓] 1099-INT from First National Bank
- [✓] 1099-DIV from Vanguard
- [✓] 1099-B from Schwab

**Deductions:**
- [✓] Form 1098 (mortgage interest)
- [✓] Form 1098-E (student loan interest)
- [✓] Property tax statement
- [✓] Charitable donation receipts
  - ⚠️ **IMPORTANT:** Need written acknowledgment for donations ≥$250

**Other:**
- [✓] Copy of filed return
- [✓] Proof of estimated tax payments (if any)
- [✓] State tax return

---

### If Audited

**What to Expect:**
1. IRS sends notice by mail (never by phone/email)
2. Requests documentation for specific items
3. 90% of audits handled by mail (no in-person meeting)
4. Respond within 30 days

**How to Respond:**
- Provide only requested documents
- Include cover letter explaining each item
- Send via certified mail with return receipt
- Keep copies of everything sent
- Consider hiring tax professional if complex

**Your Audit Risk:** Very low. Standard W-2 return.

---

**Risk Mitigation Complete**

Your documentation checklist is ready. Keep all receipts organized.
```

### Phase 8: Final Recommendations

```markdown
## Final Recommendations

### Before Filing ✅

**Required Actions:**
- [✓] Review entire return page by page
- [✓] Verify all SSNs are correct
- [✓] Check direct deposit bank account numbers
- [✓] Sign and date return (electronic signature if e-filing)
- [✓] Gather charitable donation receipts ≥$250

**Recommended Actions:**
- [ ] Consider IRA contribution ($7,000) - saves $1,540
- [ ] Consider additional HSA contribution ($6,300) - saves $1,386
- [ ] Prepare California state return
- [ ] Set up electronic filing account (IRS Free File)

---

### Filing Options

**E-Filing (Recommended):**
- **Fastest:** Refund in 2-3 weeks with direct deposit
- **Most accurate:** Built-in error checking
- **Confirmation:** Email receipt and IRS acknowledgment
- **Free options:** IRS Free File (income under $79,000)

**Paper Filing:**
- **Slower:** 6-8 weeks for refund
- **Address:** See Form 1040 instructions based on state
- **Include:** Form 1040-V if making payment
- **Tracking:** Send certified mail with return receipt

**Professional Review:**
- Not required for your standard return
- Consider if: major life changes, audit concerns, complex items

---

### Important Dates

- **April 15, 2025** - Filing deadline
- **April 15, 2025** - IRA contribution deadline
- **October 15, 2025** - Extension deadline (if filed Form 4868)
- **July 15, 2025** - Expected refund if e-filed by April 15

---

### Next Steps

**1. Decide on Optimizations**
Run `/optimize-deductions` for detailed analysis of IRA and HSA options.

**2. Prepare State Return**
Run `/prepare-state-return CA 2024` to complete California state taxes.

**3. File Return**
- E-file through IRS Free File or tax software
- Or print PDF and mail certified
- Track refund: https://www.irs.gov/refunds

**4. Plan for Next Year**
- Adjust W-4 withholding if needed
- Set up quarterly estimated payments if required
- Consider tax-advantaged retirement contributions

---

## Validation Complete ✓

**Summary:**
- ✅ No critical errors
- ⚠️ 2 minor warnings (documentation recommended)
- 💡 $2,926 potential additional savings available
- 🟢 Low audit risk (0.4%)
- 📊 Confidence level: HIGH

**Your return is ready to file.**

**Estimated refund:** $1,924
**Expected deposit date:** Mid-May 2025 (if e-filed in April)

---

**Next Command:** `/prepare-return` to implement optimizations or proceed to filing.

---

*This validation was performed by Claude Code Tax Automation. While we've thoroughly checked your return, you are ultimately responsible for its accuracy. Consider professional review for complex situations.*

*Validation completed: 2025-11-27 14:32:15*
*Audit confidence: 95%*
*Processing time: 45 seconds*
```

## Error Handling

**Return Not Found:**
```markdown
❌ No tax return found for year 2024.

**Solutions:**
1. Run `/prepare-return 2024` to create new return
2. Verify Redux state: `store.getState().Y2024`
3. Check if return was saved to different year

**Need help?** Type `/help prepare-return`
```

**Incomplete Return:**
```markdown
⚠️  Tax return is incomplete and cannot be fully validated.

**Missing Required Information:**
- Personal information (name, SSN)
- Filing status
- At least one income source

**Partial Validation Results:**
[... show what can be validated ...]

**Action Required:**
Run `/prepare-return 2024` to complete your return.
```

**Validation Errors:**
```markdown
❌ Validation failed with critical errors.

**Critical Issues Found:**
1. Invalid SSN format
2. Negative income amount
3. Missing required form

**Cannot proceed with filing until these are resolved.**

Run `/prepare-return 2024` to fix these issues.
```

## Integration Points

Coordinates with:
- **tax-return-auditor** agent (performs audit)
- **tax-liability-calculator** skill (verifies calculations)
- **irs-rule-lookup** skill (checks compliance)
- **deduction-optimizer** skill (finds opportunities)

## Output

- Comprehensive audit report (markdown)
- Pass/Fail status
- List of critical issues
- List of warnings
- Optimization opportunities
- Audit risk assessment
- Filing checklist
- Confidence score

## Best Practices

1. **Always validate before filing** - Catches errors early
2. **Re-validate after changes** - Ensure fixes didn't break anything
3. **Keep audit report** - Part of permanent tax records
4. **Address all critical issues** - Return will be rejected otherwise
5. **Consider warnings** - Even if not blocking, reduce audit risk

## Example Usage

```bash
# Validate current year return
/validate-return

# Validate specific year
/validate-return 2023

# Quick validation (skip optimizations)
/validate-return --quick

# Verbose validation (include all details)
/validate-return --verbose
```

## Success Criteria

Validation passes when:
- ✅ No critical errors
- ✅ All calculations verified
- ✅ IRS compliance confirmed
- ✅ Audit risk assessed
- ✅ Documentation checklist generated

## Performance

- **Simple return:** 30-45 seconds
- **Complex return:** 1-2 minutes
- **Includes:** Full 6-phase audit process
- **Confidence:** 95%+ accuracy

---

**Recommendation:** Run this validation on every return before filing. It's your last line of defense against IRS notices and audit complications.
