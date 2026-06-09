/**
 * Integration test: Complete 2024 tax return for Benjamin & Laura Sack
 * Tests the full workflow from data entry to PDF generation
 */

import { personalTools } from '../../src/tools/personal'
import { incomeTools } from '../../src/tools/income'
import { pdfTools } from '../../src/tools/pdf'
import { stateManager } from '../../src/state'
import { FilingStatus } from 'ustaxes/core/data'
import * as fs from 'fs'
import * as path from 'path'

describe('Integration Test: Sack Family 2024 Tax Return', () => {
  const testOutputDir = '/tmp/ustaxes-mcp-test-output'

  beforeAll(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true })
    }
  })

  beforeEach(() => {
    // Reset state before each test
    stateManager.resetYear(2024)
  })

  it('should complete full tax return workflow', async () => {
    // Step 1: Set filing status
    const filingStatusResult =
      await personalTools.ustaxes_set_filing_status.handler({
        year: 2024,
        status: FilingStatus.MFJ
      })

    expect(filingStatusResult.success).toBe(true)

    // Step 2: Add primary taxpayer (Benjamin)
    const primaryResult =
      await personalTools.ustaxes_add_primary_person.handler({
        year: 2024,
        firstName: 'Benjamin',
        lastName: 'Sack',
        ssn: '123-45-6789', // Placeholder
        dateOfBirth: '1989-01-01',
        address: {
          address: '120 Reedy Meadow Rd',
          city: 'Groton',
          state: 'MA',
          zip: '01450'
        }
      })

    expect(primaryResult.success).toBe(true)

    // Step 3: Add spouse (Laura)
    const spouseResult = await personalTools.ustaxes_add_spouse.handler({
      year: 2024,
      firstName: 'Laura',
      lastName: 'Sack',
      ssn: '987-65-4321', // Placeholder
      dateOfBirth: '1990-01-01'
    })

    expect(spouseResult.success).toBe(true)

    // Step 4: Add Benjamin's W-2 (Fulgent Genetics)
    const benjaminW2Result = await incomeTools.ustaxes_add_w2.handler({
      year: 2024,
      employer: {
        name: 'Fulgent Genetics',
        EIN: '12-3456789', // Placeholder
        address: {
          address: '4399 Santa Anita Ave',
          city: 'El Monte',
          state: 'CA',
          zip: '91731'
        }
      },
      occupation: 'Bioinformatics Scientist',
      wages: 99152.88,
      federalWithholding: 6898.0,
      socialSecurityWages: 99152.88,
      socialSecurityWithholding: 5510.3,
      medicareWages: 99152.88,
      medicareWithholding: 1437.72,
      stateWages: 99152.88,
      stateWithholding: 6898.0,
      state: 'MA',
      personRole: 'PRIMARY'
    })

    expect(benjaminW2Result.success).toBe(true)

    // Step 5: Add Laura's W-2 (GeneDx)
    const lauraW2Result = await incomeTools.ustaxes_add_w2.handler({
      year: 2024,
      employer: {
        name: 'GeneDx',
        EIN: '98-7654321', // Placeholder
        address: {
          address: '333 Ludlow St',
          city: 'Stamford',
          state: 'CT',
          zip: '06902'
        }
      },
      occupation: 'Genetic Counselor',
      wages: 229134.12, // Federal AGI - Benjamin's wages
      federalWithholding: 20000.0, // Estimated
      socialSecurityWages: 229134.12,
      socialSecurityWithholding: 14206.32,
      medicareWages: 229134.12,
      medicareWithholding: 3322.45,
      stateWages: 229134.12,
      stateWithholding: 2038.97,
      state: 'MA',
      personRole: 'SPOUSE'
    })

    expect(lauraW2Result.success).toBe(true)

    // Step 6: Verify state data
    const yearState = stateManager.getYearState(2024)

    expect(yearState.taxPayer.filingStatus).toBe('MFJ')
    expect(yearState.taxPayer.primaryPerson?.firstName).toBe('Benjamin')
    expect(yearState.taxPayer.spouse?.firstName).toBe('Laura')
    expect(yearState.w2s).toHaveLength(2)

    // Calculate totals
    const totalWages = yearState.w2s.reduce(
      (sum: number, w2) => sum + w2.income,
      0
    )
    const totalFederalWithholding = yearState.w2s.reduce(
      (sum: number, w2) => sum + w2.fedWithholding,
      0
    )
    const totalMAWithholding = yearState.w2s.reduce(
      (sum: number, w2) => sum + (w2.stateWithholding || 0),
      0
    )

    expect(totalWages).toBeCloseTo(328287.0, 2) // Federal AGI
    expect(totalMAWithholding).toBeCloseTo(8936.97, 2) // Total MA withholding

    console.log('\n=== Tax Summary ===')
    console.log(`Total W-2 Wages: $${totalWages.toLocaleString()}`)
    console.log(
      `Total Federal Withholding: $${totalFederalWithholding.toLocaleString()}`
    )
    console.log(`Total MA Withholding: $${totalMAWithholding.toLocaleString()}`)

    // Expected MA calculation:
    // Federal AGI: $328,287
    // MA Personal Exemption (MFJ): -$8,800
    // MA Taxable Income: $319,487
    // MA Tax (5%): $15,974.35
    // MA Withholding: -$8,936.97
    // Amount Due: $7,037.38

    const expectedMATaxableIncome = totalWages - 8800 // MFJ exemption
    const expectedMATax = expectedMATaxableIncome * 0.05
    const expectedAmountDue = expectedMATax - totalMAWithholding

    console.log(
      `\nExpected MA Taxable Income: $${expectedMATaxableIncome.toLocaleString()}`
    )
    console.log(`Expected MA Tax (5%): $${expectedMATax.toLocaleString()}`)
    console.log(`Expected Amount Due: $${expectedAmountDue.toLocaleString()}`)

    expect(expectedMATaxableIncome).toBeCloseTo(319487, 0)
    expect(expectedMATax).toBeCloseTo(15974.35, 2)
    expect(expectedAmountDue).toBeCloseTo(7037.38, 2)
  })

  it('should generate federal PDF', async () => {
    // Set up basic return
    await personalTools.ustaxes_set_filing_status.handler({
      year: 2024,
      status: FilingStatus.MFJ
    })
    await personalTools.ustaxes_add_primary_person.handler({
      year: 2024,
      firstName: 'Benjamin',
      lastName: 'Sack',
      ssn: '123-45-6789',
      dateOfBirth: '1989-01-01',
      address: {
        address: '120 Reedy Meadow Rd',
        city: 'Groton',
        state: 'MA',
        zip: '01450'
      }
    })

    await incomeTools.ustaxes_add_w2.handler({
      year: 2024,
      employer: {
        name: 'Test Corp',
        EIN: '12-3456789',
        address: {
          address: '123 St',
          city: 'Boston',
          state: 'MA',
          zip: '02101'
        }
      },
      wages: 100000,
      federalWithholding: 15000,
      socialSecurityWages: 100000,
      socialSecurityWithholding: 6200,
      medicareWages: 100000,
      medicareWithholding: 1450,
      stateWages: 100000,
      stateWithholding: 5000,
      personRole: 'PRIMARY'
    })

    // Generate PDF
    const pdfResult = await pdfTools.ustaxes_generate_federal_pdf.handler({
      year: 2024,
      outputPath: path.join(testOutputDir, 'federal-1040-2024.pdf')
    })

    if (!pdfResult.success) {
      console.log('\n=== Federal PDF Generation Error ===')
      console.log('Error:', pdfResult.error)
      console.log('Details:', pdfResult.details)
    }

    expect(pdfResult.success).toBe(true)
    if (pdfResult.success) {
      const data = pdfResult.data as any
      expect(data.outputPath).toBe(
        path.join(testOutputDir, 'federal-1040-2024.pdf')
      )
      expect(fs.existsSync(data.outputPath)).toBe(true)

      // Check file size
      const stats = fs.statSync(data.outputPath)
      expect(stats.size).toBeGreaterThan(1000) // At least 1KB
      console.log(`\nFederal PDF generated: ${data.sizeKB} KB`)
    }
  }, 30000) // 30 second timeout for PDF generation

  it('should generate state PDF', async () => {
    // Set up basic return with MA (Massachusetts)
    await personalTools.ustaxes_set_filing_status.handler({
      year: 2024,
      status: FilingStatus.MFJ
    })
    await personalTools.ustaxes_add_primary_person.handler({
      year: 2024,
      firstName: 'Benjamin',
      lastName: 'Sack',
      ssn: '123-45-6789',
      dateOfBirth: '1989-01-01',
      address: {
        address: '120 Reedy Meadow Rd',
        city: 'Groton',
        state: 'MA',
        zip: '01450'
      }
    })

    // Add MA state residency (required for state return)
    stateManager.addStateResidency(2024, 'MA')

    await incomeTools.ustaxes_add_w2.handler({
      year: 2024,
      employer: {
        name: 'Test Corp',
        EIN: '12-3456789',
        address: {
          address: '123 St',
          city: 'Boston',
          state: 'MA',
          zip: '02101'
        }
      },
      wages: 100000,
      federalWithholding: 15000,
      socialSecurityWages: 100000,
      socialSecurityWithholding: 6200,
      medicareWages: 100000,
      medicareWithholding: 1450,
      stateWages: 100000,
      stateWithholding: 5000,
      state: 'MA',
      personRole: 'PRIMARY'
    })

    // Generate state PDF
    const pdfResult = await pdfTools.ustaxes_generate_state_pdf.handler({
      year: 2024,
      state: 'MA',
      outputPath: path.join(testOutputDir, 'state-MA-2024.pdf')
    })

    if (!pdfResult.success) {
      console.log('\n=== State PDF Generation Error ===')
      console.log('Error:', pdfResult.error)
      console.log('Details:', pdfResult.details)
    }

    expect(pdfResult.success).toBe(true)
    if (pdfResult.success) {
      const data = pdfResult.data as any
      expect(data.outputPath).toBe(
        path.join(testOutputDir, 'state-MA-2024.pdf')
      )
      expect(fs.existsSync(data.outputPath)).toBe(true)

      // Check file size
      const stats = fs.statSync(data.outputPath)
      expect(stats.size).toBeGreaterThan(1000) // At least 1KB
      console.log(`\nState PDF generated: ${data.sizeKB} KB`)
      console.log(`State: ${data.state}`)
      console.log(`Forms included: ${data.formsIncluded.join(', ')}`)
    }
  }, 30000) // 30 second timeout for PDF generation
})
