/**
 * Test Helper Utilities
 *
 * Common utilities for testing the Claude Code automation layer
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Load test fixture
 */
export function loadFixture(filename: string): any {
  const fixturePath = path.join(__dirname, '../../test-fixtures', filename);
  const content = fs.readFileSync(fixturePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Create mock PDF buffer
 */
export function createMockPDF(text: string): Buffer {
  // Simple mock PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${text.length}
>>
stream
${text}
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000184 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${240 + text.length}
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}

/**
 * Create mock image buffer
 */
export function createMockImage(width: number = 100, height: number = 100): Buffer {
  // Simple 1x1 transparent PNG
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);
  return png;
}

/**
 * Sample W-2 data generator
 */
export function createSampleW2(overrides: Partial<any> = {}): any {
  return {
    occupation: 'Software Engineer',
    income: 75000,
    medicareIncome: 75000,
    fedWithholding: 12000,
    ssWages: 75000,
    ssWithholding: 4650,
    medicareWithholding: 1087.50,
    stateWages: 75000,
    stateWithholding: 3750,
    ein: '12-3456789',
    employerName: 'ABC Company',
    state: 'CA',
    ...overrides,
  };
}

/**
 * Sample 1099 data generator
 */
export function createSample1099(
  form: '1099-INT' | '1099-DIV' | '1099-B' | '1099-NEC',
  overrides: Partial<any> = {}
): any {
  const base = {
    form,
    payer: 'XYZ Financial',
    income: 1000,
  };

  switch (form) {
    case '1099-INT':
      return { ...base, interest: 1000, ...overrides };
    case '1099-DIV':
      return { ...base, dividends: 1000, qualifiedDividends: 800, ...overrides };
    case '1099-B':
      return { ...base, proceeds: 10000, costBasis: 9000, ...overrides };
    case '1099-NEC':
      return { ...base, nonemployeeCompensation: 15000, ...overrides };
    default:
      return { ...base, ...overrides };
  }
}

/**
 * Sample tax return data
 */
export function createSampleTaxReturn(overrides: Partial<any> = {}): any {
  return {
    filingStatus: 'single',
    taxPayer: {
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
    },
    w2s: [createSampleW2()],
    f1099s: [],
    standardDeduction: 14600,
    taxableIncome: 60400,
    federalTax: 8686,
    effectiveRate: 0.1158,
    marginalRate: 0.12,
    ...overrides,
  };
}

/**
 * Calculate expected tax (2024 brackets)
 */
export function calculateExpectedTax(income: number, filingStatus: string): number {
  const brackets = {
    single: [
      { rate: 0.10, min: 0, max: 11600 },
      { rate: 0.12, min: 11601, max: 47150 },
      { rate: 0.22, min: 47151, max: 100525 },
      { rate: 0.24, min: 100526, max: 191950 },
      { rate: 0.32, min: 191951, max: 243725 },
      { rate: 0.35, min: 243726, max: 609350 },
      { rate: 0.37, min: 609351, max: Infinity },
    ],
    married: [
      { rate: 0.10, min: 0, max: 23200 },
      { rate: 0.12, min: 23201, max: 94300 },
      { rate: 0.22, min: 94301, max: 201050 },
      { rate: 0.24, min: 201051, max: 383900 },
      { rate: 0.32, min: 383901, max: 487450 },
      { rate: 0.35, min: 487451, max: 731200 },
      { rate: 0.37, min: 731201, max: Infinity },
    ],
  };

  const applicableBrackets = brackets[filingStatus as keyof typeof brackets] || brackets.single;
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of applicableBrackets) {
    if (remainingIncome <= 0) break;

    const bracketIncome = Math.min(
      remainingIncome,
      bracket.max - bracket.min + 1
    );

    tax += bracketIncome * bracket.rate;
    remainingIncome -= bracketIncome;
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Mock MCP tool response
 */
export function createMockMCPResponse(content: string, isError: boolean = false): any {
  return {
    content: [{ type: 'text', text: content }],
    isError,
  };
}

/**
 * Wait helper for async tests
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock file system operations
 */
export class MockFileSystem {
  private files: Map<string, Buffer | string> = new Map();

  writeFile(path: string, content: Buffer | string): void {
    this.files.set(path, content);
  }

  readFile(path: string): Buffer | string | null {
    return this.files.get(path) || null;
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  reset(): void {
    this.files.clear();
  }

  getAllFiles(): string[] {
    return Array.from(this.files.keys());
  }
}

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Assert value is within percentage tolerance
   */
  assertWithinTolerance(
    actual: number,
    expected: number,
    tolerancePercent: number = 0.01
  ): void {
    const tolerance = Math.abs(expected * tolerancePercent);
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
      throw new Error(
        `Expected ${actual} to be within ${tolerancePercent * 100}% of ${expected} ` +
        `(tolerance: ${tolerance}, diff: ${diff})`
      );
    }
  },

  /**
   * Assert SSN format
   */
  assertValidSSN(ssn: string): void {
    if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
      throw new Error(`Invalid SSN format: ${ssn} (expected: XXX-XX-XXXX)`);
    }
  },

  /**
   * Assert EIN format
   */
  assertValidEIN(ein: string): void {
    if (!/^\d{2}-\d{7}$/.test(ein)) {
      throw new Error(`Invalid EIN format: ${ein} (expected: XX-XXXXXXX)`);
    }
  },

  /**
   * Assert currency value (non-negative, finite)
   */
  assertValidCurrency(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount < 0) {
      throw new Error(`Invalid currency value: ${amount}`);
    }
  },
};
