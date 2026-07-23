import {
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole,
  Supported1099
} from 'ustaxes/core/data'
import { isLeft } from 'ustaxes/core/util'
import { create1040 } from '../../irsForms/Main'
import { createStateReturn } from '../../stateForms'
import CA540 from '../../stateForms/CA/CA540'
import { blankState } from 'ustaxes/redux/reducer'

/**
 * Golden test: reproduces a real 2025 California resident return
 * (single filer, tech W-2 with RSUs and employer HSA, brokerage
 * interest/dividends, net capital loss capped at -3,000, renter over
 * the AGI limit) and asserts every computed Form 540 line against the
 * values from the filed return.
 *
 * Federal reference values: 1040 line 1z 910,733; 2b 3,739; 3b 20,770;
 * 7 -3,000; 9/11b 932,242. Schedule D line 7 -8,095, line 15 -1,223.
 */

const f1099s: Supported1099[] = [
  {
    payer: 'Broker INT 1',
    type: Income1099Type.INT,
    personRole: PersonRole.PRIMARY,
    form: { income: 1591.24 }
  },
  {
    payer: 'Broker INT 2',
    type: Income1099Type.INT,
    personRole: PersonRole.PRIMARY,
    form: { income: 946.78 }
  },
  {
    // Remaining interest so federal 2b totals 3,739
    payer: 'Broker INT 3',
    type: Income1099Type.INT,
    personRole: PersonRole.PRIMARY,
    form: { income: 1200.98 }
  },
  {
    payer: 'Broker DIV 1',
    type: Income1099Type.DIV,
    personRole: PersonRole.PRIMARY,
    form: {
      dividends: 4116.25,
      qualifiedDividends: 3851.99,
      totalCapitalGainsDistributions: 0
    }
  },
  {
    // Money market fund dividends so federal 3b totals 20,770
    payer: 'Broker DIV 2',
    type: Income1099Type.DIV,
    personRole: PersonRole.PRIMARY,
    form: {
      dividends: 16653.75,
      qualifiedDividends: 0,
      totalCapitalGainsDistributions: 0
    }
  },
  {
    // Nets to Schedule D line 7 = -8,095 (short), line 15 = -1,223 (long)
    payer: 'Broker B',
    type: Income1099Type.B,
    personRole: PersonRole.PRIMARY,
    form: {
      shortTermProceeds: 10000,
      shortTermCostBasis: 18095,
      longTermProceeds: 5000,
      longTermCostBasis: 6223
    }
  }
]

const info: Information = {
  ...blankState,
  taxPayer: {
    filingStatus: FilingStatus.S,
    primaryPerson: {
      firstName: 'Golden',
      lastName: 'Payer',
      ssid: '123456789',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date('1997-07-30'),
      isTaxpayerDependent: false,
      address: {
        address: '1 Test Way',
        city: 'San Francisco',
        state: 'CA',
        zip: '94100'
      }
    },
    dependents: []
  },
  w2s: [
    {
      occupation: 'Engineer',
      income: 910733.46,
      medicareIncome: 934233.46,
      fedWithholding: 280000,
      ssWages: 176100,
      ssWithholding: 10918.2,
      medicareWithholding: 20154.48,
      personRole: PersonRole.PRIMARY,
      state: 'CA',
      stateWages: 915033.46,
      stateWithholding: 86822.3,
      box12: { C: 395.28, D: 23500, W: 4300, DD: 9258.24 }
    }
  ],
  f1099s,
  stateResidencies: [{ state: 'CA' }],
  caStateInfo: {
    qualifiesForRentersCredit: true,
    monthsWithoutHealthCoverage: 0,
    usGovObligationInterest: 841
  }
}

describe('CA 2025 golden return', () => {
  const build = (): CA540 => {
    const f1040Result = create1040(info, [])
    if (isLeft(f1040Result)) {
      throw new Error(f1040Result.left.join(';'))
    }
    const [f1040] = f1040Result.right
    const stateResult = createStateReturn(f1040)
    if (isLeft(stateResult)) {
      throw new Error(stateResult.left.join(';'))
    }
    const ca540 = stateResult.right.find((f) => f.formName === '540')
    if (ca540 === undefined) throw new Error('no 540 produced')
    return ca540 as CA540
  }

  it('reproduces the federal reference values', () => {
    const ca540 = build()
    const f1040 = ca540.f1040
    expect(Math.round(f1040.l1z())).toBe(910733)
    expect(Math.round(f1040.l2b() ?? 0)).toBe(3739)
    expect(Math.round(f1040.l3b() ?? 0)).toBe(20770)
    expect(Math.round(f1040.l7a() ?? 0)).toBe(-3000)
    expect(Math.round(f1040.scheduleD.l7())).toBe(-8095)
    expect(Math.round(f1040.scheduleD.l15())).toBe(-1223)
    expect(Math.round(f1040.l11b())).toBe(932242)
  })

  it('matches every filed Form 540 line', () => {
    const ca540 = build()
    expect(Math.round(ca540.l12())).toBe(915033)
    expect(Math.round(ca540.l13())).toBe(932242)
    expect(Math.round(ca540.l14())).toBe(841)
    expect(Math.round(ca540.l16())).toBe(4300)
    expect(Math.round(ca540.l17())).toBe(935701)
    expect(Math.round(ca540.l18())).toBe(5706)
    expect(Math.round(ca540.l19())).toBe(929995)
    expect(ca540.l31()).toBe(95226)
    expect(ca540.l32()).toBe(0)
    expect(ca540.l46() ?? 0).toBe(0)
    expect(ca540.l62()).toBe(0)
    expect(Math.round(ca540.l64())).toBe(95226)
    expect(Math.round(ca540.l71())).toBe(86822)
    expect(ca540.l72() ?? 0).toBe(0)
    expect(Math.round(ca540.l78())).toBe(86822)
    expect(ca540.l92()).toBe(0)
    expect(ca540.fullYearCoverage()).toBe(true)
    // Balance due
    expect(Math.round(ca540.l111() ?? 0)).toBe(8404)
    expect(ca540.l115()).toBe(0)
  })
})
