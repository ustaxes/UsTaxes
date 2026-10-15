/**
 * Mock UsTaxes Redux API
 *
 * Provides mock implementations of UsTaxes Redux actions and state
 * for testing the automation layer without modifying UsTaxes code.
 */

export interface IncomeW2 {
  occupation: string;
  income: number;
  medicareIncome: number;
  fedWithholding: number;
  ssWages: number;
  ssWithholding: number;
  medicareWithholding: number;
  stateWages?: number;
  stateWithholding?: string;
  ein?: string;
  employerName?: string;
  state?: string;
  ssn?: string;
}

export interface Supported1099 {
  form: '1099-INT' | '1099-DIV' | '1099-B' | '1099-NEC';
  payer: string;
  income: number;
  [key: string]: any;
}

export interface F1098e {
  lender: string;
  interest: number;
}

export interface TaxPayer {
  firstName: string;
  lastName: string;
  ssn: string;
  role: 'PRIMARY' | 'SPOUSE';
}

export interface Dependent {
  firstName: string;
  lastName: string;
  ssn: string;
  relationship: string;
  birthYear: number;
}

export interface Information {
  taxPayer: TaxPayer;
  w2s: IncomeW2[];
  f1099s: Supported1099[];
  f1098es: F1098e[];
  refund?: {
    routingNumber?: string;
    accountNumber?: string;
    accountType?: 'checking' | 'savings';
  };
}

/**
 * Mock Redux store
 */
export class MockReduxStore {
  private state: Information = {
    taxPayer: {
      firstName: '',
      lastName: '',
      ssn: '',
      role: 'PRIMARY',
    },
    w2s: [],
    f1099s: [],
    f1098es: [],
  };

  private actions: any[] = [];

  /**
   * Get current state
   */
  getState(): Information {
    return { ...this.state };
  }

  /**
   * Get action history
   */
  getActions(): any[] {
    return [...this.actions];
  }

  /**
   * Reset store
   */
  reset(): void {
    this.state = {
      taxPayer: {
        firstName: '',
        lastName: '',
        ssn: '',
        role: 'PRIMARY',
      },
      w2s: [],
      f1099s: [],
      f1098es: [],
    };
    this.actions = [];
  }

  /**
   * Mock dispatch function
   */
  dispatch = (action: any): void => {
    this.actions.push(action);

    // Simulate Redux action handling
    switch (action.type) {
      case 'ADD_W2':
        this.state.w2s.push(action.payload);
        break;
      case 'ADD_1099':
        this.state.f1099s.push(action.payload);
        break;
      case 'ADD_1098E':
        this.state.f1098es.push(action.payload);
        break;
      case 'SAVE_PRIMARY_PERSON_INFO':
        this.state.taxPayer = { ...this.state.taxPayer, ...action.payload };
        break;
      case 'SAVE_REFUND_INFO':
        this.state.refund = action.payload;
        break;
    }
  };
}

/**
 * Mock Redux actions (simulating UsTaxes API)
 */
export const mockActions = {
  addW2: (w2: IncomeW2) => ({
    type: 'ADD_W2',
    payload: w2,
  }),

  add1099: (form1099: Supported1099) => ({
    type: 'ADD_1099',
    payload: form1099,
  }),

  add1098e: (f1098e: F1098e) => ({
    type: 'ADD_1098E',
    payload: f1098e,
  }),

  savePrimaryPersonInfo: (person: Partial<TaxPayer>) => ({
    type: 'SAVE_PRIMARY_PERSON_INFO',
    payload: person,
  }),

  saveRefundInfo: (refund: any) => ({
    type: 'SAVE_REFUND_INFO',
    payload: refund,
  }),
};

/**
 * Create mock store instance
 */
export function createMockStore(): MockReduxStore {
  return new MockReduxStore();
}

/**
 * Mock validators (simulating UsTaxes validation)
 */
export const mockValidators = {
  incomeW2: (w2: any): boolean => {
    return (
      w2 &&
      typeof w2.occupation === 'string' &&
      typeof w2.income === 'number' &&
      w2.income >= 0 &&
      typeof w2.fedWithholding === 'number' &&
      w2.fedWithholding >= 0
    );
  },

  supported1099: (form: any): boolean => {
    return (
      form &&
      ['1099-INT', '1099-DIV', '1099-B', '1099-NEC'].includes(form.form) &&
      typeof form.payer === 'string' &&
      typeof form.income === 'number'
    );
  },

  ssn: (ssn: string): boolean => {
    return /^\d{3}-\d{2}-\d{4}$/.test(ssn);
  },

  ein: (ein: string): boolean => {
    return /^\d{2}-\d{7}$/.test(ein);
  },
};
