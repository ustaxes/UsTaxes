/**
 * MCP Server Integration Example
 *
 * This example demonstrates how to use the ustaxes-server MCP server
 * to programmatically complete a tax return.
 *
 * The MCP server provides tools for:
 * - Setting personal information (filing status, taxpayer, spouse, dependents)
 * - Adding income (W-2s, 1099s, property, student loans)
 * - Managing deductions (HSA, IRA, itemized deductions)
 * - Generating PDFs (federal and state)
 *
 * To use this server, add it to your MCP configuration:
 *
 * ```json
 * {
 *   "mcpServers": {
 *     "ustaxes": {
 *       "command": "npx",
 *       "args": ["-y", "tsx", ".claude/mcp-servers/ustaxes-server/src/index.ts"]
 *     }
 *   }
 * }
 * ```
 */

import { FilingStatus } from 'ustaxes/core/data'

/**
 * Example 1: Simple W-2 Employee Return
 *
 * This example shows how to complete a basic tax return for a single
 * taxpayer with one W-2.
 */
export async function simpleW2Return() {
  // Step 1: Set filing status
  await mcp.ustaxes_set_filing_status({
    year: 2024,
    status: FilingStatus.S, // Single
  })

  // Step 2: Add primary taxpayer
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
        zip: '02101',
      },
    },
  })

  // Step 3: Add W-2 income
  await mcp.ustaxes_add_w2({
    year: 2024,
    w2: {
      occupation: 'Software Engineer',
      income: 75000,
      medicareIncome: 75000,
      fedWithholding: 12000,
      ssWages: 75000,
      ssWithholding: 4650,
      medicareWithholding: 1087.5,
      ein: '12-3456789',
      employerName: 'Tech Company Inc',
      personRole: 'PRIMARY',
    },
  })

  // Step 4: Generate federal PDF
  const federalPdf = await mcp.ustaxes_generate_federal_pdf({
    year: 2024,
    outputPath: '/tmp/federal-return.pdf',
  })

  console.log(`Federal PDF generated: ${federalPdf.data.fileSize / 1024} KB`)

  // Step 5: Add state residency and generate state PDF
  await mcp.ustaxes_add_state_residency({
    year: 2024,
    state: 'MA',
  })

  const statePdf = await mcp.ustaxes_generate_state_pdf({
    year: 2024,
    state: 'MA',
    outputPath: '/tmp/ma-state-return.pdf',
  })

  console.log(`State PDF generated: ${statePdf.data.fileSize / 1024} KB`)
}

/**
 * Example 2: Married Filing Jointly with Multiple Income Sources
 *
 * This example shows a more complex return with:
 * - Married filing jointly
 * - Multiple W-2s
 * - 1099 interest income
 * - Student loan interest deduction
 * - Rental property
 */
export async function complexMarriedReturn() {
  // Step 1: Set filing status
  await mcp.ustaxes_set_filing_status({
    year: 2024,
    status: FilingStatus.MFJ,
  })

  // Step 2: Add primary taxpayer
  await mcp.ustaxes_add_primary_person({
    year: 2024,
    person: {
      firstName: 'Jane',
      lastName: 'Smith',
      ssid: '111-22-3333',
      role: 'PRIMARY',
      address: {
        address: '456 Oak Ave',
        city: 'Cambridge',
        state: 'MA',
        zip: '02138',
      },
    },
  })

  // Step 3: Add spouse
  await mcp.ustaxes_add_spouse({
    year: 2024,
    spouse: {
      firstName: 'John',
      lastName: 'Smith',
      ssid: '444-55-6666',
      role: 'SPOUSE',
    },
  })

  // Step 4: Add dependents
  await mcp.ustaxes_add_dependent({
    year: 2024,
    dependent: {
      firstName: 'Emma',
      lastName: 'Smith',
      ssid: '777-88-9999',
      role: 'DEPENDENT',
      birthYear: 2015, // Age 9 - qualifies for child tax credit
      relationship: 'DAUGHTER',
    },
  })

  // Step 5: Add W-2s for both spouses
  await mcp.ustaxes_add_w2({
    year: 2024,
    w2: {
      occupation: 'Attorney',
      income: 120000,
      medicareIncome: 120000,
      fedWithholding: 20000,
      ssWages: 120000,
      ssWithholding: 7440,
      medicareWithholding: 1740,
      ein: '11-1111111',
      employerName: 'Law Firm LLP',
      personRole: 'PRIMARY',
      state: 'MA',
      stateWages: 120000,
      stateWithholding: 6000,
    },
  })

  await mcp.ustaxes_add_w2({
    year: 2024,
    w2: {
      occupation: 'Software Engineer',
      income: 95000,
      medicareIncome: 95000,
      fedWithholding: 15000,
      ssWages: 95000,
      ssWithholding: 5890,
      medicareWithholding: 1377.5,
      ein: '22-2222222',
      employerName: 'Tech Corp',
      personRole: 'SPOUSE',
      state: 'MA',
      stateWages: 95000,
      stateWithholding: 4750,
    },
  })

  // Step 6: Add 1099-INT interest income
  await mcp.ustaxes_add_1099({
    year: 2024,
    form1099: {
      form: '1099-INT',
      payer: 'My Bank',
      payerTin: '33-3333333',
      personRole: 'PRIMARY',
      income: 1200,
      interest: 1200,
    },
  })

  // Step 7: Add student loan interest deduction
  await mcp.ustaxes_add_student_loan({
    year: 2024,
    f1098e: {
      lender: 'Student Loan Servicer',
      interest: 2500, // Max deduction is $2500
    },
  })

  // Step 8: Add rental property
  await mcp.ustaxes_add_property({
    year: 2024,
    property: {
      address: {
        address: '789 Rental St',
        city: 'Somerville',
        state: 'MA',
        zip: '02145',
      },
      rentalDays: 365,
      personalUseDays: 0,
      rentReceived: 24000,
      expenses: {
        mortgageInterest: 8000,
        taxes: 5000,
        insurance: 1200,
        repairs: 800,
        utilities: 0,
        managementFees: 1200,
      },
    },
  })

  // Step 9: Add HSA contribution
  await mcp.ustaxes_add_hsa({
    year: 2024,
    hsa: {
      personRole: 'PRIMARY',
      totalContributions: 4150, // Family coverage max for 2024
      employerContributions: 1000,
    },
  })

  // Step 10: Generate federal PDF
  const federalPdf = await mcp.ustaxes_generate_federal_pdf({
    year: 2024,
    outputPath: '/tmp/complex-federal-return.pdf',
  })

  console.log('=== Tax Summary ===')
  console.log(`Total Income: $${(120000 + 95000 + 1200 + (24000 - 16200)).toLocaleString()}`)
  console.log(`Federal PDF: ${federalPdf.data.fileSize / 1024} KB`)

  // Step 11: Generate MA state return
  await mcp.ustaxes_add_state_residency({
    year: 2024,
    state: 'MA',
  })

  const statePdf = await mcp.ustaxes_generate_state_pdf({
    year: 2024,
    state: 'MA',
    outputPath: '/tmp/complex-ma-state-return.pdf',
  })

  console.log(`State PDF: ${statePdf.data.fileSize / 1024} KB`)
}

/**
 * Example 3: Self-Employed with Itemized Deductions
 *
 * This example shows:
 * - Self-employment income via 1099-NEC
 * - Itemized deductions
 * - IRA contributions
 */
export async function selfEmployedReturn() {
  await mcp.ustaxes_set_filing_status({
    year: 2024,
    status: FilingStatus.S,
  })

  await mcp.ustaxes_add_primary_person({
    year: 2024,
    person: {
      firstName: 'Sarah',
      lastName: 'Contractor',
      ssid: '555-66-7777',
      role: 'PRIMARY',
      address: {
        address: '321 Freelance Ln',
        city: 'Boston',
        state: 'MA',
        zip: '02115',
      },
    },
  })

  // Add self-employment income
  await mcp.ustaxes_add_1099({
    year: 2024,
    form1099: {
      form: '1099-NEC',
      payer: 'Client Corp',
      payerTin: '88-8888888',
      personRole: 'PRIMARY',
      income: 85000,
      nonEmployeeCompensation: 85000,
    },
  })

  // Add itemized deductions
  await mcp.ustaxes_set_itemized_deductions({
    year: 2024,
    deductions: {
      medicalAndDental: 8000,
      stateAndLocalTaxes: 10000, // SALT cap is $10,000
      mortgageInterest: 12000,
      charitableCash: 5000,
    },
  })

  // Add IRA contribution
  await mcp.ustaxes_add_ira({
    year: 2024,
    ira: {
      personRole: 'PRIMARY',
      contributionType: 'traditional',
      contribution: 7000, // 2024 limit for age < 50
    },
  })

  const federalPdf = await mcp.ustaxes_generate_federal_pdf({
    year: 2024,
    outputPath: '/tmp/selfemployed-return.pdf',
  })

  console.log(`Self-employed return generated: ${federalPdf.data.fileSize / 1024} KB`)
}

/**
 * Example 4: Testing and Validation Workflow
 *
 * This example shows how to use the MCP server for testing
 * and validation purposes.
 */
export async function testingWorkflow() {
  // Create a test return
  await simpleW2Return()

  // Export state for analysis
  const exportedState = await mcp.ustaxes_export_state({
    year: 2024,
    outputPath: '/tmp/tax-return-state.json',
  })

  console.log('State exported for review')

  // Clear and reimport
  await mcp.ustaxes_clear_year({
    year: 2024,
  })

  await mcp.ustaxes_import_state({
    year: 2024,
    statePath: '/tmp/tax-return-state.json',
  })

  console.log('State reimported successfully')

  // Regenerate PDFs to verify
  const federalPdf = await mcp.ustaxes_generate_federal_pdf({
    year: 2024,
    outputPath: '/tmp/verified-federal.pdf',
  })

  console.log('Verification complete')
}

/**
 * Usage Notes:
 *
 * 1. The MCP server maintains state in memory, so you must complete
 *    a return in a single session or use export/import for persistence.
 *
 * 2. All tools validate input using the UsTaxes schema validators,
 *    so invalid data will be rejected with clear error messages.
 *
 * 3. PDF generation uses pdf-lib to fill official IRS forms, ensuring
 *    compatibility with e-filing systems.
 *
 * 4. State returns currently support MA (Massachusetts) with more
 *    states planned for future releases.
 *
 * 5. For production use, always review generated PDFs and consider
 *    consulting a tax professional for complex situations.
 */
