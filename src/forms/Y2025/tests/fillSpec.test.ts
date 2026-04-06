import {
  AccountType,
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole,
  Supported1099
} from 'ustaxes/core/data'
import { isRight } from 'ustaxes/core/util'
import { create1040 } from '../irsForms/Main'
import F1040 from '../irsForms/F1040'

/**
 * End-to-end integration test using data from Islam_1040_TY2025_Fill_Spec.md.
 * Verifies that the Y2025 tax engine produces the expected values for a
 * concrete return: single filer, two W-2s, 1099-INT, 1099-DIV, and
 * 1099-B (short-term with wash-sale-adjusted cost basis).
 *
 * Note: IRS forms display whole-dollar amounts (Math.round), but the raw
 * computation methods return full-precision floats. Tests below compare
 * raw values; use closeTo(x, 0) for cent-level precision.
 */

const f1099s: Supported1099[] = [
  {
    payer: 'Robinhood Securities LLC',
    type: Income1099Type.INT,
    personRole: PersonRole.PRIMARY,
    form: { income: 35.01 }
  },
  {
    payer: 'Robinhood Markets Inc (Robinhood Securities LLC)',
    type: Income1099Type.DIV,
    personRole: PersonRole.PRIMARY,
    form: {
      dividends: 2.3,
      qualifiedDividends: 2.3,
      totalCapitalGainsDistributions: 0
    }
  },
  {
    // Net (wash-sale-adjusted) proceeds - cost: 126638.83 - 119363.86 = 7274.97
    payer: 'Robinhood Securities LLC',
    type: Income1099Type.B,
    personRole: PersonRole.PRIMARY,
    form: {
      shortTermProceeds: 126638.83,
      shortTermCostBasis: 119363.86,
      longTermProceeds: 0,
      longTermCostBasis: 0
    }
  }
]

const info: Information = {
  f1099s,
  w2s: [
    {
      occupation: '',
      income: 15262.6,
      medicareIncome: 0,
      fedWithholding: 1732.63,
      ssWages: 0,
      ssWithholding: 0,
      medicareWithholding: 0,
      employer: {
        EIN: '24-0795445',
        employerName: 'Lehigh University'
      },
      personRole: PersonRole.PRIMARY,
      state: 'PA',
      stateWages: 1237.6,
      stateWithholding: 37.99
    },
    {
      occupation: '',
      income: 41162.41,
      medicareIncome: 43188.33,
      fedWithholding: 6834.76,
      ssWages: 43188.33,
      ssWithholding: 2677.68,
      medicareWithholding: 626.23,
      employer: {
        EIN: '20-5624386',
        employerName: 'Lawrence Livermore National Security LLC'
      },
      personRole: PersonRole.PRIMARY,
      state: 'CA',
      stateWages: 38902.06,
      stateWithholding: 2486.02
    }
  ],
  estimatedTaxes: [],
  realEstate: [],
  taxPayer: {
    filingStatus: FilingStatus.S,
    primaryPerson: {
      firstName: 'Md Khayrul',
      lastName: 'Islam',
      ssid: '693702494',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date(1995, 7, 28),
      address: {
        address: '975 Murrieta Blvd',
        aptNo: 'Apt 10',
        city: 'Livermore',
        state: 'CA',
        zip: '94550'
      },
      isTaxpayerDependent: false
    },
    dependents: [],
    contactPhoneNumber: '(484) 935-9363',
    contactEmail: 'islam11@llnl.gov'
  },
  questions: {
    CRYPTO: false,
    FOREIGN_ACCOUNT_EXISTS: false,
    FINCEN_114: false,
    FOREIGN_TRUST_RELATIONSHIP: false
  },
  f1098es: [],
  f3921s: [],
  scheduleK1Form1065s: [],
  itemizedDeductions: undefined,
  stateResidencies: [{ state: 'CA' }],
  healthSavingsAccounts: [],
  credits: [],
  individualRetirementArrangements: [],
  refund: {
    routingNumber: '031005503',
    accountNumber: '528993284',
    accountType: AccountType.checking
  }
}

// Compare raw float value to expected with 2 decimal precision
const near = (v: number | undefined, expected: number) =>
  expect(v).toBeCloseTo(expected, 2)

describe('TY2025 Fill Spec — Islam return', () => {
  let f1040: F1040

  beforeAll(() => {
    const result = create1040(info, [])
    expect(isRight(result)).toBe(true)
    if (!isRight(result)) throw new Error('create1040 failed')
    f1040 = result.right[0]
  })

  describe('Form 1040 Page 1 — Income', () => {
    it('line 1a: W-2 wages', () => near(f1040.l1a(), 56425.01))
    it('line 1z: total wages', () => near(f1040.l1z(), 56425.01))
    it('line 2b: taxable interest', () => near(f1040.l2b(), 35.01))
    it('line 3a: qualified dividends', () => near(f1040.l3a(), 2.3))
    it('line 3b: ordinary dividends', () => near(f1040.l3b(), 2.3))
    it('line 7: capital gain', () => near(f1040.l7(), 7274.97))
    it('line 8: other income = 0', () => near(f1040.l8(), 0))
    it('line 9: total income', () => near(f1040.l9(), 63737.29))
    it('line 10: adjustments = 0', () => near(f1040.l10(), 0))
    it('line 11: AGI', () => near(f1040.l11(), 63737.29))
  })

  describe('Form 1040 Page 2 — Tax, Credits, Payments', () => {
    it('line 12: standard deduction', () => expect(f1040.l12()).toBe(15750))
    it('line 14: total deductions', () => expect(f1040.l14()).toBe(15750))
    it('line 15: taxable income', () => near(f1040.l15(), 47987.29))
    it('line 16: tax ≈ 5518.50', () => {
      const tax = f1040.l16() ?? 0
      expect(tax).toBeGreaterThanOrEqual(5518)
      expect(tax).toBeLessThanOrEqual(5519)
    })
    it('line 17: Sch 2 line 3 = 0', () => expect(f1040.l17()).toBe(0))
    it('line 18 = 16 + 17', () => {
      near(f1040.l18(), (f1040.l16() ?? 0) + (f1040.l17() ?? 0))
    })
    it('line 19: child tax credit = 0', () => expect(f1040.l19()).toBe(0))
    it('line 21: credits = 0', () => expect(f1040.l21()).toBe(0))
    it('line 22 = 18 - 21', () => near(f1040.l22(), f1040.l18()))
    it('line 23: other taxes = 0', () => expect(f1040.l23()).toBe(0))
    it('line 24 = 22 + 23', () => near(f1040.l24(), f1040.l22()))
    it('line 25a: W-2 withholding', () => near(f1040.l25a(), 8567.39))
    it('line 25d: total withholding', () => near(f1040.l25d(), 8567.39))
    it('line 33: total payments', () => near(f1040.l33(), 8567.39))
    it('line 34: overpaid', () => near(f1040.l34(), 3048.89))
  })

  describe('Schedule B — Interest and Dividends', () => {
    it('line 2: interest total', () => near(f1040.scheduleB.l2(), 35.01))
    it('line 6: dividend total', () => near(f1040.scheduleB.l6(), 2.3))
    it('line 4: taxable interest', () => near(f1040.scheduleB.l4(), 35.01))
    it('to1040l2b', () => near(f1040.scheduleB.to1040l2b(), 35.01))
    it('to1040l3b', () => near(f1040.scheduleB.to1040l3b(), 2.3))
    it('foreign account = No', () =>
      expect(f1040.scheduleB.foreignAccount()).toBe(false))
    it('foreign trust = No', () =>
      expect(f1040.scheduleB.foreignTrust()).toBe(false))
  })

  describe('Schedule D — Capital Gains', () => {
    it('line 1a proceeds', () => near(f1040.scheduleD.l1ad(), 126638.83))
    it('line 1a cost basis', () => near(f1040.scheduleD.l1ae(), 119363.86))
    it('line 1a gain', () => near(f1040.scheduleD.l1ah(), 7274.97))
    it('line 7: total short-term', () => near(f1040.scheduleD.l7(), 7274.97))
    it('line 15: total long-term = 0', () =>
      expect(f1040.scheduleD.l15()).toBe(0))
    it('line 16: net gain', () => near(f1040.scheduleD.l16(), 7274.97))
    it('line 17: both gains = false (l15=0)', () =>
      expect(f1040.scheduleD.l17()).toBe(false))
    it('to1040 = l16', () => near(f1040.scheduleD.to1040(), 7274.97))
  })

  describe('Schedule 2 — Additional Taxes', () => {
    it('line 3 (to 1040 line 17) = 0', () =>
      expect(f1040.schedule2.l3()).toBe(0))
    it('line 21 (to 1040 line 23) = 0', () =>
      expect(f1040.schedule2.l21()).toBe(0))
  })

  describe('Verification checksums', () => {
    it('line 9 = 1z + 2b + 3b + 7a', () => {
      const expected =
        f1040.l1z() +
        (f1040.l2b() ?? 0) +
        (f1040.l3b() ?? 0) +
        (f1040.l7() ?? 0)
      near(f1040.l9(), expected)
    })
    it('line 15 = 11 - 14', () => {
      near(f1040.l15(), f1040.l11() - f1040.l14())
    })
    it('line 34 = 33 - 24', () => {
      near(f1040.l34(), f1040.l33() - f1040.l24())
    })
    it('W-2 withholding = Lehigh box2 + LLNL box2', () => {
      near(f1040.l25a(), 1732.63 + 6834.76)
    })
    it('Sch D gain = proceeds - cost', () => {
      near(
        (f1040.scheduleD.l1ad() ?? 0) - (f1040.scheduleD.l1ae() ?? 0),
        7274.97
      )
    })
  })
})
