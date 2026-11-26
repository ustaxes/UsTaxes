import type { IncomeW2 } from 'ustaxes/core/data'
import { PersonRole } from 'ustaxes/core/data'
import type { SSTaxLimits } from 'ustaxes/core/irsForms/excessSSTax'
import {
  claimableExcessSSTax,
  excessSSTaxWithholding
} from 'ustaxes/core/irsForms/excessSSTax'
import { fica as fica2020 } from 'ustaxes/forms/Y2020/data/federal'
import { fica as fica2021 } from 'ustaxes/forms/Y2021/data/federal'
import { fica as fica2022 } from 'ustaxes/forms/Y2022/data/federal'
import { fica as fica2023 } from 'ustaxes/forms/Y2023/data/federal'
import { fica as fica2024 } from 'ustaxes/forms/Y2024/data/federal'
import { fica as fica2025 } from 'ustaxes/forms/Y2025/data/federal'

const employerA = { EIN: '111111111', employerName: 'employer A' }
const employerB = { EIN: '222222222', employerName: 'employer B' }

const w2 = (fields: Partial<IncomeW2>): IncomeW2 => ({
  employer: employerA,
  personRole: PersonRole.PRIMARY,
  occupation: '',
  state: 'AL',
  income: 0,
  medicareIncome: 0,
  fedWithholding: 0,
  ssWages: 0,
  ssWithholding: 0,
  medicareWithholding: 0,
  stateWages: 0,
  stateWithholding: 0,
  ...fields
})

describe.each([
  [2020, fica2020],
  [2021, fica2021],
  [2022, fica2022],
  [2023, fica2023],
  [2024, fica2024],
  [2025, fica2025]
] as [number, SSTaxLimits][])('excess SS withholding %i', (_year, limits) => {
  const { maxSSTax: max, maxIncomeSSTaxApplies: base } = limits
  const claim = (w2s: IncomeW2[]): number => claimableExcessSSTax(w2s, limits)

  it('allows the excess with two employers and wages over the wage base', () => {
    expect(
      claim([
        w2({ ssWages: base, ssWithholding: max }),
        w2({ employer: employerB, ssWages: 20000, ssWithholding: 1000 })
      ])
    ).toBeCloseTo(1000, 2)
  })

  it('denies the excess when wages are at or below the wage base', () => {
    expect(
      claim([
        w2({ ssWages: 10000, ssWithholding: 1000 }),
        w2({ employer: employerB, ssWages: 10000, ssWithholding: max })
      ])
    ).toEqual(0)
  })

  it('treats W-2s with the same EIN as one employer', () => {
    expect(
      claim([
        w2({ ssWages: base, ssWithholding: max - 1000 }),
        w2({ ssWages: 20000, ssWithholding: 3000 })
      ])
    ).toEqual(0)
  })

  it('still allows the excess from other employers when one withheld over the max', () => {
    expect(
      claim([
        w2({ ssWages: base, ssWithholding: max + 500 }),
        w2({ employer: employerB, ssWages: 20000, ssWithholding: 3000 })
      ])
    ).toBeCloseTo(3000, 2)
  })

  it('counts social security tips (via box 5) in the wage test', () => {
    // Box 3 totals base - 10,000; tips bring box 5 over the base.
    const half = (base - 10000) / 2
    expect(
      claim([
        w2({ ssWages: half, medicareIncome: half + 7500, ssWithholding: 6000 }),
        w2({
          employer: employerB,
          ssWages: half,
          medicareIncome: half + 7500,
          ssWithholding: 6000
        })
      ])
    ).toBeCloseTo(12000 - max, 2)
  })

  it('does not count Medicare-only wages from W-2s without SS withholding', () => {
    expect(
      claim([
        w2({
          employer: { EIN: '333333333', employerName: 'state government' },
          medicareIncome: base + 10000
        }),
        w2({ ssWages: 7500, medicareIncome: 7500, ssWithholding: max / 2 }),
        w2({
          employer: employerB,
          ssWages: 7500,
          medicareIncome: 7500,
          ssWithholding: max / 2 + 500
        })
      ])
    ).toEqual(0)
  })

  it('falls back to box 1 when boxes 3 and 5 are blank', () => {
    expect(
      claim([
        w2({ income: 10000, ssWithholding: 1000 }),
        w2({ employer: employerB, income: 10000, ssWithholding: max })
      ])
    ).toEqual(0)
    expect(
      claim([
        w2({ income: base, ssWithholding: 6000 }),
        w2({ employer: employerB, income: 20000, ssWithholding: 6000 })
      ])
    ).toBeCloseTo(12000 - max, 2)
  })

  it('figures the excess separately for each spouse', () => {
    const half = (personRole: PersonRole.PRIMARY | PersonRole.SPOUSE) => [
      w2({ personRole, ssWages: base, ssWithholding: max }),
      w2({
        personRole,
        employer: employerB,
        ssWages: 20000,
        ssWithholding: 1000
      })
    ]
    const w2s = [...half(PersonRole.PRIMARY), ...half(PersonRole.SPOUSE)]
    expect(excessSSTaxWithholding(w2s, PersonRole.PRIMARY, limits)).toBeCloseTo(
      1000,
      2
    )
    expect(excessSSTaxWithholding(w2s, PersonRole.SPOUSE, limits)).toBeCloseTo(
      1000,
      2
    )
    expect(claim(w2s)).toBeCloseTo(2000, 2)

    // Pooled the couple is over the max, but neither spouse is individually.
    expect(
      claim([
        w2({ ssWages: base, ssWithholding: max - 1000 }),
        w2({
          personRole: PersonRole.SPOUSE,
          employer: employerB,
          ssWages: base,
          ssWithholding: 2000
        })
      ])
    ).toEqual(0)
  })
})
