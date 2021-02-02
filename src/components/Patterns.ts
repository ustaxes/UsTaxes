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
    regexp: /[0-9]{5}-[0-9]{4}/,
    description: 'Input should be filled with 9 numbers',
    mask: '99999-9999'
  },
  ssn: {
    mask: '999-99-9999',
    regexp: /[0-9]{3}-[0-9]{2}-[0-9]{4}/,
    description: 'Input should be filled with 9 numbers'
  },
  ein: {
    mask: '99-9999999',
    regexp: /[0-9]{2}-[0-9]{7}/,
    description: 'Input should be filled with 9 numbers'
  },
  currency: {
    regexp: /^[0-9]+$/,
    description: 'Input should be filled with numbers only'
  },
  bankAccount: {
    mask: '999999999999',
    regexp: /[0-9]{10}|[0-9]{11}|[0-9]{12}/,
    description: 'Input should be filled with 10-12 numbers'
  },
  bankRouting: {
    mask: '999999999',
    regexp: /[0-9]{9}/,
    description: 'Input should be filled with 10 numbers'
  },
  usPhoneNumber: {
    regexp: /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
    description: 'Input should be filled with 10 numbers',
    mask: '999-999-9999'
  }
}
