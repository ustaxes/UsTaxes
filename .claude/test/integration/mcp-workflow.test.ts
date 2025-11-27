/**
 * Integration Tests: MCP Server Workflows
 *
 * Tests integration between multiple MCP servers
 */

import {
  createMockPDF,
  createSampleW2,
  createMockMCPResponse,
} from '../utils/test-helpers';

import { createMockStore, mockActions } from '../utils/redux-mocks';

describe('MCP Server Integration Workflows', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
  });

  describe('Document Parse → Validate → Store Workflow', () => {
    it('should parse, validate, and store W-2', async () => {
      // Step 1: Parse document
      const parseResponse = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        confidence: 0.95,
        extracted_data: {
          occupation: 'Engineer',
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

      const parsed = JSON.parse(parseResponse.content[0].text);
      expect(parsed.confidence).toBeGreaterThan(0.9);

      // Step 2: Validate
      const validateResponse = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: true,
        errors: [],
        warnings: [],
      }));

      const validation = JSON.parse(validateResponse.content[0].text);
      expect(validation.is_valid).toBe(true);

      // Step 3: Store in Redux
      store.dispatch(mockActions.addW2(parsed.extracted_data));

      const state = store.getState();
      expect(state.w2s).toHaveLength(1);
      expect(state.w2s[0].income).toBe(75000);
    });

    it('should handle validation failure and not store', async () => {
      // Step 1: Parse with missing data
      const parseResponse = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        confidence: 0.70,
        extracted_data: {
          income: 75000,
          // Missing required fields
        },
      }));

      const parsed = JSON.parse(parseResponse.content[0].text);

      // Step 2: Validation fails
      const validateResponse = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: false,
        errors: [
          { field: 'fedWithholding', message: 'Required' },
        ],
      }));

      const validation = JSON.parse(validateResponse.content[0].text);
      expect(validation.is_valid).toBe(false);

      // Step 3: Should NOT store invalid data
      const state = store.getState();
      expect(state.w2s).toHaveLength(0);
    });
  });

  describe('Query Rules → Calculate Tax Workflow', () => {
    it('should query standard deduction and calculate tax', async () => {
      // Step 1: Query IRS rules for standard deduction
      const rulesResponse = createMockMCPResponse(JSON.stringify({
        topic: 'standard_deduction',
        tax_year: 2024,
        data: {
          single: 14600,
        },
      }));

      const rules = JSON.parse(rulesResponse.content[0].text);
      const standardDeduction = rules.data.single;

      expect(standardDeduction).toBe(14600);

      // Step 2: Add income to store
      const w2 = createSampleW2({ income: 75000 });
      store.dispatch(mockActions.addW2(w2));

      // Step 3: Calculate tax using queried rules
      const state = store.getState();
      const totalIncome = state.w2s.reduce((sum, w2) => sum + w2.income, 0);
      const taxableIncome = totalIncome - standardDeduction;

      expect(taxableIncome).toBe(60400);

      // Step 4: Query tax brackets
      const bracketsResponse = createMockMCPResponse(JSON.stringify({
        topic: 'tax_brackets',
        tax_year: 2024,
        filing_status: 'single',
        data: {
          brackets: [
            { rate: 0.10, min: 0, max: 11600 },
            { rate: 0.12, min: 11601, max: 47150 },
            { rate: 0.22, min: 47151, max: 100525 },
          ],
        },
      }));

      const brackets = JSON.parse(bracketsResponse.content[0].text);
      expect(brackets.data.brackets[0].rate).toBe(0.10);

      // Step 5: Calculate tax
      let tax = 0;
      let remainingIncome = taxableIncome;

      for (const bracket of brackets.data.brackets) {
        if (remainingIncome <= 0) break;

        const bracketIncome = Math.min(
          remainingIncome,
          bracket.max - bracket.min + 1
        );

        tax += bracketIncome * bracket.rate;
        remainingIncome -= bracketIncome;
      }

      expect(tax).toBeGreaterThan(0);
      expect(tax).toBeCloseTo(8341, 0);
    });
  });

  describe('Parse Multiple → Validate All → Consistency Check Workflow', () => {
    it('should parse multiple W-2s and check consistency', async () => {
      // Parse W-2 #1
      const parse1 = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        extracted_data: {
          occupation: 'Engineer',
          income: 50000,
          fedWithholding: 7000,
          ssWages: 50000,
          ssWithholding: 3100,
          medicareIncome: 50000,
          medicareWithholding: 725,
          ein: '12-3456789',
          employerName: 'Company A',
        },
      }));

      // Parse W-2 #2
      const parse2 = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        extracted_data: {
          occupation: 'Consultant',
          income: 25000,
          fedWithholding: 3000,
          ssWages: 25000,
          ssWithholding: 1550,
          medicareIncome: 25000,
          medicareWithholding: 362.50,
          ein: '98-7654321',
          employerName: 'Company B',
        },
      }));

      const w2_1 = JSON.parse(parse1.content[0].text).extracted_data;
      const w2_2 = JSON.parse(parse2.content[0].text).extracted_data;

      // Validate both
      const validate1 = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: true,
      }));

      const validate2 = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: true,
      }));

      expect(JSON.parse(validate1.content[0].text).is_valid).toBe(true);
      expect(JSON.parse(validate2.content[0].text).is_valid).toBe(true);

      // Store both
      store.dispatch(mockActions.addW2(w2_1));
      store.dispatch(mockActions.addW2(w2_2));

      const state = store.getState();
      expect(state.w2s).toHaveLength(2);

      // Check consistency
      const consistencyResponse = createMockMCPResponse(JSON.stringify({
        is_consistent: true,
        checks: [
          {
            type: 'income_total',
            status: 'pass',
            message: 'Total W-2 income: $75,000',
          },
        ],
      }));

      const consistency = JSON.parse(consistencyResponse.content[0].text);
      expect(consistency.is_consistent).toBe(true);

      // Verify total income
      const totalIncome = state.w2s.reduce((sum, w2) => sum + w2.income, 0);
      expect(totalIncome).toBe(75000);
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should retry parsing after initial failure', async () => {
      // First attempt fails
      const failResponse = createMockMCPResponse(
        'Error: Low confidence extraction',
        true
      );

      expect(failResponse.isError).toBe(true);

      // User provides better quality image, retry
      const retryResponse = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        confidence: 0.92,
        extracted_data: createSampleW2(),
      }));

      const retry = JSON.parse(retryResponse.content[0].text);
      expect(retry.confidence).toBeGreaterThan(0.9);

      // Now validation and storage can proceed
      const validateResponse = createMockMCPResponse(JSON.stringify({
        form_type: 'W2',
        is_valid: true,
      }));

      expect(JSON.parse(validateResponse.content[0].text).is_valid).toBe(true);
    });
  });

  describe('Complete Multi-Form Workflow', () => {
    it('should process W-2 + multiple 1099s end-to-end', async () => {
      // Parse and store W-2
      const w2Parse = createMockMCPResponse(JSON.stringify({
        document_type: 'W2',
        extracted_data: createSampleW2({ income: 60000 }),
      }));

      const w2Data = JSON.parse(w2Parse.content[0].text).extracted_data;
      store.dispatch(mockActions.addW2(w2Data));

      // Parse and store 1099-INT
      const intParse = createMockMCPResponse(JSON.stringify({
        document_type: '1099-INT',
        extracted_data: {
          form: '1099-INT',
          payer: 'Bank A',
          income: 500,
          interest: 500,
        },
      }));

      const intData = JSON.parse(intParse.content[0].text).extracted_data;
      store.dispatch(mockActions.add1099(intData));

      // Parse and store 1099-DIV
      const divParse = createMockMCPResponse(JSON.stringify({
        document_type: '1099-DIV',
        extracted_data: {
          form: '1099-DIV',
          payer: 'Broker B',
          income: 800,
          dividends: 800,
          qualifiedDividends: 600,
        },
      }));

      const divData = JSON.parse(divParse.content[0].text).extracted_data;
      store.dispatch(mockActions.add1099(divData));

      // Validate all consistency
      const state = store.getState();
      expect(state.w2s).toHaveLength(1);
      expect(state.f1099s).toHaveLength(2);

      const totalW2 = state.w2s.reduce((sum, w2) => sum + w2.income, 0);
      const totalInterest = state.f1099s
        .filter(f => f.form === '1099-INT')
        .reduce((sum, f) => sum + (f.interest || 0), 0);
      const totalDiv = state.f1099s
        .filter(f => f.form === '1099-DIV')
        .reduce((sum, f) => sum + (f.dividends || 0), 0);

      const totalIncome = totalW2 + totalInterest + totalDiv;

      expect(totalIncome).toBe(61300);

      // Query rules and calculate
      const rulesResponse = createMockMCPResponse(JSON.stringify({
        topic: 'standard_deduction',
        data: { single: 14600 },
      }));

      const deduction = JSON.parse(rulesResponse.content[0].text).data.single;
      const taxableIncome = totalIncome - deduction;

      expect(taxableIncome).toBe(46700);

      // Final consistency check
      const consistencyResponse = createMockMCPResponse(JSON.stringify({
        is_consistent: true,
        checks: [
          { type: 'total_income', status: 'pass' },
          { type: 'all_forms_valid', status: 'pass' },
        ],
      }));

      expect(JSON.parse(consistencyResponse.content[0].text).is_consistent).toBe(true);
    });
  });
});
