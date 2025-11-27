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

## Disclaimers

All generated tax returns are **DRAFTS** and should be reviewed by a qualified tax professional before filing. This system:
- Does NOT replace professional tax advice
- Does NOT guarantee audit protection
- Does NOT guarantee accuracy
- Is provided as-is for automation assistance

Users are responsible for the accuracy and completeness of their filed returns.

---

**Last Updated:** 2025-11-27
**Claude Code Version:** Latest
**UsTaxes Version:** 2024
