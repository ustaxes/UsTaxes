# Self-Employed Tax Guide
## Complete Guide for Freelancers, Contractors, and Small Business Owners

**Version:** 1.0
**Last Updated:** 2025-11-27
**For Tax Year:** 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start for Self-Employed](#quick-start-for-self-employed)
3. [Understanding Schedule C](#understanding-schedule-c)
4. [Business Income](#business-income)
5. [Business Expenses](#business-expenses)
6. [Home Office Deduction](#home-office-deduction)
7. [Self-Employment Tax](#self-employment-tax)
8. [Quarterly Estimated Taxes](#quarterly-estimated-taxes)
9. [Complete Walkthrough](#complete-walkthrough)
10. [Common Scenarios](#common-scenarios)
11. [Tax-Saving Strategies](#tax-saving-strategies)
12. [Frequently Asked Questions](#frequently-asked-questions)

---

## Overview

### Who This Guide Is For

You should use this guide if you:
- ✅ Work as a freelancer or independent contractor
- ✅ Receive 1099-NEC forms (not W-2s)
- ✅ Run a sole proprietorship
- ✅ Have a side business or gig work
- ✅ Are self-employed full-time or part-time

You might NOT need this guide if you:
- ❌ Only have W-2 income
- ❌ Are a partner in a partnership (use Schedule E)
- ❌ Own an S-corp or C-corp (different forms)
- ❌ Only have rental income (use Schedule E)

### What You'll File

As a self-employed individual, you'll need:

**Required Forms:**
- **Schedule C** (Profit or Loss from Business)
- **Schedule SE** (Self-Employment Tax)
- **Form 1040** (Individual Income Tax Return)

**Possibly Required:**
- **Schedule 1** (Additional Income and Adjustments)
- **Form 8829** (Home Office Expenses) - if using actual expense method
- **Form 4562** (Depreciation) - if you have assets to depreciate
- **Form 1040-ES** (Estimated Tax Vouchers) - for next year's payments

### Key Differences from W-2 Employment

| W-2 Employee | Self-Employed (1099) |
|--------------|----------------------|
| Employer withholds taxes | You pay estimated quarterly taxes |
| Employer pays half of SS/Medicare | You pay both halves (15.3%) |
| No business expense deductions | Can deduct business expenses |
| Simple tax return | Schedule C required |
| No estimated payments needed | Must make quarterly payments |
| Employment protections | No employment protections |

---

## Quick Start for Self-Employed

### 5-Minute Setup

```
You: I'm self-employed and need to do my taxes

Claude: I'll help you prepare your self-employed tax return.

        First, tell me about your business:
        - What type of work do you do?
        - When did you start?
        - What's your business name (if any)?

You: I'm a freelance software developer. Started January 2024.
     Business name is "John Doe Consulting"

Claude: Great! Now let's gather your income information.

        Did you receive any 1099-NEC forms?

You: Yes, 3 forms. Let me upload them.
     ~/taxes/1099-nec-client1.pdf
     ~/taxes/1099-nec-client2.pdf
     ~/taxes/1099-nec-client3.pdf

Claude: [Parses all 1099-NEC forms]

        Found income from:
        - Client A: $45,000
        - Client B: $32,000
        - Client C: $18,000
        ────────────────────────
        Total: $95,000

        Did you receive any cash or other payments not reported
        on 1099-NEC forms?

You: Yes, $3,000 from small projects

Claude: ✓ Total business income: $98,000

        Now let's track your business expenses.
        [Continues with expense entry...]
```

### What You'll Need

**Income Documents:**
- [ ] All 1099-NEC forms
- [ ] Records of cash/check payments
- [ ] Bank statements (for verification)
- [ ] PayPal/Venmo/other payment records

**Expense Records:**
- [ ] Receipts for business expenses
- [ ] Credit card statements
- [ ] Mileage log (if you drive for business)
- [ ] Home office measurements
- [ ] Utility bills (for home office)
- [ ] Internet/phone bills

**Other Documents:**
- [ ] Prior year tax return (for estimated taxes)
- [ ] Quarterly estimated tax payment records
- [ ] Business licenses/permits

---

## Understanding Schedule C

### What Is Schedule C?

Schedule C (Profit or Loss from Business) is where you report:
- All business income
- All business expenses
- Your net profit or loss

**Net Profit = Gross Income - Business Expenses**

This net profit is:
1. Subject to self-employment tax (15.3%)
2. Added to your other income for federal income tax
3. Used to calculate quarterly estimated taxes

### Schedule C Structure

```
Part I: Income
  Line 1: Gross receipts or sales
  ...
  Line 7: Gross income

Part II: Expenses
  Line 8: Advertising
  Line 9: Car and truck expenses
  Line 10: Commissions and fees
  ...
  Line 28: Total expenses

Part III: Cost of Goods Sold (if applicable)

Part IV: Information on Your Vehicle (if claiming car expenses)

Part V: Other Expenses
```

### Common Business Codes (Line B)

| Code | Description |
|------|-------------|
| 531210 | Software publishers |
| 541511 | Custom computer programming |
| 541512 | Computer systems design |
| 541990 | Professional, scientific, technical services |
| 711510 | Independent artists, writers, performers |
| 812990 | Personal services (consultants) |

**Pro Tip:** Choose the most specific code that matches your business.

---

## Business Income

### What Counts as Business Income?

**Include:**
- ✅ All 1099-NEC payments
- ✅ Cash payments from clients
- ✅ Check payments
- ✅ Credit card payments
- ✅ PayPal, Venmo, Zelle, etc.
- ✅ Bartering (fair market value)
- ✅ Form 1099-K payments (if business)

**Don't Include:**
- ❌ Personal gifts
- ❌ Loans (to be repaid)
- ❌ Capital contributions
- ❌ Refunds for expenses

### Tracking Income

**Best Practices:**
```
1. Separate business bank account
2. Use accounting software (QuickBooks, FreshBooks, Wave)
3. Save all invoices
4. Record cash payments immediately
5. Reconcile monthly
```

### Entering Income in Claude

```
You: My business income for 2024 was:
     1099-NEC from Client A: $45,000
     1099-NEC from Client B: $32,000
     1099-NEC from Client C: $18,000
     Cash payments: $3,000

Claude: ✓ Total business income: $98,000

        I'll report this on Schedule C, Line 1 (Gross receipts).

        Note: You should receive 1099-NEC forms for any client
              who paid you $600 or more. Verify you've included
              all sources.
```

---

## Business Expenses

### What Can You Deduct?

**The IRS Test:** An expense must be:
1. **Ordinary** - Common and accepted in your industry
2. **Necessary** - Helpful and appropriate for your business

### Major Expense Categories

#### 1. Home Office (Special Rules - See Section Below)

#### 2. Vehicle Expenses

**Two Methods:**

**A. Standard Mileage Rate (2024: $0.67/mile)**
```
You: I drove 8,000 business miles in 2024

Claude: Vehicle deduction (standard mileage):
        8,000 miles × $0.67 = $5,360

        Plus: Parking and tolls (separate)
```

**B. Actual Expense Method**
```
You: My car expenses were:
     Gas: $2,400
     Insurance: $1,200
     Repairs: $800
     Registration: $150
     Total: $4,550

     Business use: 60%

Claude: Vehicle deduction (actual expenses):
        $4,550 × 60% = $2,730

        Plus depreciation if you own the vehicle.
```

**Pro Tip:** Calculate both methods and use the higher deduction.

#### 3. Equipment & Supplies

**Office Supplies:**
- Pens, paper, printer ink
- Computer accessories
- Software subscriptions
- Office furniture (under $2,500 can be expensed immediately)

**Equipment:**
- Computers, laptops, tablets
- Cameras, recording equipment
- Specialized tools
- Can be depreciated or expensed (Section 179)

**Example:**
```
You: I bought a new MacBook Pro for $2,800 in March 2024

Claude: You have two options:

        Option 1: Section 179 Deduction
        Deduct full $2,800 in 2024

        Option 2: Depreciation
        Deduct over 5 years (computer equipment)
        2024 deduction: ~$560 (half-year convention)

        Recommendation: Use Section 179 for full deduction
```

#### 4. Professional Services

Deductible:
- Accounting and bookkeeping fees
- Legal fees (business-related)
- Consulting fees
- Web design and hosting
- Professional memberships

**Example:**
```
You: I paid my accountant $1,200 for tax prep and quarterly bookkeeping

Claude: ✓ Deductible as "Legal and professional services"
        Schedule C, Line 17: $1,200
```

#### 5. Advertising & Marketing

- Website costs
- Business cards
- Online ads (Google, Facebook, LinkedIn)
- Promotional materials
- Sponsorships

#### 6. Insurance

**Deductible:**
- Business liability insurance
- Professional liability (E&O)
- Business property insurance
- Cyber liability insurance

**NOT on Schedule C:**
- Health insurance (separate deduction on Schedule 1)
- Life insurance (generally not deductible)

#### 7. Education & Training

**Deductible:**
- Courses to improve current skills
- Professional development
- Industry conferences
- Business books and publications

**NOT Deductible:**
- Education to qualify for new profession
- Personal development not related to business

#### 8. Meals & Entertainment

**50% Deductible:**
- Business meals with clients
- Meals while traveling for business
- Meals at business conferences

**100% Deductible (2024):**
- Office snacks for employees
- Company holiday party

**Example:**
```
You: I spent $3,200 on client lunches and dinners

Claude: Meals deduction:
        $3,200 × 50% = $1,600 deductible
        Schedule C, Line 24b
```

#### 9. Travel

**100% Deductible:**
- Airfare for business trips
- Hotel stays
- Rental cars
- Uber/Lyft for business
- Conference registration fees

**50% Deductible:**
- Meals while traveling

**Example:**
```
You: I attended a conference:
     Airfare: $450
     Hotel: $600 (3 nights)
     Conference fee: $800
     Meals: $200

Claude: Travel deduction:
        Airfare: $450 ✓
        Hotel: $600 ✓
        Conference: $800 ✓
        Meals: $100 (50% of $200)
        ────────────────────
        Total: $1,950
```

#### 10. Contract Labor

If you hire subcontractors:
- Deductible on Schedule C, Line 11
- You must issue 1099-NEC if you pay $600+
- Keep contracts and invoices

#### 11. Utilities & Phone

**Business Use Percentage Method:**
```
You: My internet is $100/month. I use it 80% for business.
     My cell phone is $80/month. I use it 50% for business.

Claude: Utilities deduction:
        Internet: $1,200/year × 80% = $960
        Phone: $960/year × 50% = $480
        ────────────────────────────────
        Total: $1,440
```

### Complete Expense Entry Example

```
You: Here are all my business expenses for 2024:

     Office supplies: $1,200
     Software subscriptions: $4,800
     Internet (80% business): $960
     Cell phone (50% business): $480
     Professional development: $2,500
     Accounting fees: $1,200
     Business insurance: $800
     Client meals: $3,200
     Conference (travel + fees): $1,950
     Marketing (website + ads): $2,400
     Contract labor: $8,500

Claude: Calculating Schedule C expenses...

        Line 8 (Advertising): $2,400
        Line 11 (Contract labor): $8,500
        Line 15 (Insurance): $800
        Line 17 (Legal/professional): $1,200
        Line 18 (Office expense): $1,200
        Line 24a (Travel): $1,950
        Line 24b (Meals): $1,600 (50% of $3,200)
        Line 25 (Utilities): $1,440
        Line 27a (Other expenses):
          - Software: $4,800
          - Training: $2,500
        ────────────────────────────────────
        Total Expenses: $26,390

        Gross Income: $98,000
        Total Expenses: -$26,390
        ────────────────────────────────────
        Net Profit: $71,610

        This net profit will be subject to:
        1. Self-employment tax: ~$10,119 (15.3%)
        2. Federal income tax: Based on your bracket
```

---

## Home Office Deduction

### Qualification Requirements

You can claim home office deduction if:
1. ✅ You use part of your home **exclusively** for business
2. ✅ You use it **regularly** for business
3. ✅ It's your **principal place of business**

**Exclusively = Only for Business**
- ✅ Dedicated room used only as office
- ✅ Section of room with clear separation
- ❌ Dining table you also use for meals
- ❌ Guest bedroom with desk in corner (if also used for guests)

### Two Methods

#### Method 1: Simplified Method (Easier)

**Formula:** Square footage × $5/sq ft (max 300 sq ft)

**Example:**
```
You: I have a 200 sq ft home office

Claude: Simplified home office deduction:
        200 sq ft × $5 = $1,000

        This is deducted on Schedule C, Line 30.
        No Form 8829 required.
```

**Pros:**
- ✅ Simple calculation
- ✅ No Form 8829 needed
- ✅ No depreciation recapture when you sell home

**Cons:**
- ❌ Usually lower deduction
- ❌ Max $1,500 (300 sq ft limit)

#### Method 2: Actual Expense Method (More Complex)

**Formula:** Home expenses × (Office sq ft / Total home sq ft)

**Example:**
```
You: Home office: 200 sq ft
     Total home: 2,000 sq ft
     Business percentage: 10%

     Annual home expenses:
     Mortgage interest: $15,000
     Property tax: $6,000
     Utilities: $3,600
     Home insurance: $1,200
     HOA fees: $2,400
     Repairs (whole house): $1,800
     Total: $30,000

Claude: Actual expense home office deduction:

        Direct expenses (office only):
        - Office paint/repairs: $0

        Indirect expenses (whole home × 10%):
        - Mortgage interest: $1,500
        - Property tax: $600
        - Utilities: $360
        - Insurance: $120
        - HOA: $240
        - Repairs: $180
        ────────────────────────────────
        Total: $3,000

        Plus depreciation: ~$400/year (if you own)
        ────────────────────────────────
        Total deduction: $3,400

        This requires Form 8829.
```

**Pros:**
- ✅ Usually higher deduction
- ✅ No square footage limit
- ✅ Can include depreciation

**Cons:**
- ❌ More complex
- ❌ Requires Form 8829
- ❌ Depreciation recapture when selling home

### Which Method to Choose?

```
You: Which home office method should I use?

Claude: Let me calculate both:

        Simplified: 200 sq ft × $5 = $1,000
        Actual: $3,400 (including depreciation)

        Recommendation: Use actual expense method
        Additional tax savings: ~$336 (at 12% bracket + SE tax)

        Would you like me to prepare Form 8829?
```

### Home Office Entry Example

```
You: I have a dedicated 250 sq ft home office in my 2,000 sq ft home.

     Calculate using actual expense method:

     Mortgage interest: $18,000/year
     Property tax: $8,000/year
     Utilities: $4,800/year
     Home insurance: $1,500/year
     Internet: $1,200/year
     Repairs/maintenance: $2,000/year

Claude: Home office deduction (actual expenses):

        Business percentage: 250/2,000 = 12.5%

        Deductible expenses:
        Mortgage interest: $18,000 × 12.5% = $2,250
        Property tax: $8,000 × 12.5% = $1,000
        Utilities: $4,800 × 12.5% = $600
        Insurance: $1,500 × 12.5% = $188
        Internet: $1,200 × 100% = $1,200 (business use)
        Repairs: $2,000 × 12.5% = $250
        ────────────────────────────────────────
        Total: $5,488

        Plus depreciation (if owned): ~$450
        ────────────────────────────────────────
        Total home office deduction: $5,938

        Tax savings (25% effective rate): ~$1,485
```

---

## Self-Employment Tax

### What Is Self-Employment Tax?

**Components:**
- **12.4%** Social Security tax (on first $168,600 of SE income in 2024)
- **2.9%** Medicare tax (on all SE income)
- **0.9%** Additional Medicare tax (on SE income over $200K single / $250K married)

**Total: 15.3%** on most self-employment income

### Why Do You Pay This?

W-2 employees split this cost with employers (7.65% each). As self-employed, you pay both halves.

### Calculation

```
You: My net profit was $71,610. What's my self-employment tax?

Claude: Calculating Schedule SE (Self-Employment Tax):

        Net profit from Schedule C: $71,610

        Step 1: Calculate SE income
        $71,610 × 92.35% = $66,142

        Step 2: Apply SE tax rates
        Social Security: $66,142 × 12.4% = $8,202
        Medicare: $66,142 × 2.9% = $1,918
        ──────────────────────────────────────
        Total SE tax: $10,120

        Step 3: Half is deductible
        Deductible amount: $5,060
        (This reduces your AGI on Schedule 1, Line 15)

        Your total tax burden:
        Self-employment tax: $10,120
        Plus federal income tax on: $66,550 ($71,610 - $5,060)
```

### SE Tax Strategies

**1. S-Corp Election (Advanced)**
```
If net profit > $60K, consider S-corp:
- Pay yourself reasonable salary (subject to SE tax)
- Take remaining profit as distribution (no SE tax)
- Requires payroll, tax returns, more complexity
- Consult CPA before electing
```

**2. Maximize Deductions**
```
Every $1,000 in business expenses saves:
- SE tax: ~$153
- Income tax: ~$120 (12% bracket)
- Total: ~$273
```

**3. Retirement Contributions**
```
SEP-IRA or Solo 401(k):
- Reduces income tax
- Doesn't reduce SE tax
- Can contribute up to $69,000 (2024)
```

---

## Quarterly Estimated Taxes

### Why Pay Quarterly?

W-2 employees have taxes withheld. Self-employed must pay estimated taxes quarterly to avoid penalties.

### When to Pay

| Quarter | Period | Due Date |
|---------|--------|----------|
| Q1 | Jan 1 - Mar 31 | April 15 |
| Q2 | Apr 1 - May 31 | June 17 |
| Q3 | Jun 1 - Aug 31 | September 16 |
| Q4 | Sep 1 - Dec 31 | January 15 (next year) |

### How Much to Pay

**Safe Harbor Rules (Avoid Penalty):**
1. Pay **90% of current year tax**, OR
2. Pay **100% of prior year tax** (110% if AGI > $150K)

### Calculating Quarterly Payments

```
You: I expect to earn $98,000 and have $26,000 in expenses.
     What should my quarterly payments be?

Claude: Estimating 2024 taxes:

        Net profit: $72,000
        SE tax: ~$10,181
        Deductible SE tax: -$5,091
        Taxable income: $66,909
        Standard deduction: -$14,600
        ──────────────────────────────
        Taxable income: $52,309

        Federal income tax:
        $11,600 @ 10%: $1,160
        $40,709 @ 12%: $4,885
        ──────────────────────────────
        Income tax: $6,045

        Total tax:
        SE tax: $10,181
        Income tax: $6,045
        ──────────────────────────────
        Total: $16,226

        Quarterly payment: $16,226 / 4 = $4,057

        Due dates:
        Q1 (Apr 15): $4,057
        Q2 (Jun 17): $4,057
        Q3 (Sep 16): $4,057
        Q4 (Jan 15): $4,057

        Would you like me to generate Form 1040-ES vouchers?
```

### Making Payments

**Options:**
1. **IRS Direct Pay** (free): https://www.irs.gov/payments/direct-pay
2. **EFTPS** (Electronic Federal Tax Payment System): https://www.eftps.gov
3. **Mail with voucher** (Form 1040-ES)
4. **Credit/debit card** (convenience fee ~2%)

**Pro Tip:** Set up automatic quarterly payments via EFTPS.

---

## Complete Walkthrough

### Scenario: Freelance Graphic Designer

**Profile:**
- Name: Sarah Johnson
- Business: Freelance graphic design
- Started: January 1, 2024
- Filing status: Single
- Home office: 180 sq ft of 1,200 sq ft apartment

**Let's prepare her complete return:**

#### Step 1: Start

```
You: I'm a freelance graphic designer and need to do my 2024 taxes

Claude: I'll help you prepare your Schedule C for your graphic design business.

        First, let me get some basic information:
        - Business name: (if different from your name)
        - When did you start:
        - Principal business code:

You: Business name: Sarah Johnson Design
     Started: January 1, 2024
     Business code: 541430 (Graphic Design Services)

Claude: ✓ Got it. Now let's gather your income.
```

#### Step 2: Income

```
You: I have three 1099-NEC forms:
     Client A (Tech Startup): $42,000
     Client B (Marketing Agency): $28,000
     Client C (Small Business): $15,000

     Plus $3,500 in cash from smaller projects

Claude: Total business income:

        1099-NEC income: $85,000
        Cash income: $3,500
        ──────────────────────────
        Gross receipts: $88,500

        ✓ This will go on Schedule C, Line 1
```

#### Step 3: Expenses

```
You: My business expenses:

     Adobe Creative Cloud: $600/year
     Office supplies (paper, pens): $450
     Computer equipment: $2,100 (new iPad Pro)
     Professional development (Skillshare, courses): $800
     Business insurance: $650
     Accounting software (QuickBooks): $360
     Website hosting and domain: $240
     Marketing (business cards, portfolio site): $1,200
     Client meetings (coffee, meals): $1,800
     Professional association membership: $350
     Stock photos and fonts: $480

Claude: Categorizing Schedule C expenses:

        Line 8 (Advertising): $1,200
        Line 15 (Insurance): $650
        Line 18 (Office expense): $450
        Line 24b (Meals): $900 (50% of $1,800)
        Line 27a (Other expenses):
          - Software (Adobe): $600
          - Software (QuickBooks): $360
          - Website: $240
          - Education: $800
          - Memberships: $350
          - Stock assets: $480
          - Equipment: $2,100
        ──────────────────────────────
        Total: $8,130

        Note: iPad can be fully deducted via Section 179
```

#### Step 4: Home Office

```
You: I have a dedicated 180 sq ft office in my 1,200 sq ft apartment

     Rent: $24,000/year ($2,000/month)
     Utilities: $1,800/year
     Renters insurance: $360/year
     Internet: $720/year (100% business use)

Claude: Home office deduction calculation:

        Method 1 (Simplified):
        180 sq ft × $5 = $900

        Method 2 (Actual):
        Business %: 180/1,200 = 15%

        Rent: $24,000 × 15% = $3,600
        Utilities: $1,800 × 15% = $270
        Insurance: $360 × 15% = $54
        Internet: $720 × 100% = $720
        ──────────────────────────────
        Total: $4,644

        Recommendation: Use actual expense method
        Additional deduction: $3,744

        Total expenses with home office: $12,774
```

#### Step 5: Calculate Net Profit

```
Claude: Schedule C Summary:

        Gross receipts: $88,500
        Total expenses: -$12,774
        ──────────────────────────────
        Net profit: $75,726

        This is your business profit before taxes.
```

#### Step 6: Self-Employment Tax

```
Claude: Calculating Schedule SE:

        Net profit: $75,726
        × 92.35%: $69,933 (SE income)

        Social Security: $69,933 × 12.4% = $8,672
        Medicare: $69,933 × 2.9% = $2,028
        ──────────────────────────────
        SE tax: $10,700

        Deductible half: $5,350
        (Reduces your AGI)
```

#### Step 7: Federal Income Tax

```
Claude: Calculating federal income tax:

        Schedule C profit: $75,726
        Less: ½ SE tax: -$5,350
        ──────────────────────────────
        AGI: $70,376

        Less: Standard deduction: -$14,600
        ──────────────────────────────
        Taxable income: $55,776

        Tax calculation (2024 single rates):
        $11,600 @ 10%: $1,160
        $44,176 @ 12%: $5,301
        ──────────────────────────────
        Income tax: $6,461

        Total tax liability:
        SE tax: $10,700
        Income tax: $6,461
        ──────────────────────────────
        Total: $17,161
```

#### Step 8: Estimated Payments

```
You: I didn't make any estimated payments during 2024

Claude: Tax due: $17,161

        You may owe an underpayment penalty since you didn't
        make estimated payments.

        For 2025, you should make quarterly payments of:
        $17,161 / 4 = $4,290 per quarter

        Due dates:
        - April 15, 2025: $4,290
        - June 17, 2025: $4,290
        - September 16, 2025: $4,290
        - January 15, 2026: $4,290

        Would you like me to generate 1040-ES vouchers?
```

#### Step 9: Tax-Saving Opportunities

```
Claude: Here are some ways to reduce your 2024 tax bill:

        1. Traditional IRA Contribution (deadline: April 15, 2025)
           Max: $7,000 ($8,000 if age 50+)
           Tax savings: $7,000 × 27.7% = ~$1,940

        2. SEP-IRA Contribution (deadline: April 15, 2025)
           Max: $75,726 × 20% = $15,145
           Tax savings: $15,145 × 27.7% = ~$4,195

        3. Health Insurance Premiums
           If you paid for your own health insurance,
           it's 100% deductible on Schedule 1

        Would you like to add any of these?

You: Yes, I'll contribute $7,000 to a Traditional IRA

Claude: ✓ Updated calculation:

        AGI: $70,376
        Less: IRA contribution: -$7,000
        ──────────────────────────────
        New AGI: $63,376

        New taxable income: $48,776

        New income tax: $5,621
        Total tax: $16,321 (SE tax + income tax)

        Tax saved: $840
        Amount due: $16,321
```

#### Step 10: Generate Forms

```
You: Generate all my tax forms

Claude: Generating 2024 tax return for Sarah Johnson...

        ✓ Form 1040 (Individual Income Tax Return)
        ✓ Schedule 1 (Additional Income and Adjustments)
        ✓ Schedule C (Profit or Loss from Business)
        ✓ Schedule SE (Self-Employment Tax)
        ✓ Form 8829 (Expenses for Business Use of Home)
        ✓ Form 1040-ES (2025 Estimated Tax Vouchers)

        Saved to: ./ustaxes-output/2024-SarahJohnson-SelfEmployed.pdf

        Summary:
        - Gross business income: $88,500
        - Net business profit: $75,726
        - Self-employment tax: $10,700
        - Federal income tax: $5,621
        - Total tax: $16,321
        - Amount due: $16,321

        ⚠️ Remember to:
        1. Review all forms carefully
        2. Sign and date
        3. File by April 15, 2025
        4. Make 2025 estimated payments quarterly
```

---

## Common Scenarios

### Scenario 1: Part-Time Side Gig

**Profile:** Full-time W-2 employee + side freelance work

```
You: I have a W-2 ($60,000) and made $12,000 freelancing on the side

Claude: You'll need:
        - Form 1040
        - Schedule C (for $12,000 freelance income)
        - Schedule SE (for SE tax on $12,000)

        Your W-2 withholding may not cover the additional tax
        from freelancing (~$1,700 SE tax + ~$1,440 income tax).

        For next year, either:
        1. Make quarterly estimated payments, OR
        2. Increase W-4 withholding at your day job
```

### Scenario 2: First Year in Business (Mid-Year Start)

**Profile:** Started business in July

```
You: I started my consulting business on July 1, 2024
     Income July-Dec: $35,000
     Expenses July-Dec: $8,000

Claude: ✓ Schedule C for partial year:
        Gross income: $35,000
        Expenses: $8,000
        Net profit: $27,000

        SE tax: ~$3,817
        Income tax: ~$3,240 (single, no other income)

        For 2025, plan for full year:
        Projected annual income: $70,000
        Quarterly payments: ~$3,850
```

### Scenario 3: Loss in First Year

**Profile:** New business with more expenses than income

```
You: My first year:
     Income: $15,000
     Expenses: $22,000
     Net loss: -$7,000

Claude: Schedule C with loss:
        This $7,000 loss can offset other income (W-2, spouse's
        income, etc.) reducing your overall tax.

        No self-employment tax (loss, not profit).

        ⚠️ Hobby Loss Rules:
        You must show profit in 3 of 5 years to avoid being
        classified as a hobby. Keep good records showing
        business intent.
```

### Scenario 4: Multiple Businesses

**Profile:** Two separate side businesses

```
You: I have two businesses:
     1. Freelance writing: $25,000 income, $5,000 expenses
     2. Etsy shop: $8,000 income, $6,000 expenses

Claude: You'll file two Schedule Cs:

        Schedule C #1 (Writing):
        Net profit: $20,000

        Schedule C #2 (Etsy):
        Net profit: $2,000

        Total SE income: $22,000
        SE tax: ~$3,111

        Both net profits combine for income tax calculation.
```

### Scenario 5: Switching from W-2 to Self-Employed Mid-Year

```
You: I was employed Jan-June (W-2: $45,000, withheld $6,000)
     Went self-employed July-Dec (earned $40,000, expenses $8,000)

Claude: Your 2024 return will include:

        W-2 income: $45,000
        Schedule C profit: $32,000

        Total income: $77,000
        SE tax on $32,000: ~$4,522
        Income tax: ~$8,400

        Less W-2 withholding: -$6,000
        ──────────────────────────────
        Tax due: ~$6,922

        You'll need to make estimated payments in 2025 for
        the full year of self-employment.
```

---

## Tax-Saving Strategies

### 1. Maximize Business Deductions

**Commonly Missed Deductions:**

```
✓ Bank fees and merchant processing fees
✓ PayPal/Stripe fees
✓ Domain registrations
✓ Email marketing tools (Mailchimp, ConvertKit)
✓ Zoom/Skype subscriptions
✓ Cloud storage (Dropbox, Google Workspace)
✓ Business licenses and permits
✓ Professional headshots
✓ Coworking space memberships
✓ Trade publications and subscriptions
✓ Business-related podcast equipment
✓ Client gifts (up to $25 per person)
```

### 2. Retirement Contributions

**Options for Self-Employed:**

#### SEP-IRA
```
Contribution limit: Up to 25% of net SE income
Max: $69,000 (2024)
Deadline: Tax return deadline + extensions

Example:
Net SE income: $80,000
Max contribution: $80,000 × 20% = $16,000
Tax savings: $16,000 × 27.7% = ~$4,432
```

#### Solo 401(k)
```
Employee contribution: Up to $23,000 (2024)
Plus employer contribution: Up to 25% of SE income
Max combined: $69,000 (2024)
Age 50+: Additional $7,500 catch-up

Example:
Net SE income: $80,000
Employee: $23,000
Employer: $16,000
Total: $39,000 possible
Tax savings: $39,000 × 27.7% = ~$10,803
```

#### Traditional IRA
```
Contribution limit: $7,000 (2024)
Age 50+: Additional $1,000
Fully deductible if no retirement plan at work

Tax savings: $7,000 × 27.7% = ~$1,940
```

### 3. Health Insurance Deduction

```
You: I paid $8,400 for health insurance in 2024

Claude: Self-employed health insurance deduction:

        This is deducted on Schedule 1, Line 17
        (NOT on Schedule C)

        Reduces AGI by $8,400
        Tax savings: $8,400 × 27.7% = ~$2,327

        Note: Cannot exceed your net SE income
```

### 4. Qualified Business Income (QBI) Deduction

```
If your taxable income is under $191,950 (single) or
$383,900 (married), you may get an additional 20% deduction
on your QBI.

Example:
Net SE income: $75,000
QBI deduction: $75,000 × 20% = $15,000

This reduces taxable income by an additional $15,000
Tax savings: $15,000 × 12% = $1,800

Claude automatically calculates this if you're eligible.
```

### 5. Vehicle Strategy

**Best Practice:**
```
Year 1: Use actual expense method + bonus depreciation
  Can deduct ~40% of vehicle cost immediately

Years 2+: Switch to standard mileage
  Usually results in higher overall deduction

This maximizes total deductions over vehicle life.
```

### 6. Timing Income and Expenses

**December Strategy:**
```
Defer income to January (if cash basis):
- Invoice in late December, receive payment in January
- Pushes income to next year

Accelerate expenses to December:
- Buy equipment before year-end
- Pay January expenses in December
- Prepay annual subscriptions

Result: Lower current year tax
```

### 7. Family Employment

**Hiring Your Spouse:**
```
Advantages:
- Their salary is business deduction
- Can provide them with health insurance (deductible)
- Contributions to their 401(k) (deductible)

Requirements:
- Must be legitimate work
- Must pay reasonable wage
- Must issue W-2
```

**Hiring Your Children:**
```
Child under 18:
- No FICA tax (if sole proprietorship)
- Their income taxed at lower rate
- Standard deduction: $14,600 (effectively tax-free)

Example:
Pay child $10,000 for legitimate work
- Your deduction: $10,000 × 27.7% = $2,770 saved
- Their tax: $0 (under standard deduction)
- Net family savings: $2,770
```

### 8. Section 179 and Bonus Depreciation

**Equipment Purchases:**
```
Section 179: Deduct up to $1,220,000 in equipment (2024)
Bonus Depreciation: 60% in 2024 (phasing down)

Example: Buy $30,000 worth of equipment
Option 1: Section 179 - deduct full $30,000 in 2024
Option 2: Bonus depreciation - deduct $18,000 in 2024
Option 3: Regular depreciation - deduct ~$6,000/year

Best: Use Section 179 for immediate full deduction
Tax savings: $30,000 × 27.7% = $8,310
```

---

## Frequently Asked Questions

### Income Questions

**Q: Do I need to report cash income?**
A: Yes, ALL income must be reported, regardless of whether you received a 1099.

**Q: What if I didn't receive a 1099-NEC from a client who paid me $5,000?**
A: Still report it. Clients must issue 1099-NEC for $600+, but you report all income.

**Q: I received a 1099-K from PayPal. Do I also report it?**
A: Yes, but avoid double-counting. Match 1099-K to your actual sales records.

**Q: Is barter income taxable?**
A: Yes, report the fair market value of goods/services received.

### Expense Questions

**Q: Can I deduct my gym membership?**
A: Only if you're a fitness professional and it's directly related to your business.

**Q: Can I deduct my regular commute?**
A: No, but you can deduct:
  - Travel to client sites
  - Travel between multiple work locations
  - Travel from home office to other work location

**Q: What about my business clothing?**
A: Only if it's:
  - Required for your work AND
  - Not suitable for everyday wear
  (Examples: Uniforms, protective gear, costumes)

**Q: Can I deduct my entire cell phone bill?**
A: Only the business-use percentage. Track business vs. personal usage.

### Home Office Questions

**Q: Can I claim home office if I sometimes work from coffee shops?**
A: Yes, as long as your home office is your *principal* place of business.

**Q: I rent. Can I still claim home office?**
A: Yes! Use the portion of rent for your office space.

**Q: Will home office deduction trigger an audit?**
A: Not if you legitimately qualify. Keep good records and photos.

### Tax Payment Questions

**Q: I missed making quarterly estimated payments. What happens?**
A: You may owe an underpayment penalty (~3-5% annually on the shortfall). Pay as much as you can now to minimize the penalty.

**Q: Can I pay my tax bill with a credit card?**
A: Yes, but there's a ~2% processing fee. Only worthwhile for rewards cards that offset the fee.

**Q: Can I set up a payment plan?**
A: Yes, IRS offers installment agreements. Interest and penalties continue to accrue.

### Retirement Questions

**Q: Which retirement plan is best for self-employed?**
A:
- Low income (<$50K): Traditional IRA
- Moderate income ($50K-$100K): SEP-IRA
- High income (>$100K): Solo 401(k)

**Q: When is the deadline for retirement contributions?**
A:
- SEP-IRA: Tax return deadline + extensions (Oct 15)
- Solo 401(k): Dec 31 (employee portion), tax deadline (employer)
- Traditional IRA: April 15 (no extensions)

### Record-Keeping Questions

**Q: How long should I keep records?**
A:
- Tax returns: Forever
- Supporting documents: 7 years minimum
- Property records: As long as you own + 7 years

**Q: What records do I need to keep?**
A:
- All invoices and receipts
- Bank statements
- Credit card statements
- Mileage logs
- Home office measurements and photos
- Contracts with clients
- 1099 forms

**Q: Can I use my personal bank account?**
A: Legally yes, but it makes accounting much harder. Strongly recommend separate business account.

### Software Questions

**Q: What accounting software should I use?**
A: Popular options:
- **QuickBooks Self-Employed**: $15/mo, simple
- **Wave**: Free, basic features
- **FreshBooks**: $17/mo, invoicing focus
- **QuickBooks Online**: $30/mo, full-featured

**Q: Do I need to use software?**
A: No, but it makes life much easier. At minimum, use a spreadsheet.

---

## Conclusion

Self-employment offers freedom and flexibility, but also tax complexity. Key takeaways:

✅ **Track everything** - Income and expenses, all year
✅ **Separate finances** - Business bank account and credit card
✅ **Pay quarterly** - Avoid underpayment penalties
✅ **Maximize deductions** - Especially home office and retirement
✅ **Keep excellent records** - For 7+ years
✅ **Plan ahead** - Tax strategy throughout the year, not just at filing

### Next Steps

1. **Gather all documents** (1099s, receipts, records)
2. **Start conversation with Claude Code** ("I'm self-employed...")
3. **Follow the walkthrough** in this guide
4. **Review generated forms** carefully
5. **Consider professional review** if income > $100K or complex situation
6. **File on time** (April 15 deadline)
7. **Set up 2025 quarterly payments**

---

**Need Help?** Start a conversation:
```
You: I'm self-employed and need help with my taxes
```

Claude will guide you through the entire process, step by step.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**For Tax Year:** 2024
