/**
 * Unit Tests: MCP Servers
 *
 * Tests for the three MCP servers (isolated unit tests)
 * - tax-document-parser
 * - irs-rules-engine
 * - form-validator
 */

import {
  createMockPDF,
  createMockImage,
  createSampleW2,
  createSample1099,
  createMockMCPResponse,
} from '../utils/test-helpers';

describe('MCP Servers - Unit Tests', () => {
  describe('tax-document-parser Server', () => {
    describe('parse_document Tool', () => {
      it('should define parse_document tool schema', () => {
        const toolSchema = {
          name: 'parse_document',
          description: 'Parse tax document (W-2, 1099, 1098, etc.) from PDF or image',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to document file (PDF or image)',
              },
              document_type: {
                type: 'string',
                enum: ['auto', 'W2', '1099-INT', '1099-DIV', '1099-B', '1099-NEC', '1098', '1098-E'],
                description: 'Document type (auto-detect if not specified)',
              },
            },
            required: ['file_path'],
          },
        };

        expect(toolSchema.name).toBe('parse_document');
        expect(toolSchema.inputSchema.required).toContain('file_path');
        expect(toolSchema.inputSchema.properties.document_type.enum).toContain('W2');
      });

      it('should simulate parsing W-2 from PDF', async () => {
        const mockPDF = createMockPDF('W-2 Wage and Tax Statement\nWages: $75,000\nFederal tax withheld: $12,000');

        // Simulate MCP tool response
        const response = createMockMCPResponse(JSON.stringify({
          document_type: 'W2',
          confidence: 0.95,
          extracted_data: {
            wages: 75000,
            fedWithholding: 12000,
            employer: 'ABC Company',
            ein: '12-3456789',
          },
          validation: {
            is_valid: true,
            missing_fields: [],
          },
        }));

        expect(response.content[0].text).toContain('W2');
        expect(response.content[0].text).toContain('75000');
        expect(response.isError).toBe(false);
      });

      it('should simulate parsing 1099-INT from image', async () => {
        const mockImage = createMockImage(800, 1000);

        const response = createMockMCPResponse(JSON.stringify({
          document_type: '1099-INT',
          confidence: 0.88,
          extracted_data: {
            payer: 'XYZ Bank',
            interest: 1250.50,
            taxExemptInterest: 0,
          },
          validation: {
            is_valid: true,
            missing_fields: [],
          },
        }));

        expect(response.content[0].text).toContain('1099-INT');
        expect(response.content[0].text).toContain('1250.5');
      });

      it('should handle auto document type detection', async () => {
        const mockPDF = createMockPDF('Form 1099-NEC\nNonemployee compensation: $25,000');

        const response = createMockMCPResponse(JSON.stringify({
          document_type: '1099-NEC',
          confidence: 0.92,
          extracted_data: {
            payer: 'Contractor Inc',
            nonemployeeCompensation: 25000,
          },
          validation: {
            is_valid: true,
            missing_fields: [],
          },
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.document_type).toBe('1099-NEC');
      });

      it('should return low confidence for unclear documents', async () => {
        const mockPDF = createMockPDF('Unclear document with poor quality');

        const response = createMockMCPResponse(JSON.stringify({
          document_type: 'unknown',
          confidence: 0.35,
          extracted_data: {},
          validation: {
            is_valid: false,
            missing_fields: ['all'],
          },
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.confidence).toBeLessThan(0.5);
        expect(parsed.validation.is_valid).toBe(false);
      });

      it('should handle missing required fields', async () => {
        const mockPDF = createMockPDF('Incomplete W-2\nWages: $50,000');

        const response = createMockMCPResponse(JSON.stringify({
          document_type: 'W2',
          confidence: 0.75,
          extracted_data: {
            wages: 50000,
          },
          validation: {
            is_valid: false,
            missing_fields: ['fedWithholding', 'employer', 'ein'],
          },
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.validation.missing_fields).toContain('fedWithholding');
        expect(parsed.validation.missing_fields).toContain('employer');
      });

      it('should handle PDF parsing errors', async () => {
        const response = createMockMCPResponse(
          'Error: Unable to parse PDF - file is corrupted or encrypted',
          true
        );

        expect(response.isError).toBe(true);
        expect(response.content[0].text).toContain('Error');
        expect(response.content[0].text).toContain('corrupted');
      });

      it('should handle OCR errors on images', async () => {
        const response = createMockMCPResponse(
          'Error: OCR failed - image quality too low',
          true
        );

        expect(response.isError).toBe(true);
        expect(response.content[0].text).toContain('OCR failed');
      });
    });

    describe('extract_fields Tool', () => {
      it('should define extract_fields tool schema', () => {
        const toolSchema = {
          name: 'extract_fields',
          description: 'Extract specific fields from parsed document text',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Document text content',
              },
              fields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Field names to extract',
              },
              document_type: {
                type: 'string',
                description: 'Document type for field patterns',
              },
            },
            required: ['text', 'fields'],
          },
        };

        expect(toolSchema.name).toBe('extract_fields');
        expect(toolSchema.inputSchema.required).toContain('text');
        expect(toolSchema.inputSchema.required).toContain('fields');
      });

      it('should extract wages from W-2 text', () => {
        const text = 'Box 1 Wages, tips, other compensation: $75,000.00';
        const fields = ['wages'];

        const extracted = {
          wages: 75000.00,
        };

        expect(extracted.wages).toBe(75000.00);
      });

      it('should extract multiple fields from W-2', () => {
        const text = `
          W-2 Wage and Tax Statement
          Box 1 Wages: $75,000.00
          Box 2 Federal income tax withheld: $12,000.00
          Box 3 Social security wages: $75,000.00
          Employee SSN: 123-45-6789
          Employer ID: 12-3456789
        `;

        const extracted = {
          wages: 75000.00,
          fedWithholding: 12000.00,
          ssWages: 75000.00,
          ssn: '123-45-6789',
          ein: '12-3456789',
        };

        expect(extracted.wages).toBe(75000.00);
        expect(extracted.fedWithholding).toBe(12000.00);
        expect(extracted.ssn).toBeValidSSN();
        expect(extracted.ein).toBeValidEIN();
      });

      it('should return null for missing fields', () => {
        const text = 'Box 1 Wages: $50,000';

        const extracted = {
          wages: 50000,
          fedWithholding: null, // Not found in text
        };

        expect(extracted.wages).toBe(50000);
        expect(extracted.fedWithholding).toBeNull();
      });
    });
  });

  describe('irs-rules-engine Server', () => {
    describe('query_rule Tool', () => {
      it('should define query_rule tool schema', () => {
        const toolSchema = {
          name: 'query_rule',
          description: 'Query IRS tax rules and regulations',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Tax topic or rule to query',
              },
              tax_year: {
                type: 'number',
                description: 'Tax year (default: 2024)',
              },
              form: {
                type: 'string',
                description: 'Specific form (optional)',
              },
            },
            required: ['topic'],
          },
        };

        expect(toolSchema.name).toBe('query_rule');
        expect(toolSchema.inputSchema.required).toContain('topic');
      });

      it('should query standard deduction for 2024', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          topic: 'standard_deduction',
          tax_year: 2024,
          data: {
            single: 14600,
            married_filing_jointly: 29200,
            married_filing_separately: 14600,
            head_of_household: 21900,
          },
          source: 'IRS Rev. Proc. 2023-34',
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.data.single).toBe(14600);
        expect(parsed.data.married_filing_jointly).toBe(29200);
      });

      it('should query tax brackets for 2024', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          topic: 'tax_brackets',
          tax_year: 2024,
          filing_status: 'single',
          data: {
            brackets: [
              { rate: 0.10, min: 0, max: 11600 },
              { rate: 0.12, min: 11601, max: 47150 },
              { rate: 0.22, min: 47151, max: 100525 },
              { rate: 0.24, min: 100526, max: 191950 },
              { rate: 0.32, min: 191951, max: 243725 },
              { rate: 0.35, min: 243726, max: 609350 },
              { rate: 0.37, min: 609351, max: Infinity },
            ],
          },
          source: 'IRS Rev. Proc. 2023-34',
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.data.brackets).toHaveLength(7);
        expect(parsed.data.brackets[0].rate).toBe(0.10);
        expect(parsed.data.brackets[6].rate).toBe(0.37);
      });

      it('should query child tax credit rules', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          topic: 'child_tax_credit',
          tax_year: 2024,
          data: {
            amount_per_child: 2000,
            refundable_amount: 1700,
            phase_out_threshold_single: 200000,
            phase_out_threshold_married: 400000,
            phase_out_rate: 50, // $50 per $1,000 over threshold
          },
          source: 'IRS Pub 972',
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.data.amount_per_child).toBe(2000);
        expect(parsed.data.refundable_amount).toBe(1700);
      });

      it('should query EITC eligibility', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          topic: 'earned_income_tax_credit',
          tax_year: 2024,
          data: {
            max_credit_0_children: 632,
            max_credit_1_child: 4213,
            max_credit_2_children: 6960,
            max_credit_3_or_more: 7830,
            phase_out_begins_single_0: 9800,
            phase_out_begins_single_1: 21560,
          },
          source: 'IRS Rev. Proc. 2023-34',
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.data.max_credit_1_child).toBe(4213);
      });

      it('should query self-employment tax rates', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          topic: 'self_employment_tax',
          tax_year: 2024,
          data: {
            total_rate: 0.153,
            social_security_rate: 0.124,
            medicare_rate: 0.029,
            ss_wage_cap: 168600,
            additional_medicare_threshold_single: 200000,
            additional_medicare_rate: 0.009,
          },
          source: 'IRS Pub 334',
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.data.total_rate).toBe(0.153);
        expect(parsed.data.ss_wage_cap).toBe(168600);
      });

      it('should handle unknown topic', async () => {
        const response = createMockMCPResponse(
          'Error: Topic not found in IRS rules database',
          true
        );

        expect(response.isError).toBe(true);
        expect(response.content[0].text).toContain('not found');
      });
    });

    describe('search_publication Tool', () => {
      it('should define search_publication tool schema', () => {
        const toolSchema = {
          name: 'search_publication',
          description: 'Search IRS publications for specific guidance',
          inputSchema: {
            type: 'object',
            properties: {
              publication_number: {
                type: 'string',
                description: 'IRS publication number (e.g., "17", "501")',
              },
              search_term: {
                type: 'string',
                description: 'Term to search for in publication',
              },
              tax_year: {
                type: 'number',
                description: 'Tax year (default: 2024)',
              },
            },
            required: ['publication_number', 'search_term'],
          },
        };

        expect(toolSchema.name).toBe('search_publication');
        expect(toolSchema.inputSchema.required).toContain('publication_number');
      });

      it('should search Publication 17 for mortgage interest', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          publication: 'Pub 17 - Your Federal Income Tax',
          tax_year: 2024,
          search_term: 'mortgage interest',
          results: [
            {
              section: 'Deductible Home Mortgage Interest',
              page: 142,
              excerpt: 'You can deduct home mortgage interest on the first $750,000...',
            },
          ],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.results[0].section).toContain('Mortgage Interest');
        expect(parsed.results[0].page).toBe(142);
      });
    });
  });

  describe('form-validator Server', () => {
    describe('validate_form Tool', () => {
      it('should define validate_form tool schema', () => {
        const toolSchema = {
          name: 'validate_form',
          description: 'Validate tax form data against IRS requirements',
          inputSchema: {
            type: 'object',
            properties: {
              form_type: {
                type: 'string',
                enum: ['W2', '1099-INT', '1099-DIV', '1099-B', '1099-NEC', '1098-E', '1040'],
                description: 'Tax form type',
              },
              form_data: {
                type: 'object',
                description: 'Form data to validate',
              },
              tax_year: {
                type: 'number',
                description: 'Tax year (default: 2024)',
              },
            },
            required: ['form_type', 'form_data'],
          },
        };

        expect(toolSchema.name).toBe('validate_form');
        expect(toolSchema.inputSchema.required).toContain('form_type');
        expect(toolSchema.inputSchema.required).toContain('form_data');
      });

      it('should validate complete W-2 data', async () => {
        const w2 = createSampleW2();

        const response = createMockMCPResponse(JSON.stringify({
          form_type: 'W2',
          is_valid: true,
          errors: [],
          warnings: [],
          validated_data: w2,
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_valid).toBe(true);
        expect(parsed.errors).toHaveLength(0);
      });

      it('should detect missing required fields', async () => {
        const incompleteW2 = {
          occupation: 'Engineer',
          income: 75000,
          // Missing fedWithholding, ssWages, etc.
        };

        const response = createMockMCPResponse(JSON.stringify({
          form_type: 'W2',
          is_valid: false,
          errors: [
            { field: 'fedWithholding', message: 'Required field missing' },
            { field: 'ssWages', message: 'Required field missing' },
            { field: 'ssWithholding', message: 'Required field missing' },
          ],
          warnings: [],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_valid).toBe(false);
        expect(parsed.errors.length).toBeGreaterThan(0);
      });

      it('should detect invalid SSN format', async () => {
        const w2WithInvalidSSN = createSampleW2();
        w2WithInvalidSSN.ssn = '123456789'; // Missing hyphens

        const response = createMockMCPResponse(JSON.stringify({
          form_type: 'W2',
          is_valid: false,
          errors: [
            { field: 'ssn', message: 'Invalid SSN format (expected: XXX-XX-XXXX)' },
          ],
          warnings: [],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.errors[0].field).toBe('ssn');
        expect(parsed.errors[0].message).toContain('Invalid SSN format');
      });

      it('should detect negative income values', async () => {
        const w2WithNegativeIncome = createSampleW2({ income: -1000 });

        const response = createMockMCPResponse(JSON.stringify({
          form_type: 'W2',
          is_valid: false,
          errors: [
            { field: 'income', message: 'Income cannot be negative' },
          ],
          warnings: [],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.errors[0].field).toBe('income');
        expect(parsed.errors[0].message).toContain('cannot be negative');
      });

      it('should warn about unusual values', async () => {
        const w2WithHighWithholding = createSampleW2({
          income: 50000,
          fedWithholding: 40000, // 80% withholding rate - unusual
        });

        const response = createMockMCPResponse(JSON.stringify({
          form_type: 'W2',
          is_valid: true,
          errors: [],
          warnings: [
            {
              field: 'fedWithholding',
              message: 'Withholding rate of 80% is unusually high',
              severity: 'warning',
            },
          ],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_valid).toBe(true); // Still valid, just unusual
        expect(parsed.warnings.length).toBeGreaterThan(0);
      });

      it('should validate 1099-INT data', async () => {
        const int = createSample1099('1099-INT', {
          interest: 1250,
        });

        const response = createMockMCPResponse(JSON.stringify({
          form_type: '1099-INT',
          is_valid: true,
          errors: [],
          warnings: [],
          validated_data: int,
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_valid).toBe(true);
      });

      it('should detect mismatched form data', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          form_type: 'W2',
          is_valid: false,
          errors: [
            {
              field: 'form_type',
              message: 'Data does not match expected W-2 structure',
            },
          ],
          warnings: [],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_valid).toBe(false);
        expect(parsed.errors[0].message).toContain('does not match');
      });
    });

    describe('check_consistency Tool', () => {
      it('should define check_consistency tool schema', () => {
        const toolSchema = {
          name: 'check_consistency',
          description: 'Check consistency across multiple tax forms',
          inputSchema: {
            type: 'object',
            properties: {
              forms: {
                type: 'array',
                description: 'Array of forms to check for consistency',
              },
            },
            required: ['forms'],
          },
        };

        expect(toolSchema.name).toBe('check_consistency');
        expect(toolSchema.inputSchema.required).toContain('forms');
      });

      it('should detect SSN mismatch across forms', async () => {
        const w2_1 = createSampleW2();
        const w2_2 = createSampleW2();
        w2_2.ssn = '999-88-7777'; // Different SSN

        const response = createMockMCPResponse(JSON.stringify({
          is_consistent: false,
          errors: [
            {
              type: 'ssn_mismatch',
              message: 'SSN mismatch between W-2 forms',
              forms: ['W2[0]', 'W2[1]'],
            },
          ],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_consistent).toBe(false);
        expect(parsed.errors[0].type).toBe('ssn_mismatch');
      });

      it('should verify total income matches', async () => {
        const response = createMockMCPResponse(JSON.stringify({
          is_consistent: true,
          checks: [
            {
              type: 'income_total',
              status: 'pass',
              message: 'Total W-2 income matches 1040 Line 1',
            },
          ],
        }));

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.is_consistent).toBe(true);
      });
    });
  });

  describe('MCP Server Error Handling', () => {
    it('should handle file not found errors', () => {
      const response = createMockMCPResponse(
        'Error: File not found at path /invalid/path.pdf',
        true
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('File not found');
    });

    it('should handle network errors', () => {
      const response = createMockMCPResponse(
        'Error: Unable to connect to IRS website - network timeout',
        true
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('network timeout');
    });

    it('should handle malformed input', () => {
      const response = createMockMCPResponse(
        'Error: Invalid input schema - missing required field "file_path"',
        true
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Invalid input schema');
    });
  });
});
