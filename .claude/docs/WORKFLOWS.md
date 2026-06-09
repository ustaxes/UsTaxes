# UsTaxes Claude Code - Complete Workflows

Detailed workflows for preparing tax returns using Claude Code and the UsTaxes MCP Server.

## Table of Contents

- [Overview](#overview)
- [Standard Workflow Pattern](#standard-workflow-pattern)
- [Simple W-2 Employee](#simple-w-2-employee)
- [Married Filing Jointly](#married-filing-jointly)
- [Self-Employed (Schedule C)](#self-employed-schedule-c)
- [Rental Property Income](#rental-property-income)
- [Investment Income](#investment-income)
- [Itemized Deductions](#itemized-deductions)
- [Multi-Year Returns](#multi-year-returns)
- [Document Extraction](#document-extraction)
- [Validation and Review](#validation-and-review)
- [State-Only Returns](#state-only-returns)

---

## Overview

All tax return workflows in Claude Code follow a similar pattern:

1. **Setup**: Set filing status and personal information
2. **Income**: Add all income sources (W-2, 1099, business, rental, etc.)
3. **Deductions**: Add above-the-line and itemized deductions
4. **Credits**: Add eligible tax credits
5. **Validate**: Check for errors and completeness
6. **Generate**: Create PDF tax forms
7. **Save**: Export data for safe keeping

---

## Standard Workflow Pattern

### Phase 1: Initialization

```
You: "/prepare-return 2024"

Claude executes:
1. Check if return already exists (ustaxes_export_state)
2. If exists, ask if should resume or start fresh
3. Initialize new return if needed
```

### Phase 2: Personal Information

```
Claude asks:
- Filing status (S, MFJ, MFS, HOH, W)
- Primary taxpayer info (name, SSN, DOB, address)
- Spouse info (if MFJ)
- Dependents (if any)

Claude executes:
- ustaxes_set_filing_status
- ustaxes_add_primary_person
- ustaxes_add_spouse (if applicable)
- ustaxes_add_dependent (for each dependent)
```

### Phase 3: Income Collection

```
Claude asks about each income type:
- W-2 wage income
- 1099-INT (interest)
- 1099-DIV (dividends)
- 1099-B (brokerage)
- 1099-NEC (self-employment)
- Schedule E (rental properties)
- Other income sources

Claude executes appropriate tool for each:
- ustaxes_add_w2
- ustaxes_add_1099_int
- ustaxes_add_1099_div
- ustaxes_add_1099_b
- ustaxes_add_property
```

### Phase 4: Deductions and Adjustments

```
Claude asks about:
- IRA contributions
- HSA contributions
- Student loan interest
- Itemized deductions (if potentially beneficial)

Claude executes:
- ustaxes_add_ira
- ustaxes_add_hsa
- ustaxes_add_1098e
- ustaxes_set_itemized_deductions
```

### Phase 5: Validation

```
Claude executes:
- ustaxes_export_state (to analyze)
- Validates all data completeness
- Checks IRS rule compliance
- Calculates expected tax/refund
```

### Phase 6: PDF Generation

```
Claude executes:
- ustaxes_generate_federal_pdf
- ustaxes_add_state_residency (if not already set)
- ustaxes_generate_state_pdf (for applicable states)
```

### Phase 7: Save and Review

```
Claude executes:
- ustaxes_export_state (final backup)
- Provides summary with next steps
- Offers optimization suggestions
```

---

## Simple W-2 Employee

**Scenario**: Single filer, one W-2, standard deduction, no dependents

### Conversation Flow

```
You: "/prepare-return 2024"

=== SETUP ===
Claude: "What is your filing status?"
You: "Single"

Claude: "Please provide your information:
- Name
- SSN
- Date of birth
- Address"

You: "Alice Johnson, 123-45-6789, 5/15/1992,
      456 Oak St, Boston, MA 02101"

=== INCOME ===
Claude: "Do you have W-2 income from an employer?"
You: "Yes, one W-2"

Claude: "Please provide your W-2 details or upload a photo"
You: "Manual entry:
- Employer: Tech Corp Inc
- Box 1 (Wages): $85,000
- Box 2 (Federal tax): $13,000
- Box 3 (SS wages): $85,000
- Box 4 (SS tax): $5,270
- Box 5 (Medicare wages): $85,000
- Box 6 (Medicare tax): $1,232.50
- Box 16 (State wages): $85,000
- Box 17 (State tax): $4,250"

Claude: "W-2 added. Any other income sources?"
You: "No"

=== DEDUCTIONS ===
Claude: "Do you have:
- IRA contributions?
- HSA contributions?
- Student loan interest?
- Itemized deductions?"

You: "No deductions"

=== GENERATE ===
Claude: "Generating your federal and state returns..."

*Executes:*
- ustaxes_generate_federal_pdf
- ustaxes_generate_state_pdf (for MA)

=== SUMMARY ===
Claude provides:
- Tax calculation summary
- Expected refund
- PDF file locations
- Next steps
```

### Expected Result

**Federal Return:**
- Gross Income: $85,000
- Standard Deduction: $14,600
- Taxable Income: $70,400
- Total Tax: ~$10,500
- Withholding: $13,000
- **Refund: ~$2,500**

**Forms Generated:**
- Form 1040
- Any required schedules

**Files Created:**
- `/tmp/alice-federal-2024.pdf`
- `/tmp/alice-ma-2024.pdf`
- `/tmp/alice-state-2024.json` (backup)

---

## Married Filing Jointly

**Scenario**: Married couple, two W-2s, two children, IRA contributions

### Key Differences from Single Filer

1. **Add Spouse Information**
```
Claude: "Please provide spouse information"
You: "Robert Johnson, 987-65-4321, 3/20/1990"

*Executes: ustaxes_add_spouse*
```

2. **Add Dependents**
```
Claude: "Do you have dependents?"
You: "Yes, two children"

Claude: "Please provide first dependent's information"
You: "Emma Johnson, 111-22-3333, 6/10/2015, DAUGHTER, 12 months"

Claude: "Second dependent?"
You: "Noah Johnson, 444-55-6666, 9/15/2018, SON, 12 months"

*Executes: ustaxes_add_dependent (twice)*
```

3. **Add Multiple W-2s**
```
Claude: "Does the primary taxpayer have W-2 income?"
You: "Yes, Alice has a W-2 from Tech Corp, $85,000 wages..."

Claude: "Does the spouse have W-2 income?"
You: "Yes, Robert has a W-2 from Healthcare Inc, $65,000 wages..."

*Executes: ustaxes_add_w2 (twice, with personRole: PRIMARY and SPOUSE)*
```

4. **IRA Contributions**
```
Claude: "Do you or your spouse have IRA contributions?"
You: "Yes, Alice contributed $7,000 to traditional IRA"

You: "And Robert contributed $7,000 to traditional IRA"

*Executes: ustaxes_add_ira (twice)*
```

### Expected Result

**Federal Return:**
- Combined Income: $150,000
- IRA Deductions: -$14,000
- AGI: $136,000
- Standard Deduction: -$29,200
- Taxable Income: $106,800
- Tax Before Credits: ~$15,500
- Child Tax Credits: -$4,000 (2 × $2,000)
- Total Tax: ~$11,500
- **Refund: ~$6,500**

**Forms Generated:**
- Form 1040
- Schedule 1 (Additional Income and Adjustments)

---

## Self-Employed (Schedule C)

**Scenario**: Head of Household, freelance income, business expenses

### Conversation Flow

```
=== SETUP ===
You: "/prepare-return 2024"

Claude: "Filing status?"
You: "Head of Household"

Claude: "Personal information and qualifying dependent?"
You: "Sarah Williams, 222-33-4444, 8/12/1985, 789 Elm St, Cambridge, MA 02139
      Dependent: Lisa Williams, 555-66-7777, 1/20/2012, DAUGHTER, 12 months"

=== INCOME ===
Claude: "Income sources?"
You: "Self-employed as freelance consultant"

Claude: "Do you have 1099-NEC forms or just total income?"
You: "I have multiple 1099-NECs totaling $95,000 in income"

Claude: "Business expenses?"
You: "Home office: $5,000
      Equipment: $3,000
      Software subscriptions: $2,000
      Professional development: $1,500
      Total: $11,500"

*Note: Schedule C income/expenses would be added via appropriate tools*

=== DEDUCTIONS ===
Claude: "Other deductions?"
You: "Self-employed health insurance: $8,000
      SEP IRA contribution: $15,000
      Student loan interest: $2,500"

*Executes:*
- ustaxes_add_1098e (student loan)
- Adds SEP IRA via appropriate tool
- Adds self-employment health insurance

=== SELF-EMPLOYMENT TAX ===
Claude automatically calculates:
- Self-employment tax on net profit ($95,000 - $11,500 = $83,500)
- SE tax: ~$11,800
- Deductible portion of SE tax: ~$5,900

=== GENERATE ===
Forms generated:
- Form 1040
- Schedule 1 (Additional Income)
- Schedule 2 (Additional Taxes - SE tax)
- Schedule C (Business Income)
- Schedule SE (Self-Employment Tax)
```

### Expected Result

- Gross Business Income: $95,000
- Business Expenses: -$11,500
- Net Profit: $83,500
- Self-Employment Tax: ~$11,800
- Deductible SE Tax: ~$5,900
- SEP IRA: -$15,000
- Health Insurance: -$8,000
- Student Loan Interest: -$2,500
- Standard Deduction: -$21,900 (HOH)
- **Tax Owed: ~$8,000**

---

## Rental Property Income

**Scenario**: Single filer with W-2 and one rental property

### Conversation Flow

```
=== INCOME ===
Claude: "Do you have rental property income?"
You: "Yes, one rental property"

Claude: "Property address?"
You: "123 Rental Ave, Somerville, MA 02144"

Claude: "Annual rent received?"
You: "$30,000"

Claude: "Rental expenses?"
You: "Mortgage interest: $18,000
      Property taxes: $5,000
      Insurance: $1,500
      Repairs: $800
      Management fees: $3,000
      Utilities: $1,200
      Depreciation: $4,000"

*Executes: ustaxes_add_property*

Claude: "Net rental income: -$3,500 (loss)
         This loss can offset your W-2 income"
```

### Expected Result

**Schedule E (Rental Income):**
- Rental Income: $30,000
- Total Expenses: $33,500
- Net Loss: -$3,500 (may be limited by passive activity rules)

**Forms Generated:**
- Form 1040
- Schedule E (Supplemental Income)
- Schedule 1 (if rental loss applied)

---

## Investment Income

**Scenario**: Single filer with W-2, interest, dividends, and capital gains

### Conversation Flow

```
=== INVESTMENT INCOME ===
Claude: "Do you have investment income?"
You: "Yes, interest and dividends"

Claude: "1099-INT forms?"
You: "Bank of America: $850 interest"

*Executes: ustaxes_add_1099_int*

Claude: "1099-DIV forms?"
You: "Vanguard:
      Ordinary dividends: $3,200
      Qualified dividends: $2,800
      Capital gain distributions: $500"

*Executes: ustaxes_add_1099_div*

Claude: "Did you sell any stocks, bonds, or other investments?"
You: "Yes, sold 100 shares of Apple stock"

Claude: "1099-B details?"
You: "Sale proceeds: $18,000
      Cost basis: $15,000
      Date acquired: 3/15/2020
      Date sold: 8/20/2024"

*Executes: ustaxes_add_1099_b*

Claude calculates:
- Long-term capital gain: $3,000 (preferential 15% rate)
```

### Expected Result

**Investment Income:**
- Interest: $850 (ordinary income)
- Ordinary Dividends: $3,200 (ordinary income)
- Qualified Dividends: $2,800 (preferential rate)
- Long-term Capital Gains: $3,500 (preferential rate)

**Forms Generated:**
- Schedule B (Interest and Dividends)
- Schedule D (Capital Gains)
- Form 8949 (Sales of Capital Assets)

---

## Itemized Deductions

**Scenario**: Married Filing Jointly with high SALT, mortgage interest, and charitable donations

### When to Itemize

Itemize if total itemized deductions exceed standard deduction:
- MFJ Standard Deduction 2024: $29,200

### Conversation Flow

```
Claude: "Let me check if itemizing would be beneficial...

Your potential itemized deductions:
- State/local taxes: $10,000 (capped)
- Mortgage interest: $18,000
- Charitable donations: $8,000
- Medical expenses: $15,000 (AGI floor applies)
- Total: $51,000

This exceeds your standard deduction of $29,200.
Should I set up itemized deductions?"

You: "Yes"

Claude: "Please provide details for each category..."

*Executes: ustaxes_set_itemized_deductions*
```

### Key Limitations

- **SALT Cap**: State and local taxes capped at $10,000
- **Medical Floor**: Only amount exceeding 7.5% of AGI deductible
- **Mortgage Interest**: Limited to interest on first $750,000 of debt
- **Charitable**: Various limits based on AGI

### Expected Result

**Schedule A (Itemized Deductions):**
- Medical: $15,000 - (AGI × 7.5%) = varies
- SALT: $10,000 (capped)
- Mortgage Interest: $18,000
- Charitable: $8,000
- **Total: ~$45,000+**

**Tax Savings vs Standard Deduction:**
- Itemized: $45,000
- Standard: $29,200
- **Additional Deduction: $15,800**
- Tax Savings (22% bracket): ~$3,476

---

## Multi-Year Returns

**Scenario**: Preparing returns for multiple tax years

### Workflow

```bash
# Year 1: 2022
/prepare-return 2022
# Complete 2022 return
# Export state

# Year 2: 2023
/prepare-return 2023
# Complete 2023 return
# Export state

# Year 3: 2024
/prepare-return 2024
# Complete 2024 return
# Export state
```

### Managing Multiple Years

```
Claude: "I see you have data for multiple years:
- 2022: Complete (exported 11/15/2024)
- 2023: In progress
- 2024: Empty

Which year would you like to work on?"

You: "2023"

Claude: "Loading 2023 return data..."

*Executes: ustaxes_import_state for 2023*
```

### Batch Generation

```
You: "Generate PDFs for all three years"

Claude: "I'll generate PDFs for 2022, 2023, and 2024..."

*Executes for each year:*
- ustaxes_import_state
- ustaxes_generate_federal_pdf
- ustaxes_generate_state_pdf
```

---

## Document Extraction

**Scenario**: Extract data from W-2 and 1099 PDFs/images

### Using Document Extraction

```
You: "/extract-documents /path/to/tax-documents/"

Claude: "I'll analyze all tax documents in this directory...

Found:
1. w2-acme-corp.pdf
2. w2-tech-inc.pdf
3. 1099-int-bank.pdf
4. 1099-div-vanguard.pdf

Extracting data using Claude's vision capabilities..."

*For each document:*
- Reads file using Read tool (Claude has vision)
- Identifies document type (W-2, 1099-INT, 1099-DIV, etc.)
- Extracts all relevant fields
- Validates extracted data
- Confirms with user before adding

Claude: "W-2 from Acme Corp:
- Employer: Acme Corporation
- EIN: 12-3456789
- Wages (Box 1): $85,000
- Federal withholding (Box 2): $13,000
...

Is this information correct?"

You: "Yes"

*Executes: ustaxes_add_w2*

Claude continues with next document...
```

### Supported Documents

- **W-2**: Wage and Tax Statement
- **1099-INT**: Interest Income
- **1099-DIV**: Dividend Income
- **1099-B**: Brokerage Transactions
- **1099-NEC**: Nonemployee Compensation
- **1099-R**: Retirement Distributions
- **1098**: Mortgage Interest
- **1098-E**: Student Loan Interest

### Manual Verification

Always verify extracted data:
1. Claude shows extracted values
2. User confirms or corrects
3. Only then data is added to return

---

## Validation and Review

### Comprehensive Validation

```
You: "/validate-return 2024"

Claude: "Running comprehensive validation...

=== PHASE 1: DATA COMPLETENESS ===
✅ Filing status set (MFJ)
✅ Primary taxpayer information complete
✅ Spouse information complete
✅ 2 dependents added
✅ 3 W-2s added
✅ 2 1099-INT forms
✅ 1 1099-DIV form

=== PHASE 2: IRS RULE COMPLIANCE ===
✅ SSN formats valid
✅ Dependent ages qualify
✅ IRA contributions within limits
✅ SALT cap applied correctly
✅ Child tax credit eligibility verified

=== PHASE 3: CALCULATION VERIFICATION ===
✅ AGI calculation: $165,000
✅ Taxable income: $121,800
✅ Tax liability: $18,234
✅ Credits applied: $4,000
✅ Total tax: $14,234
✅ Withholding: $18,000
✅ Refund: $3,766

=== PHASE 4: PDF GENERATION TEST ===
✅ Federal PDF generated successfully
✅ Forms included: 1040, Schedule 1, Schedule B
✅ State PDF generated successfully

=== AUDIT RISK ASSESSMENT ===
Risk Level: LOW

Factors:
- Standard W-2 income ✅
- No cash businesses ✅
- Modest deductions ✅
- Adequate withholding ✅

=== OPTIMIZATION OPPORTUNITIES ===
1. Consider increasing IRA contributions (used $7,000 of $7,000 limit)
2. Track charitable donations for next year
3. Consider HSA if high-deductible health plan

=== RECOMMENDATIONS ===
✅ Return is complete and accurate
✅ Ready for filing
✅ Keep all supporting documents for 7 years
"
```

---

## State-Only Returns

**Scenario**: Federal return filed, need to prepare state return

### Workflow

```
You: "I already filed my federal return. I just need the MA state return"

Claude: "I can help with that. Do you have:
1. A copy of your federal return?
2. Or the tax data exported from your federal preparation?

This will help me prepare your state return accurately."

You: "I have my federal 1040"

Claude: "Please provide key information from your federal return:
- AGI (Line 11)
- Federal tax (Line 24)
- State withholding from W-2s

Or import previously exported state if you used this tool for federal."

*If importing:*
Claude: "I'll import your saved federal data and generate the MA state return"

*Executes:*
- ustaxes_import_state
- ustaxes_generate_state_pdf
```

---

**Last Updated:** 2024-11-28
**Version:** 1.0.0
