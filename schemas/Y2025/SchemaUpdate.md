# Y2024 → Y2025 PDF Schema Changes

19 shared forms between years. 11 new Y2025-only forms added (f4547, f1040s1a, f1040sr, f4797, f4952, f4972, f5695, f8814, f8888, f8910, f8936).

## Field counts

| Form     | Y2024 | Y2025 | Delta |
| -------- | ----: | ----: | ----: |
| f1040    |   141 |   199 |   +58 |
| f8949    |   244 |   202 |   -42 |
| f1040s1  |    69 |    73 |    +4 |
| f1040s2  |    60 |    63 |    +3 |
| f1040s3  |    39 |    37 |    -2 |
| f1040sa  |    37 |    33 |    -4 |
| f1040sei |    39 |    38 |    -1 |
| f6251    |    61 |    62 |    +1 |
| f1040sd  |    55 |    55 |     0 |
| f1040sb  |    72 |    72 |     0 |
| f1040se  |   185 |   185 |     0 |
| f1040s8  |    41 |    41 |     0 |
| f1040sse |    27 |    27 |     0 |
| f1040v   |    15 |    15 |     0 |
| f8889    |    27 |    27 |     0 |
| f8959    |    26 |    26 |     0 |
| f8960    |    38 |    38 |     0 |
| f8995    |    33 |    33 |     0 |
| f8995a   |   111 |   111 |     0 |

---

## Type 1 — Field renamed / re-pathed

Same field, same purpose, IRS changed the internal PDF name. Detected by same container group + same position in sequence. Handled by `migrateToNativeInstructions` which zips by position — new name attaches to same old value automatically.

### Leaf-id padding change (cosmetic)

10 forms where field count is identical but leaf ids lost their leading zero:

`f1_01[0]` → `f1_1[0]`, `f1_02[0]` → `f1_2[0]`, etc.

Affected: **f1040sd, f1040sb, f1040se, f1040sse, f1040s8, f1040v, f8889, f8959, f8960, f8995a**

Example — Schedule D, Row1a gain field:

```
Y2024: topmostSubform[0].Page1[0].Table_PartI[0].Row1a[0].f1_05_RO[0]  → this.l1ag()
Y2025: topmostSubform[0].Page1[0].Table_PartI[0].Row1a[0].f1_5[0]      → this.l1ag()
```

### Root subform rename

Schedule A and Schedule 1 changed their XFA root from `topmostSubform[0]` to `form1[0]`. All leaf ids and values stayed the same.

Example — Schedule A, line 1:

```
Y2024: topmostSubform[0].Page1[0].f1_1[0]  → this.f1040.namesString()
Y2025: form1[0].Page1[0].f1_1[0]           → this.f1040.namesString()
```

Schedule 1:

```
Y2024: form1[0].Page1[0].f1_01[0]
Y2025: topmostSubform[0].Page1[0].f1_01[0]
```

(Root swapped in the opposite direction for this form.)

### Renamed within container + small suffix change

Schedule D `f1_05_RO[0]` → `f1_5[0]` (dropped `_RO` suffix and leading zero). Same container `Row1a[0]`, same position, same value.

---

## Type 2 — Genuinely new field

IRS added a brand new box that never existed before. Handled by placing the field in `fillInstructions()` with `undefined` as the value. The filler skips `undefined` fields so the rest of the form fills correctly. Contract tests (`contractTests.test.ts`) enforce that every schema field appears in `fillInstructions()`.

### F1040 — OBBB provision fields (8 new fields, indices 6–13)

New checkboxes and date-of-birth text fields for the OBBB provision:

```
checkbox('...c1_3[0]', undefined)     — OBBB provision checkbox
text('...f1_05[0]', undefined)        — DOB month (maxLength 2)
text('...f1_06[0]', undefined)        — DOB month (maxLength 2)
text('...f1_07[0]', undefined)        — DOB year (maxLength 4)
text('...f1_08[0]', undefined)        — DOB month (maxLength 2)
text('...f1_09[0]', undefined)        — DOB month (maxLength 2)
text('...f1_10[0]', undefined)        — DOB year (maxLength 4)
checkbox('...c1_4[0]', undefined)     — OBBB provision checkbox
```

### F1040 — additional new fields scattered through the form

Fields `f1_14`, `f1_15`, `f1_17`, `f1_18` (indices 17–18, 20–21) also mapped to `undefined`.

### F1040 — expanded dependent rows

Y2024 had 4 dependent rows (`Row1`–`Row4`). Y2025 added `Row5`–`Row7` with nested `Dependent1`–`Dependent4` sub-groups and additional checkboxes `c1_12`–`c1_31`.

### Schedule B — extra text field

`f1_66[0]` (index 71) added after the FINCEN country line. Mapped to `undefined`.

### Forms with small delta (+1 to +4)

- **f1040s1** (+4): 4 new fields added
- **f1040s2** (+3): 3 new fields added
- **f6251** (+1): 1 new field added

### Forms with negative delta (fields removed)

- **f1040sa** (-4): Lines l7, l16Other3, l16, l17 consolidated or removed from PDF. Y2025 ends at `l16Other2` + Line 18 checkbox (33 fields vs 37).
- **f1040s3** (-2): 2 fields removed
- **f1040sei** (-1): 1 field removed

---

## Type 3 — Structural rearrangement

Field order shifted so much that positional mapping broke down. Not just a few new fields — the entire structure was rearranged. Fixed by flipping the architecture: `fillInstructions()` became the source of truth (name + value together), and `fields()` derives from it.

### F1040 (141 → 199, +41%)

The most disrupted form. Key structural changes:

1. **Campaign checkboxes moved** from indices 17–18 (Y2024) to indices 3–4 (Y2025) — pushed everything else down.
2. **8 OBBB fields inserted** at indices 6–13, shifting all subsequent fields.
3. **Address block renamed**: `f1_10`–`f1_17` (Y2024) → `f1_20`–`f1_27` (Y2025), still inside `Address_ReadOrder` container.
4. **Filing status checkboxes renumbered**: `c1_1`–`c1_5` (Y2024) → `c1_5`–`c1_12` (Y2025).
5. **Dependent rows expanded**: 4 rows → 7 rows with nested Dependent sub-groups.
6. **SSN_ReadOrder, Line28_ReadOrder** — new container groups that didn't exist in Y2024.

**Architectural fix**: `fields()` no longer maintains its own positional array. Instead:

```typescript
fields = (): Field[] =>
  this.fillInstructions().map((instr) => {
    if (instr.kind === 'text')
      return instr.value === undefined ? '' : instr.value
    if (instr.kind === 'checkbox') return instr.value
    return instr.value
  })
```

One place to maintain instead of two.

### F8949 (244 → 202, -17%)

42 fields removed. The table structure was reorganized with fewer rows exposed in the PDF.

---

## Tooling that handles the migration

| Tool                                     | Role                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/extractPdfSchema.ts`            | Extracts field names/types/order from IRS PDF → `schemas/Y2025/*.json`                                                                                    |
| `scripts/migrateToNativeInstructions.ts` | Zips Y2024 `fields()` expressions with Y2025 PDF field names by position. Flags `EXTRA PDF` (Type 2) and `EXTRA TS` mismatches.                           |
| `contractTests.test.ts`                  | Enforces TS ↔ PDF parity: every schema field must appear in `fillInstructions()`, every instruction must reference a real schema field, types must match. |

---

## Verification

All Y2025 forms pass the contract test: every PDF schema field is accounted for in `fillInstructions()` (either with a computed value or `undefined`), and every `fillInstructions()` entry references a field that exists in the schema with matching type.
