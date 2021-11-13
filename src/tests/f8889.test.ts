import fc from 'fast-check'
import * as arbitraries from './arbitraries'

import {
  FilingStatus,
  Income1099Type,
  PersonRole,
  IncomeW2,
  Information
} from 'ustaxes/redux/data'
import { CURRENT_YEAR, healthSavingsAccounts } from 'ustaxes/data/federal'
import F8889 from 'ustaxes/irsForms/F8889'

describe('Health Savings Accounts', () => {
  it('should have a max contribution limit when covered for all months', () => {
    const information: Information = {
      f1099s: [
        {
          payer: 'payer-name',
          type: Income1099Type.INT,
          form: { income: 1111111 },
          personRole: PersonRole.PRIMARY
        }
      ],
      w2s: [
        {
          employer: { EIN: '111111111', employerName: 'w2s employer name' },
          personRole: PersonRole.SPOUSE,
          occupation: 'w2s-occupation',
          state: 'AL',
          income: 111,
          medicareIncome: 222,
          fedWithholding: 333,
          ssWithholding: 444,
          medicareWithholding: 555,
          stateWages: 666,
          stateWithholding: 777
        }
      ],
      estimatedTaxes: [],
      realEstate: [],
      taxPayer: {
        primaryPerson: {
          address: {
            address: '0001',
            aptNo: '',
            city: 'AR city',
            state: 'AR',
            zip: '1234567'
          },
          firstName: 'payer-first-name',
          lastName: 'payer-last-name',
          isTaxpayerDependent: false,
          role: PersonRole.PRIMARY,
          ssid: '111111111'
        },
        spouse: {
          firstName: 'spouse-first-name',
          isTaxpayerDependent: false,
          lastName: 'spouse-last-name',
          role: PersonRole.SPOUSE,
          ssid: '222222222'
        },
        dependents: [],
        filingStatus: FilingStatus.MFS
      },
      questions: {},
      f1098es: [],
      stateResidencies: [{ state: 'AL' }],
      healthSavingsAccounts: [
        {
          coverageType: 'self-only',
          contributions: 3550,
          personRole: PersonRole.PRIMARY,
          startDate: new Date(CURRENT_YEAR, 0, 1),
          endDate: new Date(CURRENT_YEAR, 11, 31),
          label: 'test'
        }
      ]
    }
    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    if (f8889.fullYearHsa()) {
      if (f8889.lastMonthCoverage() == 'self-only') {
        expect(f8889.contributionLimit()).toEqual(
          healthSavingsAccounts.contributionLimit['self-only']
        )
      } else {
        expect(f8889.contributionLimit()).toEqual(
          healthSavingsAccounts.contributionLimit['self-only']
        )
      }
    }
    /*
    fc.assert(
      fc.property(arbitraries.information, (information) => {
        if (information.taxPayer.primaryPerson !== undefined) {
          let f8889 = new F8889(information, information.taxPayer.primaryPerson)
          if (f8889.fullYearHsa()) {
            if(f8889.lastMonthCoverage() == 'self-only') {
              expect(f8889.contributionLimit()).toEqual(healthSavingsAccounts.contributionLimit['self-only'])
            } else {
              expect(f8889.contributionLimit()).toEqual(healthSavingsAccounts.contributionLimit['self-only'])
            }
          }
        }
      })
    )*/
  })
})
