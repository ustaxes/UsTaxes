# UsTaxes MCP Server - Practical Examples

Real-world examples of preparing complete tax returns using the UsTaxes MCP Server.

## Table of Contents

- [Simple W-2 Employee](#simple-w-2-employee)
- [Married Filing Jointly with Dependents](#married-filing-jointly-with-dependents)
- [Self-Employed with Rental Property](#self-employed-with-rental-property)
- [Investment Income and Capital Gains](#investment-income-and-capital-gains)
- [Complete Return with All Features](#complete-return-with-all-features)
- [State Management Workflows](#state-management-workflows)
- [Error Recovery](#error-recovery)

---

## Simple W-2 Employee

### Scenario

Single filer, one W-2 job, standard deduction, no dependents.

### Workflow

```typescript
// Step 1: Set filing status
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'S'
})

// Step 2: Add taxpayer information
await callTool('ustaxes_add_primary_person', {
  year: 2024,
  firstName: 'Alice',
  lastName: 'Smith',
  ssn: '123-45-6789',
  dateOfBirth: '1990-05-15',
  address: {
    address: '100 Main Street',
    city: 'Boston',
    state: 'MA',
    zip: '02101'
  }
})

// Step 3: Add W-2 income
await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'PRIMARY',
  employer: {
    name: 'Acme Corporation',
    EIN: '12-3456789',
    address: {
      address: '500 Business Blvd',
      city: 'Boston',
      state: 'MA',
      zip: '02102'
    }
  },
  occupation: 'Software Engineer',
  wages: 85000,
  federalWithholding: 12000,
  socialSecurityWages: 85000,
  socialSecurityWithholding: 5270,
  medicareWages: 85000,
  medicareWithholding: 1232.5,
  stateWages: 85000,
  stateWithholding: 4250,
  state: 'MA'
})

// Step 4: Generate PDFs
await callTool('ustaxes_generate_federal_pdf', {
  year: 2024,
  outputPath: '/tmp/alice-federal-2024.pdf'
})

await callTool('ustaxes_generate_state_pdf', {
  year: 2024,
  state: 'MA',
  outputPath: '/tmp/alice-ma-2024.pdf'
})
```

### Expected Tax Outcome

- Gross Income: $85,000
- Standard Deduction: $14,600
- Taxable Income: $70,400
- Federal Tax: ~$10,000
- Refund: ~$2,000 (after withholding)

---

## Married Filing Jointly with Dependents

### Scenario

Married couple, two W-2 jobs, two children, standard deduction, IRA contributions.

### Workflow

```typescript
// Step 1: Set filing status
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'MFJ'
})

// Step 2: Add primary taxpayer
await callTool('ustaxes_add_primary_person', {
  year: 2024,
  firstName: 'John',
  lastName: 'Doe',
  ssn: '111-22-3333',
  dateOfBirth: '1985-03-20',
  address: {
    address: '456 Oak Avenue',
    city: 'Cambridge',
    state: 'MA',
    zip: '02138'
  }
})

// Step 3: Add spouse
await callTool('ustaxes_add_spouse', {
  year: 2024,
  firstName: 'Jane',
  lastName: 'Doe',
  ssn: '444-55-6666',
  dateOfBirth: '1987-07-10'
})

// Step 4: Add first dependent (daughter)
await callTool('ustaxes_add_dependent', {
  year: 2024,
  firstName: 'Emily',
  lastName: 'Doe',
  ssn: '777-88-9999',
  dateOfBirth: '2015-11-05',
  relationship: 'DAUGHTER',
  months: 12
})

// Step 5: Add second dependent (son)
await callTool('ustaxes_add_dependent', {
  year: 2024,
  firstName: 'Michael',
  lastName: 'Doe',
  ssn: '111-22-4444',
  dateOfBirth: '2018-04-15',
  relationship: 'SON',
  months: 12
})

// Step 6: Add primary's W-2
await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'PRIMARY',
  employer: {
    name: 'Tech Corp',
    EIN: '98-7654321',
    address: {
      address: '1000 Tech Park',
      city: 'Boston',
      state: 'MA',
      zip: '02110'
    }
  },
  occupation: 'Senior Engineer',
  wages: 140000,
  federalWithholding: 22000,
  socialSecurityWages: 140000,
  socialSecurityWithholding: 8680,
  medicareWages: 140000,
  medicareWithholding: 2030,
  stateWages: 140000,
  stateWithholding: 7000,
  state: 'MA'
})

// Step 7: Add spouse's W-2
await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'SPOUSE',
  employer: {
    name: 'Healthcare Systems Inc',
    EIN: '55-6677889',
    address: {
      address: '200 Medical Way',
      city: 'Boston',
      state: 'MA',
      zip: '02115'
    }
  },
  occupation: 'Nurse Practitioner',
  wages: 95000,
  federalWithholding: 14000,
  socialSecurityWages: 95000,
  socialSecurityWithholding: 5890,
  medicareWages: 95000,
  medicareWithholding: 1377.5,
  stateWages: 95000,
  stateWithholding: 4750,
  state: 'MA'
})

// Step 8: Add IRA contributions
await callTool('ustaxes_add_ira', {
  year: 2024,
  personRole: 'PRIMARY',
  contributionType: 'traditional',
  contribution: 7000
})

await callTool('ustaxes_add_ira', {
  year: 2024,
  personRole: 'SPOUSE',
  contributionType: 'traditional',
  contribution: 7000
})

// Step 9: Generate all PDFs
await callTool('ustaxes_generate_all_pdfs', {
  year: 2024,
  outputDir: '/tmp/doe-family-2024'
})
```

### Expected Tax Outcome

- Combined Gross Income: $235,000
- IRA Deductions: -$14,000
- Adjusted Gross Income: $221,000
- Standard Deduction: -$29,200
- Taxable Income: $191,800
- Child Tax Credits: -$4,000 (2 children × $2,000)
- Federal Tax: ~$30,000
- Refund: ~$6,000

---

## Self-Employed with Rental Property

### Scenario

Head of Household, self-employed income (Schedule C), rental property income (Schedule E), HSA contributions.

### Workflow

```typescript
// Step 1: Set filing status
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'HOH'
})

// Step 2: Add taxpayer
await callTool('ustaxes_add_primary_person', {
  year: 2024,
  firstName: 'Robert',
  lastName: 'Johnson',
  ssn: '222-33-4444',
  dateOfBirth: '1980-09-12',
  address: {
    address: '789 Elm Street',
    city: 'Somerville',
    state: 'MA',
    zip: '02144'
  }
})

// Step 3: Add dependent (qualifying child for HOH)
await callTool('ustaxes_add_dependent', {
  year: 2024,
  firstName: 'Sarah',
  lastName: 'Johnson',
  ssn: '555-66-7777',
  dateOfBirth: '2012-01-20',
  relationship: 'DAUGHTER',
  months: 12
})

// Step 4: Add 1099-NEC (self-employment income)
// Note: Actual implementation may vary - this is conceptual
await callTool('ustaxes_add_1099_nec', {
  year: 2024,
  payer: 'Freelance Clients',
  nonEmployeeCompensation: 85000,
  payerTIN: '99-8877665'
})

// Step 5: Add rental property
await callTool('ustaxes_add_property', {
  year: 2024,
  address: {
    address: '123 Rental Ave',
    city: 'Cambridge',
    state: 'MA',
    zip: '02139'
  },
  rentReceived: 30000,
  expenses: {
    mortgage: 18000,
    taxes: 5000,
    insurance: 1500,
    repairs: 800,
    management: 3000,
    utilities: 1200,
    depreciation: 4000
  }
})

// Step 6: Add HSA contribution
await callTool('ustaxes_add_hsa', {
  year: 2024,
  personRole: 'PRIMARY',
  contribution: 4150,
  employerContribution: 0
})

// Step 7: Add student loan interest
await callTool('ustaxes_add_1098e', {
  year: 2024,
  lender: 'Federal Student Aid',
  interest: 2500
})

// Step 8: Generate PDFs
await callTool('ustaxes_generate_all_pdfs', {
  year: 2024,
  outputDir: '/tmp/johnson-2024'
})
```

### Expected Forms Generated

- Form 1040
- Schedule 1 (Additional Income and Adjustments)
- Schedule C (Self-Employment Income)
- Schedule E (Rental Income)
- Schedule SE (Self-Employment Tax)

---

## Investment Income and Capital Gains

### Scenario

Single filer with W-2 income plus significant investment income (interest, dividends, capital gains).

### Workflow

```typescript
// Step 1-2: Set filing status and add taxpayer
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'S'
})

await callTool('ustaxes_add_primary_person', {
  year: 2024,
  firstName: 'Lisa',
  lastName: 'Williams',
  ssn: '333-44-5555',
  dateOfBirth: '1988-11-30',
  address: {
    address: '321 Investment Lane',
    city: 'Boston',
    state: 'MA',
    zip: '02116'
  }
})

// Step 3: Add W-2
await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'PRIMARY',
  employer: {
    name: 'Finance Corp',
    EIN: '66-7788990',
    address: {
      address: '100 Wall Street',
      city: 'Boston',
      state: 'MA',
      zip: '02109'
    }
  },
  occupation: 'Financial Analyst',
  wages: 120000,
  federalWithholding: 20000,
  socialSecurityWages: 120000,
  socialSecurityWithholding: 7440,
  medicareWages: 120000,
  medicareWithholding: 1740,
  stateWages: 120000,
  stateWithholding: 6000,
  state: 'MA'
})

// Step 4: Add interest income (1099-INT)
await callTool('ustaxes_add_1099_int', {
  year: 2024,
  payer: 'Bank of America',
  interest: 1200,
  payerTIN: '12-3456789'
})

// Step 5: Add dividend income (1099-DIV)
await callTool('ustaxes_add_1099_div', {
  year: 2024,
  payer: 'Vanguard',
  ordinaryDividends: 4500,
  qualifiedDividends: 3800,
  capitalGains: 800
})

await callTool('ustaxes_add_1099_div', {
  year: 2024,
  payer: 'Fidelity',
  ordinaryDividends: 2100,
  qualifiedDividends: 1800,
  capitalGains: 300
})

// Step 6: Add capital gains (1099-B)
await callTool('ustaxes_add_1099_b', {
  year: 2024,
  payer: 'Charles Schwab',
  description: '200 shares AAPL',
  proceeds: 35000,
  costBasis: 28000,
  dateAcquired: '2018-03-01',
  dateSold: '2024-08-15',
  shortTerm: false
})

// Long-term gain: $7,000

// Step 7: Generate PDFs
await callTool('ustaxes_generate_federal_pdf', {
  year: 2024,
  outputPath: '/tmp/williams-federal-2024.pdf'
})
```

### Expected Forms

- Form 1040
- Schedule B (Interest and Dividend Income)
- Schedule D (Capital Gains and Losses)
- Form 8949 (Sales and Dispositions of Capital Assets)

### Expected Tax Treatment

- W-2 Wages: $120,000 (ordinary income)
- Interest: $1,200 (ordinary income)
- Ordinary Dividends: $6,600 (ordinary income)
- Qualified Dividends: $5,600 (preferential 15% rate)
- Long-term Capital Gains: $7,000 + $1,100 = $8,100 (preferential 15% rate)

---

## Complete Return with All Features

### Scenario

Married Filing Jointly with comprehensive tax situation including:

- Multiple W-2s
- Investment income
- Rental property
- Itemized deductions
- Educational expenses
- Retirement contributions

```typescript
// Full workflow demonstrating all major tools

// 1. Filing status
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'MFJ'
})

// 2. Personal information
await callTool('ustaxes_add_primary_person', {
  year: 2024,
  firstName: 'Michael',
  lastName: 'Anderson',
  ssn: '777-88-9999',
  dateOfBirth: '1975-02-14',
  address: {
    address: '999 Complete Street',
    city: 'Boston',
    state: 'MA',
    zip: '02118'
  }
})

await callTool('ustaxes_add_spouse', {
  year: 2024,
  firstName: 'Jennifer',
  lastName: 'Anderson',
  ssn: '888-99-0000',
  dateOfBirth: '1977-06-22'
})

await callTool('ustaxes_add_dependent', {
  year: 2024,
  firstName: 'Alex',
  lastName: 'Anderson',
  ssn: '111-22-3333',
  dateOfBirth: '2005-09-10',
  relationship: 'SON',
  months: 12
})

// 3. W-2 Income (both spouses)
await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'PRIMARY',
  employer: {
    name: 'Major Corp',
    EIN: '12-3456789',
    address: {
      address: '1 Corporate Plaza',
      city: 'Boston',
      state: 'MA',
      zip: '02110'
    }
  },
  occupation: 'Engineering Manager',
  wages: 180000,
  federalWithholding: 28000,
  socialSecurityWages: 168600, // SS wage cap
  socialSecurityWithholding: 10453.2,
  medicareWages: 180000,
  medicareWithholding: 2610,
  stateWages: 180000,
  stateWithholding: 9000,
  state: 'MA'
})

await callTool('ustaxes_add_w2', {
  year: 2024,
  personRole: 'SPOUSE',
  employer: {
    name: 'Research Institute',
    EIN: '98-7654321',
    address: {
      address: '50 Science Drive',
      city: 'Cambridge',
      state: 'MA',
      zip: '02139'
    }
  },
  occupation: 'Research Scientist',
  wages: 110000,
  federalWithholding: 16000,
  socialSecurityWages: 110000,
  socialSecurityWithholding: 6820,
  medicareWages: 110000,
  medicareWithholding: 1595,
  stateWages: 110000,
  stateWithholding: 5500,
  state: 'MA'
})

// 4. Investment Income
await callTool('ustaxes_add_1099_int', {
  year: 2024,
  payer: 'Bank of America',
  interest: 800
})

await callTool('ustaxes_add_1099_div', {
  year: 2024,
  payer: 'Vanguard',
  ordinaryDividends: 5200,
  qualifiedDividends: 4500,
  capitalGains: 1200
})

await callTool('ustaxes_add_1099_b', {
  year: 2024,
  payer: 'Fidelity',
  description: '100 shares VTI',
  proceeds: 25000,
  costBasis: 20000,
  dateAcquired: '2019-05-15',
  dateSold: '2024-11-01',
  shortTerm: false
})

// 5. Rental Property
await callTool('ustaxes_add_property', {
  year: 2024,
  address: {
    address: '456 Rental Property',
    city: 'Somerville',
    state: 'MA',
    zip: '02145'
  },
  rentReceived: 36000,
  expenses: {
    mortgage: 20000,
    taxes: 6000,
    insurance: 1800,
    repairs: 1200,
    management: 3600,
    utilities: 1500,
    depreciation: 5000
  }
})

// 6. Retirement Contributions
await callTool('ustaxes_add_ira', {
  year: 2024,
  personRole: 'PRIMARY',
  contributionType: 'traditional',
  contribution: 7000
})

await callTool('ustaxes_add_ira', {
  year: 2024,
  personRole: 'SPOUSE',
  contributionType: 'traditional',
  contribution: 7000
})

// 7. HSA Contribution
await callTool('ustaxes_add_hsa', {
  year: 2024,
  personRole: 'PRIMARY',
  contribution: 8300,
  employerContribution: 2000
})

// 8. Student Loan Interest (for dependent's college)
await callTool('ustaxes_add_1098e', {
  year: 2024,
  lender: 'Federal Student Aid',
  interest: 2500
})

// 9. Itemized Deductions (if beneficial)
await callTool('ustaxes_set_itemized_deductions', {
  year: 2024,
  medicalExpenses: 12000,
  stateAndLocalTaxes: 10000,
  homeMortgageInterest: 18000,
  charitableCash: 8000,
  charitableNonCash: 1500
})

// 10. Export state for review
await callTool('ustaxes_export_state', {
  year: 2024,
  outputPath: '/tmp/anderson-state-2024.json'
})

// 11. Generate all PDFs
await callTool('ustaxes_generate_all_pdfs', {
  year: 2024,
  outputDir: '/tmp/anderson-complete-2024'
})
```

### Expected Forms

- Form 1040
- Schedule 1 (Additional Income and Adjustments to Income)
- Schedule A (Itemized Deductions)
- Schedule B (Interest and Dividend Income)
- Schedule D (Capital Gains and Losses)
- Schedule E (Rental Income)
- Form 8949 (Capital Asset Sales)
- Form 8889 (HSA)

---

## State Management Workflows

### Saving and Restoring Work

```typescript
// At end of session - export current work
await callTool('ustaxes_export_state', {
  year: 2024,
  outputPath: '/home/user/Documents/Taxes/tax-state-2024.json'
})

// Later - restore work
await callTool('ustaxes_import_state', {
  year: 2024,
  statePath: '/home/user/Documents/Taxes/tax-state-2024.json'
})

// Verify import
const resource = await readResource('return://2024/summary')
console.log(resource)
```

### Multiple Years

```typescript
// Prepare returns for multiple years
for (const year of [2022, 2023, 2024]) {
  // Import saved state for each year
  await callTool('ustaxes_import_state', {
    year,
    statePath: `/path/to/tax-state-${year}.json`
  })

  // Generate PDFs
  await callTool('ustaxes_generate_all_pdfs', {
    year,
    outputDir: `/tmp/taxes-${year}`
  })
}
```

### Clearing and Starting Over

```typescript
// Clear year if you need to start over
await callTool('ustaxes_clear_year', {
  year: 2024
})

// Verify clear
const resource = await readResource('return://2024/summary')
// Should show empty return
```

---

## Error Recovery

### Handling Import Errors

```typescript
try {
  await callTool('ustaxes_import_state', {
    year: 2024,
    statePath: '/path/to/state.json'
  })
} catch (error) {
  console.error('Import failed:', error)

  // Start fresh
  await callTool('ustaxes_clear_year', { year: 2024 })

  // Re-enter data manually
  // ...
}
```

### Validating Before PDF Generation

```typescript
// Export and inspect before generating PDFs
const exportResult = await callTool('ustaxes_export_state', {
  year: 2024,
  outputPath: '/tmp/validation-check.json'
})

// Read and validate
const stateData = JSON.parse(
  await fs.readFile('/tmp/validation-check.json', 'utf-8')
)

// Check for completeness
if (!stateData.taxPayer?.filingStatus) {
  console.error('Missing filing status!')
}

if (stateData.w2s.length === 0) {
  console.error('No W-2s added!')
}

// Only generate PDFs if valid
if (isValid) {
  await callTool('ustaxes_generate_federal_pdf', {
    year: 2024,
    outputPath: '/tmp/federal-2024.pdf'
  })
}
```

### Incremental Validation

```typescript
// Validate after each major step
const steps = [
  { name: 'Filing Status', check: () => /* check status */ },
  { name: 'Personal Info', check: () => /* check personal */ },
  { name: 'Income', check: () => /* check income */ },
  { name: 'Deductions', check: () => /* check deductions */ }
]

for (const step of steps) {
  const result = await step.check()
  if (!result.valid) {
    console.error(`Step "${step.name}" failed:`, result.errors)
    break
  }
}
```

---

## Tips & Best Practices

### 1. Always Export State

```typescript
// At end of each session
await callTool('ustaxes_export_state', {
  year: 2024,
  outputPath: '/safe/location/tax-backup-2024.json'
})
```

### 2. Use Resources to Check Progress

```typescript
// Check federal summary
const federal = await readResource('return://2024/federal')
console.log(`W-2s: ${federal.income.w2Count}`)
console.log(`Total wages: $${federal.income.totalW2Wages}`)
```

### 3. Generate PDFs Early and Often

```typescript
// Generate test PDFs during data entry to catch errors early
await callTool('ustaxes_generate_federal_pdf', {
  year: 2024,
  outputPath: '/tmp/test-return.pdf'
})
```

### 4. Break Complex Returns into Phases

```typescript
// Phase 1: Personal info
// Phase 2: W-2 income
// Phase 3: Other income
// Phase 4: Deductions
// Phase 5: Validate and generate

// Export after each phase
```

---

**Last Updated:** 2024-11-28
**Version:** 1.0.0
