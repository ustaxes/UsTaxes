# Claude Code Tax Automation - Quick Start Guide

Get started with autonomous tax preparation in minutes.

## Prerequisites

✅ UsTaxes installed and running
✅ Claude Code installed
✅ Tax documents ready (W-2s, 1099s, receipts, etc.)

## 5-Minute Setup

### Step 1: Verify MCP Servers (Optional)

The system includes 3 MCP servers for advanced features:

```bash
# Build MCP servers (one-time setup)
cd .claude/mcp-servers/tax-document-parser && npm install && npm run build
cd ../irs-rules-engine && npm install && npm run build
cd ../form-validator && npm install && npm run build
```

### Step 2: Organize Your Documents

Create a folder structure:
```
~/files/taxes/2024/
├── w2/
│   ├── employer1-w2.pdf
│   └── employer2-w2.pdf
├── 1099/
│   ├── bank-1099-int.pdf
│   ├── broker-1099-div.pdf
│   └── contractor-1099-nec.pdf
├── receipts/
│   ├── charitable/
│   ├── medical/
│   └── business/
└── statements/
    ├── mortgage-1098.pdf
    └── student-loan-1098e.pdf
```

### Step 3: Start Your Tax Return

Open Claude Code in the UsTaxes directory and run:

```bash
/prepare-return 2024
```

That's it! Claude will:
1. Ask for document locations
2. Extract data automatically
3. Ask clarifying questions
4. Fill out forms
5. Validate everything
6. Generate your tax return PDF

---

## Available Commands

### Quick Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `/prepare-return` | Complete tax return workflow | `/prepare-return 2024` |
| `/extract-documents` | Extract data from documents | `/extract-documents ~/files/taxes/2024/w2.pdf w2` |
| `/validate-return` | Validate completed return | `/validate-return 2024` |
| `/optimize-deductions` | Find tax-saving opportunities | `/optimize-deductions` |
| `/estimate-taxes` | Quick tax estimate | `/estimate-taxes 75000 single` |

### Detailed Command Usage

#### `/prepare-return [year]`

**Complete autonomous tax preparation workflow.**

**What it does:**
1. Document collection
2. Data extraction
3. Intelligent questioning
4. Form filling
5. Audit & validation
6. PDF generation

**Usage:**
```bash
/prepare-return 2024
```

**You'll be asked:**
- Where are your tax documents?
- Filing status?
- Dependents?
- Any missing information

**Output:**
- Completed Form 1040
- All required schedules
- State return(s)
- PDF ready to file

---

#### `/extract-documents [path] [type]`

**Extract data from a specific tax document.**

**Document Types:**
- `w2` - W-2 (Wage and Tax Statement)
- `1099-nec` - 1099-NEC (Nonemployee Compensation)
- `1099-int` - 1099-INT (Interest Income)
- `1099-div` - 1099-DIV (Dividends)
- `1099-b` - 1099-B (Broker transactions)
- `1098` - 1098 (Mortgage Interest)
- `1098-e` - 1098-E (Student Loan Interest)
- `receipt` - General receipt

**Usage:**
```bash
# Extract W-2
/extract-documents ~/files/taxes/2024/employer-w2.pdf w2

# Extract 1099-NEC
/extract-documents ~/files/taxes/2024/contractor-1099.pdf 1099-nec

# Extract multiple documents
/extract-documents ~/files/taxes/2024/w2/ w2
```

**Output:**
- Extracted field data
- Confidence scores
- Validation errors (if any)
- Ready to import into return

---

#### `/validate-return [year]`

**Comprehensive pre-filing validation.**

**Checks performed:**
1. Document inventory (are all documents included?)
2. Data validation (SSN format, amounts, dates)
3. Math verification (all calculations)
4. IRS compliance (rules and limits)
5. Optimization (missed deductions/credits)
6. Audit risk (red flags)

**Usage:**
```bash
/validate-return 2024
```

**Output:**
- ✅ PASS / ⚠️ WARN / ❌ FAIL for each check
- Detailed findings
- Actionable recommendations
- Risk score (1-10)

**Example output:**
```
✅ PASS: All required documents present
✅ PASS: All math calculations verified
⚠️ WARN: Missing charitable contribution receipts
❌ FAIL: SSN format invalid on dependent #2
⚠️ WARN: Potential Schedule C expenses not claimed
✅ PASS: Low audit risk (score: 2/10)

Recommendations:
1. Correct SSN on dependent #2 (required)
2. Obtain charitable receipts (recommended)
3. Review Schedule C expenses (potential $1,200 savings)
```

---

#### `/optimize-deductions`

**Find legitimate tax-saving opportunities.**

**Analyzes:**
- Itemized vs. standard deduction
- Above-the-line deductions
- Tax credits (EITC, child tax, education)
- Timing strategies (defer income, accelerate deductions)
- Carryover opportunities

**Usage:**
```bash
/optimize-deductions
```

**Output:**
- Specific recommendations
- Estimated tax savings
- Implementation steps
- Required documentation

**Example output:**
```
Tax Optimization Opportunities:

1. Itemize Deductions (+$2,400 savings)
   - Charitable: $8,000
   - State tax: $10,000
   - Mortgage interest: $12,000
   - Medical: $3,000
   - Total: $33,000 vs. Standard $29,200
   - Action: Switch to itemized deductions

2. HSA Contribution (+$880 savings)
   - Current: $2,000
   - Maximum: $4,150
   - Additional: $2,150
   - Tax savings: $2,150 × 22% = $473
   - Plus payroll tax savings: $2,150 × 7.65% = $164
   - Total savings: $637

3. Harvest Capital Losses (+$660 savings)
   - You have $3,000 capital loss carryover
   - Can offset ordinary income
   - Tax savings: $3,000 × 22% = $660

Total Potential Savings: $3,680
```

---

#### `/estimate-taxes [income] [status]`

**Quick tax estimate.**

**Usage:**
```bash
# Single filer, $75,000 income
/estimate-taxes 75000 single

# Married filing jointly, $150,000 income
/estimate-taxes 150000 married
```

**Filing Statuses:**
- `single` or `S`
- `married` or `MFJ`
- `married_separate` or `MFS`
- `head_of_household` or `HOH`

**Output:**
- Federal tax estimate
- Effective tax rate
- Marginal tax bracket
- Estimated refund/owed (if withholding provided)

---

## Skills (Autonomous Features)

These activate automatically when relevant:

### tax-document-analyzer

**Auto-activates when:** You provide a tax document

**What it does:** Extracts structured data automatically

**Example:**
```
You: Here's my W-2 [attach file]

Claude: I've automatically analyzed your W-2:
- Employer: ABC Company
- Income: $75,000
- Federal withholding: $12,000
- State withholding: $3,500
- Confidence: 98%

Would you like me to import this into your tax return?
```

### tax-liability-calculator

**Auto-activates when:** Tax calculation is needed

**What it does:** Calculates your exact tax liability

### irs-rule-lookup

**Auto-activates when:** Tax rule clarification needed

**What it does:** References IRS publications and rules

### deduction-optimizer

**Auto-activates when:** Optimization requested

**What it does:** Finds all tax-saving opportunities

---

## Common Workflows

### Scenario 1: Simple W-2 Return

**You have:** One W-2, standard deduction

**Steps:**
1. `/extract-documents ~/taxes/2024/w2.pdf w2`
2. `/prepare-return 2024`
3. Answer a few questions (filing status, dependents)
4. Review and file

**Time:** 10-15 minutes

---

### Scenario 2: Itemized Deductions

**You have:** W-2, charitable donations, mortgage interest, state taxes

**Steps:**
1. `/extract-documents ~/taxes/2024/w2.pdf w2`
2. `/extract-documents ~/taxes/2024/1098.pdf 1098`
3. Organize charitable receipts
4. `/prepare-return 2024`
5. Provide itemized deduction amounts when asked
6. `/validate-return 2024`
7. Review and file

**Time:** 30-45 minutes

---

### Scenario 3: Self-Employment + Rental Property

**You have:** W-2, Schedule C business, Schedule E rental

**Steps:**
1. Extract all documents:
   ```bash
   /extract-documents ~/taxes/2024/w2.pdf w2
   /extract-documents ~/taxes/2024/1099-nec.pdf 1099-nec
   ```
2. Organize business expenses by category
3. Organize rental income and expenses
4. `/prepare-return 2024`
5. Claude will guide you through:
   - Schedule C (business income/expenses)
   - Schedule SE (self-employment tax)
   - Schedule E (rental property)
   - Form 8995 (QBI deduction)
6. `/optimize-deductions` (find additional savings)
7. `/validate-return 2024`
8. Review and file

**Time:** 1-2 hours

**Tax Savings Tip:** Track ALL business expenses (home office, mileage, supplies). Use the guides:
- `.claude/guides/schedule-c-guide.md`
- `.claude/guides/schedule-e-guide.md`

---

### Scenario 4: Capital Gains + Multi-State

**You have:** Stock sales, moved states during year

**Steps:**
1. Extract documents
2. Import brokerage 1099-B (may need manual entry for multiple sales)
3. `/prepare-return 2024`
4. Provide part-year resident information:
   - Old state: Jan-Jun
   - New state: Jul-Dec
5. Claude prepares:
   - Federal Schedule D + Form 8949
   - Part-year resident return (old state)
   - Part-year resident return (new state)
6. `/validate-return 2024`
7. Review and file (3 returns total)

**Time:** 1.5-2.5 hours

**Tax Savings Tip:** Consider tax-loss harvesting. Use guide:
- `.claude/guides/schedule-d-guide.md`

---

## Getting Help

### In-App Guidance

Ask Claude anything:
- "How do I report self-employment income?"
- "What's the difference between Schedule C and Schedule E?"
- "Can I deduct my home office?"
- "What are the 2024 tax brackets?"
- "Do I need to file a state return?"

Claude has access to:
- Complete tax guides (Schedule C, E, D, state tax, carryovers)
- IRS publications and rules
- 2024 tax data (brackets, limits, credits)
- All 50 state tax rules

### Documentation

**Core Documentation:**
- `.claude/CLAUDE.md` - Project overview and architecture
- `.claude/IMPLEMENTATION_SUMMARY.md` - Complete implementation details

**Guides:**
- `.claude/guides/schedule-c-guide.md` - Self-employment (527 lines)
- `.claude/guides/schedule-e-guide.md` - Rental property (580 lines)
- `.claude/guides/schedule-d-guide.md` - Capital gains (650 lines)
- `.claude/guides/state-tax-guide.md` - All states (700 lines)
- `.claude/guides/carryover-tracking-guide.md` - Multi-year tracking (500 lines)

### Example Questions

**Business Expenses:**
```
You: What Schedule C expenses can I deduct for my freelance business?

Claude: As a freelancer, you can deduct all ordinary and necessary business expenses on Schedule C. Here are the most common:

Line 8 - Advertising: Website, business cards, Google ads
Line 18 - Office expenses: Supplies, software subscriptions
Line 24b - Meals: 50% of business meals with clients
Line 25 - Utilities: Internet (business %), phone
Line 27a - Other expenses: Professional development, memberships

For a complete list with examples, see .claude/guides/schedule-c-guide.md

Would you like me to help you categorize your specific expenses?
```

**Rental Property:**
```
You: How do I calculate depreciation for my rental property?

Claude: Residential rental property is depreciated over 27.5 years using the straight-line method.

Calculation:
1. Determine your basis: Purchase price + closing costs
2. Subtract land value (not depreciable)
3. Divide building value by 27.5 years
4. Adjust for first year (mid-month convention)

Example:
- Purchase: $300,000
- Land: $50,000
- Building: $250,000
- Annual depreciation: $250,000 / 27.5 = $9,091
- First year (purchased June): 7/12 × $9,091 = $5,303

Report on Schedule E, Line 18 (from Form 4562).

Need help calculating your specific property?
```

**State Tax:**
```
You: I moved from California to Texas mid-year. How do I file?

Claude: You'll file two state returns as a part-year resident:

1. California part-year return (Form 540):
   - Report income earned Jan-Jun while CA resident
   - Allocate by date

2. Texas: No state income tax
   - No Texas return needed

Federal return: Report all income on one federal return as normal.

Allocation example:
- Total W-2: $100,000
- CA period: 6 months
- CA return: $50,000

See .claude/guides/state-tax-guide.md for complete multi-state rules.

Would you like me to help allocate your specific income?
```

---

## Tips for Best Results

### Document Quality

✅ **Good:**
- Clear, readable scans
- PDFs from employer/bank (best)
- Photos in good lighting
- All pages included

❌ **Poor:**
- Blurry photos
- Missing pages
- Handwritten (hard to OCR)
- Crumpled or damaged

### Organization

**Best Practice:**
```
~/files/taxes/
├── 2024/                    # Current year
│   ├── w2/
│   ├── 1099/
│   ├── receipts/
│   └── return-2024.pdf      # Final return
├── 2023/                    # Prior year (for carryovers)
│   └── return-2023.pdf
└── carryovers.json          # Multi-year tracking
```

### Accuracy

**Always verify:**
- SSN/EIN format
- Dollar amounts (especially large numbers)
- Dates
- Spelling of names

**Let Claude help:**
- Auto-validation catches most errors
- Manual review recommended for complex returns
- Ask questions if unsure

### Security

**Private data never leaves your machine:**
- All processing is local
- No cloud storage
- Hooks enforce PII protection

**Keep secure:**
- Final PDF (signature-ready return)
- Carryover tracking files
- Prior year returns

---

## FAQ

**Q: Is this official IRS software?**
A: No. This is an automation layer on top of UsTaxes, an open-source tax application. It assists with tax preparation but does not replace professional advice.

**Q: Can I file directly with the IRS?**
A: The system generates a PDF. You can print and mail it, or use IRS Free File to e-file.

**Q: What if I have a complex situation?**
A: The system handles many complex scenarios (self-employment, rental property, capital gains, multi-state). For very complex situations (foreign income, trusts, partnerships), consult a CPA.

**Q: How accurate is the extraction?**
A: 95%+ accuracy for standard forms. Always verify extracted data before using.

**Q: Can I amend a prior year return?**
A: Not currently supported. Use tax software or consult a professional for amendments.

**Q: What about state taxes?**
A: All 50 states + DC are supported. The system will prepare state returns automatically based on your federal return.

**Q: How do I track carryovers?**
A: The system automatically tracks capital losses, passive losses, charitable contributions, and other carryovers. See `.claude/guides/carryover-tracking-guide.md`.

**Q: Is this free?**
A: The UsTaxes application is free. Claude Code requires an Anthropic API subscription.

---

## Next Steps

1. **Try a simple return:** Start with `/prepare-return 2024`
2. **Read relevant guides:** Schedule C, E, or D if applicable
3. **Optimize:** Run `/optimize-deductions`
4. **Validate:** Always run `/validate-return` before filing
5. **File:** Generate PDF and file electronically or by mail

---

## Support

**Questions?** Ask Claude directly - it has access to all documentation and guides.

**Issues?** Report at https://github.com/ustaxes/ustaxes/issues

**Updates?** This implementation supports 2024 tax year. Annual updates required.

---

**Ready to start?**

```bash
/prepare-return 2024
```

**Good luck with your taxes! 🎯**
