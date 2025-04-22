1. copy `src/forms/<year - 1>` to `src/forms/<year>`
2. change `CURRENT_YEAR` constant in `src/forms/<year>/data/federal.ts`
3. change the income limits for filing statuses in `src/forms/<year>/data/federal.ts`
4. change the standard deduction limits in `src/forms/<year>/data/federal.ts`
5. chage the long term capital gains tax rates in `src/forms/<year>/data/federal.ts`
6. add in the year to `TaxYears` in `src/core/data.ts`
7. in `redux/data.ts` add in the new year to `BlankYearTaxesState`
8. update `DEFAULT_TAX_YEAR` in `src/redux/reducer.ts`