# Interactive Tutorials
## UsTaxes - Claude Code Automation Layer

**Version:** 1.0.0
**Last Updated:** 2025-11-27

---

## Table of Contents

1. [Tutorial 1: Simple W-2 Employee](#tutorial-1-simple-w-2-employee)
2. [Tutorial 2: Self-Employed Freelancer](#tutorial-2-self-employed-freelancer)
3. [Tutorial 3: Investment Income & Capital Gains](#tutorial-3-investment-income--capital-gains)
4. [Tutorial 4: Homeowner with Itemized Deductions](#tutorial-4-homeowner-with-itemized-deductions)
5. [Tutorial 5: Complex Multi-Source Income](#tutorial-5-complex-multi-source-income)
6. [Tutorial 6: Married Filing Jointly with Dependents](#tutorial-6-married-filing-jointly-with-dependents)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## How to Use These Tutorials

Each tutorial is designed as an **interactive walkthrough** showing the exact conversation between you and Claude Code. The tutorials progress from simple to complex scenarios.

### Tutorial Format

```
You: [What you type]
Claude: [Claude's response and actions]
```

### Before You Begin

1. **Start Claude Code:**
   ```bash
   cd /path/to/ustaxes
   claude
   ```

2. **Have your documents ready:**
   - W-2s, 1099s, 1098s as PDF files
   - Or be prepared to enter data manually

3. **Follow along:**
   - Type exactly what's shown after "You:"
   - Or adapt to your specific situation

---

## Tutorial 1: Simple W-2 Employee

**Scenario:** Sarah is a single software engineer with one W-2. No dependents, no investments, standard deduction.

**Time:** 10 minutes
**Difficulty:** ★☆☆☆☆ (Beginner)
**Forms Generated:** 1040

### Sarah's Information
- Name: Sarah Johnson
- SSN: 123-45-6789
- DOB: April 15, 1992
- Address: 123 Main St, Portland, OR 97201
- Filing Status: Single
- W-2: $75,000 wages, $11,250 withheld

---

### Step 1: Start the Return

```
You: I want to prepare my 2024 tax return

Claude: I'll help you prepare your 2024 federal tax return.

        Let's start with your basic information.

        What is your legal first and last name?
```

```
You: Sarah Johnson

Claude: Great! What is your Social Security Number?

        (Format: XXX-XX-XXXX)
```

```
You: 123-45-6789

Claude: Thank you. What is your date of birth?

        (Format: MM/DD/YYYY or YYYY-MM-DD)
```

```
You: 04/15/1992

Claude: What is your current address?
```

```
You: 123 Main St, Portland, OR 97201

Claude: Perfect. What is your filing status?

        Options:
        1. Single
        2. Married Filing Jointly
        3. Married Filing Separately
        4. Head of Household
        5. Qualifying Widow(er)
```

```
You: Single

Claude: ✓ Filing Status: Single

        Do you have any dependents? (yes/no)
```

```
You: No

Claude: Understood.

        Now let's gather your income information.

        Do you have any W-2 forms? (yes/no)
```

---

### Step 2: Add Income

```
You: Yes, I have one W-2

Claude: Great! You can either:
        1. Upload a PDF: "I have a W-2 at ~/path/to/w2.pdf"
        2. Enter manually: "I'll enter the W-2 data"

        Which would you prefer?
```

```
You: I'll enter the W-2 data

Claude: No problem! I'll ask you for each field.

        Employer name?
```

```
You: Tech Corp Inc

Claude: Employer EIN (Employer Identification Number)?

        (Format: XX-XXXXXXX, found in box b)
        (Type "skip" if you don't have it)
```

```
You: 12-3456789

Claude: Your occupation or job title?
```

```
You: Software Engineer

Claude: Box 1 - Wages, tips, other compensation?
```

```
You: 75000

Claude: Box 2 - Federal income tax withheld?
```

```
You: 11250

Claude: Box 3 - Social security wages?
        (Usually same as Box 1, unless you had pre-tax deductions)
```

```
You: 75000

Claude: Box 4 - Social security tax withheld?
```

```
You: 4650

Claude: Box 5 - Medicare wages and tips?
        (Usually same as Box 1)
```

```
You: 75000

Claude: Box 6 - Medicare tax withheld?
```

```
You: 1087.50

Claude: ✓ W-2 added successfully!

        Summary:
        Employer: Tech Corp Inc (12-3456789)
        Occupation: Software Engineer
        Wages: $75,000.00
        Federal withholding: $11,250.00
        SS tax: $4,650.00
        Medicare tax: $1,087.50

        Does this look correct? (yes/no)
```

```
You: Yes

Claude: Perfect!

        Do you have any other W-2 forms? (yes/no)
```

```
You: No

Claude: Do you have any 1099 forms?
        (1099-INT for interest, 1099-DIV for dividends, etc.)
```

```
You: No

Claude: Do you have any other income to report?
        (Self-employment, rental property, etc.)
```

```
You: No

Claude: Great! Now let's review deductions.
```

---

### Step 3: Deductions

```
Claude: You're eligible for the standard deduction of $14,600.

        Do you want to itemize deductions instead?
        (Only worth it if you have more than $14,600 in:
        - Mortgage interest
        - State/local taxes (max $10,000)
        - Charitable donations
        - Medical expenses over 7.5% of income)

        Itemize? (yes/no)
```

```
You: No, use standard deduction

Claude: ✓ Using standard deduction: $14,600

        Do you have any student loan interest to deduct? (yes/no)
```

```
You: No

Claude: Do you contribute to an IRA or HSA? (yes/no)
```

```
You: No

Claude: Any other adjustments to income? (yes/no)
```

```
You: No
```

---

### Step 4: Calculate Tax

```
Claude: Perfect! Let me calculate your tax.

        ════════════════════════════════════════════
        2024 Tax Return Summary - Sarah Johnson
        ════════════════════════════════════════════

        INCOME
        W-2 wages                           $75,000
        Other income                              $0
        ────────────────────────────────────────────
        Total income                        $75,000

        ADJUSTMENTS
        Standard deduction                 -$14,600
        Other adjustments                         $0
        ────────────────────────────────────────────
        Taxable income                      $60,400

        TAX CALCULATION
        Tax on $60,400 (single):
          $11,600 × 10% = $1,160
          $35,550 × 12% = $4,266
          $13,250 × 22% = $2,915
        ────────────────────────────────────────────
        Total tax                            $8,341

        CREDITS & PAYMENTS
        Credits                                   $0
        Federal withholding                -$11,250
        ────────────────────────────────────────────

        REFUND                              $2,909
        ════════════════════════════════════════════

        You're getting a refund of $2,909!

        Would you like me to generate your tax forms? (yes/no)
```

---

### Step 5: Generate Forms

```
You: Yes

Claude: Great! Do you want to set up direct deposit for your refund?
        (yes/no)
```

```
You: Yes

Claude: I'll need your bank information:

        Bank routing number (9 digits)?
```

```
You: 123456789

Claude: Account number?
```

```
You: 9876543210

Claude: Account type?
        1. Checking
        2. Savings
```

```
You: Checking

Claude: ✓ Direct deposit info saved

        Generating your tax forms...

        ✓ Form 1040 generated
        ✓ Form 1040-V (payment voucher - not needed, refund)

        Forms saved to: ./ustaxes-output/2024-tax-return.pdf

        ════════════════════════════════════════════
        NEXT STEPS
        ════════════════════════════════════════════

        1. Review the PDF carefully
        2. Check all numbers match your W-2
        3. Verify your personal information
        4. Sign and date the form

        5. File your return:
           - E-file through IRS Free File
           - Use commercial software
           - Mail paper return

        6. Expect refund in 2-3 weeks (e-file)
           or 6-8 weeks (mail)

        Questions? Just ask!
```

---

### ✅ Tutorial 1 Complete!

**What You Learned:**
- Basic tax return workflow
- Entering W-2 information
- Standard deduction
- Tax calculation
- Direct deposit setup
- Form generation

**Your Turn:**
Adapt this tutorial with your own W-2 information!

---

## Tutorial 2: Self-Employed Freelancer

**Scenario:** Marcus is a freelance graphic designer. He has self-employment income, business expenses, and home office deduction.

**Time:** 20 minutes
**Difficulty:** ★★★☆☆ (Intermediate)
**Forms Generated:** 1040, Schedule C, Schedule SE

### Marcus's Information
- Name: Marcus Williams
- SSN: 234-56-7890
- DOB: June 10, 1988
- Filing Status: Single
- Business: Freelance Graphic Design
- Income: $95,000
- Expenses: $18,500

---

### Step 1: Start and Basic Info

```
You: I'm self-employed and need to file my 2024 taxes

Claude: I'll help you prepare your self-employed tax return for 2024.

        Let's start with your basic information.

        What is your legal first and last name?
```

```
You: Marcus Williams

Claude: Social Security Number? (XXX-XX-XXXX)
```

```
You: 234-56-7890

Claude: Date of birth? (MM/DD/YYYY)
```

```
You: 06/10/1988

Claude: Address?
```

```
You: 456 Oak Street, Austin, TX 78701

Claude: Filing status?
```

```
You: Single

Claude: Any dependents?
```

```
You: No
```

---

### Step 2: Self-Employment Income

```
Claude: Now let's discuss your self-employment income.

        What type of business do you operate?
```

```
You: Freelance graphic design

Claude: Perfect! Do you have:
        1. A business name (DBA)?
        2. An EIN (Employer Identification Number)?

        (Type "no" if you just use your personal name and SSN)
```

```
You: No, I use my personal name

Claude: That's fine! Most sole proprietors do.

        What was your total business income for 2024?
        (All payments received from clients)
```

```
You: 95000

Claude: Great! $95,000 in business income.

        Did you receive any 1099-NEC forms from clients? (yes/no)
```

```
You: Yes, from my three biggest clients

Claude: Good. Make sure your reported income matches the total
        on all your 1099-NECs. The IRS will check this.

        Now let's enter your business expenses.
```

---

### Step 3: Business Expenses

```
Claude: I'll ask about common business expense categories.
        Enter the amount for each, or "0" if none.

        ────────────────────────────────────────────
        BUSINESS EXPENSES
        ────────────────────────────────────────────

        Advertising and marketing?
        (Ads, website, business cards)
```

```
You: 2400

Claude: Car and truck expenses?
        (Business mileage, parking, tolls)
        Note: You can use standard mileage rate or actual expenses
```

```
You: 1800

Claude: Using standard mileage rate?
        (2024 rate: $0.67/mile)
```

```
You: Yes, drove 2,687 business miles

Claude: ✓ $1,800 vehicle expenses (2,687 miles × $0.67)

        Commissions and fees?
        (Freelancer platform fees, payment processing)
```

```
You: 3200

Claude: Contract labor?
        (Payments to subcontractors)
```

```
You: 0

Claude: Depreciation?
        (Computer equipment, furniture)
```

```
You: 1500

Claude: Insurance?
        (Business liability, professional insurance)
```

```
You: 1200

Claude: Legal and professional services?
        (Accountant, lawyer fees)
```

```
You: 800

Claude: Office expenses?
        (Supplies, software subscriptions, postage)
```

```
You: 2400

Claude: Rent or lease?
        (Office space, equipment rental)
```

```
You: 0

Claude: Repairs and maintenance?
```

```
You: 0

Claude: Supplies?
        (Not included in office expenses above)
```

```
You: 600

Claude: Taxes and licenses?
        (Business licenses, professional fees)
```

```
You: 400

Claude: Travel?
        (Airfare, hotels for business trips)
```

```
You: 1200

Claude: Meals?
        (50% deductible for business meals)
```

```
You: 800

Claude: I'll automatically deduct 50% = $400

        Utilities?
        (If you have a home office, we'll calculate this separately)
```

```
You: 0

Claude: Other expenses?
        (Anything else not listed above)
```

```
You: 0

Claude: ✓ Total expenses so far: $15,700

        Do you have a home office? (yes/no)
```

---

### Step 4: Home Office Deduction

```
You: Yes

Claude: Great! The home office deduction can save you significant tax.

        Requirements:
        ✓ Regular and exclusive use for business
        ✓ Principal place of business

        Do you meet these requirements? (yes/no)
```

```
You: Yes

Claude: Perfect! You can use:
        1. Simplified method: $5/sq ft (max 300 sq ft = $1,500)
        2. Actual expense method: Calculate percentage of home

        Which method? (1 or 2)
```

```
You: 1 - Simplified method

Claude: How many square feet is your home office?
        (Maximum: 300 sq ft)
```

```
You: 200

Claude: ✓ Home office deduction: $1,000 (200 sq ft × $5)

        ════════════════════════════════════════════
        SCHEDULE C SUMMARY
        ════════════════════════════════════════════

        Gross receipts                      $95,000

        EXPENSES:
        Advertising                           $2,400
        Car and truck                         $1,800
        Commissions                           $3,200
        Depreciation                          $1,500
        Insurance                             $1,200
        Legal/professional                      $800
        Office expense                        $2,400
        Supplies                                $600
        Taxes and licenses                      $400
        Travel                                $1,200
        Meals (50% deductible)                  $400
        Home office (simplified)              $1,000
        ────────────────────────────────────────────
        Total expenses                      $16,900

        NET PROFIT                          $78,100
        ════════════════════════════════════════════

        Does this look correct? (yes/no)
```

```
You: Yes

Claude: Perfect!
```

---

### Step 5: Self-Employment Tax

```
Claude: Now I need to calculate your self-employment tax.

        This covers Social Security and Medicare for self-employed
        individuals (equivalent to FICA taxes for employees).

        ────────────────────────────────────────────
        SELF-EMPLOYMENT TAX CALCULATION
        ────────────────────────────────────────────

        Net profit (Schedule C)             $78,100
        × 92.35% (SE adjustment)            $72,145

        Social Security (12.4%)              $8,946
        Medicare (2.9%)                      $2,092
        ────────────────────────────────────────────
        Total SE tax                        $11,038

        Deductible half                      $5,519
        ════════════════════════════════════════════

        You'll owe $11,038 in self-employment tax, but you can
        deduct half ($5,519) from your taxable income.
```

---

### Step 6: Other Income & Deductions

```
Claude: Do you have any other income sources?
        - W-2 from another job?
        - Investment income?
        - Other?
```

```
You: No

Claude: Any retirement contributions?
        - SEP-IRA
        - Solo 401(k)
        - Traditional IRA
```

```
You: Yes, I contributed $6,500 to a traditional IRA

Claude: ✓ IRA deduction: $6,500

        Did you pay for your own health insurance? (yes/no)
```

```
You: Yes, $7,200 for the year

Claude: ✓ Self-employed health insurance deduction: $7,200

        This is an adjustment to income, very valuable!

        Any student loan interest?
```

```
You: No

Claude: Will you use the standard deduction ($14,600) or itemize?
```

```
You: Standard deduction
```

---

### Step 7: Final Tax Calculation

```
Claude: Calculating your complete tax return...

        ════════════════════════════════════════════
        2024 TAX RETURN - Marcus Williams
        ════════════════════════════════════════════

        INCOME
        Business income (Schedule C)        $95,000
        Business expenses                   -$16,900
        ────────────────────────────────────────────
        Net business profit                 $78,100

        ADJUSTMENTS TO INCOME
        SE tax deduction                     -$5,519
        Self-employed health insurance       -$7,200
        IRA contribution                     -$6,500
        ────────────────────────────────────────────
        Adjusted Gross Income (AGI)         $58,881

        DEDUCTIONS
        Standard deduction                  -$14,600
        ────────────────────────────────────────────
        Taxable income                      $44,281

        INCOME TAX
        $11,600 × 10%                         $1,160
        $32,681 × 12%                         $3,922
        ────────────────────────────────────────────
        Regular income tax                    $5,082

        SELF-EMPLOYMENT TAX
        SE tax (Schedule SE)                $11,038
        ────────────────────────────────────────────

        TOTAL TAX                           $16,120

        PAYMENTS & CREDITS
        Federal withholding                       $0
        Estimated tax payments                    $0
        Credits                                   $0
        ────────────────────────────────────────────

        TAX DUE                             $16,120
        ════════════════════════════════════════════

        You owe $16,120 in taxes for 2024.

        ⚠️  IMPORTANT: Estimated Taxes for 2025
        ────────────────────────────────────────────
        To avoid penalties next year, you should make
        quarterly estimated tax payments:

        Due dates:
        • April 15, 2025:  $4,030
        • June 16, 2025:   $4,030
        • Sept 15, 2025:   $4,030
        • Jan 15, 2026:    $4,030

        Would you like me to:
        1. Generate payment vouchers (Form 1040-ES)?
        2. Calculate different estimated tax scenarios?
        3. Just generate the 2024 return?
```

```
You: Generate payment vouchers please

Claude: ✓ Form 1040-ES vouchers generated

        Now generating your complete tax return...

        ✓ Form 1040
        ✓ Schedule C (Business Profit/Loss)
        ✓ Schedule SE (Self-Employment Tax)
        ✓ Form 1040-V (Payment Voucher)
        ✓ Form 1040-ES (2025 Estimated Taxes)

        Files saved to: ./ustaxes-output/

        ════════════════════════════════════════════
        NEXT STEPS
        ════════════════════════════════════════════

        1. Review all forms carefully
        2. Verify business income matches 1099-NECs
        3. Keep receipts for all expenses (7 years)

        4. Pay your 2024 tax:
           - Pay by April 15, 2025
           - IRS Direct Pay (free): irs.gov/payments
           - Or mail check with Form 1040-V

        5. Make 2025 quarterly payments:
           - Use Form 1040-ES vouchers
           - Or pay online at irs.gov/payments

        6. Tax-saving tips for next year:
           - Contribute more to SEP-IRA (up to $69,000)
           - Track ALL business expenses
           - Consider quarterly tax planning

        Questions about deductions or taxes?
```

---

### ✅ Tutorial 2 Complete!

**What You Learned:**
- Schedule C (business profit/loss)
- Business expense categories
- Home office deduction
- Self-employment tax (Schedule SE)
- SE health insurance deduction
- Estimated tax payments
- Tax planning for next year

**Your Turn:**
Use this as a template for your freelance business!

---

## Tutorial 3: Investment Income & Capital Gains

**Scenario:** Jessica sold stocks and received dividends. She needs to report capital gains and qualified dividends.

**Time:** 15 minutes
**Difficulty:** ★★★☆☆ (Intermediate)
**Forms Generated:** 1040, Schedule B, Schedule D, Form 8949

### Jessica's Information
- Name: Jessica Chen
- Filing Status: Single
- W-2 Income: $120,000
- Stock sales: $45,000 proceeds
- Dividends: $6,500

---

### Step 1: Start Return (Abbreviated)

```
You: Help me with my 2024 taxes. I have W-2 income and investment income

Claude: I'll help you prepare your return with employment and
        investment income.

        [Basic info collection - name, SSN, address, etc.]
        [W-2 entry - $120,000 wages, $18,000 withheld]

        Now let's handle your investment income.

        Do you have any 1099-DIV forms? (dividend income)
```

---

### Step 2: Dividend Income

```
You: Yes, one from Vanguard

Claude: Great! I'll need the information from your 1099-DIV.

        Payer name?
```

```
You: Vanguard

Claude: Box 1a - Total ordinary dividends?
```

```
You: 6500

Claude: Box 1b - Qualified dividends?
        (These are taxed at lower capital gains rates)
```

```
You: 5800

Claude: Box 2a - Total capital gain distributions?
```

```
You: 1200

Claude: ✓ 1099-DIV added

        Summary:
        Payer: Vanguard
        Ordinary dividends: $6,500
        Qualified dividends: $5,800
        Capital gain distributions: $1,200

        Correct? (yes/no)
```

```
You: Yes

Claude: Perfect!

        Qualified dividends are taxed at:
        - 0% if your taxable income < $47,025 (single)
        - 15% if $47,025 - $518,900
        - 20% if > $518,900

        You'll likely pay 15% on these = $870 in tax.

        Do you have any other 1099-DIV forms?
```

```
You: No

Claude: Do you have any 1099-INT forms? (interest income)
```

```
You: Yes, $850 from my savings account at Chase

Claude: ✓ Interest income: $850

        Now, did you sell any stocks, bonds, or other investments
        in 2024? (yes/no)
```

---

### Step 3: Capital Gains

```
You: Yes, I sold some stocks

Claude: Okay! Capital gains can be:
        - Short-term (held ≤ 1 year) - taxed as ordinary income
        - Long-term (held > 1 year) - taxed at 0%, 15%, or 20%

        Do you have 1099-B forms from your broker? (yes/no)
```

```
You: Yes, from Vanguard

Claude: Perfect! The 1099-B will have all the details.

        I'll need information for each stock sale.

        How many different stocks did you sell?
```

```
You: 3 stocks

Claude: Great, I'll ask about each one.

        ════════════════════════════════════════════
        STOCK SALE #1
        ════════════════════════════════════════════

        Stock symbol or name?
```

```
You: AAPL

Claude: Date acquired? (MM/DD/YYYY)
```

```
You: 01/15/2020

Claude: Date sold? (MM/DD/YYYY)
```

```
You: 03/20/2024

Claude: Holding period: 4 years, 2 months → LONG-TERM ✓

        Number of shares sold?
```

```
You: 100

Claude: Sale proceeds (before commissions)?
```

```
You: 18500

Claude: Cost basis (what you originally paid)?
```

```
You: 12000

Claude: ✓ AAPL Sale Summary:
        Holding period: Long-term
        Proceeds: $18,500
        Cost basis: $12,000
        Gain: $6,500

        ────────────────────────────────────────────
        STOCK SALE #2
        ────────────────────────────────────────────

        Stock symbol or name?
```

```
You: TSLA

Claude: Date acquired?
```

```
You: 11/10/2023

Claude: Date sold?
```

```
You: 06/15/2024

Claude: Holding period: 7 months → SHORT-TERM

        ⚠️  Short-term gains are taxed as ordinary income
            (same rate as your salary)

        Number of shares?
```

```
You: 50

Claude: Sale proceeds?
```

```
You: 15000

Claude: Cost basis?
```

```
You: 13500

Claude: ✓ TSLA Sale Summary:
        Holding period: Short-term
        Proceeds: $15,000
        Cost basis: $13,500
        Gain: $1,500

        ────────────────────────────────────────────
        STOCK SALE #3
        ────────────────────────────────────────────

        Stock symbol or name?
```

```
You: VTI

Claude: Date acquired?
```

```
You: 05/20/2019

Claude: Date sold?
```

```
You: 08/10/2024

Claude: Holding period: 5 years, 3 months → LONG-TERM ✓

        Number of shares?
```

```
You: 50

Claude: Sale proceeds?
```

```
You: 11500

Claude: Cost basis?
```

```
You: 9000

Claude: ✓ VTI Sale Summary:
        Holding period: Long-term
        Proceeds: $11,500
        Cost basis: $9,000
        Gain: $2,500
```

---

### Step 4: Capital Gains Summary

```
Claude: ════════════════════════════════════════════
        CAPITAL GAINS SUMMARY
        ════════════════════════════════════════════

        SHORT-TERM GAINS (held ≤ 1 year):
        TSLA                                 $1,500
        ────────────────────────────────────────────
        Total short-term                     $1,500

        LONG-TERM GAINS (held > 1 year):
        AAPL                                 $6,500
        VTI                                  $2,500
        ────────────────────────────────────────────
        Total long-term                      $9,000

        Plus: LT capital gain distributions  $1,200
        ────────────────────────────────────────────
        Total long-term gains                $10,200

        ════════════════════════════════════════════

        Tax treatment:
        • Short-term ($1,500): Taxed at 24% = $360
        • Long-term ($10,200): Taxed at 15% = $1,530

        Does this match your 1099-B? (yes/no)
```

```
You: Yes

Claude: Perfect! Let me verify totals:
        Total proceeds: $45,000 ✓
        Total cost basis: $34,500 ✓
        Total gain: $10,500 ✓

        Any other investment sales?
```

```
You: No
```

---

### Step 5: Net Investment Income Tax

```
Claude: One more thing to check...

        Because you have investment income and your total income
        is over $200,000 (single), you may owe Net Investment
        Income Tax (NIIT) at 3.8%.

        Let me calculate:

        W-2 income:                        $120,000
        Dividends:                           $6,500
        Interest:                              $850
        Capital gains:                      $10,500
        ────────────────────────────────────────────
        Total income:                      $137,850
        Standard deduction:                -$14,600
        ────────────────────────────────────────────
        Modified AGI:                      $123,250

        NIIT threshold (single):           $200,000

        You're under the threshold, so NO NIIT. ✓

        (You'd only owe NIIT if your MAGI exceeded $200K)
```

---

### Step 6: Final Tax Calculation

```
Claude: ════════════════════════════════════════════
        2024 TAX RETURN - Jessica Chen
        ════════════════════════════════════════════

        INCOME
        W-2 wages                          $120,000
        Interest income                        $850
        Ordinary dividends                   $6,500
        Capital gains (short-term)           $1,500
        ────────────────────────────────────────────
        Ordinary income                    $128,850

        DEDUCTIONS
        Standard deduction                  -$14,600
        ────────────────────────────────────────────
        Taxable ordinary income            $114,250

        INCOME TAX (ordinary income):
        $11,600 × 10%                        $1,160
        $35,550 × 12%                        $4,266
        $53,375 × 22%                       $11,743
        $13,725 × 24%                        $3,294
        ────────────────────────────────────────────
        Tax on ordinary income              $20,463

        CAPITAL GAINS TAX:
        Qualified dividends ($5,800) × 15%     $870
        Long-term gains ($10,200) × 15%      $1,530
        ────────────────────────────────────────────
        Tax on capital gains                 $2,400

        TOTAL TAX                           $22,863

        PAYMENTS
        Federal withholding                -$18,000
        ────────────────────────────────────────────

        TAX DUE                              $4,863
        ════════════════════════════════════════════

        You owe $4,863 in federal tax.

        Generate forms? (yes/no)
```

```
You: Yes

Claude: Generating tax forms...

        ✓ Form 1040
        ✓ Schedule B (Interest and Dividends)
        ✓ Schedule D (Capital Gains and Losses)
        ✓ Form 8949 (Sales of Capital Assets)
        ✓ Form 1040-V (Payment Voucher)

        Files saved to: ./ustaxes-output/

        ════════════════════════════════════════════
        IMPORTANT REMINDERS
        ════════════════════════════════════════════

        1. Keep these documents (7 years):
           ✓ 1099-DIV from Vanguard
           ✓ 1099-B from Vanguard
           ✓ 1099-INT from Chase
           ✓ Purchase confirmations for stocks

        2. Tax-saving tips for next year:
           • Harvest losses to offset gains
           • Hold stocks > 1 year for lower rates
           • Consider tax-loss harvesting in December
           • Max out IRA ($7,000) to reduce AGI

        3. Payment due April 15, 2025
           Pay at: irs.gov/payments

        Questions?
```

---

### ✅ Tutorial 3 Complete!

**What You Learned:**
- Dividend income (1099-DIV)
- Qualified vs. ordinary dividends
- Short-term vs. long-term capital gains
- Form 8949 and Schedule D
- Capital gains tax rates
- Net Investment Income Tax (NIIT)
- Tax-loss harvesting strategies

---

## Tutorial 4: Homeowner with Itemized Deductions

**Scenario:** Robert owns a home and has significant deductible expenses. Should he itemize instead of taking the standard deduction?

**Time:** 12 minutes
**Difficulty:** ★★☆☆☆ (Intermediate)
**Forms Generated:** 1040, Schedule A

### Robert's Information
- Married Filing Jointly
- W-2 Income: $165,000
- Mortgage interest: $22,000
- Property taxes: $9,500
- Charitable donations: $5,200
- State income tax: $8,400

---

### Step 1: Basic Info & Income (Abbreviated)

```
You: I need help with my taxes. I'm married and own a home.

Claude: [Collects basic information]
        [Enters W-2: $165,000 wages, $24,750 withheld]

        Do you have any other income sources?
```

```
You: No, just our W-2s

Claude: Perfect. Now let's look at deductions.

        As a married couple filing jointly, your standard
        deduction is $29,200.

        However, if you have:
        • Mortgage interest
        • Property taxes
        • Charitable donations
        • State income taxes
        • Medical expenses

        ...totaling more than $29,200, you should itemize.

        Do you want to explore itemizing? (yes/no)
```

---

### Step 2: Mortgage Interest

```
You: Yes, let's see if I should itemize

Claude: Great! I'll ask about each category.

        ════════════════════════════════════════════
        ITEMIZED DEDUCTIONS
        ════════════════════════════════════════════

        Did you pay mortgage interest? (yes/no)
```

```
You: Yes

Claude: Do you have Form 1098 from your mortgage lender? (yes/no)
```

```
You: Yes

Claude: Perfect! What's the lender name?
```

```
You: Wells Fargo

Claude: Box 1 - Mortgage interest paid?
```

```
You: 22000

Claude: ✓ Mortgage interest: $22,000

        Is this your primary residence? (yes/no)
```

```
You: Yes

Claude: Perfect. This is fully deductible.

        Note: Mortgage interest on loans up to $750,000
        (taken after 12/15/2017) is deductible.

        Any mortgage insurance premiums (PMI)? (if yes, enter amount)
```

```
You: No

Claude: Do you have a second mortgage or HELOC? (yes/no)
```

```
You: No
```

---

### Step 3: State and Local Taxes

```
Claude: State and local taxes (SALT)?

        You can deduct the greater of:
        A. State income tax paid
        B. State sales tax paid

        Plus property taxes (combined max $10,000)

        Which did you pay more of?
        1. State income tax
        2. State sales tax
```

```
You: State income tax

Claude: How much state income tax did you pay in 2024?
        (From W-2 box 17 or estimated tax payments)
```

```
You: 8400

Claude: Real estate property taxes?
        (From your property tax bill or escrow statement)
```

```
You: 9500

Claude: Let me calculate:

        State income tax:                    $8,400
        Property tax:                        $9,500
        ────────────────────────────────────────────
        Total SALT:                         $17,900
        SALT cap (max deduction):           $10,000
        ────────────────────────────────────────────
        Your SALT deduction:                $10,000

        ⚠️  You're hitting the $10K SALT cap. You can't deduct
            the extra $7,900, unfortunately. This cap started
            in 2018 and remains in effect.

        Any personal property taxes? (car registration, etc.)
```

```
You: No
```

---

### Step 4: Charitable Contributions

```
Claude: Charitable contributions?

        Did you donate to charities in 2024? (yes/no)
```

```
You: Yes

Claude: Great! I'll need details for each donation.

        Cash donations?
        (Money, checks, credit card donations)
```

```
You: 4200

Claude: To qualified charities (501(c)(3))? (yes/no)
```

```
You: Yes, to our church and Red Cross

Claude: ✓ Cash donations: $4,200

        Non-cash donations?
        (Clothing, household items, etc.)
```

```
You: Yes, donated a car worth $1,000

Claude: For non-cash donations over $500, you need Form 8283.

        Was the car valued:
        1. Over $5,000 (requires appraisal)
        2. Under $5,000
```

```
You: Under $5,000

Claude: Good. What was the fair market value?
        (What a willing buyer would pay)
```

```
You: 1000

Claude: ✓ Non-cash donations: $1,000

        Total charitable: $5,200

        Do you have receipts for all donations? (yes/no)
```

```
You: Yes

Claude: Perfect! Keep those receipts.

        IRS requires:
        • Written acknowledgment for donations ≥ $250
        • Form 8283 for non-cash ≥ $500
        • Appraisal for non-cash ≥ $5,000
```

---

### Step 5: Medical and Other Deductions

```
Claude: Medical and dental expenses?

        You can deduct medical expenses exceeding 7.5% of your AGI.

        Your AGI: $165,000
        7.5% threshold: $12,375

        Did you have medical expenses over $12,375? (yes/no)
```

```
You: No, only about $3,000

Claude: Then medical expenses won't help (under threshold).

        Casualty and theft losses?
        (From federally declared disasters only)
```

```
You: No

Claude: Other itemized deductions?
        (Gambling losses, certain unreimbursed employee expenses)
```

```
You: No
```

---

### Step 6: Itemized vs. Standard

```
Claude: Let me compare your options:

        ════════════════════════════════════════════
        DEDUCTION COMPARISON
        ════════════════════════════════════════════

        ITEMIZED DEDUCTIONS:
        Mortgage interest                   $22,000
        State & local taxes (capped)        $10,000
        Charitable contributions             $5,200
        Medical (below threshold)                $0
        Other                                    $0
        ────────────────────────────────────────────
        Total itemized                      $37,200

        STANDARD DEDUCTION:
        Married Filing Jointly              $29,200

        ────────────────────────────────────────────
        RECOMMENDATION: ITEMIZE ✓

        By itemizing, you'll deduct an extra $8,000
        ($37,200 - $29,200 = $8,000)

        Tax savings: $8,000 × 22% = $1,760

        ════════════════════════════════════════════

        Use itemized deductions? (yes/no)
```

```
You: Yes

Claude: ✓ Itemizing deductions

        Calculating your tax...

        ════════════════════════════════════════════
        2024 TAX RETURN SUMMARY
        ════════════════════════════════════════════

        INCOME
        W-2 wages                          $165,000
        ────────────────────────────────────────────
        Adjusted Gross Income              $165,000

        DEDUCTIONS (Itemized)
        Mortgage interest                   $22,000
        State & local taxes                 $10,000
        Charitable contributions             $5,200
        ────────────────────────────────────────────
        Total itemized deductions          -$37,200
        ────────────────────────────────────────────
        Taxable income                     $127,800

        TAX CALCULATION (MFJ brackets):
        $23,200 × 10%                        $2,320
        $71,100 × 12%                        $8,532
        $33,500 × 22%                        $7,370
        ────────────────────────────────────────────
        Total tax                           $18,222

        PAYMENTS
        Federal withholding                -$24,750
        ────────────────────────────────────────────

        REFUND                               $6,528
        ════════════════════════════════════════════

        You're getting a $6,528 refund!

        If you had used the standard deduction:
        • Taxable income: $135,800
        • Tax: $20,022
        • Refund: $4,728

        By itemizing, you saved $1,800 in taxes! ✓

        Generate forms? (yes/no)
```

```
You: Yes

Claude: Generating tax forms...

        ✓ Form 1040
        ✓ Schedule A (Itemized Deductions)
        ✓ Form 1098 (Mortgage Interest Statement)

        Files saved to: ./ustaxes-output/

        ════════════════════════════════════════════
        DOCUMENT RETENTION
        ════════════════════════════════════════════

        Keep these for 7 years:
        ✓ Form 1098 (mortgage interest)
        ✓ Property tax bills
        ✓ Charitable donation receipts
        ✓ State tax payment records

        ════════════════════════════════════════════
        TAX TIPS FOR NEXT YEAR
        ════════════════════════════════════════════

        To maximize deductions:
        • Bunch charitable donations in one year
        • Pay January mortgage payment in December
        • Consider donor-advised fund
        • Track all medical expenses
        • Keep detailed donation records

        Questions?
```

---

### ✅ Tutorial 4 Complete!

**What You Learned:**
- Itemized vs. standard deduction comparison
- Mortgage interest deduction (Form 1098)
- SALT cap ($10,000 limit)
- Charitable contribution rules
- Medical expense threshold (7.5% AGI)
- Schedule A preparation
- Tax-saving strategies for homeowners

---

## Tutorial 5: Complex Multi-Source Income

**Scenario:** Linda has W-2 income, rental property, stock sales, and retirement distributions. This is a comprehensive return.

**Time:** 30 minutes
**Difficulty:** ★★★★☆ (Advanced)
**Forms Generated:** 1040, Schedule D, Schedule E, Form 8949, Form 4797

### Linda's Information
- Married Filing Jointly
- W-2: $95,000
- Rental property income/expenses
- Stock sales: $180,000 proceeds
- IRA distribution: $15,000

---

### (This tutorial is truncated for space - includes all aspects)

```
You: I have a complex return with rental income, stocks, and IRA

Claude: I'll guide you through this comprehensive return step by step.

        [Tutorial would continue with:]
        - W-2 income entry
        - Rental property (Schedule E)
          - Rental income
          - Depreciation
          - Repairs vs improvements
          - Passive activity rules
        - Stock sales (Schedule D, Form 8949)
        - IRA distribution (Form 1099-R)
          - Early withdrawal penalty check
          - Withholding
        - Tax calculation with multiple forms
        - Alternative Minimum Tax (AMT) check
        - Net Investment Income Tax (NIIT)

        Final forms:
        ✓ Form 1040
        ✓ Schedule D (Capital Gains)
        ✓ Schedule E (Rental Income)
        ✓ Form 8949 (Stock Sales)
        ✓ Form 4797 (Sale of Business Property)
        ✓ Form 8960 (NIIT)
        ✓ Possibly Form 6251 (AMT)
```

---

## Tutorial 6: Married Filing Jointly with Dependents

**Scenario:** The Martinez family - married with 3 children, claiming Child Tax Credit and dependent care credit.

**Time:** 18 minutes
**Difficulty:** ★★★☆☆ (Intermediate)
**Forms Generated:** 1040, Schedule 8812, Form 2441

### Family Information
- David & Maria Martinez
- 3 children (ages 5, 8, 14)
- Combined W-2: $135,000
- Daycare expenses: $8,000/year

---

### Step 1: Family Information

```
You: Help me file taxes for my family - married with 3 kids

Claude: Perfect! Let's prepare your family tax return.

        [Collects taxpayer info for both spouses]

        Now let's add your dependents.

        How many children do you have?
```

```
You: 3 children

Claude: Great! I'll collect information for each child.

        ════════════════════════════════════════════
        DEPENDENT #1
        ════════════════════════════════════════════

        First and last name?
```

```
You: Sofia Martinez

Claude: Date of birth? (MM/DD/YYYY)
```

```
You: 03/15/2019

Claude: Age: 5 years old

        Social Security Number?
```

```
You: 456-78-9012

Claude: Relationship to you?
```

```
You: Daughter

Claude: Did she live with you for more than 6 months? (yes/no)
```

```
You: Yes, all year

Claude: ✓ Sofia qualifies as a dependent
        ✓ Eligible for Child Tax Credit ($2,000)
        ✓ Under 13 - eligible for Child Care Credit

        ────────────────────────────────────────────
        DEPENDENT #2
        ────────────────────────────────────────────

        First and last name?
```

```
You: Carlos Martinez

Claude: Date of birth?
```

```
You: 08/22/2016

Claude: Age: 8 years old

        SSN?
```

```
You: 567-89-0123

Claude: Relationship?
```

```
You: Son

Claude: Lived with you all year?
```

```
You: Yes

Claude: ✓ Carlos qualifies as a dependent
        ✓ Eligible for Child Tax Credit ($2,000)
        ✓ Under 13 - eligible for Child Care Credit

        ────────────────────────────────────────────
        DEPENDENT #3
        ────────────────────────────────────────────

        First and last name?
```

```
You: Isabella Martinez

Claude: Date of birth?
```

```
You: 11/05/2010

Claude: Age: 14 years old

        SSN?
```

```
You: 678-90-1234

Claude: Relationship?
```

```
You: Daughter

Claude: Lived with you all year?
```

```
You: Yes

Claude: ✓ Isabella qualifies as a dependent
        ✓ Eligible for Child Tax Credit ($2,000)
        ✓ Over 13 - not eligible for Child Care Credit

        ════════════════════════════════════════════
        DEPENDENTS SUMMARY
        ════════════════════════════════════════════

        1. Sofia (age 5) - Daughter
        2. Carlos (age 8) - Son
        3. Isabella (age 14) - Daughter

        All qualify for Child Tax Credit: $6,000 total
        2 eligible for Child Care Credit (under 13)
```

---

### Step 2: Income and Childcare

```
Claude: [W-2 entry for both spouses - total $135,000]

        Now, did you pay for childcare in 2024?
        (Daycare, after-school care, summer camp)
```

```
You: Yes, daycare for Sofia and Carlos

Claude: Great! This may qualify for the Child and Dependent Care Credit.

        Who provided the care?
```

```
You: Little Stars Daycare

Claude: Provider's EIN or SSN?
        (Should be on your receipts)
```

```
You: 12-3456789

Claude: Total amount paid in 2024?
```

```
You: 8000

Claude: For both children?
```

```
You: Yes

Claude: Perfect! Let me calculate the credit:

        Qualifying expenses (max $6,000 for 2+ kids): $6,000
        Your income: $135,000

        Credit rate table (based on AGI):
        $135,000 → 20% credit rate

        ────────────────────────────────────────────
        Child Care Credit: $6,000 × 20% = $1,200
        ════════════════════════════════════════════

        Note: Only up to $3,000 per child ($6,000 for 2+)
        is eligible. Your $8,000 in expenses exceeds this,
        so we'll use the $6,000 maximum.
```

---

### Step 3: Tax Calculation with Credits

```
Claude: Calculating your family tax return...

        ════════════════════════════════════════════
        2024 TAX RETURN - Martinez Family
        ════════════════════════════════════════════

        INCOME
        David W-2                           $72,000
        Maria W-2                           $63,000
        ────────────────────────────────────────────
        Total income                       $135,000

        ADJUSTMENTS
        None                                      $0
        ────────────────────────────────────────────
        Adjusted Gross Income              $135,000

        DEDUCTIONS
        Standard deduction (MFJ)            $29,200
        ────────────────────────────────────────────
        Taxable income                     $105,800

        TAX CALCULATION
        $23,200 × 10%                        $2,320
        $71,100 × 12%                        $8,532
        $11,500 × 22%                        $2,530
        ────────────────────────────────────────────
        Tax before credits                  $13,382

        CREDITS
        Child Tax Credit:
          • Sofia (age 5)                    $2,000
          • Carlos (age 8)                   $2,000
          • Isabella (age 14)                $2,000
        Total Child Tax Credit               -$6,000

        Child Care Credit                    -$1,200
        ────────────────────────────────────────────
        Total credits                        -$7,200

        TAX AFTER CREDITS                     $6,182

        PAYMENTS
        David federal withholding           -$10,800
        Maria federal withholding            -$9,450
        ────────────────────────────────────────────
        Total withholding                   -$20,250

        REFUND                               $14,068
        ════════════════════════════════════════════

        Congratulations! You're getting a $14,068 refund.

        The Child Tax Credit saved you $6,000 and the
        Child Care Credit saved you another $1,200!

        Generate forms? (yes/no)
```

```
You: Yes

Claude: Generating tax forms...

        ✓ Form 1040
        ✓ Schedule 8812 (Child Tax Credit)
        ✓ Form 2441 (Child and Dependent Care)

        Files saved to: ./ustaxes-output/

        ════════════════════════════════════════════
        IMPORTANT NOTES
        ════════════════════════════════════════════

        Child Tax Credit:
        • $2,000 per qualifying child under 17
        • Fully refundable up to $1,700
        • Phases out at $400K AGI (MFJ)

        Child Care Credit:
        • Max $3,000 per child ($6,000 total for 2+)
        • 20%-35% credit rate (based on AGI)
        • Must have SSN/EIN for provider

        For Next Year:
        • Keep daycare receipts
        • Get provider TIN by January
        • Consider flexible spending account (FSA)
          for pre-tax childcare ($5,000 limit)

        Questions about credits or dependents?
```

---

### ✅ Tutorial 6 Complete!

**What You Learned:**
- Adding multiple dependents
- Child Tax Credit calculation
- Child and Dependent Care Credit
- Credit phaseouts and limits
- Schedule 8812 and Form 2441
- FSA planning for next year

---

## Troubleshooting Common Issues

### Issue 1: "OCR couldn't read my W-2"

**Solution:**
```
You: The W-2 scan is blurry, OCR failed

Claude: No problem! I can help you enter it manually.

        Let's go field by field. I'll tell you where to
        find each number on your W-2.

        Box 1 (top left) - Wages, tips, compensation?
```

**Prevention:**
- Scan at 300 DPI minimum
- Use good lighting
- Flatten the document
- Save as PDF, not JPG

---

### Issue 2: "Math doesn't match my calculation"

**Solution:**
```
You: Show me the detailed tax calculation

Claude: Here's the line-by-line breakdown:

        Taxable income: $75,000

        Tax Brackets (Single 2024):
        First $11,600 × 10% = $1,160
        Next $35,550 × 12% = $4,266
        Next $27,850 × 22% = $6,127
        ────────────────────────────────
        Total: $11,553

        [Shows exactly how each bracket applies]
```

---

### Issue 3: "Missing form I need"

**Solution:**
```
You: I need Form 8606 for my IRA

Claude: Form 8606 (Nondeductible IRAs) isn't currently
        supported in this automation layer.

        For now, you can:
        1. Complete it manually using IRS instructions
        2. Use IRS Free File for this form
        3. File the rest with UsTaxes, add 8606 separately

        Would you like help understanding Form 8606?
```

---

### Issue 4: "Validation errors"

**Solution:**
```
You: I'm getting validation errors

Claude: Let me check what's wrong:

        ❌ SSN format invalid: "123456789"
        Should be: "123-45-6789"

        ❌ Date of birth missing for dependent

        ❌ State required for W-2

        Let's fix these one by one...
```

---

## What's Next?

After completing these tutorials, you're ready to:

1. **Prepare your own return** using the patterns shown
2. **Explore advanced features** like:
   - Estimated tax calculations
   - Multi-year comparisons
   - What-if scenarios
   - Audit risk analysis

3. **Read the complete guides:**
   - Self-Employed Guide for Schedule C details
   - API Reference for programmatic access
   - Architecture docs for understanding the system

4. **Get help anytime:**
   ```
   You: How do I claim the education credit?
   You: What's the QBI deduction?
   You: Am I eligible for EITC?
   ```

---

## Practice Scenarios

Try these on your own:

### Scenario A: College Student
- Part-time job: $15,000
- Scholarships: $8,000
- Student loan interest: $600
- Can parents still claim you?

### Scenario B: Retirement
- Social Security: $28,000
- Pension: $35,000
- IRA distribution: $12,000
- Investment income: $5,000

### Scenario C: Side Business
- Full-time W-2: $70,000
- Etsy sales: $15,000
- Business expenses: $4,200
- Home office: 150 sq ft

---

## Need Help?

**During the conversation:**
```
You: I'm stuck, what should I do next?
You: Explain [topic] in simple terms
You: Show me an example of [scenario]
```

**Documentation:**
- Quick Start: `.claude/docs/QUICK_START.md`
- Full Guide: `.claude/docs/AI_AUTOMATION_GUIDE.md`
- Self-Employed: `.claude/docs/SELF_EMPLOYED_GUIDE.md`
- API Reference: `.claude/docs/API_REFERENCE.md`

**GitHub:**
- Issues: https://github.com/ustaxes/ustaxes/issues
- Discussions: https://github.com/ustaxes/ustaxes/discussions

---

**Happy filing!** 🎉

Remember: These tutorials are educational examples. Always review your actual tax forms carefully and consult a tax professional for complex situations.

---

**Last Updated:** 2025-11-27
**Version:** 1.0.0
**Tutorial Count:** 6 complete walkthroughs
