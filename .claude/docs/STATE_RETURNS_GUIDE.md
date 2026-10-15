# State Tax Returns Guide
## Massachusetts Support & State Contribution Framework

**Version:** 1.0.0
**Last Updated:** 2025-11-27
**Currently Supported:** Massachusetts (MA)
**Framework Status:** Ready for community contributions

---

## Table of Contents

1. [Massachusetts Tax Returns](#massachusetts-tax-returns)
2. [Using Massachusetts Support](#using-massachusetts-support)
3. [How State Support Works](#how-state-support-works)
4. [Contributing Your State](#contributing-your-state)
5. [State Implementation Template](#state-implementation-template)
6. [Testing State Returns](#testing-state-returns)
7. [State Tax Resources](#state-tax-resources)

---

## Massachusetts Tax Returns

### Overview

Massachusetts state tax support is now available for tax year 2024. The automation layer can help you prepare:

- **Form 1** - Massachusetts Resident Income Tax Return
- **Schedule X** - Exemptions
- **Schedule Y** - Massachusetts Deductions and Exemptions
- **Schedule B** - Dividend and Interest Income
- **Schedule D** - Capital Gains and Losses

### Massachusetts Tax Rules (2024)

**Tax Rate:** 5.0% flat rate on most income

**Personal Exemptions (2024):**
- Single: $4,400
- Married Filing Jointly: $8,800
- Head of Household: $6,800
- Per Dependent: $1,000

**Standard Deductions:**
Massachusetts doesn't have a standard deduction, but allows specific itemized deductions that differ from federal.

**Key Differences from Federal:**
- Flat 5% tax rate (not progressive brackets)
- Different deduction rules
- Part-year resident calculations
- Different treatment of retirement income
- State-specific credits

---

## Using Massachusetts Support

### Quick Start

```
You: I need to prepare my 2024 Massachusetts state tax return

Claude: I'll help you with your MA state return!

        First, have you completed your federal return?
        (State returns require federal AGI)
```

```
You: Yes, my federal AGI is $85,000

Claude: Perfect! What's your Massachusetts filing status?
        1. Single
        2. Married Filing Jointly
        3. Married Filing Separately
        4. Head of Household
```

```
You: Married Filing Jointly

Claude: Were you a Massachusetts resident for the full year?
```

```
You: Yes

Claude: Great! Let's gather your MA-specific information.

        Massachusetts wages (from W-2 box 16)?
```

### Complete Example

**Scenario:** Sarah and John, married filing jointly, both worked in MA

```
You: Help me with my Massachusetts state return

Claude: I'll guide you through your MA state return.

        ════════════════════════════════════════════
        MASSACHUSETTS INFORMATION NEEDED
        ════════════════════════════════════════════

        From your federal return:
        - Federal AGI
        - Filing status
        - Number of dependents

        From your W-2(s):
        - MA wages (box 16)
        - MA withholding (box 17)

        Do you have this information ready?
```

```
You: Yes
     Federal AGI: $135,000
     Filing status: Married Filing Jointly
     2 dependents
     Sarah MA wages: $75,000, withholding $3,750
     John MA wages: $60,000, withholding $3,000

Claude: ✓ Information collected

        Calculating Massachusetts tax...

        ════════════════════════════════════════════
        MASSACHUSETTS TAX CALCULATION
        ════════════════════════════════════════════

        INCOME
        Sarah MA wages                      $75,000
        John MA wages                       $60,000
        ────────────────────────────────────────────
        Total MA income                    $135,000

        EXEMPTIONS
        Personal (MFJ)                      -$8,800
        Dependents (2 × $1,000)             -$2,000
        ────────────────────────────────────────────
        Taxable income                     $124,200

        TAX CALCULATION
        $124,200 × 5.0%                      $6,210

        PAYMENTS
        Sarah withholding                    $3,750
        John withholding                     $3,000
        ────────────────────────────────────────────
        Total payments                       $6,750

        REFUND                                 $540
        ════════════════════════════════════════════

        Generate MA Form 1? (yes/no)
```

### Part-Year Residents

```
You: I moved to Massachusetts in July 2024

Claude: You're a part-year resident. I'll need:

        1. Date you became a MA resident
        2. Income before moving to MA
        3. Income after moving to MA
        4. Other state returns you're filing

        What date did you become a MA resident?
```

```
You: July 1, 2024

Claude: From January-June, where did you live?
```

```
You: New York

Claude: I'll calculate your MA tax on income earned
        from July-December only.

        You'll also need to file a NY part-year return.
        Would you like help with that after MA?
```

---

## How State Support Works

### Architecture

```
User Request
     ↓
Federal Return Completed
     ↓
State-Specific Questions
     ↓
State Tax Calculation
     ↓
State Form Generation
     ↓
State PDF Output
```

### State Form Structure

Each state implementation includes:

1. **Tax Parameters** - Rates, exemptions, standard deductions
2. **Form Classes** - TypeScript classes for each form
3. **Calculation Logic** - State-specific tax computation
4. **PDF Templates** - State form PDFs
5. **Validators** - State-specific validation rules

### File Structure

```
src/forms/Y2024/stateForms/MA/
├── Form1.ts                 # Main MA tax return
├── ScheduleX.ts            # Exemptions
├── ScheduleY.ts            # Deductions
├── ScheduleB.ts            # Interest/Dividends
├── ScheduleD.ts            # Capital Gains
├── Parameters.ts           # Tax rates, exemptions
└── index.ts               # Exports

.claude/docs/states/
└── MA_GUIDE.md            # MA-specific documentation

.claude/test/states/
└── ma.test.ts             # MA state tests
```

---

## Contributing Your State

### Why Contribute?

- Help taxpayers in your state file for free
- Learn about tax law and software development
- Build something used by thousands
- Open source contribution for your portfolio

### States Needed

**High Priority (Large Population):**
- California (CA)
- Texas (TX) - no income tax, but has franchise tax for businesses
- Florida (FL) - no income tax
- New York (NY)
- Pennsylvania (PA)
- Illinois (IL) - partially implemented
- Ohio (OH)
- Georgia (GA)
- North Carolina (NC)
- Michigan (MI)

**Medium Priority:**
- New Jersey (NJ)
- Virginia (VA)
- Washington (WA) - no income tax, but capital gains tax
- Arizona (AZ)
- Tennessee (TN) - limited income tax
- Indiana (IN)
- Missouri (MO)
- Maryland (MD)
- Wisconsin (WI)
- Colorado (CO)

**All Other States Welcome!**

### Prerequisites

**Required Knowledge:**
- TypeScript basics
- Understanding of tax forms
- Your state's tax rules

**Nice to Have:**
- React experience
- PDF manipulation
- Test-driven development

**Time Commitment:**
- Simple state (flat tax): 10-20 hours
- Complex state (progressive brackets): 30-50 hours
- Testing and documentation: 10-15 hours

### Step-by-Step Guide

#### Phase 1: Research (2-4 hours)

1. **Download your state's tax forms** for 2024:
   - Main income tax return
   - All schedules and attachments
   - Instructions (very important!)
   - Tax tables

2. **Document the tax rules:**
   ```markdown
   # [STATE] Tax Rules 2024

   ## Tax Rates
   - Single: [progressive brackets or flat rate]
   - MFJ: [rates]
   - HOH: [rates]

   ## Standard Deduction
   - Single: $X
   - MFJ: $X

   ## Personal Exemptions
   - Taxpayer: $X
   - Spouse: $X
   - Dependent: $X

   ## Special Rules
   - [State-specific credits]
   - [Income adjustments]
   - [Unique calculations]
   ```

3. **Identify complexity:**
   - Simple: Flat tax rate, minimal deductions (MA, IL, PA)
   - Moderate: Progressive brackets, standard state rules (many states)
   - Complex: Unique credits, special calculations (CA, NY)

#### Phase 2: Setup (1-2 hours)

1. **Create branch:**
   ```bash
   git checkout -b feature/state-[STATE]
   ```

2. **Create directory structure:**
   ```bash
   mkdir -p src/forms/Y2024/stateForms/[STATE]
   mkdir -p .claude/docs/states
   mkdir -p .claude/test/states
   ```

3. **Copy Massachusetts template:**
   ```bash
   cp -r src/forms/Y2024/stateForms/MA/* \
         src/forms/Y2024/stateForms/[STATE]/
   ```

4. **Rename files** for your state (e.g., `Form1.ts` → `Form540.ts` for CA)

#### Phase 3: Implementation (10-40 hours)

**Start with Parameters.ts:**

```typescript
// src/forms/Y2024/stateForms/[STATE]/Parameters.ts

export interface [STATE]TaxBracket {
  limit: number
  rate: number
}

// Example for progressive state (CA, NY, etc.)
export const singleBrackets2024: [STATE]TaxBracket[] = [
  { limit: 10099, rate: 0.01 },
  { limit: 23942, rate: 0.02 },
  { limit: 37788, rate: 0.04 },
  // ... more brackets
]

// Example for flat tax state (MA, IL, etc.)
export const flatTaxRate = 0.05  // 5%

export const standardDeductions2024 = {
  Single: 2500,
  MFJ: 5000,
  HOH: 3750
}

export const personalExemptions2024 = {
  taxpayer: 1000,
  spouse: 1000,
  dependent: 500
}
```

**Implement Main Form:**

```typescript
// src/forms/Y2024/stateForms/[STATE]/Form[NUMBER].ts

import Form from 'ustaxes/core/stateForms/Form'
import { State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import * as Params from './Parameters'

export default class Form[NUMBER] extends Form {
  state: State = '[STATE]'
  formName = 'Form [NUMBER]'
  formOrder = 0

  info: ValidatedInformation

  constructor(info: ValidatedInformation) {
    super()
    this.info = info
  }

  // Calculate state AGI
  stateAGI = (): number => {
    // Start with federal AGI
    let agi = this.info.taxPayer.primaryPerson?.federalAGI ?? 0

    // Add back state-specific additions
    // ... your state's rules

    // Subtract state-specific subtractions
    // ... your state's rules

    return agi
  }

  // Calculate state taxable income
  stateTaxableIncome = (): number => {
    const agi = this.stateAGI()

    // Subtract exemptions
    const exemptions = this.totalExemptions()

    // Subtract deductions
    const deductions = this.totalDeductions()

    return Math.max(0, agi - exemptions - deductions)
  }

  // Calculate state tax
  stateTax = (): number => {
    const taxableIncome = this.stateTaxableIncome()

    // For flat tax states:
    return taxableIncome * Params.flatTaxRate

    // For progressive tax states:
    // return this.calculateProgressiveTax(taxableIncome)
  }

  // Helper: Progressive tax calculation
  calculateProgressiveTax = (income: number): number => {
    const brackets = this.getBrackets()  // Based on filing status
    let tax = 0
    let previousLimit = 0

    for (const bracket of brackets) {
      if (income <= previousLimit) break

      const incomeInBracket = Math.min(
        income - previousLimit,
        bracket.limit - previousLimit
      )

      tax += incomeInBracket * bracket.rate
      previousLimit = bracket.limit

      if (income <= bracket.limit) break
    }

    return Math.round(tax)
  }

  // Get tax brackets based on filing status
  getBrackets = (): Params.[STATE]TaxBracket[] => {
    switch (this.info.taxPayer.filingStatus) {
      case FilingStatus.S:
        return Params.singleBrackets2024
      case FilingStatus.MFJ:
        return Params.mfjBrackets2024
      case FilingStatus.HOH:
        return Params.hohBrackets2024
      default:
        return Params.singleBrackets2024
    }
  }

  // Calculate total exemptions
  totalExemptions = (): number => {
    let exemptions = Params.personalExemptions2024.taxpayer

    if (this.info.taxPayer.spouse) {
      exemptions += Params.personalExemptions2024.spouse
    }

    exemptions +=
      this.info.taxPayer.dependents.length *
      Params.personalExemptions2024.dependent

    return exemptions
  }

  // Calculate total deductions
  totalDeductions = (): number => {
    // Standard deduction or itemized, whichever is greater
    const standard = this.standardDeduction()
    const itemized = this.itemizedDeductions()

    return Math.max(standard, itemized)
  }

  standardDeduction = (): number => {
    switch (this.info.taxPayer.filingStatus) {
      case FilingStatus.S:
        return Params.standardDeductions2024.Single
      case FilingStatus.MFJ:
        return Params.standardDeductions2024.MFJ
      case FilingStatus.HOH:
        return Params.standardDeductions2024.HOH
      default:
        return Params.standardDeductions2024.Single
    }
  }

  itemizedDeductions = (): number => {
    // Implement state-specific itemized deductions
    // Note: Often different from federal!
    let deductions = 0

    // Medical expenses
    if (this.info.itemizedDeductions?.medicalAndDental) {
      // Your state's rules for medical deductions
    }

    // State and local taxes
    // ... etc.

    return deductions
  }

  // Generate PDF fields
  fields = (): Field[] => {
    return [
      // Line 1: Name
      this.info.taxPayer.primaryPerson?.firstName ?? '',
      this.info.taxPayer.primaryPerson?.lastName ?? '',

      // Line 2: SSN
      this.info.taxPayer.primaryPerson?.ssid ?? '',

      // Line 3: Address
      // ... etc.

      // Line 10: State AGI
      this.stateAGI(),

      // Line 15: Exemptions
      this.totalExemptions(),

      // Line 20: Deductions
      this.totalDeductions(),

      // Line 25: Taxable Income
      this.stateTaxableIncome(),

      // Line 30: State Tax
      this.stateTax(),

      // Line 35: Withholding
      this.stateWithholding(),

      // Line 40: Refund or Amount Due
      this.refundOrAmountDue()
    ]
  }

  refundOrAmountDue = (): number => {
    const tax = this.stateTax()
    const withholding = this.stateWithholding()
    return withholding - tax  // Positive = refund, negative = owe
  }

  attachments = (): Form[] => {
    // Return array of schedules that need to be attached
    return []
  }
}
```

#### Phase 4: Testing (5-10 hours)

**Create test file:**

```typescript
// .claude/test/states/[state].test.ts

import Form[NUMBER] from 'src/forms/Y2024/stateForms/[STATE]/Form[NUMBER]'
import { FilingStatus } from 'ustaxes/core/data'

describe('[STATE] State Return 2024', () => {
  describe('Simple return - single filer', () => {
    test('should calculate tax correctly', () => {
      const info = {
        taxPayer: {
          primaryPerson: {
            firstName: 'Test',
            lastName: 'User',
            ssid: '123-45-6789',
            federalAGI: 75000
          },
          filingStatus: FilingStatus.S,
          dependents: []
        },
        w2s: [{
          income: 75000,
          state: '[STATE]',
          stateWages: 75000,
          stateWithholding: 3500
        }]
      }

      const form = new Form[NUMBER](info)

      expect(form.stateAGI()).toBe(75000)
      expect(form.stateTaxableIncome()).toBe(/* expected value */)
      expect(form.stateTax()).toBe(/* expected value */)
    })
  })

  describe('Married filing jointly', () => {
    test('should apply correct exemptions', () => {
      // Test MFJ scenario
    })
  })

  describe('With dependents', () => {
    test('should calculate dependent exemptions', () => {
      // Test with dependents
    })
  })

  describe('Itemized deductions', () => {
    test('should choose higher of standard or itemized', () => {
      // Test itemized vs standard
    })
  })

  describe('Part-year resident', () => {
    test('should prorate income', () => {
      // Test part-year calculation
    })
  })
})
```

**Run tests:**
```bash
cd .claude/test
npm test -- states/[state].test.ts
```

#### Phase 5: Documentation (3-5 hours)

**Create state guide:**

```markdown
<!-- .claude/docs/states/[STATE]_GUIDE.md -->

# [STATE NAME] State Tax Return Guide

## Overview

This guide explains how to prepare your [STATE] state tax return
using the Claude Code automation layer.

## [STATE] Tax Basics

### Tax Rates (2024)
[Explain your state's tax structure]

### Filing Requirements
[Who needs to file in your state]

### Key Forms
[List the forms your implementation supports]

## Using the Automation

### Quick Start
[Show example conversation]

### Common Scenarios
[Document 3-5 common scenarios]

## [STATE]-Specific Features

### Unique Credits
[Explain state-specific credits]

### Special Deductions
[Document special deductions]

### Part-Year Residents
[Explain part-year rules]

## Troubleshooting

### Common Issues
[Document common problems]

### Getting Help
[Where to get help with [STATE] returns]

## Resources

- [STATE] Department of Revenue: [URL]
- 2024 Tax Forms: [URL]
- Tax Instructions: [URL]
```

#### Phase 6: Submit (1 hour)

1. **Run all tests:**
   ```bash
   cd .claude/test
   npm test
   ```

2. **Update documentation index:**
   ```markdown
   <!-- .claude/docs/README.md -->

   ### State Guides
   - [Massachusetts](.claude/docs/states/MA_GUIDE.md)
   - [STATE NAME](.claude/docs/states/[STATE]_GUIDE.md)  ← Add this
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add [STATE] state tax return support for 2024

   Implemented [STATE] Form [NUMBER] and supporting schedules.

   Features:
   - [STATE] tax calculation
   - Exemptions and deductions
   - Progressive tax brackets (or flat tax)
   - Part-year resident support
   - Credits and adjustments

   Testing:
   - 15+ test cases covering common scenarios
   - All tests passing

   Documentation:
   - Complete [STATE] user guide
   - API documentation
   - Common scenario examples"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/state-[STATE]
   ```

5. **Create Pull Request on GitHub:**
   - Title: `Add [STATE] state tax return support`
   - Description: Explain what you implemented
   - Reference: Link to state tax forms and instructions
   - Testing: Describe test coverage
   - Checklist:
     - [ ] All tests passing
     - [ ] Documentation complete
     - [ ] Follows code style
     - [ ] No breaking changes

---

## State Implementation Template

### Complexity Levels

**Level 1: Simple (10-15 hours)**
- Flat tax rate
- Simple exemptions
- Standard deduction only
- Examples: MA, IL, PA

**Level 2: Moderate (20-30 hours)**
- Progressive tax brackets
- Standard and itemized deductions
- Common credits (EITC, child care)
- Examples: Most states

**Level 3: Complex (40-50 hours)**
- Unique tax calculations
- Many state-specific credits
- Special income treatments
- Examples: CA, NY

### Minimum Viable Implementation

For your first contribution, implement:

✅ **Required:**
1. Main tax return form
2. Tax calculation (correct brackets)
3. Standard deduction
4. Basic exemptions
5. Withholding calculation
6. Refund/amount due

⭐ **Nice to Have:**
- Itemized deductions
- State-specific credits
- Additional schedules
- Part-year resident support

🎯 **Can Add Later:**
- Complex credits
- Business income
- Rental property
- Multiple states

---

## Testing State Returns

### Test Cases to Cover

1. **Basic Scenarios (Required):**
   - Single filer, standard deduction
   - Married filing jointly
   - Head of household
   - With dependents (0, 1, 3+)

2. **Deductions:**
   - Standard deduction
   - Itemized deductions (if supported)
   - Comparison (standard vs itemized)

3. **Income Levels:**
   - Low income (< $30K)
   - Medium income ($50K-$100K)
   - High income (> $150K)

4. **Edge Cases:**
   - No state withholding
   - Overpayment (large refund)
   - Underpayment (owe tax)
   - Zero tax (income below threshold)

5. **Part-Year Residents:**
   - Moved in mid-year
   - Moved out mid-year
   - Multiple states

### Manual Testing

Create test scenarios with:
```
You: I want to test [STATE] state return with:
     - Filing status: Single
     - Income: $75,000
     - State withholding: $3,500
     - Dependents: 0

     Calculate the tax
```

Compare results with:
- State's official tax calculator
- Commercial tax software
- Manual calculation using tax tables

---

## State Tax Resources

### Research Tools

**Official State Resources:**
- State Department of Revenue websites
- Official tax forms and instructions
- State tax calculators
- Tax bulletins and guidance

**Commercial Software (for comparison):**
- TurboTax state calculators
- H&R Block state tools
- FreeTaxUSA

**Tax Professional Resources:**
- AICPA state tax guides
- Tax Foundation state reports
- State tax policy centers

### Common Patterns Across States

**States with NO Income Tax:**
- Alaska, Florida, Nevada, New Hampshire (wage income)
- South Dakota, Tennessee (wage income), Texas, Washington, Wyoming

**Flat Tax States:**
- Colorado (4.40%)
- Illinois (4.95%)
- Indiana (3.15%)
- Kentucky (4.5%)
- Massachusetts (5.0%)
- Michigan (4.25%)
- North Carolina (4.75%)
- Pennsylvania (3.07%)
- Utah (4.65%)

**Progressive Tax States:**
- California, Connecticut, Hawaii, Iowa, Louisiana
- Maine, Maryland, Minnesota, New Jersey, New Mexico
- New York, Oregon, Vermont, Wisconsin
- And others (see state documentation)

---

## Getting Help

### For Implementation Questions

**Discord Channel:** `#state-contributions`
- Ask technical questions
- Get code reviews
- Find collaborators

**GitHub Discussions:**
- https://github.com/ustaxes/ustaxes/discussions
- Tag: `state-returns`

**Documentation:**
- This guide
- [Architecture](.claude/docs/ARCHITECTURE.md)
- [API Reference](.claude/docs/API_REFERENCE.md)

### For State Tax Law Questions

**Don't Rely on:**
- ❌ This automation layer for tax advice
- ❌ Other developers (we're not tax professionals)

**Do Consult:**
- ✅ State Department of Revenue website
- ✅ Official tax instructions
- ✅ Licensed tax professional in your state

---

## Roadmap

### Immediate Priority States

Based on user requests and population:

1. **California** (40M residents)
2. **New York** (20M residents)
3. **Pennsylvania** (13M residents)
4. **Illinois** (12M residents) - partial implementation exists
5. **Ohio** (12M residents)

### Future Enhancements

- **Multi-state returns** - Work in multiple states
- **City/local taxes** - NYC, Philadelphia, etc.
- **State credits** - More comprehensive credit support
- **State-specific forms** - Additional schedules
- **Prior year support** - 2023, 2022 state returns

---

## Contributor Recognition

All state contributors will be:

✨ **Acknowledged in:**
- Project README
- State guide documentation
- Release notes
- GitHub contributors list

🏆 **Special Recognition for:**
- First state contributor
- Most complex state (CA, NY)
- Most comprehensive testing
- Best documentation

---

## FAQ

**Q: Do I need to be a tax expert?**
A: No! You need to understand your state's forms and be able to read the instructions. We'll help with the code.

**Q: How long does it take?**
A: Simple states: 10-20 hours. Complex states: 30-50 hours. Spread over a few weekends.

**Q: What if I get stuck?**
A: Ask in Discord #state-contributions or GitHub Discussions. The community will help!

**Q: Can I work on multiple states?**
A: Yes! But finish one first before starting another.

**Q: Do I need to implement everything?**
A: No. Start with basics (tax calculation, standard deduction). Add features incrementally.

**Q: What if my state has a weird rule?**
A: Document it! We'll help you figure out how to implement it.

**Q: How do I test if I don't have that income situation?**
A: Use example scenarios from tax instructions. Create realistic test cases.

---

## Thank You!

By contributing state tax support, you're helping thousands of people file their taxes for free. Your work makes a real difference!

**Questions?** Open an issue or ask in Discord.

**Ready to start?** Pick your state and let's go! 🚀

---

**Last Updated:** 2025-11-27
**Version:** 1.0.0
**States Supported:** 1 (Massachusetts)
**States in Progress:** [List states being worked on]
**Contributors:** [List contributors]
