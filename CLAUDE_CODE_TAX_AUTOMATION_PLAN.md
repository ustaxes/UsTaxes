# Claude Code Tax Automation Layer - Implementation Plan

**Version:** 1.0
**Date:** 2025-11-27
**Branch:** `claude-code-tax-automation`

---

## Executive Summary

This document outlines the comprehensive plan for building a Claude Code automation layer on top of the UsTaxes open-source tax preparation application. The goal is to enable autonomous tax return completion through document analysis, intelligent questioning, and programmatic form generation.

### Key Objectives

1. **Autonomous Document Processing** - Parse W-2s, 1099s, receipts, and other tax documents to extract structured data
2. **Intelligent Information Gathering** - Ask clarifying questions to fill data gaps
3. **Automated Form Completion** - Populate Redux state and generate IRS-compliant tax forms
4. **Validation & Audit** - Ensure accuracy, compliance, and completeness
5. **Extensibility** - Leverage Claude Code's plugin architecture for distribution

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION LAYER                        │
│  • Slash Commands (/extract-documents, /validate-return, etc.)  │
│  • Natural Language Queries                                      │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CLAUDE CODE ORCHESTRATION                      │
│  • Skills (autonomous capabilities)                              │
│  • Sub-Agents (specialized multi-step processors)                │
│  • Hooks (automatic logging, validation)                         │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MCP INTEGRATION LAYER                       │
│  • tax-document-parser MCP (OCR, PDF extraction)                 │
│  • irs-rules-engine MCP (tax law queries)                        │
│  • form-validator MCP (compliance checking)                      │
│  • memory MCP (session state, audit trail)                       │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USTAXES APPLICATION CORE                      │
│  • Redux Actions (addW2, add1099, setFilingStatus, etc.)        │
│  • Data Model (Information interface)                            │
│  • Form Engine (F1040, Schedules, Worksheets)                    │
│  • PDF Generator (fillPDF, create1040PDFs)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Tax Documents → Extract → Validate → Clarify → Populate State →
Generate Forms → Audit → Export PDF
```

---

## Component Design

### 1. Slash Commands (User-Triggered Operations)

#### 1.1 `/extract-documents` - Document Parsing

**Purpose:** Parse tax documents and extract structured data

**Location:** `.claude/commands/extract-documents.md`

```markdown
---
description: Extract tax data from documents (W-2, 1099, receipts, etc.)
argument-hint: [document-path] [document-type?]
allowed-tools: [Bash, Read, WebFetch]
model: claude-sonnet-4-5
---

You are a tax document extraction specialist. Extract structured data from the document at $1.

## Document Type Detection
If $2 is not provided, automatically detect document type from:
- W-2 (wage and tax statement)
- 1099-INT (interest income)
- 1099-DIV (dividend income)
- 1099-B (proceeds from broker)
- 1099-R (retirement distributions)
- 1099-MISC/NEC (miscellaneous/non-employee compensation)
- 1099-SSA (social security benefits)
- 1098-E (student loan interest)
- Receipt (business expense)
- Invoice (business income)
- Bank statement
- Brokerage statement
- Property tax statement

## Extraction Process
1. Read the document using appropriate tool
2. Identify document type and tax year
3. Extract all relevant fields using IRS form structure
4. Map to UsTaxes data model (IncomeW2, Supported1099, etc.)
5. Validate extracted data against AJV schemas
6. Flag any ambiguous or missing data
7. Output structured JSON with confidence scores

## Output Format
Return JSON matching UsTaxes Redux action payloads:
- For W-2: IncomeW2 interface
- For 1099: Supported1099 union type
- For receipts: ItemizedDeductions or Property expenses

Include:
- extractedData (structured object)
- documentType (detected type)
- taxYear (extracted year)
- confidence (0-100 per field)
- ambiguities (fields needing clarification)
- validationErrors (schema violations)
```

#### 1.2 `/prepare-return` - Complete Return Workflow

**Purpose:** Orchestrate full tax return preparation

**Location:** `.claude/commands/prepare-return.md`

```markdown
---
description: Prepare a complete tax return from start to finish
argument-hint: [tax-year] [taxpayer-name?]
allowed-tools: [Bash, Read, Write, WebFetch]
model: claude-sonnet-4-5
---

You are an autonomous tax preparation assistant. Complete a tax return for year $1.

## Workflow

### Phase 1: Document Collection
1. Ask user for location of tax documents
2. Inventory all available documents
3. Identify missing documents
4. Use /extract-documents for each document

### Phase 2: Taxpayer Information
1. Extract personal information (name, SSN, address, DOB)
2. Determine filing status (single, MFJ, MFS, HOH, widow)
3. Identify dependents
4. Collect spouse information if applicable

### Phase 3: Income Processing
1. Process W-2s (wages, withholding, state income)
2. Process 1099s (interest, dividends, capital gains, retirement)
3. Process Schedule C income (self-employment)
4. Process Schedule E income (rental property)
5. Process Schedule K-1 (partnership/S-corp)

### Phase 4: Deduction Analysis
1. Calculate standard deduction
2. Gather itemized deductions if beneficial
3. Process student loan interest (1098-E)
4. Process HSA contributions
5. Process IRA contributions

### Phase 5: Credits & Payments
1. Calculate dependent credits (child tax credit, etc.)
2. Calculate education credits
3. Calculate earned income credit
4. Process estimated tax payments
5. Process federal withholding

### Phase 6: Form Generation
1. Populate Redux state via actions
2. Validate all data
3. Generate forms using create1040()
4. Run audit checks
5. Export PDF

### Phase 7: Review
1. Present summary to user
2. Highlight optimization opportunities
3. Flag items needing attention
4. Provide next steps

## Error Handling
- If documents are unclear, ask specific questions
- If data is missing, prompt user with context
- If calculations seem unusual, flag for review
- Maintain audit trail of all decisions

## Output
- Completed Redux state
- Generated PDF
- Summary report
- Audit log
```

#### 1.3 `/validate-return` - Compliance Check

**Purpose:** Validate completed return for accuracy and compliance

**Location:** `.claude/commands/validate-return.md`

```markdown
---
description: Validate a tax return for completeness, accuracy, and compliance
argument-hint: [tax-year?]
allowed-tools: [Bash, Read, WebFetch]
model: claude-sonnet-4-5
---

You are a tax return auditor. Validate the current tax return for year ${1:-2024}.

## Validation Checks

### 1. Completeness
- [ ] All required personal information present
- [ ] All income sources documented
- [ ] All required forms included
- [ ] All schedules completed

### 2. Mathematical Accuracy
- [ ] All calculations correct
- [ ] All totals match across forms
- [ ] All carryovers properly calculated
- [ ] All limitations applied correctly

### 3. Data Consistency
- [ ] SSNs match across forms
- [ ] Names match exactly
- [ ] Amounts match supporting documents
- [ ] Filing status consistent with household

### 4. Compliance
- [ ] Forms match tax year
- [ ] All required disclosures made
- [ ] Foreign account reporting if applicable
- [ ] Estimated tax penalties calculated

### 5. Optimization
- [ ] Itemized vs standard deduction optimized
- [ ] All eligible credits claimed
- [ ] All eligible deductions taken
- [ ] Tax-advantaged accounts utilized

## Output Format
Provide detailed report:
1. Validation Status (PASS/FAIL/WARNING)
2. Issues Found (with severity)
3. Recommendations
4. Risk Assessment
5. Next Steps
```

#### 1.4 `/estimate-taxes` - Quick Tax Calculation

**Location:** `.claude/commands/estimate-taxes.md`

```markdown
---
description: Estimate federal tax liability
argument-hint: [income] [filing-status]
model: haiku
---

Calculate estimated federal tax liability for $1 income with $2 filing status.

Use 2024 tax brackets and standard deduction. Provide:
- Adjusted Gross Income
- Taxable Income
- Tax Liability
- Effective Tax Rate
- Marginal Tax Rate
```

#### 1.5 `/optimize-deductions` - Deduction Analysis

**Location:** `.claude/commands/optimize-deductions.md`

```markdown
---
description: Analyze and optimize deductions for maximum tax benefit
allowed-tools: [Bash, Read, WebFetch]
model: claude-sonnet-4-5
---

You are a tax optimization specialist. Analyze the current tax return and identify deduction opportunities.

## Analysis Areas
1. Itemized vs Standard Deduction
2. Above-the-line deductions (Schedule 1)
3. Business expenses (Schedule C)
4. Rental property expenses (Schedule E)
5. Investment expenses
6. Retirement contributions
7. HSA contributions
8. Educational expenses

## Output
- Current deduction total
- Itemized vs standard comparison
- Missed opportunities
- Documentation needed
- Estimated tax savings
```

---

### 2. Skills (Autonomous Capabilities)

#### 2.1 tax-document-analyzer

**Purpose:** Automatically parse documents when provided

**Location:** `.claude/skills/tax-document-analyzer/SKILL.md`

```markdown
---
name: tax-document-analyzer
description: Analyze and extract structured data from tax documents. Automatically invoked when user provides tax documents, W-2s, 1099s, receipts, or bank statements.
allowed-tools: [Read, Bash, WebFetch]
---

# Tax Document Analyzer

You automatically analyze tax documents to extract structured data.

## Automatic Activation
Invoke this skill when:
- User mentions "here's my W-2" or similar
- User provides file path to tax document
- User uploads/shares tax-related PDF or image
- User asks to "analyze" or "extract" from document

## Capabilities
- OCR text extraction from images
- PDF text parsing
- Form field identification
- Data validation against IRS structures
- Confidence scoring

## Data Extraction

### W-2 Form
Extract:
- Box 1: Wages, tips, other compensation → income
- Box 2: Federal income tax withheld → fedWithholding
- Box 3: Social security wages → ssWages
- Box 4: Social security tax withheld → ssWithholding
- Box 5: Medicare wages and tips → medicareIncome
- Box 6: Medicare tax withheld → medicareWithholding
- Box 12: Various codes → box12
- Box 15-17: State info → state, stateWages, stateWithholding
- Employer info → EIN, name, address

### 1099-INT (Interest Income)
Extract:
- Box 1: Interest income → form1099Int.income
- Box 3: Interest on US savings bonds → form1099Int.usSavingsBondsInterest
- Box 8: Tax-exempt interest → form1099Int.taxExemptInterest
- Payer info → payer

### 1099-DIV (Dividends)
Extract:
- Box 1a: Total ordinary dividends → dividends
- Box 1b: Qualified dividends → qualifiedDividends
- Box 2a: Total capital gain distributions → capitalGain
- Payer info → payer

### 1099-B (Broker Transactions)
Extract:
- Short-term proceeds → shortTermProceeds
- Short-term cost basis → shortTermCostBasis
- Long-term proceeds → longTermProceeds
- Long-term cost basis → longTermCostBasis
- Payer info → payer

### Receipts/Invoices
Extract:
- Date → date
- Vendor → vendor
- Amount → amount
- Category → category (meals, supplies, travel, etc.)
- Business purpose → description

## Output Format
Return JSON matching UsTaxes interfaces:
```json
{
  "documentType": "W2",
  "taxYear": 2024,
  "extractedData": {
    "occupation": "Software Engineer",
    "income": 120000,
    "medicareIncome": 120000,
    "fedWithholding": 18000,
    "ssWages": 120000,
    "ssWithholding": 7440,
    "medicareWithholding": 1740,
    "employer": {
      "EIN": "12-3456789",
      "employerName": "Tech Company Inc",
      "address": {
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105"
      }
    },
    "personRole": "PRIMARY"
  },
  "confidence": {
    "income": 100,
    "fedWithholding": 100,
    "employer": 95
  },
  "ambiguities": [],
  "validationErrors": []
}
```

## Supporting Files
- `irs-form-structures.json` - Field mappings
- `ocr-patterns.json` - Text recognition patterns
- `validation-rules.json` - Data validation rules
```

**Supporting file:** `.claude/skills/tax-document-analyzer/irs-form-structures.json`

```json
{
  "W2": {
    "boxes": {
      "1": {"field": "income", "type": "currency", "required": true},
      "2": {"field": "fedWithholding", "type": "currency", "required": true},
      "3": {"field": "ssWages", "type": "currency", "required": true},
      "4": {"field": "ssWithholding", "type": "currency", "required": true},
      "5": {"field": "medicareIncome", "type": "currency", "required": true},
      "6": {"field": "medicareWithholding", "type": "currency", "required": true}
    }
  },
  "1099-INT": {
    "boxes": {
      "1": {"field": "income", "type": "currency", "required": true},
      "3": {"field": "usSavingsBondsInterest", "type": "currency"},
      "8": {"field": "taxExemptInterest", "type": "currency"}
    }
  }
}
```

#### 2.2 tax-liability-calculator

**Purpose:** Automatically calculate tax liability when income info is available

**Location:** `.claude/skills/tax-liability-calculator/SKILL.md`

```markdown
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

## Calculation Process

### 1. Determine Filing Status
- Single
- Married Filing Jointly
- Married Filing Separate
- Head of Household
- Qualifying Widow(er)

### 2. Calculate Adjusted Gross Income (AGI)
```
AGI = Total Income - Above-the-line Deductions
```

### 3. Calculate Taxable Income
```
Taxable Income = AGI - (Standard Deduction OR Itemized Deductions)
```

### 4. Apply Tax Brackets (2024)

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

### 5. Add Additional Taxes
- Alternative Minimum Tax (AMT)
- Net Investment Income Tax (NIIT) - 3.8%
- Additional Medicare Tax - 0.9%
- Self-Employment Tax - 15.3%

### 6. Subtract Credits
- Child Tax Credit
- Earned Income Credit
- Education Credits
- Foreign Tax Credit
- Residential Energy Credits

### 7. Compare to Withholding
```
Refund/Owed = (Withholding + Estimated Payments) - Total Tax
```

## Output Format
```json
{
  "filingStatus": "MFJ",
  "totalIncome": 150000,
  "adjustments": 5000,
  "agi": 145000,
  "deduction": 29200,
  "taxableIncome": 115800,
  "ordinaryTax": 15876,
  "additionalTaxes": 0,
  "totalTax": 15876,
  "credits": 4000,
  "taxAfterCredits": 11876,
  "withheld": 14000,
  "estimatedPayments": 0,
  "refund": 2124,
  "effectiveRate": 7.9,
  "marginalRate": 22
}
```

## Supporting Files
- `tax-brackets-2024.json` - Current year brackets
- `standard-deductions.json` - Standard deduction amounts
- `credit-rules.json` - Credit calculation rules
```

#### 2.3 irs-rule-lookup

**Purpose:** Reference IRS rules and guidance automatically

**Location:** `.claude/skills/irs-rule-lookup/SKILL.md`

```markdown
---
name: irs-rule-lookup
description: Look up IRS tax rules, publication guidance, and form instructions. Automatically invoked when tax law questions arise or clarification is needed.
allowed-tools: [WebFetch, Read]
---

# IRS Rule Lookup

Automatically reference IRS rules when needed during tax preparation.

## Automatic Activation
Invoke when:
- Uncertain about deduction eligibility
- Need to verify income reporting requirements
- Calculating complex credits
- Determining form applicability
- Validating data entry

## Knowledge Sources
1. IRS Publications (saved locally)
2. IRS.gov website (live lookup)
3. Form instructions
4. Tax code references

## Common Lookups

### Deduction Rules
- Publication 502: Medical expenses
- Publication 936: Mortgage interest
- Publication 526: Charitable contributions
- Publication 529: Miscellaneous deductions

### Income Reporting
- Publication 525: Taxable income
- Publication 550: Investment income
- Publication 334: Small business
- Publication 527: Residential rental

### Credits
- Publication 972: Child tax credit
- Publication 970: Education credits
- Publication 596: Earned income credit

### Special Situations
- Publication 54: Foreign earned income
- Publication 555: Community property
- Publication 544: Sales and dispositions

## Output Format
Provide:
- Rule summary
- Applicable limitations
- Documentation requirements
- Form references
- Examples
```

#### 2.4 deduction-optimizer

**Purpose:** Automatically suggest deduction opportunities

**Location:** `.claude/skills/deduction-optimizer/SKILL.md`

```markdown
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

## Optimization Strategies

### 1. Itemized vs Standard Deduction
Calculate both and recommend higher amount.

### 2. Above-the-line Deductions
- Traditional IRA contributions (up to $7,000/$8,000)
- HSA contributions (up to $4,150/$8,300)
- Student loan interest (up to $2,500)
- Self-employment tax (50%)
- Self-employed health insurance
- Educator expenses ($300)

### 3. Business Deductions (Schedule C)
- Home office deduction
- Vehicle expenses (standard mileage or actual)
- Supplies and equipment
- Professional services
- Advertising and marketing
- Travel and meals (50% limit)
- Depreciation (Section 179, bonus depreciation)

### 4. Rental Property (Schedule E)
- Mortgage interest
- Property taxes
- Insurance
- Repairs and maintenance
- Depreciation (27.5 years)
- Management fees
- Utilities

### 5. Investment Expenses
- Investment interest expense
- Margin interest
- Tax preparation fees (for investment-related)

### 6. Timing Strategies
- Bunching deductions
- Accelerating/deferring income
- Capital loss harvesting
- Retirement contribution timing

## Output Format
```json
{
  "currentDeductions": 15000,
  "standardDeduction": 29200,
  "recommendation": "Use standard deduction",
  "missedOpportunities": [
    {
      "category": "IRA Contribution",
      "potentialDeduction": 7000,
      "requirement": "Make contribution by April 15",
      "taxSavings": 1540
    }
  ],
  "totalPotentialSavings": 1540
}
```
```

---

### 3. Sub-Agents (Specialized Multi-Step Processors)

#### 3.1 tax-return-auditor

**Purpose:** Comprehensive return validation

**Location:** `.claude/agents/tax-return-auditor.md`

```markdown
---
name: tax-return-auditor
description: Performs comprehensive audits of completed tax returns for accuracy, compliance, and optimization. Invoke with "audit this return" or "review my taxes".
tools: [Bash, Read, Grep, WebFetch]
model: claude-sonnet-4-5
---

# Tax Return Auditor

You are a senior tax professional conducting quality audits on completed tax returns.

## Audit Scope

### Phase 1: Document Review
1. Inventory all forms included in return
2. Verify all required forms present
3. Check form versions match tax year
4. Review supporting schedules

### Phase 2: Data Validation
1. Personal information accuracy
   - SSNs match across all forms
   - Names spelled identically
   - Addresses consistent
   - Filing status appropriate

2. Income verification
   - All W-2s included
   - All 1099s reported
   - Business income reasonable
   - Investment income complete

3. Deduction scrutiny
   - Documentation requirements met
   - Limitations properly applied
   - Calculations correct
   - Categories appropriate

### Phase 3: Mathematical Verification
1. All arithmetic correct
2. Cross-form totals match
3. Carryovers calculated properly
4. Tax calculated correctly

### Phase 4: Compliance Check
1. All required disclosures made
2. Foreign account reporting
3. Cryptocurrency reporting
4. State nexus issues

### Phase 5: Optimization Review
1. All eligible credits claimed
2. Deductions maximized
3. Filing status optimized
4. Alternative strategies considered

### Phase 6: Risk Assessment
1. Audit risk factors
2. Unusual items flagged
3. Documentation gaps
4. Professional review needed

## Audit Report Format

```markdown
# Tax Return Audit Report
**Tax Year:** 2024
**Filing Status:** Married Filing Jointly
**Audit Date:** [date]

## Executive Summary
- Overall Status: PASS / FAIL / WARNING
- Critical Issues: [count]
- Warnings: [count]
- Recommendations: [count]

## Findings

### Critical Issues (Must Fix)
1. **Issue:** [description]
   - **Form:** [form reference]
   - **Impact:** [tax impact]
   - **Resolution:** [how to fix]

### Warnings (Should Review)
1. **Warning:** [description]
   - **Form:** [form reference]
   - **Risk Level:** Low/Medium/High
   - **Recommendation:** [suggested action]

### Optimization Opportunities
1. **Opportunity:** [description]
   - **Potential Savings:** $[amount]
   - **Action Required:** [what to do]
   - **Deadline:** [if applicable]

## Mathematical Verification
- [✓] All calculations verified correct
- [✓] Cross-form totals match
- [✓] Tax computed accurately

## Compliance Status
- [✓] All required forms included
- [✓] All disclosures made
- [✓] No red flags identified

## Risk Assessment
- **Audit Risk:** Low / Medium / High
- **Factors:** [risk factors identified]
- **Mitigation:** [steps to reduce risk]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Sign-Off
This audit was performed autonomously by Claude Code. Professional tax advisor review is recommended before filing.
```

## Audit Process

1. Load current Redux state
2. Generate forms using create1040()
3. Validate each form individually
4. Cross-validate between forms
5. Check against supporting documents
6. Calculate alternative scenarios
7. Generate detailed report
8. Provide actionable recommendations

## Error Categories

**Critical (Must Fix):**
- Mathematical errors
- Missing required forms
- Invalid data
- Compliance violations

**Warning (Should Review):**
- Unusual amounts
- Missing documentation
- Optimization missed
- Audit risk factors

**Info (Nice to Have):**
- Filing tips
- Future planning
- Record keeping suggestions
```

#### 3.2 deduction-researcher

**Purpose:** Deep research on specific deduction rules

**Location:** `.claude/agents/deduction-researcher.md`

```markdown
---
name: deduction-researcher
description: Conducts in-depth research on specific tax deductions, IRS rules, and case law. Invoke when detailed deduction analysis is needed.
tools: [Bash, Read, WebFetch, Grep]
model: claude-sonnet-4-5
---

# Deduction Researcher

You are a tax research specialist focusing on deduction eligibility and optimization.

## Research Process

### 1. Deduction Identification
- Understand the expense category
- Identify applicable IRS forms
- Locate relevant publications
- Find form instructions

### 2. Rule Analysis
- Eligibility requirements
- Income limitations
- Phase-out ranges
- Documentation needs
- Timing rules

### 3. Limitation Calculation
- Percentage limitations (e.g., 7.5% AGI for medical)
- Dollar limitations (e.g., $10,000 SALT cap)
- Phase-out calculations
- Carryover rules

### 4. Documentation Requirements
- What records to keep
- How long to retain
- What constitutes proof
- Special substantiation rules

### 5. Planning Strategies
- Timing optimization
- Bunching strategies
- Coordination with other deductions
- Alternative approaches

## Research Sources
1. IRS Publications
2. Form Instructions
3. Tax Code (IRC)
4. IRS Revenue Rulings
5. Tax Court Cases
6. IRS FAQs and Notices

## Output Format

```markdown
# Deduction Research Report: [Deduction Name]

## Summary
- **Deduction Type:** [category]
- **Applicable Forms:** [forms]
- **Maximum Benefit:** $[amount]
- **Eligibility:** [requirements]

## Detailed Rules

### Eligibility Requirements
1. [Requirement 1]
2. [Requirement 2]

### Limitations
- **Income Phase-out:** [if applicable]
- **Percentage Limit:** [if applicable]
- **Dollar Cap:** [if applicable]

### Documentation Required
- [Doc 1]
- [Doc 2]

### Special Considerations
- [Consideration 1]
- [Consideration 2]

## Calculations

### Current Situation
- Expense Amount: $[amount]
- AGI: $[agi]
- Phase-out Applied: $[amount]
- **Deductible Amount: $[final]**

### Tax Benefit
- Tax Bracket: [%]
- **Tax Savings: $[savings]**

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## References
- [IRS Publication XXX]
- [Form XXXX Instructions]
- [IRC Section XXX]
```

## Example Research Topics
- Home office deduction eligibility
- Business vs. hobby determination
- Rental property loss limitations
- Passive activity loss rules
- At-risk limitations
- Qualified Business Income (QBI) deduction
- Educator expense deduction
- Moving expense deduction (military)
```

#### 3.3 form-filler

**Purpose:** Specialized form completion

**Location:** `.claude/agents/form-filler.md`

```markdown
---
name: form-filler
description: Specializes in accurate completion of IRS forms with proper field mapping and calculation. Invoke when populating specific forms or troubleshooting form issues.
tools: [Bash, Read, Write]
model: claude-sonnet-4-5
---

# Form Filler Specialist

You are an IRS form completion expert. You populate Redux state to generate accurate tax forms.

## Capabilities

### Form Knowledge
Deep understanding of all 39 implemented federal forms:
- F1040 (main form)
- Schedules (A, B, C, D, E, SE, EIC, R, 1, 2, 3, 8812)
- Supporting forms (8949, 8889, 8959, 8960, 6251, etc.)

### Data Mapping
Map extracted document data to Redux actions:

**W-2 → addW2 Action:**
```typescript
{
  occupation: string,
  income: number,
  medicareIncome: number,
  fedWithholding: number,
  ssWages: number,
  ssWithholding: number,
  medicareWithholding: number,
  employer: {
    EIN: string,
    employerName: string,
    address: Address
  },
  personRole: PersonRole,
  state?: State,
  stateWages?: number,
  stateWithholding?: number
}
```

**1099-INT → add1099 Action:**
```typescript
{
  form: 'INT',
  form1099Int: {
    payer: string,
    income: number,
    usSavingsBondsInterest?: number,
    taxExemptInterest?: number
  },
  personRole: PersonRole
}
```

### Validation
- AJV schema validation before dispatch
- Cross-field validation
- Range checking
- Required field verification

### Calculation Verification
- Verify form calculations
- Check cross-form totals
- Validate against IRS worksheets
- Test edge cases

## Form Completion Process

### 1. Data Collection
Gather all information needed for specific form

### 2. Redux Action Dispatch
```typescript
// Example: Adding W-2
import { addW2 } from 'ustaxes/redux/actions'

const w2Data: IncomeW2 = {
  occupation: "Software Engineer",
  income: 120000,
  medicareIncome: 120000,
  fedWithholding: 18000,
  ssWages: 120000,
  ssWithholding: 7440,
  medicareWithholding: 1740,
  employer: {
    EIN: "12-3456789",
    employerName: "Tech Company",
    address: {
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94105"
    }
  },
  personRole: PersonRole.PRIMARY
}

dispatch(addW2(w2Data))
```

### 3. Validation
Verify action succeeded and state updated

### 4. Form Generation
Test form generation with current state

### 5. Visual Verification
Compare generated PDF to expected output

## Error Handling

### Common Issues
1. **Validation Failure**
   - Check required fields
   - Verify data types
   - Review field constraints

2. **Calculation Error**
   - Trace through form logic
   - Check dependent fields
   - Verify worksheet calculations

3. **PDF Generation Error**
   - Verify form isNeeded()
   - Check field count
   - Review field types

## Supported Forms Checklist

### Income Forms
- [✓] W-2 (IncomeW2)
- [✓] 1099-INT (interest)
- [✓] 1099-DIV (dividends)
- [✓] 1099-B (broker transactions)
- [✓] 1099-R (retirement distributions)
- [✓] 1099-MISC/NEC (misc income)
- [✓] 1099-SSA (social security)
- [✓] Schedule C (self-employment)
- [✓] Schedule E (rental income)
- [✓] Schedule K-1 (partnership)

### Deduction Forms
- [✓] Schedule A (itemized deductions)
- [✓] 1098-E (student loan interest)
- [✓] 8889 (HSA)
- [✓] IRA contributions

### Credit Forms
- [✓] Schedule 8812 (child tax credit)
- [✓] Schedule EIC (earned income credit)
- [✓] 8863 (education credits)
- [✓] Various residential energy credits

### Special Forms
- [✓] Schedule D (capital gains)
- [✓] 8949 (investment transactions)
- [✓] 6251 (AMT)
- [✓] 8960 (NIIT)
- [✓] 8959 (additional Medicare tax)
- [✓] Schedule SE (self-employment tax)
```

#### 3.4 question-asker

**Purpose:** Intelligent clarifying questions

**Location:** `.claude/agents/question-asker.md`

```markdown
---
name: question-asker
description: Asks intelligent, context-aware questions to gather missing tax information. Automatically invoked when data gaps are identified.
tools: [Read]
model: claude-sonnet-4-5
---

# Question Asker

You ask intelligent, context-aware questions to gather missing tax information.

## Question Strategy

### 1. Prioritization
Ask questions in order of:
1. Critical (blocking form generation)
2. High value (significant tax impact)
3. Optimization (potential savings)
4. Nice-to-have (completeness)

### 2. Context Awareness
Tailor questions based on:
- Available information
- Document analysis results
- Tax situation complexity
- Previously answered questions

### 3. Batch Related Questions
Group related questions together:
- All questions about dependents
- All questions about a specific income source
- All questions about deduction category

### 4. Provide Context
For each question, explain:
- Why the information is needed
- How it affects the return
- What happens if not provided
- Where to find the information

## Question Templates

### Personal Information
```
I need some information about [taxpayer/spouse/dependent]:

1. **Date of Birth:** [Why needed]
2. **Social Security Number:** [Why needed]
3. **Relationship:** [Why needed]

This information is required for [form/credit/purpose].
```

### Income Questions
```
I found [income source] but need clarification:

1. **Is this employment income or self-employment?**
   - This determines whether to use W-2 or Schedule C

2. **Were there any pre-tax deductions?**
   - Examples: 401(k), health insurance, HSA

3. **Did you have multiple jobs in [year]?**
   - Need all W-2s for accurate reporting
```

### Deduction Questions
```
To maximize your deductions, I need to know:

1. **Did you itemize deductions last year?**
   - Your standard deduction is $[amount]
   - Your itemized total is currently $[amount]

2. **Do you have documentation for these expenses?**
   - [Expense category]: $[amount]
   - Receipts/records needed: [list]

3. **Are there any expenses you haven't mentioned?**
   - Medical expenses over $[threshold]
   - Charitable contributions
   - State/local taxes (up to $10,000)
```

### Clarification Questions
```
I need clarification on [item]:

**What I see:** [extracted value]
**What I need:** [expected format/range]
**Example:** [example of correct format]

This is for [form line] on [form name].
```

## Question Formats

### Multiple Choice
```
**Filing Status:** Which best describes your situation?
a) Single
b) Married Filing Jointly
c) Married Filing Separately
d) Head of Household
e) Qualifying Widow(er)

[Explain each option briefly]
```

### Yes/No with Follow-up
```
**Do you have any dependents?**
- Yes → How many? [Follow-up questions]
- No → [Continue to next section]
```

### Open-Ended with Guidance
```
**Please list all sources of income in 2024:**

Include:
- W-2 wage income
- Self-employment income
- Investment income (interest, dividends, capital gains)
- Retirement distributions
- Rental income
- Other income

For each source, provide:
1. Type of income
2. Amount
3. Document reference (if available)
```

### Conditional Questions
```
**Since you reported self-employment income:**

1. Did you pay estimated taxes? [Yes/No]
   - If yes: How much per quarter?

2. Do you have a home office? [Yes/No]
   - If yes: Square footage and home percentage?

3. Did you use your vehicle for business? [Yes/No]
   - If yes: Total miles and business miles?
```

## Question Flow Example

```
Phase 1: Essential Information
├─ Personal information (name, SSN, DOB, address)
├─ Filing status
└─ Dependents

Phase 2: Income Sources
├─ Employment income (W-2s)
├─ Self-employment income (Schedule C)
├─ Investment income (1099s)
└─ Other income

Phase 3: Deductions & Credits
├─ Standard vs itemized
├─ Above-the-line deductions
├─ Child tax credit eligibility
└─ Education credits

Phase 4: Payments & Refund
├─ Withholding verification
├─ Estimated tax payments
└─ Refund preferences

Phase 5: Final Review
├─ Confirm all information
├─ Missing documents
└─ Special situations
```

## Output Format

Present questions in conversational, easy-to-understand format:

```markdown
## Let's Complete Your Tax Return

I've analyzed your documents and need some additional information.

### Personal Information

**1. Confirm Your Filing Status**
Based on your situation, you appear to be [detected status]. Is this correct?
- If married, are you filing jointly or separately?

**2. Dependents**
You mentioned [number] dependents. For each dependent, I need:
- Full name
- Social Security Number
- Date of birth
- Relationship to you
- Months lived with you in 2024

### Income Verification

**3. W-2 Verification**
I found income of $[amount] from [employer].
- Is this your only job in 2024?
- Did you have any other W-2s?

[Continue with remaining questions...]

---

**Note:** You can answer these questions all at once or one at a time. I'll save your progress as we go.
```
```

---

### 4. MCP Servers (Domain-Specific Tools)

#### 4.1 tax-document-parser MCP

**Purpose:** OCR and document extraction as an external service

**Location:** `.claude/mcp/tax-document-parser/`

**Package Structure:**
```
tax-document-parser/
├── package.json
├── src/
│   ├── index.ts (main server)
│   ├── parsers/
│   │   ├── w2Parser.ts
│   │   ├── f1099Parser.ts
│   │   ├── receiptParser.ts
│   │   └── bankStatementParser.ts
│   ├── ocr/
│   │   └── tesseractWrapper.ts
│   └── validators/
│       └── dataValidator.ts
└── README.md
```

**Server Implementation:** `src/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "tax-document-parser",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "parse_tax_document",
      description: "Extract structured data from tax documents (W-2, 1099, receipts)",
      inputSchema: {
        type: "object",
        properties: {
          document_path: {
            type: "string",
            description: "Path to document file (PDF or image)",
          },
          document_type: {
            type: "string",
            description: "Document type (W2, 1099-INT, 1099-DIV, etc.)",
            enum: ["W2", "1099-INT", "1099-DIV", "1099-B", "1099-R", "1099-MISC", "receipt", "auto"],
          },
          tax_year: {
            type: "number",
            description: "Tax year (e.g., 2024)",
          },
        },
        required: ["document_path"],
      },
    },
    {
      name: "batch_parse_documents",
      description: "Parse multiple tax documents in batch",
      inputSchema: {
        type: "object",
        properties: {
          document_directory: {
            type: "string",
            description: "Directory containing tax documents",
          },
          file_pattern: {
            type: "string",
            description: "File pattern to match (e.g., *.pdf)",
          },
        },
        required: ["document_directory"],
      },
    },
    {
      name: "validate_extracted_data",
      description: "Validate extracted tax data against IRS rules",
      inputSchema: {
        type: "object",
        properties: {
          data: {
            type: "object",
            description: "Extracted tax data to validate",
          },
          data_type: {
            type: "string",
            description: "Type of data (W2, 1099, etc.)",
          },
        },
        required: ["data", "data_type"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "parse_tax_document") {
    const { document_path, document_type, tax_year } = args;

    // OCR and extraction logic here
    const extractedData = await parseTaxDocument(
      document_path,
      document_type || "auto",
      tax_year
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(extractedData, null, 2),
        },
      ],
    };
  }

  if (name === "batch_parse_documents") {
    const { document_directory, file_pattern } = args;

    const results = await batchParseDocuments(
      document_directory,
      file_pattern || "*.pdf"
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  if (name === "validate_extracted_data") {
    const { data, data_type } = args;

    const validationResult = await validateData(data, data_type);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(validationResult, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Parser implementation
async function parseTaxDocument(
  documentPath: string,
  documentType: string,
  taxYear?: number
) {
  // 1. Load document
  // 2. If image, run OCR
  // 3. Extract text
  // 4. Parse based on document type
  // 5. Map to UsTaxes data model
  // 6. Validate
  // 7. Return structured data

  return {
    documentType,
    taxYear: taxYear || detectTaxYear(),
    extractedData: {},
    confidence: {},
    ambiguities: [],
    validationErrors: [],
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

**Configuration:** `.claude/settings.json`

```json
{
  "mcp": {
    "tax-document-parser": {
      "transport": "stdio",
      "command": "node",
      "args": ["/mnt/nas/data/code/forks/UsTaxes/.claude/mcp/tax-document-parser/dist/index.js"]
    }
  }
}
```

#### 4.2 irs-rules-engine MCP

**Purpose:** Query IRS rules, publications, and form instructions

**Server Tools:**
- `lookup_deduction_rule(deduction_type, tax_year)` - Get deduction rules
- `lookup_credit_rule(credit_type, tax_year)` - Get credit rules
- `lookup_income_reporting(income_type, tax_year)` - Income reporting requirements
- `lookup_form_instructions(form_name, tax_year)` - Form instructions
- `search_publications(query)` - Search IRS publications
- `get_tax_brackets(filing_status, tax_year)` - Current tax brackets
- `get_standard_deduction(filing_status, tax_year)` - Standard deduction amounts

#### 4.3 form-validator MCP

**Purpose:** Validate forms for IRS compliance

**Server Tools:**
- `validate_form(form_data, form_type)` - Validate individual form
- `validate_return(complete_return)` - Validate entire return
- `check_math(form_data, form_type)` - Verify calculations
- `check_consistency(forms_list)` - Cross-form validation
- `estimate_audit_risk(return_data)` - Risk assessment

#### 4.4 tax-calculation MCP

**Purpose:** Complex tax calculations

**Server Tools:**
- `calculate_ordinary_tax(taxable_income, filing_status)` - Tax from brackets
- `calculate_amt(return_data)` - Alternative minimum tax
- `calculate_niit(investment_income, agi)` - Net investment income tax
- `calculate_self_employment_tax(net_income)` - SE tax
- `calculate_qbi_deduction(qbi, taxable_income)` - Qualified business income
- `calculate_eic(agi, dependents, filing_status)` - Earned income credit

---

### 5. Hooks (Automatic Workflow Integration)

#### 5.1 Hook Configuration

**Location:** `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash .claude/hooks/validate-bash-safety.sh"
      },
      {
        "matcher": "Read",
        "command": "bash .claude/hooks/check-pii-access.sh"
      },
      {
        "matcher": "Write",
        "command": "bash .claude/hooks/validate-write-location.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "command": "bash .claude/hooks/log-operation.sh"
      }
    ],
    "UserPromptSubmit": [
      {
        "command": "bash .claude/hooks/inject-tax-context.sh"
      }
    ],
    "SessionStart": [
      {
        "command": "bash .claude/hooks/load-tax-session.sh"
      }
    ],
    "SessionEnd": [
      {
        "command": "bash .claude/hooks/save-tax-session.sh"
      }
    ]
  }
}
```

#### 5.2 Hook Scripts

**validate-bash-safety.sh** - Prevent dangerous commands

```bash
#!/bin/bash
# .claude/hooks/validate-bash-safety.sh

# Get the command from Claude
COMMAND="$1"

# Block dangerous patterns
if [[ "$COMMAND" =~ rm[[:space:]]+-rf|sudo|shutdown|reboot ]]; then
  echo "BLOCK: Dangerous command detected"
  exit 2
fi

# Block path traversal
if [[ "$COMMAND" =~ \.\./|~/ ]]; then
  echo "BLOCK: Path traversal detected"
  exit 2
fi

# Allow command
exit 0
```

**check-pii-access.sh** - Log access to sensitive data

```bash
#!/bin/bash
# .claude/hooks/check-pii-access.sh

FILE_PATH="$1"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log all file access
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"file_read\",\"path\":\"$FILE_PATH\"}" \
  >> /tmp/tax-file-access.jsonl

# Allow access
exit 0
```

**log-operation.sh** - Comprehensive operation logging

```bash
#!/bin/bash
# .claude/hooks/log-operation.sh

TOOL_NAME="$1"
TOOL_INPUT="$2"
TOOL_OUTPUT="$3"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

LOG_ENTRY=$(jq -n \
  --arg timestamp "$TIMESTAMP" \
  --arg tool "$TOOL_NAME" \
  --arg input "$TOOL_INPUT" \
  --arg output "$TOOL_OUTPUT" \
  '{timestamp: $timestamp, tool: $tool, input: $input, output: $output}')

echo "$LOG_ENTRY" >> /tmp/tax-operations.jsonl

exit 0
```

**inject-tax-context.sh** - Add tax year context

```bash
#!/bin/bash
# .claude/hooks/inject-tax-context.sh

# Read current tax year from Redux state
TAX_YEAR=$(node -e "
  const fs = require('fs');
  try {
    const state = JSON.parse(fs.readFileSync('tax-state.json'));
    console.log(state.activeYear || '2024');
  } catch {
    console.log('2024');
  }
")

# Inject context
echo "Context: Working on $TAX_YEAR tax return"

exit 0
```

**load-tax-session.sh** - Load session state

```bash
#!/bin/bash
# .claude/hooks/load-tax-session.sh

if [ -f /tmp/tax-session.json ]; then
  echo "Restored previous tax preparation session"
  cat /tmp/tax-session.json
fi

exit 0
```

**save-tax-session.sh** - Save session state

```bash
#!/bin/bash
# .claude/hooks/save-tax-session.sh

# Save current Redux state to session file
if [ -f tax-state.json ]; then
  cp tax-state.json /tmp/tax-session.json
  echo "Tax session saved"
fi

exit 0
```

---

### 6. Project Context (.claude/CLAUDE.md)

**Location:** `.claude/CLAUDE.md`

```markdown
# UsTaxes - Autonomous Tax Preparation with Claude Code

## Project Overview

This is the **Claude Code Tax Automation Layer** for UsTaxes, an open-source federal tax filing application. This layer enables autonomous tax return completion through document analysis, intelligent questioning, and programmatic form generation.

## Core Principles

### 1. Compliance First
- **All output MUST comply with current IRS guidelines**
- When uncertain about rules, reference IRS.gov or invoke irs-rule-lookup skill
- Flag any ambiguities that require professional tax advisor review
- Never make up tax rules or guidance

### 2. Data Security & Privacy
- Treat all financial and personal data as highly sensitive
- Never log SSNs, EINs, or full bank account numbers in plain text
- All file access is logged via hooks
- Use encryption for data at rest and in transit
- Follow PII handling guidelines in global CLAUDE.md

### 3. Accuracy & Validation
- Validate all extracted data against AJV schemas before dispatching Redux actions
- Cross-validate data across multiple sources when available
- Flag mathematical discrepancies
- Generate comprehensive audit trails

### 4. User Experience
- Ask questions in context with clear explanations
- Batch related questions together
- Provide progress indicators
- Explain all recommendations and decisions

## Architecture

### Tech Stack
- **Frontend:** React 17 + Material-UI 4
- **State:** Redux with redux-persist (localStorage)
- **Desktop:** Tauri (cross-platform)
- **PDF:** pdf-lib (client-side generation)
- **Validation:** AJV (JSON schema)

### Data Flow
```
Documents → Extract → Validate → Redux Actions → State → Form Generation → PDF
```

### Redux State Structure
```typescript
interface Information {
  taxPayer: TaxPayer           // Personal info, filing status
  w2s: IncomeW2[]              // W-2 wage income
  f1099s: Supported1099[]      // Various 1099 forms
  realEstate: Property[]       // Rental properties
  f1098es: F1098e[]           // Student loan interest
  itemizedDeductions?: ItemizedDeductions
  credits: Credit[]
  healthSavingsAccounts: HealthSavingsAccount[]
  individualRetirementArrangements: Ira[]
  questions: Responses         // Yes/no questions (foreign accounts, crypto)
  refund?: Refund
  // ... more fields
}
```

## Available Claude Code Features

### Slash Commands
- `/extract-documents [path] [type]` - Parse tax documents
- `/prepare-return [year]` - Complete tax return workflow
- `/validate-return [year]` - Audit and validate return
- `/estimate-taxes [income] [status]` - Quick tax estimate
- `/optimize-deductions` - Find deduction opportunities

### Skills (Autonomous)
- **tax-document-analyzer** - Automatically parse documents when provided
- **tax-liability-calculator** - Calculate taxes when data is complete
- **irs-rule-lookup** - Reference IRS rules as needed
- **deduction-optimizer** - Suggest legitimate deductions

### Sub-Agents (Specialized)
- **tax-return-auditor** - Comprehensive return validation
- **deduction-researcher** - Deep research on specific deductions
- **form-filler** - Accurate form completion
- **question-asker** - Intelligent clarifying questions

### MCP Servers
- **tax-document-parser** - OCR and document extraction
- **irs-rules-engine** - IRS rule and publication queries
- **form-validator** - Compliance checking
- **tax-calculation** - Complex tax calculations

### Hooks
- PreToolUse: Validate bash safety, check PII access
- PostToolUse: Log all operations
- UserPromptSubmit: Inject tax context
- SessionStart: Restore previous session
- SessionEnd: Save session state

## Directory Structure

```
/mnt/nas/data/code/forks/UsTaxes/
├── src/
│   ├── redux/              # Redux actions and reducers
│   │   ├── actions.ts      # 50+ action creators
│   │   ├── reducer.ts      # State management
│   │   └── data.ts         # Type definitions
│   ├── core/
│   │   └── data/
│   │       ├── index.ts    # Data models (Information, Person, etc.)
│   │       └── validate.ts # AJV validators
│   ├── forms/
│   │   └── Y2024/
│   │       └── irsForms/   # 39 federal form implementations
│   │           ├── F1040.ts
│   │           ├── ScheduleA-E.ts
│   │           └── ...
│   └── components/         # React UI components
│
├── .claude/
│   ├── CLAUDE.md          # This file
│   ├── settings.json      # Project configuration
│   ├── commands/          # Slash commands
│   ├── skills/            # Autonomous skills
│   ├── agents/            # Sub-agents
│   ├── hooks/             # Hook scripts
│   └── mcp/               # MCP servers
│
└── public/forms/          # Blank IRS PDF forms
    └── Y2024/
```

## Redux Action Reference

### Key Actions for Automation

**Personal Information:**
```typescript
savePrimaryPersonInfo(person: PrimaryPerson)
saveContactInfo(contact: ContactInfo)
saveFilingStatusInfo(status: FilingStatus)
addDependent(dependent: Dependent)
addSpouse(spouse: Spouse)
```

**Income:**
```typescript
addW2(w2: IncomeW2)
add1099(form1099: Supported1099)
addProperty(property: Property)
```

**Deductions:**
```typescript
setItemizedDeductions(deductions: ItemizedDeductions)
add1098e(f1098e: F1098e)
addHSA(hsa: HealthSavingsAccount)
addIRA(ira: Ira)
```

**Other:**
```typescript
answerQuestion(question: string, answer: boolean)
saveRefundInfo(refund: Refund)
```

All actions are exported from `src/redux/actions.ts`.

## Form Generation

To generate tax forms programmatically:

```typescript
import { create1040 } from 'src/forms/Y2024/irsForms/Main'
import { create1040PDFs } from 'src/forms/Y2024/irsForms/index'

// Validate and create form objects
const result = create1040(state.Y2024, assets)

// Generate PDF
if (result.isRight()) {
  const [validatedInfo, forms] = result.value
  const pdfBytes = await create1040PDFs(state, assets)
  // Save PDF bytes
}
```

## Validation

All data MUST be validated before dispatch:

```typescript
import * as validators from 'ustaxes/core/data/validate'

// Validate W-2 data
if (validators.incomeW2(w2Data)) {
  dispatch(addW2(w2Data))
} else {
  // Handle validation error
}
```

## Tax Year Support

Currently supports tax years 2019-2024 (6 years).
Default to 2024 unless user specifies otherwise.

## IRS Form Reference

39 federal forms implemented for 2024:
- **Main:** F1040, F1040-V
- **Schedules:** A, B, C, D, E, SE, EIC, R, 1, 2, 3, 8812
- **Supporting:** 8949, 8889, 8959, 8960, 6251, 8995, and more

All forms extend `Form` base class with:
- `isNeeded()` - Whether form should be included
- `fields()` - Array of field values in PDF order
- Calculation methods for each line

## Workflow Example

1. **User provides documents** → Invoke tax-document-analyzer skill
2. **Extract data** → Map to Redux action payloads
3. **Validate** → Use AJV validators
4. **Dispatch actions** → Update Redux state
5. **Identify gaps** → Invoke question-asker agent
6. **Complete forms** → Invoke form-filler agent
7. **Audit** → Invoke tax-return-auditor agent
8. **Generate PDF** → Call create1040PDFs()

## Memory Integration

Use the existing memory MCP to:
- Store IRS rules and guidance
- Track document processing state
- Maintain audit trails across sessions
- Remember user preferences

Tag memory entries appropriately:
- `["tax", "irs-rule", "deduction"]`
- `["tax", "document", "w2", "2024"]`
- `["tax", "audit-trail", "session-123"]`

## Important Notes

### What NOT to Do
- ❌ Don't make up tax rules or guidance
- ❌ Don't store SSNs in logs or memory
- ❌ Don't dispatch unvalidated data
- ❌ Don't guarantee audit protection
- ❌ Don't provide legal advice

### What TO Do
- ✅ Validate all data before dispatch
- ✅ Reference IRS publications
- ✅ Ask clarifying questions
- ✅ Flag unusual situations
- ✅ Generate audit trails
- ✅ Recommend professional review when appropriate

## Testing

Test with sample data before real returns:
```bash
npm run test
```

Generate test return:
```bash
/prepare-return 2024 "Test Taxpayer"
```

## Disclaimers

All generated tax returns are **DRAFTS** and should be reviewed by a qualified tax professional before filing. This system:
- Does NOT replace professional tax advice
- Does NOT guarantee audit protection
- Does NOT guarantee accuracy
- Is provided as-is for automation assistance

Users are responsible for the accuracy and completeness of their filed returns.

## Support

For issues with Claude Code integration:
- Review this document
- Check `.claude/` configuration files
- Review hook logs: `/tmp/tax-*.log`
- Check MCP server status

For issues with UsTaxes application:
- See project README.md
- Review ARCHITECTURE.md
- Check GitHub issues

---

**Last Updated:** 2025-11-27
**Claude Code Version:** Latest
**UsTaxes Version:** 2024
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

#### Goals
- Set up basic Claude Code structure
- Implement core slash commands
- Create basic document parsing skill
- Establish hook infrastructure

#### Deliverables
1. `.claude/CLAUDE.md` - Project context document
2. `.claude/settings.json` - Configuration
3. `.claude/commands/` - Initial slash commands
   - `extract-documents.md`
   - `estimate-taxes.md`
4. `.claude/skills/tax-document-analyzer/` - Basic document parsing
5. `.claude/hooks/` - Basic hook scripts
   - `log-operation.sh`
   - `validate-bash-safety.sh`
6. Test with sample W-2 parsing

#### Success Criteria
- ✅ Can extract data from W-2 PDF
- ✅ Can validate extracted data
- ✅ Can dispatch Redux action
- ✅ Hooks log operations correctly

---

### Phase 2: Intelligence (Weeks 3-4)

#### Goals
- Implement autonomous skills
- Create specialized sub-agents
- Build question-asking capabilities
- Add comprehensive validation

#### Deliverables
1. `.claude/skills/` - Additional skills
   - `tax-liability-calculator/`
   - `irs-rule-lookup/`
   - `deduction-optimizer/`
2. `.claude/agents/` - Sub-agents
   - `tax-return-auditor.md`
   - `form-filler.md`
   - `question-asker.md`
3. `.claude/commands/` - Advanced commands
   - `prepare-return.md`
   - `validate-return.md`
   - `optimize-deductions.md`
4. Support for multiple document types (1099s, receipts)
5. Intelligent question generation

#### Success Criteria
- ✅ Can parse W-2s and 1099s
- ✅ Can ask clarifying questions
- ✅ Can complete simple return (W-2 only)
- ✅ Audit agent validates return
- ✅ Generates valid PDF

---

### Phase 3: MCP Integration (Weeks 5-6)

#### Goals
- Build custom MCP servers
- Integrate external services
- Add advanced document processing
- Implement comprehensive validation

#### Deliverables
1. `.claude/mcp/tax-document-parser/` - Document extraction MCP
   - OCR integration (Tesseract)
   - PDF parsing
   - Image processing
   - Batch processing
2. `.claude/mcp/irs-rules-engine/` - Tax rule lookup MCP
   - IRS publication database
   - Form instructions
   - Rule queries
3. `.claude/mcp/form-validator/` - Compliance checking MCP
   - Form validation
   - Cross-form checks
   - Audit risk assessment
4. Integration tests
5. Performance optimization

#### Success Criteria
- ✅ OCR extracts from images
- ✅ Can process 10+ documents in batch
- ✅ IRS rule lookups work
- ✅ Form validation catches errors
- ✅ <5 second document processing

---

### Phase 4: Complex Scenarios (Weeks 7-8)

#### Goals
- Handle complex tax situations
- Support all 39 federal forms
- Implement optimization strategies
- Add edge case handling

#### Deliverables
1. Support for complex forms:
   - Schedule C (self-employment)
   - Schedule E (rental income)
   - Schedule D + 8949 (capital gains)
   - Schedule A (itemized deductions)
2. `.claude/agents/deduction-researcher.md` - Deep research agent
3. Advanced optimization logic
4. Edge case handlers
5. Comprehensive test suite

#### Success Criteria
- ✅ Can complete Schedule C return
- ✅ Can handle rental property
- ✅ Can process stock transactions
- ✅ Optimizes itemized vs standard
- ✅ 95%+ accuracy on test returns

---

### Phase 5: Polish & Distribution (Weeks 9-10)

#### Goals
- Package as plugin
- Create comprehensive documentation
- Add error recovery
- Performance tuning

#### Deliverables
1. `.claude-plugin/` - Plugin package
   - `plugin.json` - Manifest
   - All commands, skills, agents
   - MCP servers
   - Documentation
2. User documentation
   - Getting started guide
   - Command reference
   - Troubleshooting guide
   - FAQ
3. Developer documentation
   - Architecture guide
   - Extension guide
   - API reference
4. Performance optimization
5. Error recovery mechanisms

#### Success Criteria
- ✅ Plugin installs cleanly
- ✅ Documentation complete
- ✅ 10 successful test returns
- ✅ Error recovery works
- ✅ Ready for distribution

---

## File Structure Summary

```
/mnt/nas/data/code/forks/UsTaxes/
│
├── .claude/
│   ├── CLAUDE.md                          # Project context (this plan)
│   ├── settings.json                      # Configuration & hooks
│   │
│   ├── commands/                          # Slash commands
│   │   ├── extract-documents.md
│   │   ├── prepare-return.md
│   │   ├── validate-return.md
│   │   ├── estimate-taxes.md
│   │   └── optimize-deductions.md
│   │
│   ├── skills/                            # Autonomous skills
│   │   ├── tax-document-analyzer/
│   │   │   ├── SKILL.md
│   │   │   ├── irs-form-structures.json
│   │   │   └── validation-rules.json
│   │   ├── tax-liability-calculator/
│   │   │   ├── SKILL.md
│   │   │   └── tax-brackets-2024.json
│   │   ├── irs-rule-lookup/
│   │   │   └── SKILL.md
│   │   └── deduction-optimizer/
│   │       └── SKILL.md
│   │
│   ├── agents/                            # Sub-agents
│   │   ├── tax-return-auditor.md
│   │   ├── deduction-researcher.md
│   │   ├── form-filler.md
│   │   └── question-asker.md
│   │
│   ├── hooks/                             # Hook scripts
│   │   ├── validate-bash-safety.sh
│   │   ├── check-pii-access.sh
│   │   ├── log-operation.sh
│   │   ├── inject-tax-context.sh
│   │   ├── load-tax-session.sh
│   │   └── save-tax-session.sh
│   │
│   └── mcp/                               # MCP servers
│       ├── tax-document-parser/
│       │   ├── package.json
│       │   └── src/
│       │       ├── index.ts
│       │       └── parsers/
│       ├── irs-rules-engine/
│       │   ├── package.json
│       │   └── src/
│       │       └── index.ts
│       ├── form-validator/
│       │   ├── package.json
│       │   └── src/
│       │       └── index.ts
│       └── tax-calculation/
│           ├── package.json
│           └── src/
│               └── index.ts
│
└── .claude-plugin/                        # Plugin package (Phase 5)
    ├── plugin.json
    ├── README.md
    └── [all claude/ contents]
```

---

## Integration Patterns

### Pattern 1: Simple Document Extraction

```
User: "Here's my W-2: /path/to/w2.pdf"
  ↓
tax-document-analyzer skill (auto-invokes)
  ↓
Extract data → Validate → Return JSON
  ↓
User: "Add this to my return"
  ↓
form-filler agent
  ↓
dispatch(addW2(data))
  ↓
Confirm added to Redux state
```

### Pattern 2: Complete Return Workflow

```
User: "/prepare-return 2024"
  ↓
/prepare-return command
  ↓
Phase 1: Document Collection
├─ Ask for document location
├─ Batch parse all documents
└─ Extract all data
  ↓
Phase 2: question-asker agent
├─ Identify data gaps
├─ Generate questions
└─ Collect responses
  ↓
Phase 3: form-filler agent
├─ Validate all data
├─ Dispatch Redux actions
└─ Populate state
  ↓
Phase 4: Generate forms
├─ create1040(state)
└─ create1040PDFs()
  ↓
Phase 5: tax-return-auditor agent
├─ Validate completeness
├─ Check calculations
├─ Assess risk
└─ Generate report
  ↓
Present summary & PDF to user
```

### Pattern 3: Optimization Analysis

```
User: "/optimize-deductions"
  ↓
deduction-optimizer skill (auto)
  ↓
Analyze current state
  ↓
Calculate itemized vs standard
  ↓
Identify missed opportunities
  ↓
deduction-researcher agent (if needed)
├─ Deep dive into specific deductions
├─ IRS rule lookup
└─ Calculate potential savings
  ↓
Present recommendations with tax impact
```

---

## Testing Strategy

### Unit Tests
- Document parsers
- Data validators
- Redux action creators
- Form calculations

### Integration Tests
- End-to-end document processing
- Complete return generation
- Multi-form scenarios
- Edge cases

### Test Data
Create sample documents:
- Sample W-2s (various scenarios)
- Sample 1099s (INT, DIV, B, R)
- Sample receipts
- Sample bank statements
- Complete test returns

### Validation
- Compare generated PDFs to known-good returns
- Verify calculations against IRS worksheets
- Test with prior year returns
- Edge case validation

---

## Security Considerations

### Data Protection
1. **PII Handling**
   - Never log SSNs, EINs, account numbers
   - Mask sensitive data in logs
   - Encrypt data at rest
   - Clear sensitive data from memory

2. **File Access**
   - Validate all file paths
   - Prevent path traversal
   - Log all file access
   - Restrict write locations

3. **Command Execution**
   - Validate bash commands
   - Block dangerous operations
   - Sandbox execution
   - Log all commands

### Compliance
1. **IRS Requirements**
   - Follow IRS e-file specifications
   - Include all required disclosures
   - Maintain audit trails
   - Retain records per IRS guidelines

2. **Data Retention**
   - Keep session logs for 7 years
   - Archive completed returns
   - Document all decisions
   - Track all modifications

### Audit Trail
Log all operations:
- Document access
- Data extraction
- Redux actions dispatched
- Form generation
- Validation results
- User decisions

---

## Performance Targets

### Document Processing
- W-2 extraction: <2 seconds
- 1099 extraction: <2 seconds
- Receipt OCR: <3 seconds
- Batch 10 documents: <30 seconds

### Form Generation
- Simple return (W-2 only): <5 seconds
- Complex return (Schedule C, E, D): <10 seconds
- PDF generation: <3 seconds

### Validation
- Data validation: <1 second
- Form validation: <2 seconds
- Complete audit: <5 seconds

### Memory Usage
- Document parsing: <100MB
- Form generation: <50MB
- Total session: <200MB

---

## Future Enhancements

### Phase 6+ (Future)
1. **State Tax Returns**
   - State-specific forms
   - Multi-state returns
   - State credit calculations

2. **Advanced Optimization**
   - Multi-year planning
   - Roth conversion analysis
   - Estimated tax calculations
   - Tax loss harvesting

3. **Document Management**
   - Document storage
   - Receipt categorization
   - Document search
   - Audit documentation

4. **Collaboration**
   - Multi-user returns
   - Tax advisor review
   - Comments and notes
   - Version control

5. **Machine Learning**
   - Improved OCR accuracy
   - Deduction prediction
   - Audit risk prediction
   - Personalized recommendations

---

## Metrics & KPIs

### Accuracy
- Document extraction accuracy: >95%
- Calculation accuracy: >99%
- Form completion accuracy: >98%

### Efficiency
- Time to complete simple return: <15 minutes
- Time to complete complex return: <45 minutes
- Documents processed per hour: >50

### User Experience
- Questions asked: <20 for simple return
- Errors requiring user intervention: <3
- User satisfaction: >4.5/5

### Quality
- Validation error rate: <2%
- Audit risk: Low (>90% of returns)
- Professional review required: <10%

---

## Glossary

### Tax Terms
- **AGI:** Adjusted Gross Income
- **AMT:** Alternative Minimum Tax
- **EIC:** Earned Income Credit
- **HSA:** Health Savings Account
- **IRA:** Individual Retirement Arrangement
- **NIIT:** Net Investment Income Tax
- **QBI:** Qualified Business Income
- **SALT:** State and Local Taxes

### Form Abbreviations
- **F1040:** Main tax return form
- **Sch A:** Schedule A (itemized deductions)
- **Sch C:** Schedule C (self-employment)
- **Sch D:** Schedule D (capital gains)
- **Sch E:** Schedule E (rental income)
- **Sch SE:** Schedule SE (self-employment tax)

### Technical Terms
- **Redux Action:** Function that updates application state
- **AJV:** Another JSON Validator (schema validation library)
- **MCP:** Model Context Protocol
- **Skill:** Autonomous capability invoked by Claude
- **Sub-agent:** Specialized agent with separate context
- **Hook:** Automatic script execution on events

---

## Support & Resources

### Documentation
- This plan: `CLAUDE_CODE_TAX_AUTOMATION_PLAN.md`
- Project context: `.claude/CLAUDE.md`
- UsTaxes architecture: `ARCHITECTURE.md`
- UsTaxes README: `README.md`

### IRS Resources
- IRS Forms: https://www.irs.gov/forms-instructions
- IRS Publications: https://www.irs.gov/publications
- Tax Code: https://www.law.cornell.edu/uscode/text/26
- E-file Specs: https://www.irs.gov/e-file-providers

### Claude Code Resources
- Documentation: https://code.claude.com/docs
- GitHub: https://github.com/anthropics/claude-code
- MCP Specification: https://modelcontextprotocol.io

---

## Conclusion

This plan provides a comprehensive roadmap for building an autonomous tax preparation system using Claude Code and the UsTaxes application. The phased approach allows for incremental development and testing, with clear success criteria at each stage.

The combination of slash commands, autonomous skills, specialized sub-agents, and custom MCP servers creates a powerful automation layer that can handle complex tax scenarios while maintaining accuracy and compliance.

Key success factors:
1. **Accuracy** - Validate everything, reference IRS rules
2. **Security** - Protect PII, log all operations
3. **User Experience** - Ask smart questions, explain decisions
4. **Compliance** - Follow IRS requirements, maintain audit trails
5. **Extensibility** - Modular design, plugin architecture

Next steps:
1. Review and approve this plan
2. Begin Phase 1 implementation
3. Test with sample documents
4. Iterate based on results

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** DRAFT - Awaiting Approval
**Branch:** `claude-code-tax-automation`
