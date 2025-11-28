# UsTaxes MCP Server - API Reference

Complete API reference for all Model Context Protocol tools provided by the UsTaxes MCP Server.

## Table of Contents

- [Personal Information Tools](#personal-information-tools)
- [Income Tools](#income-tools)
- [Deduction Tools](#deduction-tools)
- [PDF Generation Tools](#pdf-generation-tools)
- [State Management Tools](#state-management-tools)
- [MCP Resources](#mcp-resources)
- [Common Types](#common-types)

---

## Personal Information Tools

### `ustaxes_set_filing_status`

Set the tax filing status for a given year.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `status` | string | ✅ | Filing status code |

**Filing Status Codes:**
- `S` - Single
- `MFJ` - Married Filing Jointly
- `MFS` - Married Filing Separately
- `HOH` - Head of Household
- `W` - Qualifying Widow(er)

**Example:**
```typescript
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'MFJ'
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "status": "MFJ"
  },
  "message": "Filing status set to MFJ for 2024"
}
```

---

### `ustaxes_add_primary_person`

Add or update the primary taxpayer information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `firstName` | string | ✅ | First name |
| `lastName` | string | ✅ | Last name |
| `ssn` | string | ✅ | SSN (format: XXX-XX-XXXX) |
| `dateOfBirth` | string | ✅ | Date of birth (YYYY-MM-DD) |
| `address` | object | ✅ | Address object (see below) |

**Address Object:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | string | ✅ | Street address |
| `aptNo` | string | ❌ | Apartment number |
| `city` | string | ✅ | City |
| `state` | string | ❌ | State code (2 letters) |
| `zip` | string | ✅ | ZIP code |
| `province` | string | ❌ | Province (for foreign) |
| `country` | string | ❌ | Country (defaults to USA) |
| `foreignPostalCode` | string | ❌ | Foreign postal code |

**Example:**
```typescript
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
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "name": "John Doe"
  },
  "message": "Primary taxpayer added: John Doe"
}
```

---

### `ustaxes_add_spouse`

Add or update spouse information (required for Married Filing Jointly).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `firstName` | string | ✅ | First name |
| `lastName` | string | ✅ | Last name |
| `ssn` | string | ✅ | SSN (format: XXX-XX-XXXX) |
| `dateOfBirth` | string | ✅ | Date of birth (YYYY-MM-DD) |

**Example:**
```typescript
await callTool('ustaxes_add_spouse', {
  year: 2024,
  firstName: 'Jane',
  lastName: 'Doe',
  ssn: '987-65-4321',
  dateOfBirth: '1982-03-20'
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "name": "Jane Doe"
  },
  "message": "Spouse added: Jane Doe"
}
```

---

### `ustaxes_add_dependent`

Add a dependent (child or qualifying relative).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `firstName` | string | ✅ | First name |
| `lastName` | string | ✅ | Last name |
| `ssn` | string | ✅ | SSN (format: XXX-XX-XXXX) |
| `dateOfBirth` | string | ✅ | Date of birth (YYYY-MM-DD) |
| `relationship` | string | ✅ | Relationship to taxpayer |
| `months` | number | ✅ | Months lived with you (0-12) |

**Relationship Values:**
- `SON`
- `DAUGHTER`
- `STEPCHILD`
- `FOSTER_CHILD`
- `SIBLING`
- `PARENT`
- `OTHER`

**Example:**
```typescript
await callTool('ustaxes_add_dependent', {
  year: 2024,
  firstName: 'Emily',
  lastName: 'Doe',
  ssn: '555-66-7777',
  dateOfBirth: '2015-06-10',
  relationship: 'DAUGHTER',
  months: 12
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "name": "Emily Doe"
  },
  "message": "Dependent added: Emily Doe"
}
```

---

## Income Tools

### `ustaxes_add_w2`

Add W-2 wage income from an employer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `personRole` | string | ✅ | PRIMARY or SPOUSE |
| `employer` | object | ✅ | Employer information |
| `occupation` | string | ✅ | Occupation/job title |
| `wages` | number | ✅ | Box 1 - Wages, tips, other compensation |
| `federalWithholding` | number | ✅ | Box 2 - Federal income tax withheld |
| `socialSecurityWages` | number | ✅ | Box 3 - Social security wages |
| `socialSecurityWithholding` | number | ✅ | Box 4 - Social security tax withheld |
| `medicareWages` | number | ✅ | Box 5 - Medicare wages and tips |
| `medicareWithholding` | number | ✅ | Box 6 - Medicare tax withheld |
| `stateWages` | number | ❌ | Box 16 - State wages |
| `stateWithholding` | number | ❌ | Box 17 - State income tax withheld |
| `state` | string | ❌ | State code (if state wages reported) |

**Employer Object:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Employer name |
| `EIN` | string | ✅ | Employer EIN (XX-XXXXXXX) |
| `address` | object | ✅ | Employer address |

**Example:**
```typescript
await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'PRIMARY',
  employer: {
    name: 'Tech Corp Inc',
    EIN: '12-3456789',
    address: {
      address: '456 Corporate Dr',
      city: 'Boston',
      state: 'MA',
      zip: '02102'
    }
  },
  occupation: 'Software Engineer',
  wages: 120000,
  federalWithholding: 18000,
  socialSecurityWages: 120000,
  socialSecurityWithholding: 7440,
  medicareWages: 120000,
  medicareWithholding: 1740,
  stateWages: 120000,
  stateWithholding: 6000,
  state: 'MA'
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "employer": "Tech Corp Inc",
    "wages": 120000
  },
  "message": "W-2 added for Tech Corp Inc"
}
```

---

### `ustaxes_add_1099_int`

Add 1099-INT interest income.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `payer` | string | ✅ | Financial institution name |
| `interest` | number | ✅ | Box 1 - Interest income |
| `taxExemptInterest` | number | ❌ | Box 8 - Tax-exempt interest |
| `payerTIN` | string | ❌ | Payer's EIN |

**Example:**
```typescript
await callTool('ustaxes_add_1099_int', {
  year: 2024,
  payer: 'Bank of America',
  interest: 450,
  taxExemptInterest: 0,
  payerTIN: '12-3456789'
})
```

---

### `ustaxes_add_1099_div`

Add 1099-DIV dividend income.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `payer` | string | ✅ | Financial institution name |
| `ordinaryDividends` | number | ✅ | Box 1a - Ordinary dividends |
| `qualifiedDividends` | number | ❌ | Box 1b - Qualified dividends |
| `capitalGains` | number | ❌ | Box 2a - Total capital gain distributions |

**Example:**
```typescript
await callTool('ustaxes_add_1099_div', {
  year: 2024,
  payer: 'Vanguard',
  ordinaryDividends: 2500,
  qualifiedDividends: 2000,
  capitalGains: 500
})
```

---

### `ustaxes_add_1099_b`

Add 1099-B brokerage transactions (stocks, bonds, etc.).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `payer` | string | ✅ | Brokerage name |
| `description` | string | ✅ | Security description |
| `proceeds` | number | ✅ | Box 1d - Proceeds |
| `costBasis` | number | ✅ | Box 1e - Cost basis |
| `dateAcquired` | string | ❌ | Date acquired (YYYY-MM-DD) |
| `dateSold` | string | ✅ | Date sold (YYYY-MM-DD) |
| `shortTerm` | boolean | ✅ | Short-term (true) or long-term (false) |

**Example:**
```typescript
await callTool('ustaxes_add_1099_b', {
  year: 2024,
  payer: 'Fidelity',
  description: '100 shares AAPL',
  proceeds: 18000,
  costBasis: 15000,
  dateAcquired: '2020-03-15',
  dateSold: '2024-06-20',
  shortTerm: false
})
```

---

### `ustaxes_add_property`

Add rental property income and expenses.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `address` | object | ✅ | Property address |
| `rentReceived` | number | ✅ | Total rent received |
| `expenses` | object | ✅ | Expense breakdown |

**Expense Object:**
| Field | Type | Description |
|-------|------|-------------|
| `advertising` | number | Advertising |
| `auto` | number | Auto and travel |
| `cleaning` | number | Cleaning and maintenance |
| `commissions` | number | Commissions |
| `insurance` | number | Insurance |
| `legal` | number | Legal and professional fees |
| `management` | number | Management fees |
| `mortgage` | number | Mortgage interest |
| `repairs` | number | Repairs |
| `supplies` | number | Supplies |
| `taxes` | number | Taxes |
| `utilities` | number | Utilities |
| `depreciation` | number | Depreciation |
| `other` | number | Other expenses |

**Example:**
```typescript
await callTool('ustaxes_add_property', {
  year: 2024,
  address: {
    address: '789 Rental St',
    city: 'Cambridge',
    state: 'MA',
    zip: '02138'
  },
  rentReceived: 24000,
  expenses: {
    mortgage: 12000,
    taxes: 4000,
    insurance: 1200,
    repairs: 500,
    management: 2400,
    utilities: 1200
  }
})
```

---

## Deduction Tools

### `ustaxes_set_itemized_deductions`

Set itemized deductions (use if total exceeds standard deduction).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `medicalExpenses` | number | ❌ | Medical and dental expenses |
| `stateAndLocalTaxes` | number | ❌ | State/local income and property taxes (capped at $10,000) |
| `homeMortgageInterest` | number | ❌ | Home mortgage interest |
| `charitableCash` | number | ❌ | Charitable contributions (cash) |
| `charitableNonCash` | number | ❌ | Charitable contributions (non-cash) |

**Example:**
```typescript
await callTool('ustaxes_set_itemized_deductions', {
  year: 2024,
  medicalExpenses: 8000,
  stateAndLocalTaxes: 10000,
  homeMortgageInterest: 15000,
  charitableCash: 5000
})
```

---

### `ustaxes_add_1098e`

Add student loan interest (Form 1098-E).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `lender` | string | ✅ | Lender name |
| `interest` | number | ✅ | Box 1 - Student loan interest paid |

**Example:**
```typescript
await callTool('ustaxes_add_1098e', {
  year: 2024,
  lender: 'Federal Student Aid',
  interest: 2500
})
```

---

### `ustaxes_add_hsa`

Add Health Savings Account contribution.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `personRole` | string | ✅ | PRIMARY or SPOUSE |
| `contribution` | number | ✅ | Total HSA contribution |
| `employerContribution` | number | ❌ | Employer contribution portion |

**Example:**
```typescript
await callTool('ustaxes_add_hsa', {
  year: 2024,
  personRole: 'PRIMARY',
  contribution: 4150,
  employerContribution: 1000
})
```

---

### `ustaxes_add_ira`

Add Individual Retirement Arrangement contribution.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `personRole` | string | ✅ | PRIMARY or SPOUSE |
| `contributionType` | string | ✅ | traditional or roth |
| `contribution` | number | ✅ | Total contribution amount |

**Example:**
```typescript
await callTool('ustaxes_add_ira', {
  year: 2024,
  personRole: 'PRIMARY',
  contributionType: 'traditional',
  contribution: 7000
})
```

---

## PDF Generation Tools

### `ustaxes_generate_federal_pdf`

Generate federal Form 1040 and all required schedules.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `outputPath` | string | ✅ | Full path for output PDF file |

**Example:**
```typescript
await callTool('ustaxes_generate_federal_pdf', {
  year: 2024,
  outputPath: '/tmp/federal-return-2024.pdf'
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outputPath": "/tmp/federal-return-2024.pdf",
    "formsIncluded": [
      "Form 1040",
      "Schedule 1",
      "Schedule B",
      "Schedule D"
    ],
    "totalTax": 15234.50,
    "refundOrOwed": -2765.50
  },
  "message": "Federal PDF generated successfully"
}
```

---

### `ustaxes_generate_state_pdf`

Generate state tax return PDF.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `state` | string | ✅ | State code (e.g., 'MA') |
| `outputPath` | string | ✅ | Full path for output PDF file |

**Example:**
```typescript
await callTool('ustaxes_generate_state_pdf', {
  year: 2024,
  state: 'MA',
  outputPath: '/tmp/ma-state-return-2024.pdf'
})
```

**Supported States:**
- `MA` - Massachusetts (Form 1)

*(More states in development)*

---

### `ustaxes_generate_all_pdfs`

Generate both federal and state PDFs in one call.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `outputDir` | string | ✅ | Directory for output PDFs |

**Example:**
```typescript
await callTool('ustaxes_generate_all_pdfs', {
  year: 2024,
  outputDir: '/tmp/tax-returns-2024'
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "federal": {
      "path": "/tmp/tax-returns-2024/federal-2024.pdf",
      "forms": ["Form 1040", "Schedule 1", "Schedule B"]
    },
    "state": {
      "path": "/tmp/tax-returns-2024/ma-2024.pdf",
      "forms": ["MA Form 1"]
    }
  },
  "message": "All PDFs generated successfully"
}
```

---

## State Management Tools

### `ustaxes_export_state`

Export complete tax return state to JSON file.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `outputPath` | string | ✅ | Full path for output JSON file |

**Example:**
```typescript
await callTool('ustaxes_export_state', {
  year: 2024,
  outputPath: '/tmp/tax-state-2024.json'
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outputPath": "/tmp/tax-state-2024.json",
    "itemCount": {
      "w2s": 2,
      "f1099s": 3,
      "dependents": 1
    }
  },
  "message": "State exported successfully"
}
```

---

### `ustaxes_import_state`

Import tax return state from previously exported JSON file.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year (2019-2024) |
| `statePath` | string | ✅ | Full path to JSON state file |

**Example:**
```typescript
await callTool('ustaxes_import_state', {
  year: 2024,
  statePath: '/tmp/tax-state-2024.json'
})
```

---

### `ustaxes_clear_year`

Clear all data for a specific tax year.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | ✅ | Tax year to clear (2019-2024) |

**Example:**
```typescript
await callTool('ustaxes_clear_year', {
  year: 2024
})
```

---

## MCP Resources

The MCP server provides queryable resources using the `return://` URI scheme.

### Federal Return Summary

**URI:** `return://[year]/federal`

**Description:** Summary of federal return data including income, deductions, and tax calculation.

**Example Response:**
```json
{
  "year": 2024,
  "taxpayer": {
    "name": "John Doe",
    "filingStatus": "MFJ"
  },
  "income": {
    "w2Count": 2,
    "totalW2Wages": 180000,
    "f1099Count": 3
  },
  "deductions": {
    "hasItemized": true,
    "studentLoanInterest": 1,
    "hsaContributions": 1,
    "iraContributions": 1
  },
  "dependents": 1
}
```

---

### State Return Summary

**URI:** `return://[year]/state`

**Description:** Summary of state return data.

**Example Response:**
```json
{
  "year": 2024,
  "state": "MA",
  "stateWithholding": 9000
}
```

---

### Complete Tax Summary

**URI:** `return://[year]/summary`

**Description:** Complete tax return state with all details and statistics.

---

## Common Types

### FilingStatus
```typescript
type FilingStatus = 'S' | 'MFJ' | 'MFS' | 'HOH' | 'W'
```

### PersonRole
```typescript
type PersonRole = 'PRIMARY' | 'SPOUSE'
```

### TaxYear
```typescript
type TaxYear = 2019 | 2020 | 2021 | 2022 | 2023 | 2024
```

### ToolResult
```typescript
interface ToolResult {
  success: boolean
  data?: any
  message?: string
  error?: string
  details?: any
}
```

---

## Error Handling

All tools return a consistent error format:

```json
{
  "success": false,
  "error": "Description of what went wrong",
  "details": "Additional error details or stack trace"
}
```

**Common Errors:**
- Invalid tax year (not 2019-2024)
- Missing required fields
- Invalid SSN format (must be XXX-XX-XXXX)
- Invalid EIN format (must be XX-XXXXXXX)
- Invalid state code
- File system errors (PDF generation, export/import)

---

## Rate Limits & Performance

- **In-Memory Storage**: All state is stored in memory (fast)
- **No Rate Limits**: Tools can be called as frequently as needed
- **PDF Generation**: 1-5 seconds depending on return complexity
- **State Export**: Near-instant for typical returns

---

## Security Considerations

- **SSNs and EINs**: Never logged, sanitized in error messages
- **PII Protection**: All personal information treated as sensitive
- **File System**: PDF and export operations require valid paths
- **State Persistence**: State cleared when MCP server restarts (use export/import)

---

**Last Updated:** 2024-11-28
**Version:** 1.0.0
**License:** GPL-3.0
