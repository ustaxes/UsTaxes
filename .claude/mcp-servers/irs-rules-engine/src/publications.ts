/**
 * IRS Publications Database
 * Quick reference guide to common IRS publications
 */

export const IRS_PUBLICATIONS: Record<string, any> = {
  '17': {
    title: 'Your Federal Income Tax',
    description: 'Comprehensive guide for individual taxpayers',
    url: 'https://www.irs.gov/publications/p17',
    topics: ['income', 'deductions', 'credits', 'filing'],
  },
  '502': {
    title: 'Medical and Dental Expenses',
    description: 'Guide to deducting medical expenses',
    url: 'https://www.irs.gov/publications/p502',
    topics: ['itemized_deductions', 'medical'],
  },
  '526': {
    title: 'Charitable Contributions',
    description: 'Rules for deducting charitable donations',
    url: 'https://www.irs.gov/publications/p526',
    topics: ['itemized_deductions', 'charity'],
  },
  '590-A': {
    title: 'Contributions to Individual Retirement Arrangements (IRAs)',
    description: 'IRA contribution rules and limits',
    url: 'https://www.irs.gov/publications/p590a',
    topics: ['retirement', 'deductions'],
  },
  '596': {
    title: 'Earned Income Credit (EIC)',
    description: 'Eligibility and calculation of EIC',
    url: 'https://www.irs.gov/publications/p596',
    topics: ['credits', 'low_income'],
  },
  '936': {
    title: 'Home Mortgage Interest Deduction',
    description: 'Rules for deducting mortgage interest',
    url: 'https://www.irs.gov/publications/p936',
    topics: ['itemized_deductions', 'homeownership'],
  },
  '970': {
    title: 'Tax Benefits for Education',
    description: 'Education credits and deductions',
    url: 'https://www.irs.gov/publications/p970',
    topics: ['credits', 'education'],
  },
  '972': {
    title: 'Child Tax Credit',
    description: 'Child tax credit and additional child tax credit',
    url: 'https://www.irs.gov/publications/p972',
    topics: ['credits', 'children'],
  },
};
