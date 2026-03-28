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

For how the PDF fill pipeline fits together (legacy positional bridge vs `fillInstructions()`, schemas, strict mode, and tests), see [pdf-form-filling.md](pdf-form-filling.md).

# Download IRS PDF Forms

The app fetches IRS PDFs at runtime from `public/forms/<year>/irs/<tag>.pdf`, so
the PDFs must be present before any schema extraction or fill testing can run.

1. Create the directory: `public/forms/Y<year>/irs/`
2. Download each form from the IRS website:
   ```
   https://www.irs.gov/pub/irs-pdf/fXXXX.pdf
   ```
   Save each file as `public/forms/Y<year>/irs/fXXXX.pdf` (lower-case tag, matching the form's `tag` property).
3. Update `public/catalogs.json`: under `latest.irs`, add an entry for each new form mapping its key (lower-case tag, e.g. `"f1040"`) to its IRS download URL (e.g. `"https://www.irs.gov/pub/irs-pdf/f1040.pdf"`). There is only a single `latest` key — not a per-year key — so you are extending the existing `latest.irs` object, not adding a parallel year-keyed block.

# Extract PDF Schemas

With the name-based fill system, every form that implements `fillInstructions()` must
have a matching JSON schema in `schemas/Y<year>/`. The schema captures each AcroForm
field's name and type, and is the source of truth for contract tests and CI.

```bash
# Run once per form (or per PDF that changed):
npm run extract-schema public/forms/Y<year>/irs/fXXXX.pdf schemas/Y<year>
# Produces: schemas/Y<year>/fXXXX.json
```

After adding all schemas, add corresponding `extract-schema` calls for the new year
to the **"Extract PDF schemas"** step in `.github/workflows/ci.yml`, mirroring the
pattern used for Y2024.

# Generate or Update Form Classes

For any form that is new or has changed its field layout since the previous year:

```bash
# Generate a skeleton from the PDF (writes to stdout — redirect to the target file):
npm run formgen public/forms/Y<year>/irs/fXXXX.pdf > src/forms/Y<year>/irsForms/FXXXX.ts
```

The skeleton includes a pre-populated `fillInstructions()` with every AcroForm field
already wired to its name and kind. You still need to supply the correct TypeScript
values from the form's business logic.

For forms that carried over from the previous year with only minor field changes,
it is faster to diff the extracted schema JSONs directly rather than scanning PDFs
visually:

```bash
diff schemas/Y<prev-year>/fXXXX.json schemas/Y<year>/fXXXX.json
```

Any added, removed, or renamed fields will appear in the diff. Update
`fillInstructions()` in the form class to match, then proceed to validation below.

# Validate Field Coverage with Contract Tests

After implementing or updating `fillInstructions()` for each form, run the contract
test suite to verify three invariants automatically:

1. **TS→PDF**: every instruction field name exists in the extracted schema — catches
   typos and references to fields the IRS renamed.
2. **PDF→TS**: every schema field is either handled by `fillInstructions()` or
   explicitly listed in the form's `ALLOWLIST` entry in `contractTests.test.ts` —
   catches fields the IRS added that the form class hasn't handled yet.
3. **Type alignment**: each instruction's `kind` (`text` / `checkbox` / `radio`)
   matches the schema field type — catches cases where the IRS changed a field from
   one widget type to another.

```bash
npm test -- contractTests
```

If invariant 2 fails for fields you intentionally do not fill (e.g. barcode
fields, watermark annotations), add those field names to the form's entry in the
`ALLOWLIST` map at the top of `contractTests.test.ts`.

# Update any forms

Many forms will remain the same between years but some will get big overhauls.
Use the extracted schema JSON diff (see above) as a structured way to spot field
changes — it is more reliable than visual scanning of the PDFs alone. For each
form that requires changes, edit `src/forms/<year>/irsForms/<form>.ts` and update
the business logic. The contract tests will catch any field name that exists in
the TypeScript code but was removed or renamed in the new IRS PDF.
