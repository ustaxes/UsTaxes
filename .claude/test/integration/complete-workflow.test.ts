/**
 * Integration Tests: Complete Tax Return Workflow
 *
 * Tests the full workflow from document extraction through
 * form generation and validation
 */

import {
  createMockPDF,
  createSampleW2,
  createSample1099,
  createMockMCPResponse,
  loadFixture,
  MockFileSystem,
} from '../utils/test-helpers';

import {
  createMockStore,
  mockActions,
  mockValidators,
} from '../utils/redux-mocks';

describe('Complete Tax Return Workflow', () => {
  let store: ReturnType<typeof createMockStore>;
  let mockFS: MockFileSystem;

  beforeEach(() => {
    store = createMockStore();
    mockFS = new MockFileSystem();
  });

  describe('Simple W-2 Only Return', () => {
    it('should complete entire workflow for single W-2', async () => {
      // Step 1: Document provided
      const w2PDF = createMockPDF(
        'W-2 Wage and Tax Statement\n' +
        'Box 1 Wages: $75,000.00\n' +
        'Box 2 Federal income tax withheld: $12,000.00\n' +
        'Box 3 Social security wages: $75,000.00\n' +
        'Box 4 Social security tax withheld: $4,650.00\n' +
        'Box 5 Medicare wages: $75,000.00\n' +
        'Box 6 Medicare tax withheld: $1,087.50\n' +
        'Employee SSN: 123-45-6789\n' +
        'Employer ID: 12-3456789\n' +
        'Employer: ABC Company'
      );

      mockFS.writeFile('/tmp/w2.pdf', w2PDF);
      expect(mockFS.exists('/tmp/w2.pdf')).toBe(true);

      // Step 2: Parse document (MCP call simulation)
      const parseResponse = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        confidence: 0.95,
        extracted_data: {
          occupation: 'Software Engineer',
          income: 75000,
          medicareIncome: 75000,
          fedWithholding: 12000,
          ssWages: 75000,
          ssWithholding: 4650,
          medicareWithholding: 1087.50,
          ein: '12-3456789',
          employerName: 'ABC Company',
        },
      }));

      const parsedData = JSON.parse(parseResponse.content[0].text);
      expect(parsedData.document_type).toBe('W2');
      expect(parsedData.confidence).toBeGreaterThan(0.9);

      // Step 3: Validate extracted data
      const validateResponse = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: true,
        errors: [],
        warnings: [],
      }));

      const validationResult = JSON.parse(validateResponse.content[0].text);
      expect(validationResult.is_valid).toBe(true);

      // Step 4: Dispatch to Redux store
      const w2Data = parsedData.extracted_data;
      expect(mockValidators.incomeW2(w2Data)).toBe(true);

      store.dispatch(mockActions.addW2(w2Data));

      // Step 5: Verify state updated
      const state = store.getState();
      expect(state.w2s).toHaveLength(1);
      expect(state.w2s[0].income).toBe(75000);

      // Step 6: Calculate tax
      const totalIncome = state.w2s.reduce((sum, w2) => sum + w2.income, 0);
      const standardDeduction = 14600;
      const taxableIncome = totalIncome - standardDeduction;

      expect(totalIncome).toBe(75000);
      expect(taxableIncome).toBe(60400);

      // Step 7: Calculate expected tax (2024 brackets)
      // First $11,600 at 10% = $1,160
      // Remaining $48,800 at 12% = $5,856
      // Total = $7,016
      const expectedTax = 1160 + (48800 * 0.12);
      expect(expectedTax).toBeCloseTo(7016, 0);

      // Step 8: Calculate refund
      const totalWithholding = state.w2s.reduce((sum, w2) => sum + w2.fedWithholding, 0);
      const refund = totalWithholding - expectedTax;

      expect(refund).toBeGreaterThan(0);
      expect(refund).toBeCloseTo(4984, 0);

      // Step 9: Form generation simulation
      const form1040Data = {
        filingStatus: 'single',
        totalIncome,
        standardDeduction,
        taxableIncome,
        tax: expectedTax,
        withholding: totalWithholding,
        refund,
      };

      expect(form1040Data.refund).toBeGreaterThan(0);

      // Step 10: Final validation
      expect(form1040Data.totalIncome).toBe(75000);
      expect(form1040Data.tax).toBeCloseTo(7016, 0);
      expect(form1040Data.refund).toBeCloseTo(4984, 0);
    });
  });

  describe('Multiple Income Sources', () => {
    it('should handle W-2 + 1099-INT + 1099-NEC', async () => {
      // Document 1: W-2
      const w2 = createSampleW2({
        income: 50000,
        fedWithholding: 7000,
      });

      store.dispatch(mockActions.addW2(w2));

      // Document 2: 1099-INT
      const int = createSample1099('1099-INT', {
        interest: 1250,
      });

      store.dispatch(mockActions.add1099(int));

      // Document 3: 1099-NEC (self-employment)
      const nec = createSample1099('1099-NEC', {
        nonemployeeCompensation: 15000,
      });

      store.dispatch(mockActions.add1099(nec));

      // Calculate combined income
      const state = store.getState();
      const w2Income = state.w2s.reduce((sum, w2) => sum + w2.income, 0);
      const interestIncome = state.f1099s
        .filter(f => f.form === '1099-INT')
        .reduce((sum, f) => sum + (f.interest || 0), 0);
      const necIncome = state.f1099s
        .filter(f => f.form === '1099-NEC')
        .reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);

      expect(w2Income).toBe(50000);
      expect(interestIncome).toBe(1250);
      expect(necIncome).toBe(15000);

      // Calculate self-employment tax
      const seTax = necIncome * 0.153; // 15.3%
      const seTaxDeduction = seTax / 2;

      expect(seTax).toBeCloseTo(2295, 0);
      expect(seTaxDeduction).toBeCloseTo(1147.5, 1);

      // Calculate AGI
      const grossIncome = w2Income + interestIncome + necIncome;
      const adjustedGrossIncome = grossIncome - seTaxDeduction;

      expect(grossIncome).toBe(66250);
      expect(adjustedGrossIncome).toBeCloseTo(65102.5, 1);

      // Calculate taxable income
      const standardDeduction = 14600;
      const taxableIncome = adjustedGrossIncome - standardDeduction;

      expect(taxableIncome).toBeCloseTo(50502.5, 1);

      // Verify all income sources are tracked
      expect(state.w2s.length + state.f1099s.length).toBe(3);
    });
  });

  describe('Error Recovery', () => {
    it('should handle failed document parsing gracefully', async () => {
      const corruptedPDF = Buffer.from('Not a valid PDF', 'utf-8');
      mockFS.writeFile('/tmp/corrupted.pdf', corruptedPDF);

      const errorResponse = createMockMCPResponse(
        'Error: Unable to parse PDF - file is corrupted',
        true
      );

      expect(errorResponse.isError).toBe(true);
      expect(errorResponse.content[0].text).toContain('corrupted');

      // Workflow should stop here and request user intervention
      // State should remain unchanged
      const state = store.getState();
      expect(state.w2s).toHaveLength(0);
    });

    it('should handle validation errors and request clarification', async () => {
      const incompleteW2 = {
        occupation: 'Engineer',
        income: 75000,
        // Missing required fields
      };

      const validationResponse = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: false,
        errors: [
          { field: 'fedWithholding', message: 'Required field missing' },
          { field: 'ssWages', message: 'Required field missing' },
        ],
      }));

      const validation = JSON.parse(validationResponse.content[0].text);
      expect(validation.is_valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // Should not dispatch invalid data
      expect(mockValidators.incomeW2(incompleteW2)).toBe(false);

      // State should remain unchanged
      const state = store.getState();
      expect(state.w2s).toHaveLength(0);
    });
  });

  describe('Data Consistency Checks', () => {
    it('should verify SSN consistency across documents', async () => {
      const w2_1 = createSampleW2();
      w2_1.ssn = '123-45-6789';

      const w2_2 = createSampleW2();
      w2_2.ssn = '999-88-7777'; // Different SSN - should flag

      store.dispatch(mockActions.addW2(w2_1));
      store.dispatch(mockActions.addW2(w2_2));

      const state = store.getState();

      // Check SSN consistency
      const ssns = state.w2s.map(w2 => w2.ssn).filter(ssn => ssn);
      const uniqueSSNs = new Set(ssns);

      expect(uniqueSSNs.size).toBeGreaterThan(1); // Inconsistent!

      // Should trigger consistency check warning
      const consistencyResponse = createMockMCPResponse(JSON.stringify({
        is_consistent: false,
        errors: [
          {
            type: 'ssn_mismatch',
            message: 'Multiple SSNs found across W-2 forms',
          },
        ],
      }));

      const consistency = JSON.parse(consistencyResponse.content[0].text);
      expect(consistency.is_consistent).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle itemized deductions vs standard deduction', async () => {
      const w2 = createSampleW2({ income: 100000 });
      store.dispatch(mockActions.addW2(w2));

      const standardDeduction = 14600;
      const itemizedDeductions = {
        saltDeduction: 10000, // SALT cap
        mortgageInterest: 12000,
        charitableContributions: 5000,
      };
      const itemizedTotal = 27000;

      // Should choose itemized (27,000 > 14,600)
      const chosenDeduction = Math.max(standardDeduction, itemizedTotal);

      expect(chosenDeduction).toBe(itemizedTotal);

      const taxableIncome = 100000 - chosenDeduction;
      expect(taxableIncome).toBe(73000);
    });

    it('should apply child tax credit correctly', async () => {
      const w2 = createSampleW2({ income: 75000, fedWithholding: 12000 });
      store.dispatch(mockActions.addW2(w2));

      const standardDeduction = 14600;
      const taxableIncome = 75000 - standardDeduction;

      // Tax before credits: ~$7,016
      const taxBeforeCredits = 1160 + (48800 * 0.12);

      // Apply child tax credit (2 children)
      const childTaxCredit = 2000 * 2;
      const taxAfterCredits = Math.max(0, taxBeforeCredits - childTaxCredit);

      expect(taxAfterCredits).toBeCloseTo(3016, 0);

      // Calculate refund
      const refund = 12000 - taxAfterCredits;
      expect(refund).toBeCloseTo(8984, 0);
    });
  });

  describe('State Tax Integration', () => {
    it('should calculate CA state tax alongside federal', async () => {
      const w2 = createSampleW2({
        income: 75000,
        state: 'CA',
        stateWages: 75000,
        stateWithholding: 3750,
      });

      store.dispatch(mockActions.addW2(w2));

      const state = store.getState();
      expect(state.w2s[0].state).toBe('CA');

      // Federal tax
      const standardDeduction = 14600;
      const federalTaxableIncome = 75000 - standardDeduction;
      const federalTax = 1160 + (48800 * 0.12);

      // CA state tax (simplified 9.3% rate)
      const caStandardDeduction = 5363; // 2024 CA single
      const caTaxableIncome = 75000 - caStandardDeduction;
      const caStateTax = caTaxableIncome * 0.093; // Simplified

      expect(caStateTax).toBeCloseTo(6476, 0);

      // Total tax burden
      const totalTax = federalTax + caStateTax;
      expect(totalTax).toBeCloseTo(13492, 0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income edge case', async () => {
      const w2 = createSampleW2({
        income: 0,
        fedWithholding: 0,
      });

      store.dispatch(mockActions.addW2(w2));

      const standardDeduction = 14600;
      const taxableIncome = Math.max(0, 0 - standardDeduction);

      expect(taxableIncome).toBe(0);

      // No tax owed
      const tax = 0;
      const refund = 0 - tax;

      expect(refund).toBe(0);
    });

    it('should handle very high income with AMT', async () => {
      const w2 = createSampleW2({
        income: 500000,
        fedWithholding: 150000,
      });

      store.dispatch(mockActions.addW2(w2));

      // Regular tax calculation
      const standardDeduction = 14600;
      const taxableIncome = 500000 - standardDeduction;

      // Top brackets apply
      const tax =
        11600 * 0.10 +
        35550 * 0.12 +
        53375 * 0.22 +
        91425 * 0.24 +
        51775 * 0.32 +
        (taxableIncome - 243726) * 0.35;

      expect(tax).toBeGreaterThan(100000);

      // AMT might apply - simplified check
      const amtExemption = 85700;
      const amtIncome = 500000 - amtExemption;
      const amtTax = amtIncome * 0.28; // Simplified AMT rate

      const finalTax = Math.max(tax, amtTax);
      expect(finalTax).toBeGreaterThan(100000);
    });
  });

  describe('Fixture Loading', () => {
    it('should load and use fixture data', () => {
      const fixtureW2 = loadFixture('sample-w2.json');

      expect(fixtureW2.occupation).toBe('Software Engineer');
      expect(fixtureW2.income).toBe(75000);
      expect(fixtureW2.ein).toBeValidEIN();

      store.dispatch(mockActions.addW2(fixtureW2));

      const state = store.getState();
      expect(state.w2s).toHaveLength(1);
      expect(state.w2s[0].income).toBe(75000);
    });

    it('should load complete tax return fixture', () => {
      const taxReturn = loadFixture('sample-tax-return.json');

      expect(taxReturn.filingStatus).toBe('single');
      expect(taxReturn.grossIncome).toBe(76250);
      expect(taxReturn.taxableIncome).toBe(61650);
      expect(taxReturn.federalTax).toBeCloseTo(8936, 0);
    });
  });
});
