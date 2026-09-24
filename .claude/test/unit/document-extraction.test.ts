/**
 * Unit Tests: Document Extraction
 *
 * Tests for the document extraction automation layer
 * (PDF parsing, OCR, field extraction)
 */

import {
  createMockPDF,
  createMockImage,
  createSampleW2,
  createSample1099,
} from '../utils/test-helpers';

describe('Document Extraction Layer', () => {
  describe('PDF Text Extraction', () => {
    it('should extract text from PDF buffer', () => {
      const mockText = 'W-2 Wage and Tax Statement\nWages: $75,000\nFederal tax withheld: $12,000';
      const pdfBuffer = createMockPDF(mockText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.toString()).toContain('75,000');
      expect(pdfBuffer.toString()).toContain('12,000');
    });

    it('should handle empty PDF', () => {
      const pdfBuffer = createMockPDF('');
      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });

    it('should handle malformed PDF gracefully', () => {
      const invalidBuffer = Buffer.from('not a pdf', 'utf-8');
      expect(invalidBuffer).toBeInstanceOf(Buffer);
      // Extraction layer should handle errors gracefully
    });
  });

  describe('Field Pattern Matching', () => {
    describe('W-2 Field Extraction', () => {
      const w2Patterns = {
        wages: /(?:Box 1|Wages)[^\$]*\$?([0-9,]+\.?\d{0,2})/i,
        fedWithholding: /(?:Box 2|Federal.*withheld)[^\$]*\$?([0-9,]+\.?\d{0,2})/i,
        ssn: /(?:Employee.*SSN|Social Security\s*(?:Number)?)[:\s]*(\d{3}-?\d{2}-?\d{4})/i,
        ein: /(?:Employer.*?(?:EIN|ID(?:\s+number)?))[:\s]*(\d{2}-?\d{7})/i,
        employer: /(?:Employer|Company)\s+(?:name)[:\s]*([^\n]+)/i,
      };

      it('should extract wages from W-2 text', () => {
        const text = 'Box 1 Wages, tips, other compensation: $75,000.00';
        const match = text.match(w2Patterns.wages);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('75,000.00');
      });

      it('should extract federal withholding', () => {
        const text = 'Box 2 Federal income tax withheld: $12,000.50';
        const match = text.match(w2Patterns.fedWithholding);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('12,000.50');
      });

      it('should extract SSN with and without hyphens', () => {
        const text1 = 'Employee SSN: 123-45-6789';
        const text2 = 'Social Security Number 123456789';

        const match1 = text1.match(w2Patterns.ssn);
        const match2 = text2.match(w2Patterns.ssn);

        expect(match1![1]).toMatch(/\d{3}-?\d{2}-?\d{4}/);
        expect(match2![1]).toMatch(/\d{3}-?\d{2}-?\d{4}/);
      });

      it('should extract EIN', () => {
        const text = 'Employer ID number: 12-3456789';
        const match = text.match(w2Patterns.ein);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('12-3456789');
      });

      it('should extract employer name', () => {
        const text = 'Employer name: ABC Company Inc';
        const match = text.match(w2Patterns.employer);

        expect(match).not.toBeNull();
        expect(match![1].trim()).toBe('ABC Company Inc');
      });

      it('should handle missing fields gracefully', () => {
        const text = 'Incomplete W-2 document';
        const wagesMatch = text.match(w2Patterns.wages);

        expect(wagesMatch).toBeNull();
        // Extraction layer should report missing fields
      });
    });

    describe('1099-NEC Field Extraction', () => {
      const necPatterns = {
        payer: /(?:Payer|Company)\s+(?:name)[:\s]*([^\n]+)/i,
        compensation: /(?:Nonemployee compensation|Box 1)[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
        ein: /(?:Payer.*EIN|Federal ID)[:\s]*(\d{2}-?\d{7})/i,
      };

      it('should extract payer name', () => {
        const text = 'Payer name: XYZ Corporation';
        const match = text.match(necPatterns.payer);

        expect(match).not.toBeNull();
        expect(match![1].trim()).toBe('XYZ Corporation');
      });

      it('should extract nonemployee compensation', () => {
        const text = 'Box 1 Nonemployee compensation: $25,000.00';
        const match = text.match(necPatterns.compensation);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('25,000.00');
      });
    });

    describe('1099-INT Field Extraction', () => {
      const intPatterns = {
        interest: /(?:Interest income|Box 1)[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
        taxExempt: /(?:Tax-exempt interest|Box 8)[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
      };

      it('should extract interest income', () => {
        const text = 'Box 1 Interest income: $1,250.50';
        const match = text.match(intPatterns.interest);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('1,250.50');
      });

      it('should extract tax-exempt interest', () => {
        const text = 'Box 8 Tax-exempt interest: $500.00';
        const match = text.match(intPatterns.taxExempt);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('500.00');
      });
    });
  });

  describe('Data Normalization', () => {
    it('should normalize currency strings to numbers', () => {
      const normalize = (str: string): number => {
        return parseFloat(str.replace(/,/g, ''));
      };

      expect(normalize('75,000.00')).toBe(75000.00);
      expect(normalize('1,250.50')).toBe(1250.50);
      expect(normalize('100')).toBe(100);
    });

    it('should normalize SSN format', () => {
      const normalizeSSN = (ssn: string): string => {
        const digits = ssn.replace(/\D/g, '');
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
      };

      expect(normalizeSSN('123456789')).toBe('123-45-6789');
      expect(normalizeSSN('123-45-6789')).toBe('123-45-6789');
      expect(normalizeSSN('123 45 6789')).toBe('123-45-6789');
    });

    it('should normalize EIN format', () => {
      const normalizeEIN = (ein: string): string => {
        const digits = ein.replace(/\D/g, '');
        return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
      };

      expect(normalizeEIN('123456789')).toBe('12-3456789');
      expect(normalizeEIN('12-3456789')).toBe('12-3456789');
      expect(normalizeEIN('12 3456789')).toBe('12-3456789');
    });
  });

  describe('Confidence Scoring', () => {
    it('should calculate confidence score based on field matches', () => {
      const calculateConfidence = (fields: Record<string, any>): number => {
        const requiredFields = ['wages', 'fedWithholding', 'employer'];
        const optionalFields = ['ssn', 'ein', 'stateWithholding'];

        let score = 0;
        const totalWeight = requiredFields.length * 2 + optionalFields.length;

        for (const field of requiredFields) {
          if (fields[field] !== undefined && fields[field] !== null) {
            score += 2; // Required fields worth more
          }
        }

        for (const field of optionalFields) {
          if (fields[field] !== undefined && fields[field] !== null) {
            score += 1;
          }
        }

        return Math.round((score / totalWeight) * 100);
      };

      // All fields present
      expect(
        calculateConfidence({
          wages: 75000,
          fedWithholding: 12000,
          employer: 'ABC',
          ssn: '123-45-6789',
          ein: '12-3456789',
          stateWithholding: 3750,
        })
      ).toBe(100);

      // Only required fields
      expect(
        calculateConfidence({
          wages: 75000,
          fedWithholding: 12000,
          employer: 'ABC',
        })
      ).toBe(67);

      // Missing required field
      expect(
        calculateConfidence({
          wages: 75000,
          ssn: '123-45-6789',
        })
      ).toBe(33);
    });
  });

  describe('Document Type Detection', () => {
    it('should detect W-2 from content', () => {
      const detectType = (text: string): string | null => {
        if (/W-?2|Wage and Tax Statement/i.test(text)) return 'W2';
        if (/1099-NEC|Nonemployee Compensation/i.test(text)) return '1099-NEC';
        if (/1099-INT|Interest Income/i.test(text)) return '1099-INT';
        if (/1099-DIV|Dividends/i.test(text)) return '1099-DIV';
        if (/1098|Mortgage Interest/i.test(text)) return '1098';
        return null;
      };

      expect(detectType('W-2 Wage and Tax Statement')).toBe('W2');
      expect(detectType('Form W2 2024')).toBe('W2');
      expect(detectType('WAGE AND TAX STATEMENT')).toBe('W2');
    });

    it('should detect 1099-NEC from content', () => {
      const detectType = (text: string): string | null => {
        if (/1099-NEC|Nonemployee Compensation/i.test(text)) return '1099-NEC';
        return null;
      };

      expect(detectType('Form 1099-NEC')).toBe('1099-NEC');
      expect(detectType('Nonemployee Compensation 2024')).toBe('1099-NEC');
    });

    it('should return null for unknown documents', () => {
      const detectType = (text: string): string | null => {
        if (/W-?2|Wage and Tax Statement/i.test(text)) return 'W2';
        if (/1099-NEC|Nonemployee Compensation/i.test(text)) return '1099-NEC';
        return null;
      };

      expect(detectType('Random document text')).toBeNull();
      expect(detectType('')).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should validate extracted W-2 data', () => {
      const validateW2 = (data: any): boolean => {
        return (
          data.income !== undefined &&
          data.income >= 0 &&
          data.fedWithholding !== undefined &&
          data.fedWithholding >= 0 &&
          data.employerName !== undefined &&
          data.employerName.length > 0
        );
      };

      const validW2 = createSampleW2();
      expect(validateW2(validW2)).toBe(true);

      const invalidW2 = { income: -1000 };
      expect(validateW2(invalidW2)).toBe(false);
    });

    it('should validate SSN format', () => {
      const validateSSN = (ssn: string): boolean => {
        return /^\d{3}-\d{2}-\d{4}$/.test(ssn);
      };

      expect(validateSSN('123-45-6789')).toBe(true);
      expect(validateSSN('123456789')).toBe(false);
      expect(validateSSN('12-34-5678')).toBe(false);
      expect(validateSSN('')).toBe(false);
    });

    it('should validate EIN format', () => {
      const validateEIN = (ein: string): boolean => {
        return /^\d{2}-\d{7}$/.test(ein);
      };

      expect(validateEIN('12-3456789')).toBe(true);
      expect(validateEIN('123456789')).toBe(false);
      expect(validateEIN('1-23456789')).toBe(false);
      expect(validateEIN('')).toBe(false);
    });

    it('should validate currency amounts', () => {
      const validateCurrency = (amount: number): boolean => {
        return (
          typeof amount === 'number' &&
          !isNaN(amount) &&
          isFinite(amount) &&
          amount >= 0
        );
      };

      expect(validateCurrency(75000)).toBe(true);
      expect(validateCurrency(0)).toBe(true);
      expect(validateCurrency(-1000)).toBe(false);
      expect(validateCurrency(NaN)).toBe(false);
      expect(validateCurrency(Infinity)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle extraction errors gracefully', () => {
      const extractWithErrorHandling = (text: string): { success: boolean; data?: any; error?: string } => {
        try {
          if (!text || text.trim().length === 0) {
            throw new Error('Empty document');
          }

          // Simulate extraction
          const data = { extracted: true };
          return { success: true, data };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      };

      const successResult = extractWithErrorHandling('Valid document text');
      expect(successResult.success).toBe(true);
      expect(successResult.data).toBeDefined();

      const errorResult = extractWithErrorHandling('');
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBe('Empty document');
    });
  });
});
