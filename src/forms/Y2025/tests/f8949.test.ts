import F1040 from '../irsForms/F1040'
import {
  Asset,
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole
} from 'ustaxes/core/data'
import { CURRENT_YEAR } from '../data/federal'
import { validate } from 'ustaxes/forms/F1040Base'
import { run } from 'ustaxes/core/util'
import { blankState } from 'ustaxes/redux/reducer'

const testInfo: Information = {
  ...blankState,
  taxPayer: {
    filingStatus: FilingStatus.S,
    primaryPerson: {
      firstName: 'Test',
      lastName: 'User',
      ssid: '123456789',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date('1990-01-01'),
      isTaxpayerDependent: false,
      address: {
        address: '123 Main St',
        city: 'Anytown',
        state: 'TX',
        zip: '12345'
      }
    },
    dependents: []
  }
}

const makeAsset = (positionType: Asset<Date>['positionType']): Asset<Date> => ({
  name: `test ${positionType}`,
  positionType,
  // Open 2+ years ago so short/long term tests are unambiguous
  openDate: new Date(CURRENT_YEAR - 2, 0, 1),
  closeDate: new Date(CURRENT_YEAR, 6, 1),
  openPrice: 100,
  openFee: 0,
  closePrice: 200,
  quantity: 1
})

const makeF1040 = (
  assets: Asset<Date>[],
  info: Information = testInfo
): F1040 =>
  run(validate(info)).fold(
    (errors) => {
      throw new Error(`Validation failed: ${String(errors)}`)
    },
    (validInfo) => new F1040(validInfo, assets)
  )

describe('F8949 (2025)', () => {
  describe('asset group routing', () => {
    it('non-digital sales are picked up by the non-digital f8949', () => {
      const f1040 = makeF1040([makeAsset('Security')])
      expect(f1040.f8949.isNeeded()).toBe(true)
      expect(f1040.f8949Digital.isNeeded()).toBe(false)
    })

    it('digital asset sales are picked up by the digital f8949', () => {
      const f1040 = makeF1040([makeAsset('Digital Asset')])
      expect(f1040.f8949.isNeeded()).toBe(false)
      expect(f1040.f8949Digital.isNeeded()).toBe(true)
    })

    it('real estate is treated as non-digital', () => {
      const f1040 = makeF1040([makeAsset('Real Estate')])
      expect(f1040.f8949.isNeeded()).toBe(true)
      expect(f1040.f8949Digital.isNeeded()).toBe(false)
    })

    it('mixed assets are split across both f8949 instances', () => {
      const f1040 = makeF1040([
        makeAsset('Security'),
        makeAsset('Digital Asset')
      ])
      expect(f1040.f8949.isNeeded()).toBe(true)
      expect(f1040.f8949Digital.isNeeded()).toBe(true)
    })
  })

  describe('checkbox routing', () => {
    it('non-digital f8949 checks Box C (short-term) and Box F (long-term)', () => {
      const f8949 = makeF1040([makeAsset('Security')]).f8949
      expect(f8949.part1BoxC()).toBe(true)
      expect(f8949.part1BoxI()).toBe(false)
      expect(f8949.part2BoxF()).toBe(true)
      expect(f8949.part2BoxL()).toBe(false)
    })

    it('digital f8949 checks Box I (short-term) and Box L (long-term)', () => {
      const f8949Digital = makeF1040([makeAsset('Digital Asset')]).f8949Digital
      expect(f8949Digital.part1BoxI()).toBe(true)
      expect(f8949Digital.part1BoxC()).toBe(false)
      expect(f8949Digital.part2BoxL()).toBe(true)
      expect(f8949Digital.part2BoxF()).toBe(false)
    })
  })

  describe('PDF field structure', () => {
    it('fields() returns 202 values matching the 2025 form layout', () => {
      // Per part: 2 header + 6 checkboxes (A/B/C/G/H/I) + 11 rows × 8 cols + 5 totals = 101
      // Two parts (short-term + long-term) = 202 total
      const f8949 = makeF1040([makeAsset('Security')]).f8949
      expect(f8949.fields()).toHaveLength(202)
    })
  })

  describe('f8949s collection on F1040', () => {
    it('includes both groups when both asset types are present', () => {
      const f1040 = makeF1040([
        makeAsset('Security'),
        makeAsset('Digital Asset')
      ])
      const groups = f1040.f8949s
        .filter((f) => f.isNeeded())
        .map((f) => f.group)
      expect(groups).toContain('non-digital')
      expect(groups).toContain('digital')
    })
  })

  describe('Schedule D integration', () => {
    it('l3f8949s includes Box I (digital unreported) forms feeding line 3', () => {
      const f1040 = makeF1040([makeAsset('Digital Asset')])
      const l3forms = f1040.scheduleD.l3f8949s()
      expect(l3forms.some((f) => f.part1BoxI())).toBe(true)
    })

    it('l10f8949s includes Box L (digital unreported) forms feeding line 10', () => {
      const f1040 = makeF1040([makeAsset('Digital Asset')])
      const l10forms = f1040.scheduleD.l10f8949s()
      expect(l10forms.some((f) => f.part2BoxL())).toBe(true)
    })

    it('1099-DA proceeds are aggregated into Schedule D line 1a', () => {
      const infoWithDA: Information = {
        ...testInfo,
        f1099s: [
          {
            payer: 'Coinbase',
            type: Income1099Type.DA,
            form: {
              shortTermProceeds: 5000,
              shortTermCostBasis: 3000,
              longTermProceeds: 10000,
              longTermCostBasis: 6000
            },
            personRole: PersonRole.PRIMARY
          }
        ]
      }
      const f1040 = makeF1040([], infoWithDA)
      expect(f1040.scheduleD.l1ad()).toBe(5000)
      expect(f1040.scheduleD.l1ae()).toBe(3000)
      expect(f1040.scheduleD.l8ad()).toBe(10000)
      expect(f1040.scheduleD.l8ae()).toBe(6000)
    })

    it('Schedule D is needed when there are only 1099-DA forms', () => {
      const infoWithDA: Information = {
        ...testInfo,
        f1099s: [
          {
            payer: 'Coinbase',
            type: Income1099Type.DA,
            form: {
              shortTermProceeds: 1000,
              shortTermCostBasis: 500,
              longTermProceeds: 2000,
              longTermCostBasis: 1000
            },
            personRole: PersonRole.PRIMARY
          }
        ]
      }
      const f1040 = makeF1040([], infoWithDA)
      expect(f1040.scheduleD.isNeeded()).toBe(true)
    })

    it('1099-DA and 1099-B proceeds are combined on line 1a', () => {
      const infoWithBoth: Information = {
        ...testInfo,
        f1099s: [
          {
            payer: 'Broker',
            type: Income1099Type.B,
            form: {
              shortTermProceeds: 2000,
              shortTermCostBasis: 1000,
              longTermProceeds: 4000,
              longTermCostBasis: 2000
            },
            personRole: PersonRole.PRIMARY
          },
          {
            payer: 'Coinbase',
            type: Income1099Type.DA,
            form: {
              shortTermProceeds: 3000,
              shortTermCostBasis: 1500,
              longTermProceeds: 6000,
              longTermCostBasis: 3000
            },
            personRole: PersonRole.PRIMARY
          }
        ]
      }
      const f1040 = makeF1040([], infoWithBoth)
      expect(f1040.scheduleD.l1ad()).toBe(5000) // 2000 + 3000
      expect(f1040.scheduleD.l8ad()).toBe(10000) // 4000 + 6000
    })
  })
})
