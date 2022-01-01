/* eslint @typescript-eslint/no-empty-function: "off" */

import fc from 'fast-check'
import {
  FilingStatus,
  Income1099Type,
  PersonRole,
  Information
} from '../redux/data'
import { CURRENT_YEAR, healthSavingsAccounts } from '../data/federal'
import F8889, { needsF8889 } from '../irsForms/F8889'
import { cloneDeep } from 'lodash'
import * as arbitraries from './arbitraries'

const baseInformation: Information = {
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
  healthSavingsAccounts: []
}

describe('Health Savings Accounts', () => {
  it('shold not need form 8889 if there are no health savings accounts', () => {
    expect(
      needsF8889(baseInformation, baseInformation.taxPayer.primaryPerson)
    ).toEqual(false)
  })

  it('should have a max contribution limit when covered for all months', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'self-only',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(),
        endDate: new Date(CURRENT_YEAR, 11, 31).toISOString(),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    expect(f8889.fullYearHsa()).toEqual(true)
    expect(f8889.lastMonthCoverage()).toEqual('self-only')
    expect(f8889.contributionLimit()).toEqual(
      healthSavingsAccounts.contributionLimit['self-only']
    )
    expect(f8889.calculatedCoverageType).toEqual('self-only')
  })

  it('should give the right coverage amount', () => {
    fc.assert(
      fc.property(arbitraries.information, (information) => {
        if (
          information.taxPayer.primaryPerson !== undefined &&
          information.healthSavingsAccounts.length > 0
        ) {
          const f8889 = new F8889(
            information,
            information.taxPayer.primaryPerson
          )
          if (f8889.fullYearHsa()) {
            if (f8889.lastMonthCoverage() == 'self-only') {
              expect(f8889.contributionLimit()).toEqual(
                healthSavingsAccounts.contributionLimit['self-only']
              )
            } else {
              expect(f8889.contributionLimit()).toEqual(
                healthSavingsAccounts.contributionLimit['family']
              )
            }
          }
        }
      })
    )
  })

  it('should select family coverage when both are options', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'self-only',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(),
        endDate: new Date(CURRENT_YEAR, 11, 31).toISOString(),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'family',
        contributions: 7100,
        personRole: PersonRole.SPOUSE,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(),
        endDate: new Date(CURRENT_YEAR, 11, 31).toISOString(),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    expect(f8889.fullYearHsa()).toEqual(true)
    expect(f8889.lastMonthCoverage()).toEqual('family')
    expect(f8889.contributionLimit()).toEqual(
      healthSavingsAccounts.contributionLimit['family']
    )
    expect(f8889.calculatedCoverageType).toEqual('family')
  })

  it('should calculate a partial contribution limit correctly with a single HSA', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'family',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 5, 30).toISOString(), // Jun 30th
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    expect(f8889.fullYearHsa()).toEqual(false)
    expect(f8889.contributionLimit()).toEqual(
      Math.round((healthSavingsAccounts.contributionLimit['family'] * 6) / 12)
    )
    expect(f8889.calculatedCoverageType).toEqual('family')
  })

  it('should calculate a partial contribution limit correctly with a multiple HSA', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'family',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 5, 30).toISOString(), // Jun 30th
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 1750,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 6, 1).toISOString(), // Jul 1st
        endDate: new Date(CURRENT_YEAR, 10, 30).toISOString(), // Nov 30st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    expect(f8889.fullYearHsa()).toEqual(false)
    expect(f8889.contributionLimit()).toEqual(
      Math.round(
        (healthSavingsAccounts.contributionLimit['family'] * 6) / 12 +
          (healthSavingsAccounts.contributionLimit['self-only'] * 5) / 12
      )
    )
    expect(f8889.calculatedCoverageType).toEqual('family')
  })

  it('should calculate a partial contribution limit correctly with a multiple overlapping HSA', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'family',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 5, 30).toISOString(), // Jun 30th
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 1750,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 3, 1).toISOString(), // Apr 1st
        endDate: new Date(CURRENT_YEAR, 10, 30).toISOString(), // Nov 30st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    expect(f8889.fullYearHsa()).toEqual(false)
    expect(f8889.contributionLimit()).toEqual(
      Math.round(
        (healthSavingsAccounts.contributionLimit['family'] * 6) / 12 +
          (healthSavingsAccounts.contributionLimit['self-only'] * 5) / 12
      )
    )
    expect(f8889.calculatedCoverageType).toEqual('family')
  })

  it('should split the family contribution correctly', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'family',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1).toISOString(), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 4, 31).toISOString(), // May 31st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 1750,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 5, 1).toISOString(), // Jun 1st
        endDate: new Date(CURRENT_YEAR, 11, 31).toISOString(), // Dec 31st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f8889 = new F8889(information, information.taxPayer.primaryPerson)
    expect(f8889.splitFamilyContributionLimit()).toEqual(3550)
    expect(f8889.calculatedCoverageType).toEqual('self-only')
  })
})
