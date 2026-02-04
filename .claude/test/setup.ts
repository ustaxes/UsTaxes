/**
 * Jest Setup File
 *
 * Global test configuration and utilities
 */

// Make this file a module for TypeScript
export {};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeValidSSN(received: string) {
    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    const pass = ssnPattern.test(received);
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid SSN`
          : `expected ${received} to be a valid SSN (format: XXX-XX-XXXX)`,
      pass,
    };
  },
  toBeValidEIN(received: string) {
    const einPattern = /^\d{2}-\d{7}$/;
    const pass = einPattern.test(received);
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid EIN`
          : `expected ${received} to be a valid EIN (format: XX-XXXXXXX)`,
      pass,
    };
  },
  toBeValidCurrency(received: number) {
    const pass = typeof received === 'number' && !isNaN(received) && isFinite(received);
    return {
      message: () =>
        pass
          ? `expected ${received} not to be valid currency`
          : `expected ${received} to be valid currency (number, not NaN, finite)`,
      pass,
    };
  },
});

// Global test timeout
jest.setTimeout(30000);

// Console suppression for cleaner test output (optional)
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add custom matchers to TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidSSN(): R;
      toBeValidEIN(): R;
      toBeValidCurrency(): R;
    }
  }
}
