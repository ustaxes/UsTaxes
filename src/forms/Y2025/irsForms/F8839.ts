import F1040Attachment from './F1040Attachment'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Form 8839 — Adoption Credit and Employer-Provided Adoption Benefits.
 *
 * Full computation (phase-out calculations, per-child exclusion limits) is not
 * yet implemented. The taxable portion of employer-provided adoption benefits
 * (line 31, Part II) should be entered directly via
 * `otherEarnedIncome.employerAdoptionBenefits` in the data model.
 *
 * This stub ensures the form PDF is attached to the return whenever adoption
 * benefits are present, satisfying the IRS attachment requirement.
 */
export default class F8839 extends F1040Attachment {
  tag: FormTag = 'f8839'
  sequenceIndex = 38

  isNeeded = (): boolean =>
    (this.f1040.info.otherEarnedIncome?.employerAdoptionBenefits ?? 0) > 0

  /** Line 31 — Taxable employer-provided adoption benefits (flows to F1040 line 1f). */
  l31 = (): number | undefined =>
    this.f1040.info.otherEarnedIncome?.employerAdoptionBenefits

  fields = (): Field[] => Array(100).fill(undefined) as Field[]

  // Generated from Y2025 PDF schema (schemas/Y2025/f8839.json) — 100 fields total
  // Full Part I / Part II / Part III computation not yet implemented.
  fillInstructions = (): FillInstructions => [
    // Header
    text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    // Part I — Information for Qualifying Children (not computed)
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].f1_3[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].f1_4[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].f1_5[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].c1_1[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].c1_2[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].c1_3[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].f1_6[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child1[0].c1_4[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].f1_7[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].f1_8[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].f1_9[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].c1_5[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].c1_6[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].c1_7[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].f1_10[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child2[0].c1_8[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].f1_11[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].f1_12[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].f1_13[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].c1_9[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].c1_10[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].c1_11[0]',
      undefined
    ),
    text(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].f1_14[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Table_PartI[0].BodyRow_Child3[0].c1_12[0]',
      undefined
    ),
    text('topmostSubform[0].Page1[0].Child1[0].f1_15[0]', undefined),
    text('topmostSubform[0].Page1[0].Child2[0].f1_16[0]', undefined),
    text('topmostSubform[0].Page1[0].Child3[0].f1_17[0]', undefined),
    checkbox(
      'topmostSubform[0].Page1[0].Line3_ReadOrder[0].Line3Checkboxes_ReadOrder[0].c1_13[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Line3_ReadOrder[0].Line3Checkboxes_ReadOrder[0].c1_13[1]',
      undefined
    ),
    // Part II — Employer-Provided Adoption Benefits (lines 4-31)
    text('topmostSubform[0].Page1[0].f1_18[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_19[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_20[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_21[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_22[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_23[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_24[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_25[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_26[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_27[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_28[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_29[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_30[0]', undefined),
    checkbox(
      'topmostSubform[0].Page1[0].Line8_ReadOrder[0].c1_14[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page1[0].Line8_ReadOrder[0].c1_14[1]',
      undefined
    ),
    // Line 31 — Taxable employer-provided adoption benefits → F1040 line 1f
    text('topmostSubform[0].Page1[0].f1_31[0]', this.l31()),
    text('topmostSubform[0].Page1[0].f1_32[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_33[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_34[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_35[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_36[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_37[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_38[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_39[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_40[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_41[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_42[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_43[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_44[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_45[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_46[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_47[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_48[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_49[0]', undefined),
    text('topmostSubform[0].Page1[0].f1_50[0]', undefined),
    // Page 2 — Part III: Adoption Credit (not computed)
    text('topmostSubform[0].Page2[0].Child1[0].f2_1[0]', undefined),
    text('topmostSubform[0].Page2[0].Child2[0].f2_2[0]', undefined),
    text('topmostSubform[0].Page2[0].Child3[0].f2_3[0]', undefined),
    checkbox(
      'topmostSubform[0].Page2[0].Line20_ReadOrder[0].Line20Checkboxes_ReadOrder[0].c2_1[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page2[0].Line20_ReadOrder[0].Line20Checkboxes_ReadOrder[0].c2_1[1]',
      undefined
    ),
    text('topmostSubform[0].Page2[0].f2_4[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_5[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_6[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_7[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_8[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_9[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_10[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_11[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_12[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_13[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_14[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_15[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_16[0]', undefined),
    text('topmostSubform[0].Page2[0].Line25_ReadOrder[0].f2_17[0]', undefined),
    checkbox(
      'topmostSubform[0].Page2[0].Line26_ReadOrder[0].c2_2[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page2[0].Line26_ReadOrder[0].c2_2[1]',
      undefined
    ),
    text('topmostSubform[0].Page2[0].f2_18[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_19[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_20[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_21[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_22[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_23[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_24[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_25[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_26[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_27[0]', undefined),
    checkbox(
      'topmostSubform[0].Page2[0].Line31_ReadOrder[0].Line29Checkboxes_ReadOrder[0].c2_3[0]',
      undefined
    ),
    checkbox(
      'topmostSubform[0].Page2[0].Line31_ReadOrder[0].Line29Checkboxes_ReadOrder[0].c2_3[1]',
      undefined
    ),
    text('topmostSubform[0].Page2[0].f2_28[0]', undefined)
  ]
}
