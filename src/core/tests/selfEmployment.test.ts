import { FilingStatus, Information, PersonRole } from 'ustaxes/core/data'
import { estimateScheduleCNetProfit } from 'ustaxes/core/selfEmployment'
import { blankState } from 'ustaxes/redux/reducer'

const baseInformation: Information = {
  ...blankState,
  taxPayer: {
    filingStatus: FilingStatus.S,
    primaryPerson: {
      firstName: 'Taylor',
      lastName: 'Taxpayer',
      ssid: '123456789',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date(1990, 0, 1),
      isTaxpayerDependent: false,
      address: {
        address: '123 Maple St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }
    },
    dependents: []
  },
  businesses: [
    {
      name: 'Side Gig',
      principalBusinessOrProfession: 'Consulting',
      income: {
        grossReceipts: 12000,
        returnsAndAllowances: 500,
        otherIncome: 250
      },
      expenses: {
        advertising: 300,
        office: 450
      },
      homeOfficeDeduction: 750
    }
  ]
}

describe('estimateScheduleCNetProfit', () => {
  it('falls back to businesses when legacy selfEmployedIncome entries lack net-profit fields', () => {
    expect(
      estimateScheduleCNetProfit({
        ...baseInformation,
        selfEmployedIncome: [
          {
            businessName: 'Legacy import',
            personRole: PersonRole.PRIMARY,
            grossReceipts: Number.NaN,
            expenses: Number.NaN
          }
        ]
      })
    ).toBe(10250)
  })
})
