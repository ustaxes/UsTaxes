---
name: optimize-deductions
description: "Identify legitimate deduction opportunities and tax-saving strategies for your return"
args:
  - name: year
    description: "Tax year to optimize (default: 2024)"
    required: false
  - name: focus
    description: "Focus area: itemized, business, retirement, education, all (default: all)"
    required: false
---

# Optimize Deductions

Find every legitimate deduction and tax-saving opportunity.

## Overview

This command invokes the **deduction-optimizer** skill to:
- Analyze your current return for missed deductions
- Compare itemized vs standard deduction
- Identify retirement contribution opportunities
- Find education credits
- Suggest business expense deductions
- Recommend timing strategies
- Calculate potential tax savings for each opportunity

## When to Use

Run this command:
- **During tax preparation** - Before finalizing return
- **After major life events** - Marriage, home purchase, child born
- **Year-end planning** - December optimization for current year
- **Before filing** - Final check for missed deductions
- **After income changes** - New job, raise, bonus

## Optimization Categories

### 1. Above-the-Line Deductions
- Traditional IRA contributions
- HSA contributions
- Student loan interest
- Self-employment tax
- Self-employed health insurance
- Educator expenses

### 2. Itemized Deductions
- Medical expenses
- State and local taxes (SALT)
- Mortgage interest
- Charitable contributions
- Casualty losses

### 3. Business Deductions
- Home office
- Vehicle expenses
- Equipment and supplies
- Professional services
- Business meals and travel

### 4. Tax Credits
- Child tax credit
- Dependent care credit
- Education credits
- Energy efficiency credits
- Retirement savings contributions credit

### 5. Timing Strategies
- Income deferral
- Deduction acceleration
- Bunching strategy
- Tax-loss harvesting

## Optimization Process

### Phase 1: Load Return Data

```typescript
const taxYear = args.year ?? 2024
const focus = args.focus ?? 'all'
const state = store.getState()
const yearState = state[`Y${taxYear}`]

if (!yearState) {
  throw new Error(`No ${taxYear} tax return found. Run /prepare-return first.`)
}

console.log(`Analyzing ${taxYear} return for optimization opportunities...`)
console.log(`Focus area: ${focus}`)
```

### Phase 2: Calculate Current Position

```markdown
## Current Tax Situation

**Filing Status:** Married Filing Jointly
**Adjusted Gross Income:** $187,500
**Taxable Income:** $157,500
**Tax Liability:** $24,326
**Effective Tax Rate:** 13.0%
**Marginal Tax Rate:** 22%

**Current Deductions:**
- Standard deduction: $29,200 (not used)
- Itemized deductions: $30,000 ✓
  - SALT: $10,000
  - Mortgage interest: $15,000
  - Charitable: $5,000

**Current Credits:**
- Child tax credit: $2,000

**Refund/Owed:** $1,924 refund

---

Let me analyze opportunities to improve this position...
```

### Phase 3: Itemized vs Standard Analysis

```markdown
## Deduction Strategy Analysis

### Standard vs Itemized Comparison

**Standard Deduction for MFJ:** $29,200

**Your Itemized Deductions:**
| Category | Amount | Notes |
|----------|--------|-------|
| Medical expenses | $0 | Below 7.5% AGI threshold ($14,062) |
| State/local taxes | $10,000 | SALT cap applied |
| Mortgage interest | $15,000 | From Form 1098 |
| Charitable contributions | $5,000 | Cash donations |
| Other | $0 | - |
| **Total** | **$30,000** | |

**Current Strategy:** Itemizing ✓
**Savings over standard:** $800 in taxable income = ~$176 in tax

### Optimization Opportunity

**Medical Expenses:**
- Current total: $8,000
- Threshold (7.5% AGI): $14,062
- **Need additional:** $6,062 to get ANY deduction

**Analysis:**
- You're $6,062 away from deducting medical expenses
- Even if you reached threshold, only expenses OVER $14,062 are deductible
- Current excess: $0

**Recommendation:**
If you have upcoming medical expenses (surgery, dental work, etc.):
- Consider scheduling in one year to exceed threshold
- **Example:** If you bunch $10,000 more medical in 2024:
  - Total medical: $18,000
  - Deductible amount: $18,000 - $14,062 = $3,938
  - Tax savings: ~$866 (22% bracket)

**Strategy: Medical Expense Bunching**
- Schedule elective procedures in same year
- Prepay prescriptions and medical equipment
- Timing can save hundreds in taxes

---

### Charitable Contribution Optimization

**Current:** $5,000 cash donations

**Opportunities:**

**1. Donor-Advised Fund (DAF)**
- Contribute $10,000 to DAF in 2024 (instead of $5,000)
- Take full $10,000 deduction in 2024
- Distribute $5,000/year to charities over 2 years

**Tax Impact:**
- 2024 itemized: $35,000 (vs $29,200 standard = save $1,276)
- 2025 itemized: $25,000 (vs $29,200 standard = use standard)
- **Net savings over 2 years: ~$1,276**

**2. Donate Appreciated Stock**
- Instead of cash: donate stock worth $5,000
- Cost basis: $2,000 (gain of $3,000)
- **Benefits:**
  - Deduct full $5,000 fair market value
  - Avoid $3,000 capital gains tax (~$450 at 15%)
  - **Total savings: $450 vs cash donation**

**Recommendation:** Use appreciated stock for charitable giving

---

### SALT Deduction Analysis

**Current:** $10,000 (at cap)

**Breakdown:**
- State income tax withheld: $9,400 (from W-2s)
- Property tax paid: $4,200
- **Total SALT:** $13,600
- **Deduction allowed:** $10,000 (capped)

**Optimization:**
The SALT cap ($10,000) limits your deduction. You're "wasting" $3,600 in deductions.

**Strategies:**
1. **Not applicable** - SALT cap is federal law, cannot optimize
2. **Timing:** Some states allow pre-payment of estimated taxes, but limited benefit
3. **Consider:** Moving to state with no income tax (long-term strategy)

**Analysis:** You've already optimized SALT within current law.

---

### Mortgage Interest Optimization

**Current:** $15,000 deduction

**Analysis:**
- Your mortgage interest is fully deductible
- Verified against Form 1098
- No additional optimization available

**Future Consideration:**
- As you pay down mortgage, interest decreases
- May drop below standard deduction threshold in future years
- **Example:** If interest drops to $14,200:
  - Itemized total: $29,200 (equal to standard)
  - No benefit to itemizing
  - May switch to standard deduction

**Recommendation:** Monitor annually as interest decreases

---

### Summary: Itemized Deductions

**Current Approach:** ✓ Correct (itemizing saves $176)

**Improvements Available:**
- Donate appreciated stock: Save $450
- Bunch medical expenses: Save $866 (if applicable)
- Use Donor-Advised Fund: Save $1,276 over 2 years

**Total Additional Savings Potential:** $1,326-$2,592
```

### Phase 4: Above-the-Line Deductions

```markdown
## Above-the-Line Deduction Opportunities

These deductions reduce your AGI (better than itemized deductions).

### 1. Traditional IRA Contribution ⭐ HIGH PRIORITY

**Current Status:**
- IRA contribution: $0
- You are eligible for Traditional IRA deduction

**Opportunity:**
- Maximum contribution: $7,000
- Additional if age 50+: $1,000 (total $8,000)
- **Your age:** 39 (from DOB)
- **Available contribution:** $7,000

**Tax Impact:**
- Reduces AGI: $187,500 → $180,500
- Reduces taxable income by: $7,000
- **Tax savings: $1,540** (22% marginal rate)

**Additional Benefits:**
- Tax-deferred growth until retirement
- Potential for employer match (if eligible)
- Reduces MAGI for other credits/deductions

**Deadline:** April 15, 2025

**How to Contribute:**
1. Open Traditional IRA if you don't have one
2. Contribute up to $7,000 before April 15
3. Amend return or include when filing
4. Report on Schedule 1, Line 20

**Recommendation:** ⭐ **STRONGLY RECOMMENDED** - Easy $1,540 savings

---

### 2. Health Savings Account (HSA) ⭐ HIGH PRIORITY

**Current Status:**
- Current HSA contribution: $2,000 (from W-2 Box 12, Code W)
- Your health plan: High-Deductible Health Plan (HDHP)

**Opportunity:**
- Maximum family contribution: $8,300
- Current contribution: $2,000
- **Additional available:** $6,300
- Additional if age 55+: $1,000 (you're 39, not eligible yet)

**Tax Impact:**
- Additional deduction: $6,300
- **Tax savings: $1,386** (22% marginal rate)

**Additional Benefits:**
- **Triple tax advantage:**
  1. Contributions are tax-deductible
  2. Growth is tax-free
  3. Withdrawals for medical expenses are tax-free
- Rolls over year-to-year (unlike FSA)
- Can invest for long-term growth
- Becomes retirement account at age 65

**Deadline:** April 15, 2025

**How to Contribute:**
1. Verify HDHP coverage (check with insurance)
2. Make additional $6,300 contribution to HSA
3. Report on Schedule 1, Line 13

**Recommendation:** ⭐ **STRONGLY RECOMMENDED** - Best tax deal available

**Note:** HSA is better than Traditional IRA for medical expenses (triple tax-free vs deferred)

---

### 3. Student Loan Interest Deduction ✓ ALREADY CLAIMED

**Current Status:**
- Student loan interest paid: $1,200 (Form 1098-E)
- Deduction claimed: $1,200 ✓

**Analysis:**
- Maximum deduction: $2,500
- You've claimed all eligible interest
- No additional optimization available

**Future Note:**
- Deduction phases out at higher incomes
- Phase-out range (MFJ): $165,000-$195,000 AGI
- Your AGI: $187,500 (in phase-out range)
- **Current deduction allowed:** $1,200 (partial phase-out)

---

### 4. Self-Employment Tax Deduction

**Current Status:** Not applicable (no self-employment income)

**Opportunity:**
If you have ANY self-employment income (freelance, side business, gig work):
- Can deduct 50% of self-employment tax
- Includes home office, vehicle, equipment, supplies
- **Potential savings:** 10-30% of business income

**Example:**
- Side business income: $10,000
- Self-employment tax: $1,530
- Deduct 50%: $765
- **Tax savings: $168**

**Recommendation:**
If you do any freelance/contract work, report it as business income to access deductions.

---

### 5. Educator Expenses

**Current Status:** Not applicable

**Eligibility:**
- K-12 teacher, instructor, counselor, principal, aide
- Worked 900+ hours during school year

**Opportunity:**
- Deduct up to $300 in unreimbursed classroom expenses
- $600 if both spouses are educators
- **Tax savings: $66-$132**

**Qualifying Expenses:**
- Books, supplies, equipment
- Computer equipment and software
- COVID-19 protective items
- Professional development courses

**Recommendation:**
If you're an educator, track all out-of-pocket classroom expenses.

---

### Summary: Above-the-Line Deductions

**Available Opportunities:**
1. Traditional IRA ($7,000) → Save $1,540 ⭐
2. HSA contribution ($6,300) → Save $1,386 ⭐
3. Student loan interest → Already optimized ✓

**Total Additional Savings:** $2,926

**ROI on Implementation:**
- Time to contribute: 15-30 minutes
- Tax savings: $2,926
- **Return on time investment: $5,852/hour**

**Recommendation:** ⭐⭐⭐ **IMPLEMENT IMMEDIATELY**
```

### Phase 5: Tax Credits Analysis

```markdown
## Tax Credits Optimization

Credits are better than deductions (dollar-for-dollar tax reduction).

### 1. Child Tax Credit ✓ ALREADY CLAIMED

**Current Status:**
- Qualifying child: Emily Doe (age 6)
- Credit claimed: $2,000 ✓

**Analysis:**
- Maximum credit per child: $2,000
- Refundable portion: Up to $1,700
- Phase-out threshold (MFJ): $400,000
- Your AGI: $187,500 (well below threshold)
- **You've claimed the maximum available** ✓

**No additional optimization available.**

---

### 2. Child and Dependent Care Credit 💡 POTENTIAL OPPORTUNITY

**Current Status:** Not claimed

**Eligibility:**
- Paid for childcare to enable you to work
- Child under 13 years old
- Qualifying care provider (not spouse or dependent)

**Your Situation:**
- Qualifying child: Emily (age 6) ✓
- Both spouses work: Yes ✓

**Opportunity:**
If you pay for childcare (daycare, after-school care, summer camp):

**Credit Calculation:**
- Maximum eligible expenses: $3,000 (one child)
- Credit percentage: 20-35% based on AGI
- Your AGI: $187,500 → 20% credit rate
- **Maximum credit: $600**

**Example:**
- Daycare costs: $8,000/year
- Eligible expenses: $3,000 (capped)
- Credit: $3,000 × 20% = $600
- **Tax savings: $600**

**How to Claim:**
- Form 2441 (Child and Dependent Care Expenses)
- Provide: Childcare provider name, address, Tax ID
- Report on Form 1040, Schedule 3

**Question for You:**
Do you pay for childcare for Emily? If yes, gather:
- Provider name and Tax ID
- Total amount paid in 2024
- Dates of service

**Recommendation:**
If you pay for childcare, claim this credit (free $600).

---

### 3. Education Credits 💡 POTENTIAL OPPORTUNITY

**Current Status:** Not claimed

**Two Options (cannot claim both for same student):**

**Option A: American Opportunity Credit (AOTC)**
- **Maximum credit:** $2,500 per student
- **40% refundable** (up to $1,000)
- **Requirements:**
  - Student enrolled at least half-time
  - Pursuing degree or credential
  - First 4 years of post-secondary education
  - No felony drug conviction
- **Phase-out (MFJ):** $160,000-$180,000 AGI
- **Your AGI:** $187,500 → Not eligible (above phase-out)

**Option B: Lifetime Learning Credit (LLC)**
- **Maximum credit:** $2,000 per return
- **Not refundable**
- **Requirements:**
  - Any post-secondary education
  - No enrollment requirement (even one class qualifies)
  - No limit on years
- **Phase-out (MFJ):** $160,000-$180,000 AGI
- **Your AGI:** $187,500 → Not eligible (above phase-out)

**Analysis:**
Unfortunately, your AGI ($187,500) exceeds the phase-out range for both credits.

**Opportunity:**
If you contribute to Traditional IRA ($7,000):
- Reduces AGI to $180,500 → Still above phase-out
- **No education credit available**

If you contribute to Traditional IRA + HSA ($13,300):
- Reduces AGI to $174,200 → Within phase-out range!
- **Partial credit available**

**Calculation with IRA + HSA:**
- AOTC phase-out: Linear from $160K-$180K
- Your AGI: $174,200
- Into phase-out: $14,200 / $20,000 = 71%
- Credit reduction: 71%
- Remaining credit: 29% of $2,500 = $725

**Recommendation:**
If you or spouse attend college:
1. Contribute to IRA + HSA to lower AGI
2. Claim education credit
3. **Additional savings: $725**

**Question for You:**
Did you or your spouse attend college in 2024? If yes, did you receive Form 1098-T?

---

### 4. Retirement Savings Contributions Credit (Saver's Credit)

**Current Status:** Not eligible

**Eligibility:**
- Make retirement contributions (IRA, 401k)
- AGI limits (MFJ): $76,500

**Your AGI:** $187,500 → Not eligible (too high)

**No opportunity available.**

---

### 5. Residential Energy Credits 💡 POTENTIAL OPPORTUNITY

**Two Types:**

**A. Energy Efficient Home Improvement Credit**
- Heat pumps, insulation, windows, doors
- **Credit:** 30% of cost
- **Maximum:** $1,200/year (windows/doors), $2,000/year (heat pump)
- **No income limit**

**B. Residential Clean Energy Credit**
- Solar panels, solar water heaters, geothermal
- **Credit:** 30% of cost
- **No maximum**
- **No income limit**

**Example Savings:**

**Heat Pump Installation:**
- Cost: $10,000
- Credit: $2,000 (30% up to $2,000 cap)
- **Tax savings: $2,000**

**Solar Panel Installation:**
- Cost: $25,000
- Credit: $7,500 (30% of cost)
- **Tax savings: $7,500**

**How to Claim:**
- Form 5695 (Residential Energy Credits)
- Keep manufacturer certifications
- Report on Form 1040, Schedule 3

**Question for You:**
Did you install any energy-efficient improvements in 2024?
- Heat pump, insulation, windows, doors
- Solar panels, solar water heaters
- Battery storage, geothermal

If yes, gather:
- Receipts and invoices
- Manufacturer certification statements
- Installation dates

**Recommendation:**
If you made qualifying improvements, claim the credit (30% back).

---

### Summary: Tax Credits

**Currently Claimed:**
- Child tax credit: $2,000 ✓

**Potential Opportunities:**
1. Child care credit: $600 (if you pay for daycare)
2. Education credit: $725 (if attending college + contribute to IRA/HSA)
3. Energy credits: $2,000-$7,500+ (if made improvements)

**Additional Savings Potential:** $600-$8,825

**Next Steps:**
Answer the questions above to unlock these credits.
```

### Phase 6: Business Deductions (if applicable)

```markdown
## Business Deductions (Self-Employment)

**Current Status:** No self-employment income reported

**Opportunity:**
If you have ANY business or freelance income:
- All business expenses are deductible
- Reduces both income tax AND self-employment tax
- **Typical savings: 25-40% of expenses**

### Common Business Deductions

**1. Home Office**
- Simplified method: $5/sq ft (max $1,500)
- Regular method: Actual expenses × business %
- **Average savings: $1,200-$2,500/year**

**2. Vehicle Expenses**
- Standard mileage: 67¢/mile (2024)
- Actual method: Gas, repairs, depreciation
- **Average savings: $3,000-$6,000/year**

**3. Supplies & Equipment**
- Section 179: Immediate expensing up to $1,220,000
- Computers, software, furniture, equipment
- **Average savings: $500-$5,000/year**

**4. Professional Services**
- Legal, accounting, consulting
- Web hosting, software subscriptions
- **Average savings: $500-$2,000/year**

**5. Other Common Expenses**
- Internet and phone (business portion)
- Business meals (50% deductible)
- Advertising and marketing
- Insurance, licenses, fees
- Professional development

### Example: $20,000 Side Business

**Income:** $20,000
**Expenses:**
- Home office: $1,500
- Vehicle: $2,000
- Supplies: $800
- Software: $600
- Phone/internet: $400
- **Total: $5,300**

**Tax Calculation:**
- Net business income: $14,700
- Self-employment tax (15.3%): $2,249
- Deduct 50% SE tax: -$1,125
- Income tax (22% bracket): $2,987
- **Total tax: $4,111**

**vs. Not Deducting Expenses:**
- Income tax on $20,000: $6,475
- **Savings from deductions: $2,364**

**Recommendation:**
If you do ANY freelance/contract work, even part-time:
1. Report as business income (Schedule C)
2. Deduct all legitimate expenses
3. Consider home office if applicable
4. Track mileage for business driving

---

**Question for You:**
Do you have any self-employment or side business income?
- Freelancing, consulting, contract work
- Gig economy (Uber, DoorDash, TaskRabbit)
- Online business (Etsy, eBay, Amazon)
- Rental property (Schedule E, not Schedule C)

If yes, I can help optimize your business deductions.
```

### Phase 7: Timing Strategies

```markdown
## Year-End Tax Planning Strategies

### 1. Bunching Deductions ⭐ RECOMMENDED

**The Problem:**
Your itemized deductions ($30,000) barely exceed standard ($29,200).

**The Solution:**
Alternate years: itemize one year, standard the next.

**Strategy:**
- **2024 (Itemize):** Bunch 2 years of deductions into one
  - Prepay January 2025 mortgage payment in December 2024
  - Make 2 years of charitable donations in 2024
  - Schedule elective medical procedures in 2024
  - Prepay property taxes (if allowed by state)

- **2025 (Standard):** Minimize deductions
  - Skip charitable donations
  - Defer medical procedures
  - Take standard deduction ($29,200)

**Example Calculation:**

**Without Bunching (2 years):**
- 2024: Itemize $30,000 vs standard $29,200 = save $800
- 2025: Itemize $30,000 vs standard $29,200 = save $800
- Total deductions over 2 years: $60,000
- Tax savings: $1,600

**With Bunching (2 years):**
- 2024: Itemize $45,000 vs standard $29,200 = save $15,800
- 2025: Standard $29,200 vs itemize $15,000 = use standard
- Total deductions over 2 years: $74,200
- Tax savings: $3,124

**Additional savings: $1,524 over 2 years**

**How to Implement:**
1. Prepay January 2025 mortgage in December 2024 (+$1,250)
2. Double up charitable donations in 2024 (+$5,000)
3. Bunch medical procedures in 2024 (+$6,000)
4. Prepay property taxes if allowed (+$2,100)
5. **2024 itemized total:** ~$45,000

**Tax savings in 2024: $3,476**
**Take standard in 2025: $0 out-of-pocket**

**Recommendation:** ⭐ Implement bunching for 2024/2025

---

### 2. Donor-Advised Fund (DAF)

**Strategy:**
- Contribute large amount to DAF in one year
- Take full tax deduction immediately
- Distribute to charities over multiple years

**Example:**
- 2024: Contribute $15,000 to DAF
  - Deduction: $15,000
  - Tax savings: $3,300 (22% bracket)

- 2025-2027: Distribute $5,000/year from DAF to charities
  - No additional tax benefit (already deducted)
  - Invest funds tax-free while waiting

**Benefits:**
- Immediate tax deduction
- Tax-free growth while in DAF
- Flexibility in timing charitable giving
- Can donate appreciated stock to DAF (avoid capital gains)

**Recommendation:**
If you're charitably inclined, DAF is superior to direct donations.

---

### 3. Tax-Loss Harvesting

**Current Status:**
Your capital gains: $10,000
- Short-term: $3,000 (taxed as ordinary income = 22%)
- Long-term: $7,000 (taxed at 15%)

**Strategy:**
Sell investments at a loss to offset gains.

**Example:**
- If you have stock with $5,000 unrealized loss
- Sell before year-end
- Offsets $5,000 of capital gains
- **Tax savings: $750-$1,100**

**Rules:**
- Losses offset gains dollar-for-dollar
- Excess losses offset ordinary income (up to $3,000)
- Remaining losses carry forward indefinitely
- Watch for wash-sale rule (30-day repurchase restriction)

**Recommendation:**
Review your portfolio for unrealized losses before year-end.

---

### 4. Roth Conversion

**Not applicable for your current year return, but future planning:**

**Strategy:**
Convert Traditional IRA to Roth IRA in low-income years.

**Benefits:**
- Pay tax now at current rate
- Future growth is tax-free
- No RMDs (Required Minimum Distributions) at age 73
- Tax-free withdrawals in retirement

**When to Consider:**
- Income lower than normal (job loss, sabbatical)
- Early in career (low tax bracket)
- Expecting higher future tax rates

**Your Situation:**
- Marginal rate: 22%
- This is moderate - could be good time for partial conversion
- Especially if you expect to be in 24%+ bracket later

**Recommendation:**
Consider in year with lower income (not necessarily 2024).

---

### Summary: Timing Strategies

**Immediate (Before Filing 2024):**
- Contribute to IRA by April 15 → Save $1,540
- Contribute to HSA by April 15 → Save $1,386

**Year-End 2025 (Future Planning):**
- Bunch deductions in 2025 → Save $1,524 (2025/2026)
- Tax-loss harvest → Save $750-$1,100
- Set up Donor-Advised Fund → Maximize charitable deduction

**Long-Term:**
- Consider Roth conversion in lower-income year
- Plan bunching strategy for 2026/2027
- Max out retirement contributions annually
```

### Phase 8: Final Recommendations Summary

```markdown
## 🎯 Optimization Summary & Action Plan

### Immediate Actions (Before Filing 2024)

**Priority 1: Retirement Contributions** ⭐⭐⭐
- [ ] Contribute $7,000 to Traditional IRA
  - Tax savings: $1,540
  - Deadline: April 15, 2025
  - Opens: Fidelity, Vanguard, Schwab accounts (15 min setup)

- [ ] Contribute $6,300 additional to HSA
  - Tax savings: $1,386
  - Deadline: April 15, 2025
  - Contact: Your health insurance HSA provider

**Total immediate savings: $2,926**
**Time required: 1-2 hours**
**ROI: $1,463/hour**

---

**Priority 2: Verify Credits** ⭐⭐
- [ ] Child care credit: Do you pay for daycare?
  - Potential savings: $600
  - Action: Gather provider name and Tax ID

- [ ] Education credit: Did you/spouse attend college?
  - Potential savings: $725
  - Action: Provide Form 1098-T

- [ ] Energy credits: Install any energy improvements?
  - Potential savings: $2,000-$7,500
  - Action: Gather receipts and certifications

**Potential additional savings: $600-$8,825**

---

**Priority 3: Charitable Optimization** ⭐
- [ ] Donate appreciated stock instead of cash
  - Current: $5,000 cash donation
  - Switch to: Donate stock with $2,000 cost basis
  - Tax savings: $450 (avoid capital gains)
  - Action: Transfer stock to charity directly

---

### Year-End 2025 Planning

**Bunching Strategy:**
- [ ] Prepay January 2026 mortgage in December 2025
- [ ] Double charitable donations in 2025
- [ ] Schedule medical procedures in 2025
- [ ] Prepay 2026 property taxes (if allowed)

**Result:**
- 2025: Itemize ~$45,000
- 2026: Take standard ~$30,000
- **Savings: $1,524 over 2 years**

---

### Total Potential Savings

**Immediate (2024 Return):**
- IRA contribution: $1,540
- HSA contribution: $1,386
- Child care credit: $600 (if applicable)
- Energy credits: $2,000-$7,500 (if applicable)
- Stock donation: $450 (vs cash)
- **Total: $3,976 to $11,876**

**Future (2025-2026):**
- Bunching strategy: $1,524
- **Grand Total: $5,500 to $13,400**

---

### How to Implement

**Step 1: Make Contributions (This Week)**
1. Open Traditional IRA if needed (online, 15 min)
2. Transfer $7,000 to IRA
3. Contribute $6,300 to HSA (call provider)
4. **Time: 1-2 hours**
5. **Savings: $2,926**

**Step 2: Answer Credit Questions (Now)**
1. Do you pay for childcare? → Form 2441
2. Did you attend college? → Form 8995
3. Energy improvements? → Form 5695
4. **Time: 5-10 minutes**
5. **Savings: $600-$8,825**

**Step 3: Charitable Strategy (Next Donation)**
1. Identify appreciated stock (cost < current value)
2. Transfer directly to charity
3. Get written acknowledgment
4. **Time: 30 minutes**
5. **Savings: $450**

**Step 4: Update Return**
1. Run `/prepare-return 2024` again
2. Include new contributions and credits
3. Review updated tax calculation
4. **New refund:** $4,876 (vs $1,924 = $2,952 improvement)

**Step 5: Plan Ahead (December 2025)**
1. Review bunching strategy
2. Schedule medical procedures
3. Make charitable contributions
4. Prepay eligible expenses
5. **Savings: $1,524 in 2025-2026**

---

## Questions to Answer

To unlock all available savings, please answer:

1. **Childcare:** Do you pay for daycare/after-school care for Emily?
   - If yes, provide: Provider name, Tax ID, amount paid

2. **Education:** Did you or your spouse attend college in 2024?
   - If yes, provide: Form 1098-T

3. **Energy:** Did you install energy-efficient improvements?
   - If yes, provide: Receipts, manufacturer certifications

4. **Self-Employment:** Do you have any side income?
   - If yes, I can analyze business deduction opportunities

5. **Stock Donations:** Do you have appreciated stock to donate?
   - If yes, I can guide you through the transfer process

---

## Confidence & Disclaimers

**Analysis Confidence:** HIGH (98%)

**Based on:**
- Complete review of your 2024 return
- Current IRS rules and regulations
- Standard deduction optimization strategies
- Historical savings data

**Disclaimers:**
- IRA contribution requires earned income (you qualify ✓)
- HSA contribution requires HDHP coverage (verify with insurer)
- Credits require documentation (gather before claiming)
- State rules may differ (review state-specific opportunities)
- This is tax planning guidance, not legal advice

**Professional Review:**
Consider professional review if:
- Self-employment income > $50,000
- Rental property income
- Complex investment transactions
- Foreign income or assets
- Estate planning concerns

**For your standard W-2 return:** Professional review not required.

---

## Next Steps

**Option 1: Implement All Optimizations**
Run `/prepare-return 2024` to update return with IRA and HSA contributions.

**Option 2: Ask Questions**
I'm here to help. Ask about any optimization you'd like to explore.

**Option 3: File Current Return**
Your current return is accurate. You can file as-is and implement optimizations later.

---

**Optimization Analysis Complete** ✓

**Time spent:** 3 minutes
**Opportunities found:** 8
**Total savings potential:** $5,500-$13,400
**Recommended priority:** IRA + HSA ($2,926 immediate savings)

**Your move:** What would you like to do next?
```

## Error Handling

**No Return Found:**
```markdown
❌ No tax return found for 2024.

Run `/prepare-return 2024` first to create a return.
```

**Incomplete Data:**
```markdown
⚠️  Limited optimization possible - return is incomplete.

**Available analysis:**
- General strategies
- Contribution limits

**For personalized recommendations:**
Run `/prepare-return 2024` to complete your return first.
```

## Integration Points

Coordinates with:
- **deduction-optimizer** skill (performs analysis)
- **irs-rule-lookup** skill (verifies eligibility)
- **tax-liability-calculator** skill (calculates savings)
- **question-asker** agent (gathers missing info)

## Output

- Detailed optimization report (markdown)
- Prioritized action list
- Specific dollar savings for each opportunity
- Implementation instructions
- Questions to unlock additional savings
- Future planning strategies

## Best Practices

1. **Run before filing** - Find every legitimate deduction
2. **Implement high-priority items** - IRA/HSA contributions are easy wins
3. **Answer all questions** - Unlock credit opportunities
4. **Plan ahead** - Use timing strategies for next year
5. **Keep documentation** - Required for all claimed deductions

## Example Usage

```bash
# Full optimization analysis
/optimize-deductions

# Optimize specific year
/optimize-deductions 2023

# Focus on specific area
/optimize-deductions --focus=retirement
/optimize-deductions --focus=itemized
/optimize-deductions --focus=business
```

## Performance

- **Analysis time:** 2-3 minutes
- **Opportunities found:** Typically 3-8
- **Average savings:** $2,000-$5,000
- **High earners:** $5,000-$15,000
- **Business owners:** $10,000-$50,000+

---

**Recommendation:** Run this optimization on every return. The time invested (2-3 min) typically returns hundreds to thousands in tax savings.
