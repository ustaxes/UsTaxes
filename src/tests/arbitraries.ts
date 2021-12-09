import * as fc from 'fast-check'
import * as util from 'ustaxes-core/util'
import * as arbitraries from 'ustaxes-core/tests/arbitraries'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYear, TaxYears } from 'ustaxes/data'

export const taxYear: fc.Arbitrary<TaxYear> = fc.constantFrom(
  ...util.enumKeys(TaxYears)
)

export const taxYearNumber: fc.Arbitrary<number> = taxYear.map(
  (y) => TaxYears[y]
)

export const taxesState: fc.Arbitrary<YearsTaxesState> = taxYear.chain(
  (activeYear) => {
    const information = arbitraries.forYear(TaxYears[activeYear]).information()

    return fc
      .tuple(information, information, information)
      .map(([Y2019, Y2020, Y2021]) => ({
        Y2019,
        Y2020,
        Y2021,
        activeYear
      }))
  }
)
