# UsTaxes - Autonomous Tax Preparation with Claude Code

## Project Overview

This is the **Claude Code Tax Automation Layer** for UsTaxes, an open-source federal tax filing application. This layer enables autonomous tax return completion through the UsTaxes MCP Server, document analysis, intelligent questioning, and programmatic form generation.

## Core Principles

### 1. Compliance First
- **All output MUST comply with current IRS guidelines**
- Reference IRS.gov for tax rules when uncertain
- Flag any ambiguities that require professional tax advisor review
- Never make up tax rules or guidance

### 2. Data Security & Privacy
- Treat all financial and personal data as highly sensitive
- Never log SSNs, EINs, or full bank account numbers in plain text
- All file access is logged via hooks
- Tax data stored in memory only (cleared on MCP server restart)
- Follow PII handling guidelines in global CLAUDE.md

### 3. Accuracy & Validation
- Validate all data structure before MCP tool calls
- Cross-validate data across multiple sources when available
- Flag mathematical discrepancies
- Test PDF generation to validate calculations
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
- **MCP Server:** UsTaxes MCP Server (`.claude/mcp-servers/ustaxes-server/`)

### Data Flow
```
Documents → Claude Vision → Extract → Validate → MCP Tools → State → PDF Generation
```

### Tax Data Structure
The MCP server maintains tax return state in memory with this structure:

```typescript
interface TaxReturnState {
  taxPayer: TaxPayer           // Personal info, filing status
  w2s: IncomeW2[]              // W-2 wage income
  f1099s: Supported1099[]      // Various 1099 forms
  realEstate: Property[]       // Rental properties
  f1098es: F1098e[]           // Student loan interest
  itemizedDeductions?: ItemizedDeductions
  healthSavingsAccounts: HealthSavingsAccount[]
  individualRetirementArrangements: Ira[]
  stateResidencies: string[]   // State codes
  refund?: Refund
}
```

## UsTaxes MCP Server

### Location
`.claude/mcp-servers/ustaxes-server/`

### Available MCP Tools

**Personal Information:**
- `ustaxes_set_filing_status` - Set filing status (S, MFJ, MFS, HOH, W)
- `ustaxes_add_primary_person` - Add primary taxpayer information
- `ustaxes_add_spouse` - Add spouse information
- `ustaxes_add_dependent` - Add dependent

**Income:**
- `ustaxes_add_w2` - Add W-2 wage income
- `ustaxes_add_1099` - Add 1099 income (INT, DIV, B, NEC, etc.)
- `ustaxes_add_property` - Add rental property income/expenses

**Deductions:**
- `ustaxes_set_itemized_deductions` - Set itemized deductions
- `ustaxes_add_student_loan` - Add student loan interest (1098-E)
- `ustaxes_add_hsa` - Add HSA contribution
- `ustaxes_add_ira` - Add IRA contribution

**State:**
- `ustaxes_add_state_residency` - Set state residency

**Export/Import:**
- `ustaxes_export_state` - Export tax return state to JSON file
- `ustaxes_import_state` - Import tax return state from JSON file
- `ustaxes_clear_year` - Clear all data for a tax year

**PDF Generation:**
- `ustaxes_generate_federal_pdf` - Generate federal Form 1040 PDF
- `ustaxes_generate_state_pdf` - Generate state tax return PDF

**Utility:**
- `ustaxes_list_available_tools` - List all available MCP tools

### MCP Tool Usage Example

```typescript
// Set filing status
await mcp.ustaxes_set_filing_status({
  year: 2024,
  status: 'MFJ'
})

// Add primary taxpayer
await mcp.ustaxes_add_primary_person({
  year: 2024,
  person: {
    firstName: 'John',
    lastName: 'Doe',
    ssid: '123-45-6789',
    role: 'PRIMARY',
    address: {
      address: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zip: '02101'
    }
  }
})

// Add W-2 income
await mcp.ustaxes_add_w2({
  year: 2024,
  w2: {
    occupation: 'Software Engineer',
    income: 120000,
    medicareIncome: 120000,
    fedWithholding: 18000,
    ssWages: 120000,
    ssWithholding: 7440,
    medicareWithholding: 1740,
    ein: '12-3456789',
    employerName: 'Tech Company Inc',
    personRole: 'PRIMARY'
  }
})

// Generate federal PDF
const result = await mcp.ustaxes_generate_federal_pdf({
  year: 2024,
  outputPath: '/tmp/federal-return.pdf'
})
```

## Available Claude Code Features

### Slash Commands

Located in `.claude/commands/`:

- `/prepare-return [year]` - Interactive tax return completion workflow
  - Asks questions to gather missing information
  - Populates data using MCP tools
  - Generates federal and state PDFs

- `/validate-return [year]` - Comprehensive return audit
  - Exports state for analysis
  - Validates data completeness and accuracy
  - Tests PDF generation
  - Provides detailed audit report

- `/extract-documents [path]` - Extract data from tax documents
  - Uses Claude's vision capabilities to read documents
  - Extracts W-2, 1099, 1098-E, etc.
  - Populates data using MCP tools

- `/estimate-taxes [income] [status]` - Quick tax estimate
  - Standalone tax calculator
  - Optionally uses `ustaxes_export_state` for current return
  - Provides planning estimates

- `/optimize-deductions` - Find tax-saving opportunities
  - Analyzes current return using `ustaxes_export_state`
  - Identifies missed deduction opportunities
  - Calculates potential tax savings

### Specialized Agents

Located in `.claude/agents/`:

- **form-filler** - Populates tax return data
  - Maps document fields to MCP tool parameters
  - Validates data structure before MCP calls
  - Generates federal and state PDFs

- **question-asker** - Gathers missing information
  - Identifies gaps using `ustaxes_export_state`
  - Asks prioritized, context-aware questions
  - Works with form-filler to populate via MCP tools

- **tax-return-auditor** - Comprehensive return validation
  - Audits using `ustaxes_export_state`
  - Validates via `ustaxes_generate_federal_pdf`
  - Identifies compliance issues and optimization opportunities
  - Assesses audit risk

### Integration Example

See `.claude/examples/mcp-integration-example.ts` for complete examples of:
- Simple W-2 employee return
- Married filing jointly with multiple income sources
- Self-employed with itemized deductions
- Testing and validation workflows

## Tax Year Support

Currently supports tax years 2019-2024 (6 years).
Default to 2024 unless user specifies otherwise.

## IRS Form Reference

39 federal forms implemented for 2024:
- **Main:** F1040, F1040-V
- **Schedules:** A, B, C, D, E, SE, EIC, R, 1, 2, 3, 8812
- **Supporting:** 8949, 8889, 8959, 8960, 6251, 8995, 8995-A, and more

Forms are located in `src/forms/Y2024/irsForms/`.

Each form extends `Form` base class with:
- `isNeeded()` - Whether form should be included
- `fields()` - Array of field values in PDF order
- Calculation methods for each line

## Complete Workflow Example

### Phase 1: Setup
```typescript
// Set filing status
await mcp.ustaxes_set_filing_status({
  year: 2024,
  status: 'MFJ'
})

// Add personal information
await mcp.ustaxes_add_primary_person({
  year: 2024,
  person: { /* primary taxpayer data */ }
})

await mcp.ustaxes_add_spouse({
  year: 2024,
  spouse: { /* spouse data */ }
})
```

### Phase 2: Income
```typescript
// Add W-2s
await mcp.ustaxes_add_w2({
  year: 2024,
  w2: { /* W-2 data */ }
})

// Add 1099s
await mcp.ustaxes_add_1099({
  year: 2024,
  form1099: { /* 1099 data */ }
})
```

### Phase 3: Deductions
```typescript
// Add IRA contribution
await mcp.ustaxes_add_ira({
  year: 2024,
  ira: {
    personRole: 'PRIMARY',
    contributionType: 'traditional',
    contribution: 7000
  }
})

// Add itemized deductions (if beneficial)
await mcp.ustaxes_set_itemized_deductions({
  year: 2024,
  deductions: { /* itemized deduction amounts */ }
})
```

### Phase 4: Validation
```typescript
// Export state for review
const exportResult = await mcp.ustaxes_export_state({
  year: 2024,
  outputPath: '/tmp/tax-state-2024.json'
})

// Review exported data
const stateData = JSON.parse(await fs.readFile('/tmp/tax-state-2024.json', 'utf-8'))
```

### Phase 5: PDF Generation
```typescript
// Generate federal return
const federalResult = await mcp.ustaxes_generate_federal_pdf({
  year: 2024,
  outputPath: '/tmp/federal-return.pdf'
})

console.log(`Federal PDF: ${federalResult.data.outputPath}`)
console.log(`Forms: ${federalResult.data.formsIncluded.join(', ')}`)

// Add state residency and generate state return
await mcp.ustaxes_add_state_residency({
  year: 2024,
  state: 'MA'
})

const stateResult = await mcp.ustaxes_generate_state_pdf({
  year: 2024,
  state: 'MA',
  outputPath: '/tmp/ma-state-return.pdf'
})
```

## Document Extraction Workflow

Claude Code uses Claude's built-in multimodal vision capabilities to extract data from tax documents:

```typescript
// 1. User provides document path or image
const documentPath = '/path/to/w2.pdf'

// 2. Read document using Read tool (Claude has vision)
const imageData = await read(documentPath)

// 3. Claude analyzes document and extracts fields
const w2Data = {
  occupation: '[EXTRACTED]',
  income: parseFloat('[BOX 1]'),
  fedWithholding: parseFloat('[BOX 2]'),
  ssWages: parseFloat('[BOX 3]'),
  // ... etc
}

// 4. Populate using MCP tool
await mcp.ustaxes_add_w2({
  year: 2024,
  w2: w2Data
})
```

## Important Notes

### What This System Does
- ✅ Provides MCP server for tax data management
- ✅ Generates IRS-compliant PDF forms
- ✅ Validates data structure and completeness
- ✅ Calculates federal and state tax liability
- ✅ Identifies optimization opportunities
- ✅ Exports/imports tax return state

### What This System Does NOT Do
- ❌ Provide legal tax advice
- ❌ Guarantee IRS acceptance
- ❌ Replace professional tax review (complex situations)
- ❌ File returns electronically (generates PDFs only)
- ❌ Persist data across MCP server restarts (use export/import)
- ❌ Guarantee audit protection

### Data Validation Requirements
Before calling MCP tools, ensure:
- SSNs formatted as `XXX-XX-XXXX`
- EINs formatted as `XX-XXXXXXX`
- State codes are 2-letter uppercase (e.g., `MA`, `CA`)
- Numeric values are numbers, not strings
- Required fields are present
- Amounts are non-negative

### Best Practices
1. **Always export state for analysis**
   ```typescript
   await mcp.ustaxes_export_state({ year: 2024, outputPath: '/tmp/state.json' })
   ```

2. **Test PDF generation to validate**
   ```typescript
   await mcp.ustaxes_generate_federal_pdf({ year: 2024, outputPath: '/tmp/test.pdf' })
   ```

3. **Use question-asker agent to gather missing data**
   - Check current state first via export
   - Ask prioritized questions
   - Populate via form-filler agent

4. **Run tax-return-auditor before finalizing**
   - Comprehensive validation
   - Optimization opportunities
   - Audit risk assessment

5. **Keep audit trail**
   - Save exported state files
   - Keep generated PDFs
   - Document all data sources

## MCP Server State Management

The MCP server stores tax return data **in memory only**:

- Data persists during MCP server session
- Data is cleared when MCP server restarts
- Use `ustaxes_export_state` to save data
- Use `ustaxes_import_state` to restore data
- Use `ustaxes_clear_year` to reset a tax year

**Recommended workflow for persistence:**
```typescript
// At end of session - export state
await mcp.ustaxes_export_state({
  year: 2024,
  outputPath: '/path/to/safe/location/tax-state-2024.json'
})

// At start of next session - import state
await mcp.ustaxes_import_state({
  year: 2024,
  statePath: '/path/to/safe/location/tax-state-2024.json'
})
```

## Disclaimers

All generated tax returns are **DRAFTS** and should be reviewed by a qualified tax professional before filing. This system:

- Does NOT replace professional tax advice
- Does NOT guarantee audit protection
- Does NOT guarantee accuracy
- Does NOT guarantee IRS acceptance
- Is provided as-is for automation assistance

Users are responsible for the accuracy and completeness of their filed returns.

---

**Last Updated:** 2025-11-28
**Claude Code Version:** Latest
**UsTaxes Version:** 2024
**MCP Server:** UsTaxes MCP Server v1.0
