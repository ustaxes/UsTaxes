# Mechanical changes needed to get new year in the UI

1. copy `src/forms/<year - 1>` to `src/forms/<year>`
2. change `CURRENT_YEAR` constant in `src/forms/<year>/data/federal.ts`
3. change the income limits for filing statuses in `src/forms/<year>/data/federal.ts`
4. change the standard deduction limits in `src/forms/<year>/data/federal.ts`
5. chage the long term capital gains tax rates in `src/forms/<year>/data/federal.ts`
6. add in the year to `TaxYears` in `src/core/data.ts`
7. in `redux/data.ts` add in the new year to `BlankYearTaxesState`
8. update `DEFAULT_TAX_YEAR` in `src/redux/reducer.ts`
9. update `rootReducer` in `src/redux/reducer.ts`
10. update imports to add new year in `src/forms/YearForms.ts`
11. Add in new year to `configs` in `src/forms/YearForms.ts`
12. update `taxesState` in `src/tests/arbitraries.ts`

# Update any forms

Many forms will remain the same between years but some will get big overhauls.
The easiest way is to scan through them visually between the previous year
and the new one to see if you can spot big differences. For each of the forms
that require changes edit `src/forms/<year>/irsForms/<form>.ts` and update the business logic.
