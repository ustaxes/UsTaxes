import { CreditType, FilingStatus, PersonRole } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import F1040 from '../irsForms/F1040'
import F5695 from '../irsForms/F5695'
import F8936 from '../irsForms/F8936'

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

  it('counts the residential clean energy credit once (line 5a, not 5b)', () => {
    const f1040 = new F1040(
      {
        ...information,
        dependentCareExpenses: undefined,
        credits: [
          {
            recipient: PersonRole.PRIMARY,
            amount: 10000,
            type: CreditType.ResidentialCleanEnergyCost
          }
        ]
      },
      []
    )
    // F1040 does not yet instantiate Form 5695 in Y2025; attach it directly.
    f1040.f5695 = new F5695(f1040)
    expect(f1040.schedule3.l5a()).toEqual(3000)
    expect(f1040.schedule3.l5b()).toBeUndefined()
    expect(f1040.schedule3.l8()).toEqual(3000)
    expect(f1040.l20()).toEqual(3000)
  })

  it('subtracts the clean vehicle credit once in Credit Limit Worksheet A', () => {
    const f1040 = new F1040(
      {
        ...information,
        dependentCareExpenses: undefined,
        credits: [
          {
            recipient: PersonRole.PRIMARY,
            amount: 1000,
            type: CreditType.CleanVehicle
          }
        ]
      },
      []
    )
    // F1040 does not yet instantiate Form 8936 in Y2025; attach it directly.
    f1040.f8936 = new F8936(f1040)
    expect(f1040.schedule3.l6f()).toEqual(1000)
    expect(f1040.schedule8812.creditLimitWorksheetA()).toEqual(
      Math.max(0, f1040.l18() - 1000)
    )
  })

  it('caps the care credit at tax and keeps line 19 non-negative', () => {
    // $15,000 of wages: tax on line 18 is well under the $600 credit.
    const lowWage = { ...information.w2s[0], income: 15000, ssWages: 15000 }
    const f1040 = new F1040({ ...information, w2s: [lowWage] }, [])
    const tax = f1040.l18()
    expect(tax).toBeLessThan(600)
    expect(f1040.f2441.credit() ?? 0).toEqual(tax)
    expect(f1040.schedule8812.creditLimitWorksheetA()).toBeGreaterThanOrEqual(0)
    expect(f1040.l19() ?? 0).toBeGreaterThanOrEqual(0)
    expect(f1040.l22()).toEqual(0)
  })
})
