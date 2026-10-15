# UsTaxes MCP Server

**Model Context Protocol (MCP) server for programmatic tax return preparation using UsTaxes.**

## Overview

This MCP server provides programmatic access to the UsTaxes tax preparation engine, allowing AI agents and automation tools to:

- Build complete federal and state tax returns
- Validate tax data against IRS rules
- Generate PDF tax forms
- Calculate tax liability
- Query return state and calculations

## Architecture

```
UsTaxes MCP Server
├── State Management (Redux-compatible)
├── Tools (40+ tax preparation actions)
│   ├── Personal Information
│   ├── Income (W-2, 1099, etc.)
│   ├── Deductions & Adjustments
│   ├── Tax Credits
│   ├── PDF Generation
│   └── Validation & Calculation
└── Resources (return state queries)
```

## Installation

```bash
cd .claude/mcp-servers/ustaxes-server
npm install
npm run build
```

## Usage

### In Claude Desktop Config

```json
{
  "mcpServers": {
    "ustaxes": {
      "command": "node",
      "args": [
        "/path/to/UsTaxes/.claude/mcp-servers/ustaxes-server/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

### Tools Available

#### Personal Information

- `ustaxes_set_filing_status` - Set filing status (Single, MFJ, MFS, HOH, W)
- `ustaxes_add_primary_person` - Add primary taxpayer information
- `ustaxes_add_spouse` - Add spouse information
- `ustaxes_add_dependent` - Add dependent

#### Income

- `ustaxes_add_w2` - Add W-2 wage income
- `ustaxes_add_1099_int` - Add 1099-INT interest income
- `ustaxes_add_1099_div` - Add 1099-DIV dividend income
- `ustaxes_add_1099_b` - Add 1099-B brokerage transactions
- `ustaxes_add_1099_r` - Add 1099-R retirement distributions
- `ustaxes_add_property` - Add rental property income

#### Deductions & Adjustments

- `ustaxes_set_itemized_deductions` - Set itemized deductions
- `ustaxes_add_1098` - Add mortgage interest (1098)
- `ustaxes_add_1098e` - Add student loan interest (1098-E)
- `ustaxes_add_hsa` - Add HSA contributions
- `ustaxes_add_ira` - Add IRA contributions

#### Credits

- `ustaxes_add_dependent_care_expenses` - Add dependent care expenses
- `ustaxes_add_education_expenses` - Add education expenses

#### PDF Generation

- `ustaxes_generate_federal_pdf` - Generate federal Form 1040 PDF
- `ustaxes_generate_state_pdf` - Generate state return PDF
- `ustaxes_generate_all_pdfs` - Generate all PDFs (federal + state)

#### Validation & Calculation

- `ustaxes_validate_return` - Validate return for completeness and accuracy
- `ustaxes_calculate_tax` - Calculate total tax liability
- `ustaxes_get_refund_or_owe` - Get refund or amount owed

#### State Management

- `ustaxes_get_state` - Get complete return state
- `ustaxes_reset_state` - Reset to empty return
- `ustaxes_load_state` - Load saved return state

### Resources

- `return://[year]/federal` - Federal return summary
- `return://[year]/state/[state]` - State return summary
- `return://[year]/summary` - Complete tax summary

## Example: Complete Tax Return

```typescript
// 1. Set filing status
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'MFJ'
})

// 2. Add primary taxpayer
await callTool('ustaxes_add_primary_person', {
  year: 2024,
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789',
  dateOfBirth: '1980-01-15',
  address: {
    address: '123 Main St',
    city: 'Boston',
    state: 'MA',
    zip: '02101'
  }
})

// 3. Add spouse
await callTool('ustaxes_add_spouse', {
  year: 2024,
  firstName: 'Jane',
  lastName: 'Doe',
  ssn: '987-65-4321',
  dateOfBirth: '1982-03-20'
})

// 4. Add W-2 income
await callTool('ustaxes_add_w2', {
  year: 2024,
  employer: {
    name: 'Tech Corp',
    EIN: '12-3456789',
    address: {
      address: '456 Corporate Dr',
      city: 'Boston',
      state: 'MA',
      zip: '02102'
    }
  },
  wages: 120000,
  federalWithholding: 18000,
  socialSecurityWages: 120000,
  socialSecurityWithholding: 7440,
  medicareWages: 120000,
  medicareWithholding: 1740,
  stateWages: 120000,
  stateWithholding: 6000,
  personRole: 'PRIMARY'
})

// 5. Generate PDFs
await callTool('ustaxes_generate_all_pdfs', {
  year: 2024,
  outputDir: '/tmp/tax-returns-2024'
})
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Unit tests for all 40+ tools
- Integration tests with real tax scenarios
- Edge case testing
- IRS rule validation tests

## Development

```bash
# Watch mode during development
npm run dev

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

## Security

- SSNs and EINs are never logged
- All PII is handled securely
- State is stored in-memory only (not persisted by default)
- PDF generation uses sandboxed environment

## Limitations

- Tax years supported: 2019-2024
- Federal forms: All major forms and schedules
- State forms: Currently MA (more states coming)
- Does NOT provide tax advice
- Does NOT guarantee audit protection
- User responsible for accuracy of filed returns

## License

GPL-3.0 (same as UsTaxes)

## Contributing

See main UsTaxes repository for contribution guidelines.
