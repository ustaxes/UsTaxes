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
- User asks "can I deduct...?"
- User asks "do I need to report...?"

## IRS Resource Hierarchy

### 1. Internal Revenue Code (IRC)
- Title 26 of US Code
- Primary source of tax law
- Use for definitive legal references

### 2. Treasury Regulations
- Official IRS interpretations of IRC
- More detailed than code
- Legally binding

### 3. IRS Publications
- User-friendly explanations
- Best for general guidance
- Updated annually

### 4. Form Instructions
- Specific guidance for each form
- Line-by-line explanations
- Most practical resource

### 5. Revenue Rulings & Procedures
- IRS official positions
- Specific fact patterns
- Precedential value

## Common IRS Publications

### Income Reporting
- **Pub 17:** Your Federal Income Tax (comprehensive guide)
- **Pub 525:** Taxable and Nontaxable Income
- **Pub 550:** Investment Income and Expenses
- **Pub 334:** Tax Guide for Small Business
- **Pub 527:** Residential Rental Property

### Deductions
- **Pub 502:** Medical and Dental Expenses
- **Pub 936:** Home Mortgage Interest Deduction
- **Pub 526:** Charitable Contributions
- **Pub 529:** Miscellaneous Deductions
- **Pub 463:** Travel, Gift, and Car Expenses

### Credits
- **Pub 972:** Child Tax Credit
- **Pub 970:** Tax Benefits for Education
- **Pub 596:** Earned Income Credit

### Retirement
- **Pub 590-A:** Contributions to IRAs
- **Pub 590-B:** Distributions from IRAs
- **Pub 560:** Retirement Plans for Small Business

### Business
- **Pub 583:** Starting a Business
- **Pub 535:** Business Expenses
- **Pub 587:** Business Use of Your Home
- **Pub 946:** How to Depreciate Property

### Special Situations
- **Pub 54:** Tax Guide for U.S. Citizens Abroad
- **Pub 555:** Community Property
- **Pub 544:** Sales and Other Dispositions of Assets
- **Pub 523:** Selling Your Home

## Lookup Process

### Step 1: Identify Question Type
Categorize the question:
- Deduction eligibility
- Income reporting requirement
- Credit calculation
- Form selection
- Special circumstance

### Step 2: Find Relevant Publication
Select most appropriate IRS publication or form instruction

### Step 3: Extract Key Information
- Eligibility requirements
- Limitations and thresholds
- Documentation needs
- Related forms
- Special rules

### Step 4: Provide Guidance
Present information clearly with:
- Summary of rule
- Applicable limitations
- Required documentation
- Form references
- Examples if helpful

## Example Queries

### Query: "Can I deduct home office expenses?"

**Answer:**
Based on IRS Publication 587 (Business Use of Your Home):

**Eligibility:**
- Must use part of home regularly and exclusively for business
- Must be either:
  - Principal place of business, OR
  - Place to meet clients/customers, OR
  - Separate structure used for business

**Deduction Methods:**
1. **Simplified Method:** $5 per square foot (max 300 sq ft = $1,500)
2. **Regular Method:** Actual expenses × business percentage

**Documentation Required:**
- Measurement of home office space
- Total home square footage
- Business use percentage
- Expenses (mortgage/rent, utilities, insurance, repairs)

**Forms:**
- Schedule C (Line 30) or Form 8829 (detailed method)

**Limitations:**
- Deduction cannot exceed business income
- Excess can carry forward

**Reference:** IRC §280A, Publication 587

---

### Query: "Is cryptocurrency taxable?"

**Answer:**
Based on IRS guidance (Notice 2014-21, Rev. Rul. 2019-24):

**Tax Treatment:**
- Cryptocurrency is property, not currency
- Subject to capital gains tax when sold/exchanged
- Mining income is ordinary income

**Taxable Events:**
- Selling crypto for cash
- Trading one crypto for another
- Using crypto to buy goods/services
- Receiving crypto as payment

**Reporting:**
- Form 1099-B from exchanges (if provided)
- Form 8949 for all transactions
- Schedule D for capital gain/loss summary
- Schedule 1 for mining/staking income

**Required Question:**
Form 1040 asks: "At any time during 2024, did you: (a) receive (as a reward, award, or payment for property or services); or (b) sell, exchange, gift, or otherwise dispose of a digital asset?"
Must answer YES if any crypto activity.

**Basis Tracking:**
Must track cost basis for each transaction
Can use specific identification or FIFO

**Reference:** Notice 2014-21, FAQ on IRS.gov

---

## Output Format

```markdown
## [Question/Topic]

**IRS Guidance:** [Publication/Code Section]

### Eligibility Requirements
- [Requirement 1]
- [Requirement 2]

### Limitations
- [Limitation or threshold]
- [Phase-out range if applicable]

### Documentation Required
- [Document 1]
- [Document 2]

### Forms Needed
- [Form name and line number]

### Special Considerations
- [Important note or exception]

### Example
[If helpful, provide concrete example]

### References
- [IRS Publication XXX]
- [IRC Section XXX]
- [Form XXXX Instructions]
```

## Integration with Other Skills

When invoked:
1. **By deduction-optimizer:** To verify deduction rules
2. **By form-filler:** To clarify form requirements
3. **By tax-return-auditor:** To validate compliance
4. **By question-asker:** To provide accurate context

## Online Resources

Can fetch from:
- https://www.irs.gov/publications (all publications)
- https://www.irs.gov/forms-instructions (forms and instructions)
- https://www.irs.gov/help/ita (Interactive Tax Assistant)
- https://www.law.cornell.edu/uscode/text/26 (Internal Revenue Code)

## Caching Strategy

For frequently-asked questions:
- Cache common publication excerpts
- Store current year thresholds
- Keep form instruction summaries
- Update at start of each tax season

## Accuracy Notes

- Always cite specific IRS publication or code section
- Include publication year (rules change annually)
- Flag when guidance is unclear or contested
- Note when professional advice recommended
- Distinguish between "can" and "should"

## When NOT to Invoke

Don't invoke for:
- Simple arithmetic calculations (use calculator skill)
- Data entry questions (not a rule issue)
- State tax questions (IRS covers federal only)
- Questions already answered in current session

## Follow-up Actions

After providing guidance:
1. Ask if clarification needed
2. Offer to look up related rules
3. Suggest forms to complete
4. Recommend documentation to gather
