import * as fc from 'fast-check'
import * as util from 'ustaxes/forms/Y2020/util'
import { information } from 'ustaxes/forms/Y2020/tests/arbitraries'
import { YearsTaxesState, TaxYear, TaxYears } from 'ustaxes/redux'

export const taxYear: fc.Arbitrary<TaxYear> = fc.constantFrom(
  ...util.enumKeys(TaxYears)
)

export const taxesState: fc.Arbitrary<YearsTaxesState> = taxYear.chain(
  (activeYear) =>
    fc
      .tuple(information, information, information)
      .map(([Y2019, Y2020, Y2021]) => ({
        Y2019,
        Y2020,
        Y2021,
        activeYear
      }))
)
