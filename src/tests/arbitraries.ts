import * as fc from 'fast-check'
import * as util from 'ustaxes/core/util'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYear, TaxYears } from 'ustaxes/data'
import prand from 'pure-rand'
import { Asset, AssetType } from 'ustaxes/core/data'

export const taxYear: fc.Arbitrary<TaxYear> = fc.constantFrom(
  ...util.enumKeys(TaxYears)
)

export const taxYearNumber: fc.Arbitrary<number> = taxYear.map(
  (y) => TaxYears[y]
)

const dateInYear = (year: number) =>
  fc.date({ min: new Date(year, 0, 1), max: new Date(year, 11, 31) })
const taxYearDate = taxYearNumber.chain(dateInYear)

const orUndefined = <T>(arb: fc.Arbitrary<T>) =>
  fc.oneof(arb, fc.constant(undefined))

export const positionDate: fc.Arbitrary<Asset<Date>> = fc
  .tuple(
    fc.date(),
    orUndefined(taxYearDate),
    fc.oneof(
      fc.constant<AssetType>('Security'),
      fc.constant<AssetType>('Real Estate')
    )
  )
  .chain(([openDate, closeDate, positionType]) =>
    fc
      .tuple(
        arbitraries.word,
        orUndefined(fc.date({ min: openDate })),
        fc.nat(),
        fc.nat(),
        fc.nat(),
        arbitraries.state
      )
      .map(([name, giftedDate, openPrice, closePrice, quantity, state]) => ({
        name,
        openDate,
        closeDate,
        giftedDate: closeDate === undefined ? giftedDate : undefined,
        openPrice,
        closePrice,
        positionType,
        quantity: positionType === 'Real Estate' ? 1 : quantity,
        state
      }))
  )

export const position: fc.Arbitrary<Asset<string>> = positionDate.map((p) => ({
  ...p,
  openDate: p.openDate.toISOString(),
  closeDate: p.closeDate?.toISOString(),
  giftedDate: p.giftedDate?.toISOString()
}))

export const taxesState: fc.Arbitrary<YearsTaxesState> = taxYear.chain(
  (activeYear) => {
    const information = arbitraries.forYear(TaxYears[activeYear]).information()

    return fc
      .tuple(fc.array(positionDate), information, information, information)
      .map(([assets, Y2019, Y2020, Y2021]) => ({
        assets,
        Y2019,
        Y2020,
        Y2021,
        activeYear
      }))
  }
)

const gen = new fc.Random(prand.mersenne(new Date().getMilliseconds()))

export const justOneState = (): YearsTaxesState =>
  taxesState.noShrink().generate(gen).value
