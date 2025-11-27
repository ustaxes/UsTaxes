---
name: prepare-return
description: "Complete tax return preparation workflow: extract documents, ask questions, fill forms, audit, generate PDF"
args:
  - name: year
    description: "Tax year to prepare (default: 2024)"
    required: false
---

# Prepare Tax Return

Complete autonomous tax return preparation workflow.

## Overview

This command orchestrates the full tax return completion process:
1. Initialize session and Redux state
2. Collect and extract source documents
3. Identify data gaps
4. Ask intelligent questions to fill gaps
5. Populate forms via Redux actions
6. Audit completed return
7. Optimize for deductions and credits
8. Generate final PDF

## Workflow Phases

### Phase 1: Initialization

**Step 1: Verify Tax Year**
```typescript
const taxYear = args.year ?? 2024
console.log(`Preparing ${taxYear} tax return`)

// Verify year is supported (2019-2024)
if (taxYear < 2019 || taxYear > 2024) {
  throw new Error(`Tax year ${taxYear} not supported. Supported: 2019-2024`)
}
```

**Step 2: Initialize Redux State**
```typescript
// Load persisted state or create new
const state = store.getState()
const yearState = state[`Y${taxYear}`]

if (!yearState) {
  console.log('Creating new tax return')
} else {
  console.log('Resuming existing tax return')
  console.log(`Last modified: ${yearState.lastModified}`)
}
```

**Step 3: Create Session Directory**
```bash
# Create session directory for this return
SESSION_DIR="/tmp/tax-return-${taxYear}-$(date +%s)"
mkdir -p "$SESSION_DIR"/{documents,extracts,audit,output}

echo "Session directory: $SESSION_DIR"
```

### Phase 2: Document Collection

**Step 1: Prompt for Documents**
```markdown
## Document Collection

To complete your ${taxYear} tax return, I need copies of your tax documents.

**Required Documents:**
- [ ] All W-2 forms (from employers)
- [ ] Form 1099-INT (interest income from banks)
- [ ] Form 1099-DIV (dividend income from investments)
- [ ] Form 1099-B (broker transactions/stock sales)
- [ ] Form 1099-MISC / 1099-NEC (self-employment income)
- [ ] Form 1098 (mortgage interest)
- [ ] Form 1098-E (student loan interest)
- [ ] Form 1098-T (education expenses)

**Optional Documents (if applicable):**
- [ ] Receipts for charitable donations
- [ ] Medical expense receipts
- [ ] Property tax statements
- [ ] Business expense receipts
- [ ] Rental property records
- [ ] Childcare provider information
- [ ] Prior year tax return (for carryovers)

**How to provide documents:**
1. Upload scanned documents or photos
2. Or provide file paths to existing documents
3. Or manually enter information (I'll ask questions)

Please provide documents in any order. I'll process them as you upload.
```

**Step 2: Process Each Document**
```bash
# For each document provided
for doc in $DOCUMENTS; do
  echo "Processing: $(basename $doc)"

  # Invoke tax-document-analyzer skill
  # This happens automatically when documents are provided
  # Skill extracts data and saves to $SESSION_DIR/extracts/

  # Example output:
  # {
  #   "documentType": "W2",
  #   "extractedData": {...},
  #   "confidence": 0.95,
  #   "ambiguities": [],
  #   "validationErrors": []
  # }
done
```

**Step 3: Summarize Collected Data**
```markdown
## Documents Processed

**Income Sources:**
✓ W-2 from Tech Company Inc: $120,000
✓ W-2 from School District: $55,000
✓ 1099-INT from First National Bank: $450
✓ 1099-DIV from Vanguard: $3,250

**Deductions:**
✓ 1098-E Student Loan Interest: $1,200
✓ 1098 Mortgage Interest: $15,000

**Total Income:** $178,700
**Data Quality:** 95% confidence

Proceeding to next phase...
```

### Phase 3: Data Gap Analysis

**Step 1: Check Required Fields**
```typescript
// Check for required personal information
const gaps = {
  personal: [],
  income: [],
  deductions: [],
  credits: [],
  other: []
}

// Personal info
if (!state.taxPayer.primaryPerson.firstName) gaps.personal.push('Primary taxpayer name')
if (!state.taxPayer.primaryPerson.ssid) gaps.personal.push('Primary taxpayer SSN')
if (!state.taxPayer.primaryPerson.dateOfBirth) gaps.personal.push('Primary taxpayer DOB')
if (!state.taxPayer.filingStatus) gaps.personal.push('Filing status')

// Spouse (if MFJ)
if (state.taxPayer.filingStatus === 'MFJ') {
  if (!state.taxPayer.spouse) gaps.personal.push('Spouse information')
}

// Dependents
if (state.taxPayer.dependents.length > 0) {
  state.taxPayer.dependents.forEach((dep, i) => {
    if (!dep.ssid) gaps.personal.push(`Dependent ${i+1} SSN`)
    if (!dep.dateOfBirth) gaps.personal.push(`Dependent ${i+1} DOB`)
  })
}

// W-2s
if (state.w2s.length === 0) {
  gaps.income.push('At least one W-2 required')
}

// Other income sources
// Check for common income types not yet reported
```

**Step 2: Prioritize Gaps**
```typescript
// Priority order:
// 1. Blocking - prevents form generation
// 2. High-value - significant tax impact
// 3. Optimization - potential savings
// 4. Completeness - nice to have

const prioritizedGaps = {
  blocking: gaps.personal.concat(gaps.income.filter(g => g.includes('required'))),
  highValue: gaps.deductions.filter(g => estimatedValue(g) > 1000),
  optimization: gaps.credits,
  completeness: [...remaining gaps]
}
```

### Phase 4: Intelligent Questioning

**Invoke question-asker agent:**
```markdown
I have your basic income information. Now I need some additional details:

## Personal Information

**1. Filing Status:** (Choose one)
a) Single
b) Married Filing Jointly
c) Married Filing Separately
d) Head of Household
e) Qualifying Widow(er)

*Current selection based on documents: Married Filing Jointly*
*Is this correct?* Yes / No

**2. Do you have any dependents?** Yes / No

If Yes:
- Number of children under 17: ___
- Number of other dependents: ___

**3. Can anyone claim you as a dependent?** Yes / No

## Income Verification

I found W-2 income totaling $175,000 from 2 employers.

**Did you have any OTHER income in 2024?**
- [ ] Self-employment income
- [ ] Rental property income
- [ ] Unemployment compensation
- [ ] Social Security benefits
- [ ] Retirement distributions (401k, IRA, pension)
- [ ] Alimony received
- [ ] Other income
- [✓] None of the above

## Deductions

Your standard deduction is $29,200 (Married Filing Jointly).

I found:
- Mortgage interest: $15,000
- Student loan interest: $1,200

To determine if itemizing saves money, I need to know:

**1. State and Local Taxes Paid**
- State income tax withheld: $_____ (from W-2 Box 17)
- Property tax paid: $_____
- *Max deduction: $10,000 total*

**2. Charitable Contributions**
Total cash donations in 2024: $_____
Total non-cash donations: $_____

**3. Medical Expenses**
Total out-of-pocket medical expenses: $_____
*Only deductible if over $13,402 (7.5% of income)*

---

I'll use your answers to complete your return...
```

**Step 5: Collect Responses**
```typescript
// question-asker agent collects and validates responses
// Returns structured data ready for Redux dispatch
const responses = {
  filingStatus: 'MFJ',
  dependents: [
    { firstName: 'Emily', lastName: 'Doe', ssid: '111-22-3333', dateOfBirth: new Date('2018-09-10') }
  ],
  itemizedDeductions: {
    stateAndLocalTaxes: 10000,
    charitableDonations: 5000,
    medicalExpenses: 8000  // Below threshold
  },
  otherIncome: []
}
```

### Phase 5: Form Population

**Invoke form-filler agent:**
```typescript
import { FormFillerAgent } from '.claude/agents/form-filler'

// Agent validates and dispatches all Redux actions
const result = await FormFillerAgent.populate({
  taxYear,
  extractedDocuments: documents,
  userResponses: responses
})

// Example actions dispatched:
// - saveFilingStatusInfo(FilingStatus.MFJ)
// - savePrimaryPersonInfo(primaryPerson)
// - addSpouse(spouse)
// - addDependent(dependent)
// - addW2(w2Data) x2
// - add1099(f1099Int)
// - add1099(f1099Div)
// - add1098e(studentLoan)
// - setItemizedDeductions(deductions)

if (result.success) {
  console.log(`✓ Forms populated: ${result.formsCount} forms`)
  console.log(`✓ Redux actions dispatched: ${result.actionsCount}`)
} else {
  console.error(`✗ Form population failed: ${result.errors}`)
  // Handle errors
}
```

### Phase 6: Optimization

**Invoke deduction-optimizer skill:**
```markdown
## Optimization Analysis

### Itemized vs Standard Deduction
- **Standard Deduction:** $29,200
- **Itemized Deductions:**
  - Mortgage Interest: $15,000
  - SALT (capped): $10,000
  - Charitable: $5,000
  - Medical (below threshold): $0
  - **Total Itemized:** $30,000

**✓ Recommendation:** Itemize (saves $800 in taxable income = ~$176 tax savings)

### Missed Opportunities

**1. IRA Contribution**
- Current contribution: $0
- Maximum allowed: $7,000 (or $8,000 if age 50+)
- **Deadline:** April 15, 2025 (you still have time!)
- **Estimated tax savings:** ~$1,540 (22% bracket)

**2. HSA Contribution**
Based on your W-2, you have a high-deductible health plan.
- Current HSA contribution: $2,000
- Maximum: $8,300 (family coverage)
- **Additional contribution available:** $6,300
- **Tax savings:** ~$1,386

**Total potential additional savings: $2,926**

Would you like to include these optimizations in your return?
```

### Phase 7: Audit and Validation

**Invoke tax-return-auditor agent:**
```markdown
## Tax Return Audit Report

**Taxpayer:** John & Jane Doe
**Filing Status:** Married Filing Jointly
**Tax Year:** 2024
**Audit Date:** 2025-11-27

---

### Executive Summary

**Overall Status:** ✅ PASS

**Key Findings:**
- 0 Critical Issues
- 1 Warning (review recommended)
- 2 Optimization Opportunities

**Total Tax Liability:** $28,450
**Federal Withholding:** $30,000
**Refund:** $1,550
**Effective Tax Rate:** 15.9%

---

### Warnings ⚠️

**1. Charitable Contribution Documentation**
- Location: Schedule A, Line 12
- Concern: $5,000 in charitable contributions claimed
- Risk Level: Low
- Recommendation: Ensure you have receipts for all donations over $250
- Reference: IRS Pub 526

---

### Mathematical Verification ✓

**Income:**
- W-2 Income: $175,000 ✓
- Interest: $450 ✓
- Dividends: $3,250 ✓
- **Total Income:** $178,700 ✓

**Deductions:**
- Student Loan Interest: $1,200 ✓
- Itemized Deductions: $30,000 ✓
- **AGI:** $177,500 ✓
- **Taxable Income:** $147,500 ✓

**Tax:**
- Ordinary Tax: $26,450 ✓
- Additional Taxes: $0 ✓
- **Total Tax:** $26,450 ✓

**Credits:**
- Child Tax Credit: $2,000 ✓
- **Tax After Credits:** $24,450 ✓

**Payments:**
- Federal Withholding: $30,000 ✓
- **Refund:** $1,550 ✓

---

### Audit Risk Assessment

**Risk Rating:** LOW

Standard W-2 return with common deductions. No unusual items.

**Documentation Checklist:**
- [✓] W-2 copies
- [✓] 1099 copies
- [✓] 1098 mortgage statement
- [✓] 1098-E student loan statement
- [✓] Charitable contribution receipts

---

**Recommended Next Step:** Review optimizations, then proceed to PDF generation
```

### Phase 8: Final Review and PDF Generation

**Step 1: Present Summary**
```markdown
## Tax Return Summary

**Your 2024 Federal Tax Return is Ready**

### Overview
- **Filing Status:** Married Filing Jointly
- **Adjusted Gross Income:** $177,500
- **Taxable Income:** $147,500
- **Total Tax:** $24,450
- **Withholding:** $30,000
- **Refund:** $1,550

### Forms Included
- Form 1040: U.S. Individual Income Tax Return
- Schedule 1: Additional Income and Adjustments to Income
- Schedule A: Itemized Deductions
- Schedule B: Interest and Ordinary Dividends
- Form 8812: Credits for Qualifying Children

### Optimizations Applied
✓ Itemized deductions (saves $800)
✓ Student loan interest deduction ($1,200)
✓ Child tax credit ($2,000)

### Potential Additional Savings
💡 IRA contribution: $1,540
💡 HSA contribution: $1,386

### Next Steps
1. Review the complete return below
2. Download PDF for your records
3. E-file or mail before April 15, 2025
4. Consider suggested optimizations (can contribute to IRA until deadline)

**Ready to generate PDF?** Yes / No
```

**Step 2: Generate PDF**
```typescript
import { create1040PDFs } from 'src/forms/Y2024/irsForms/index'

console.log('Generating PDF...')

try {
  const pdfBytes = await create1040PDFs(state, assets)

  // Save to session directory
  const pdfPath = `${SESSION_DIR}/output/tax-return-${taxYear}.pdf`
  fs.writeFileSync(pdfPath, pdfBytes)

  console.log(`✓ PDF generated: ${pdfPath}`)
  console.log(`Size: ${(pdfBytes.length / 1024).toFixed(2)} KB`)

  // Also save to user's preferred location
  const userPath = `/home/user/Documents/Taxes/${taxYear}/`
  fs.mkdirSync(userPath, { recursive: true })
  fs.copyFileSync(pdfPath, `${userPath}/federal-return.pdf`)

  console.log(`✓ Saved to: ${userPath}/federal-return.pdf`)

} catch (error) {
  console.error('PDF generation failed:', error)
  throw error
}
```

**Step 3: Generate Supporting Documents**
```typescript
// Save Redux state backup
const stateBackup = JSON.stringify(state[`Y${taxYear}`], null, 2)
fs.writeFileSync(`${SESSION_DIR}/output/state-backup.json`, stateBackup)

// Generate audit trail
const auditTrail = {
  taxYear,
  timestamp: new Date().toISOString(),
  documents: extractedDocuments,
  userResponses,
  reduxActions: actionLog,
  auditFindings,
  optimizations,
  pdfGenerated: true
}
fs.writeFileSync(`${SESSION_DIR}/output/audit-trail.json`, JSON.stringify(auditTrail, null, 2))

// Generate checklist
const checklist = `
# Tax Return Filing Checklist - ${taxYear}

## Before Filing
- [ ] Review all pages of PDF
- [ ] Verify all numbers match source documents
- [ ] Check that SSNs are correct
- [ ] Verify bank account for direct deposit
- [ ] Sign and date the return

## Filing Options
- [ ] E-file through IRS Free File (recommended)
- [ ] E-file through tax software
- [ ] Mail paper return (Form 1040-V if payment due)

## Keep for Records (7 years)
- [ ] Copy of filed return (PDF)
- [ ] All W-2s and 1099s
- [ ] Receipts for deductions
- [ ] Proof of estimated tax payments
- [ ] State return (if applicable)

## Important Dates
- **Tax Day:** April 15, ${taxYear + 1}
- **Extension Deadline:** October 15, ${taxYear + 1}
- **IRA Contribution Deadline:** April 15, ${taxYear + 1}

## Expected Refund
- **Amount:** $${refundAmount.toLocaleString()}
- **Direct Deposit ETA:** 2-3 weeks after e-filing
- **Paper Check ETA:** 6-8 weeks

## Questions or Issues?
- IRS Website: https://www.irs.gov
- IRS Help Line: 1-800-829-1040
- Free File: https://www.irs.gov/freefile
- Where's My Refund: https://www.irs.gov/refunds
`

fs.writeFileSync(`${SESSION_DIR}/output/filing-checklist.md`, checklist)
```

**Step 4: Final Output**
```markdown
## 🎉 Tax Return Complete!

Your 2024 federal tax return has been prepared and saved.

### Files Generated
- `tax-return-2024.pdf` - Complete tax return (ready to file)
- `state-backup.json` - Redux state backup
- `audit-trail.json` - Complete audit trail
- `filing-checklist.md` - Filing instructions and checklist

### Summary
- **Refund:** $1,550
- **Forms:** 5 forms included
- **Confidence:** High (95%+ data quality)
- **Audit Risk:** Low

### Recommended Actions
1. ✅ Review PDF thoroughly
2. ✅ Gather receipts for charitable deductions ($5,000)
3. 💡 Consider IRA contribution ($7,000) for additional $1,540 savings
4. 💡 Consider additional HSA contribution ($6,300) for $1,386 savings
5. ✅ E-file before April 15, 2025

**Total session time:** 12 minutes
**Documents processed:** 6
**Questions asked:** 8
**Optimizations found:** 2

---

**Disclaimer:** This return was prepared using automated tax software. While we've validated all calculations and cross-checked IRS rules, you should review the return carefully before filing. Consider having a tax professional review if you have complex situations. You are ultimately responsible for the accuracy of your filed return.

Would you like me to:
- [ ] Generate state return (if applicable)
- [ ] Explain any specific line items
- [ ] Research additional deduction opportunities
- [ ] Create estimated tax payment plan for next year
```

## Error Handling

### Common Issues

**1. Missing Required Documents**
```markdown
⚠️ Cannot complete return - missing required documents:
- W-2 from [employer name]
- Social Security Number for dependent [name]

Please provide these documents to continue.
```

**2. Validation Errors**
```markdown
❌ Data validation failed:
- SSN format invalid: "123456789" (expected: XXX-XX-XXXX)
- W-2 Box 1 (income) cannot be negative: -$5000

Please correct these errors and retry.
```

**3. Calculation Errors**
```markdown
⚠️ Tax calculation resulted in unusual value:
- Effective tax rate: 45% (expected: 10-37%)
- Likely cause: Missing deductions or credits

Recommend professional review before filing.
```

## Integration Points

This command orchestrates:
- **tax-document-analyzer** skill (extraction)
- **question-asker** agent (gathering data)
- **form-filler** agent (Redux population)
- **deduction-optimizer** skill (optimization)
- **tax-return-auditor** agent (validation)
- **tax-liability-calculator** skill (calculations)

## Output

- PDF tax return ready to file
- Complete audit trail
- Filing checklist
- Redux state backup
- Session logs

## Best Practices

1. **Save early, save often** - Redux state persisted after each phase
2. **Validate everything** - All data validated before dispatch
3. **Explain decisions** - Clear rationale for all recommendations
4. **Flag uncertainty** - When unsure, recommend professional review
5. **Document thoroughly** - Complete audit trail for all actions

## Example Usage

```bash
# Prepare 2024 return (default)
/prepare-return

# Prepare 2023 return
/prepare-return 2023

# Resume existing return
/prepare-return 2024
```

## Success Criteria

Return is ready to file when:
- ✅ All required fields populated
- ✅ All validations passed
- ✅ Audit found no critical issues
- ✅ PDF generated successfully
- ✅ User reviewed and approved

---

**Estimated Time:** 10-20 minutes for simple return, 30-60 minutes for complex return
**Confidence Level:** Provides confidence score based on data quality and validation results
