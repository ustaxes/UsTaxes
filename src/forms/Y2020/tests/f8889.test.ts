/* eslint @typescript-eslint/no-empty-function: "off" */

import { FilingStatus, Income1099Type, PersonRole } from 'ustaxes/core/data'
import { CURRENT_YEAR, healthSavingsAccounts } from '../data/federal'
import F8889 from '../irsForms/F8889'
import { cloneDeep } from 'lodash'
import F1040 from '../irsForms/F1040'
import { blankState } from 'ustaxes/redux/reducer'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import { yearFormBuilder } from 'ustaxes/forms/YearForms'
import { run } from 'ustaxes/core/util'
import { commonTests } from '.'

const baseInformation: ValidatedInformation = {
  ...blankState,
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
      ssWages: 111,
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
      initial: 'PFN',
      lastName: 'payer-last-name',
      isTaxpayerDependent: false,
      isBlind: false,
      dateOfBirth: new Date(CURRENT_YEAR, 0, 1),
      role: PersonRole.PRIMARY,
      ssid: '111111111'
    },
    spouse: {
      firstName: 'spouse-first-name',
      initial: 'SFN',
      isTaxpayerDependent: false,
      lastName: 'spouse-last-name',
      role: PersonRole.SPOUSE,
      ssid: '222222222',
      isBlind: false,
      dateOfBirth: new Date(CURRENT_YEAR, 0, 1)
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
  it('should not need form 8889 if there are no health savings accounts', () => {
    const builder = yearFormBuilder('Y2020').build(baseInformation, [])
    const fs = run(builder.f1040()).orThrow()
    expect(commonTests.findF1040OrFail(fs).f8889.isNeeded()).toEqual(false)
  })

  it('should have a max contribution limit when covered for all months', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'self-only',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1),
        endDate: new Date(CURRENT_YEAR, 11, 31),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
    expect(f8889.fullYearHsa()).toEqual(true)
    expect(f8889.lastMonthCoverage()).toEqual('self-only')
    expect(f8889.contributionLimit()).toEqual(
      healthSavingsAccounts.contributionLimit['self-only']
    )
    expect(f8889.calculatedCoverageType).toEqual('self-only')
  })

  it('should select family coverage when both are options', () => {
    const information = cloneDeep(baseInformation)
    information.healthSavingsAccounts = [
      {
        coverageType: 'self-only',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1),
        endDate: new Date(CURRENT_YEAR, 11, 31),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'family',
        contributions: 7100,
        personRole: PersonRole.SPOUSE,
        startDate: new Date(CURRENT_YEAR, 0, 1),
        endDate: new Date(CURRENT_YEAR, 11, 31),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
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
        startDate: new Date(CURRENT_YEAR, 0, 1), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 5, 30), // Jun 30th
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
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
        startDate: new Date(CURRENT_YEAR, 0, 1), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 5, 30), // Jun 30th
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 1750,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 6, 1), // Jul 1st
        endDate: new Date(CURRENT_YEAR, 10, 30), // Nov 30st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
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
        startDate: new Date(CURRENT_YEAR, 0, 1), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 5, 30), // Jun 30th
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 1750,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 3, 1), // Apr 1st
        endDate: new Date(CURRENT_YEAR, 10, 30), // Nov 30st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]

    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
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
        startDate: new Date(CURRENT_YEAR, 0, 1), // Jan 1st
        endDate: new Date(CURRENT_YEAR, 4, 31), // May 31st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 1750,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 5, 1), // Jun 1st
        endDate: new Date(CURRENT_YEAR, 11, 31), // Dec 31st
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]
    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
    expect(f8889.splitFamilyContributionLimit()).toEqual(3550)
    expect(f8889.calculatedCoverageType).toEqual('self-only')
  })

  it('Should apply employer contributions to only the form belonging to the right person', () => {
    const information = cloneDeep(baseInformation)
    information.w2s[0].box12 = { W: 4000 } // The w2 belongs to the spouse
    information.healthSavingsAccounts = [
      {
        coverageType: 'self-only',
        contributions: 3550,
        personRole: PersonRole.PRIMARY,
        startDate: new Date(CURRENT_YEAR, 0, 1),
        endDate: new Date(CURRENT_YEAR, 11, 31),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      },
      {
        coverageType: 'self-only',
        contributions: 3550,
        personRole: PersonRole.SPOUSE,
        startDate: new Date(CURRENT_YEAR, 0, 1),
        endDate: new Date(CURRENT_YEAR, 11, 31),
        label: 'test',
        totalDistributions: 500,
        qualifiedDistributions: 500
      }
    ]
    const f1040 = new F1040(information)

    const f8889 = new F8889(f1040, information.taxPayer.primaryPerson)
    expect(f8889.l9()).toEqual(0)

    if (information.taxPayer.spouse !== undefined) {
      const f8889spouse = new F8889(f1040, information.taxPayer.spouse)
      expect(f8889spouse.l9()).toEqual(4000)
    }
  })
})
