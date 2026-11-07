import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import F1040 from '../irsForms/F1040'

// A single filer with $50,000 of wages and $3,000 of care expenses for one
// qualifying person: Form 2441 line 8 is 20% and line 11 is $600, which
// Schedule 3 line 2 carries to Form 1040 line 20 (2025 Instructions for
// Form 1040, line 20; 2025 Instructions for Form 2441, line 11). Nothing else
// on this return (excess Social Security withholding, foreign tax credit,
// extension payment, Schedule R) would otherwise require Schedule 3.
const information: ValidatedInformation = {
  f1099s: [],
  f3921s: [],
  credits: [],
  scheduleK1Form1065s: [],
  itemizedDeductions: undefined,
  w2s: [
    {
      employer: { EIN: '111111111', employerName: 'employer' },
      personRole: PersonRole.PRIMARY,
      occupation: 'occupation',
      state: 'AL',
      income: 50000,
      medicareIncome: 50000,
      fedWithholding: 0,
      ssWages: 50000,
      ssWithholding: 3100,
      medicareWithholding: 725,
      stateWages: 50000,
      stateWithholding: 0
    }
  ],
  estimatedTaxes: [],
  realEstate: [],
  taxPayer: {
    primaryPerson: {
      address: {
        address: '0001',
        aptNo: '',
        city: 'city',
        state: 'AL',
        zip: '35004'
      },
      firstName: 'first',
      lastName: 'last',
      isTaxpayerDependent: false,
      role: PersonRole.PRIMARY,
      ssid: '111111111',
      dateOfBirth: new Date('01/01/1985'),
      isBlind: false
    },
    spouse: undefined,
    dependents: [],
    filingStatus: FilingStatus.S
  },
  questions: {},
  f1098es: [],
  stateResidencies: [{ state: 'AL' }],
  healthSavingsAccounts: [],
  individualRetirementArrangements: [],
  dependentCareExpenses: { qualifyingPersonCount: 1, totalExpenses: 3000 }
}

describe('Schedule 3', () => {
  it('carries the child and dependent care credit to Form 1040 line 20', () => {
    const f1040 = new F1040(information, [])
    expect(f1040.f2441.credit()).toEqual(600)
    expect(f1040.schedule3.isNeeded()).toEqual(true)
    expect(f1040.l20()).toEqual(600)
    expect(f1040.l22()).toEqual(Math.max(0, f1040.l18() - 600))
  })
})
