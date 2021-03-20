export interface PatternConfig {
  mask?: string
  regexp?: RegExp
  description?: string
}

export const Patterns: {[name: string]: PatternConfig} = {
  name: {
    regexp: /^[A-Za-z ]+$/i,
    description: 'Input should only include letters and spaces'
  },
  zip: {
    mask: '99999-9999',
    regexp: /[0-9]{5}-[0-9]{4}/,
    description: 'Input should be filled with 9 digits'
  },
  ssn: {
    mask: '999-99-9999',
    regexp: /[0-9]{3}-[0-9]{2}-[0-9]{4}/,
    description: 'Input should be filled with 9 digits'
  },
  ein: {
    mask: '99-9999999',
    regexp: /[0-9]{2}-[0-9]{7}/,
    description: 'Input should be filled with 9 digits'
  },
  currency: {
    regexp: /^[0-9]+$/,
    description: 'Input should be filled with digits only'
  },
  bankAccount: {
    mask: '99999999999999999',
    regexp: /[0-9]{4,17}/,
    description: 'Input should be filled with 4-17 digits'
  },
  bankRouting: {
    mask: '999999999',
    regexp: /[0-9]{9}/,
    description: 'Input should be filled with 9 digits'
  },
  usPhoneNumber: {
    mask: '999-999-9999',
    regexp: /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
    description: 'Input should be filled with 10 digits'
  }
}
