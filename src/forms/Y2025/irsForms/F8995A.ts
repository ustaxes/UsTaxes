import F8995, { getF8995PhaseOutIncome } from './F8995'

import { FormTag } from 'ustaxes/core/irsForms/Form'
import { FilingStatus } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'

function ifNumber(
  num: number | undefined,
  f: (num: number) => number | undefined
) {
  return num !== undefined ? f(num) : undefined
}

export default class F8995A extends F8995 {
  tag: FormTag = 'f8995a'
  sequenceIndex = 55.5

  l2a = (): number | undefined => this.applicableK1s()[0]?.section199AQBI
  l2b = (): number | undefined => this.applicableK1s()[1]?.section199AQBI
  l2c = (): number | undefined => this.applicableK1s()[2]?.section199AQBI

  l3a = (): number | undefined => ifNumber(this.l2a(), (num) => num * 0.2)
  l3b = (): number | undefined => ifNumber(this.l2b(), (num) => num * 0.2)
  l3c = (): number | undefined => ifNumber(this.l2c(), (num) => num * 0.2)

  /** W-2 wages per K-1 (box 17 code V) — feeds the W-2 wage limitation. */
  l4a = (): number | undefined =>
    ifNumber(this.l2a(), () => this.applicableK1s()[0]?.w2Wages ?? 0)
  l4b = (): number | undefined =>
    ifNumber(this.l2b(), () => this.applicableK1s()[1]?.w2Wages ?? 0)
  l4c = (): number | undefined =>
    ifNumber(this.l2c(), () => this.applicableK1s()[2]?.w2Wages ?? 0)

  l5a = (): number | undefined => ifNumber(this.l4a(), (num) => num * 0.5)
  l5b = (): number | undefined => ifNumber(this.l4b(), (num) => num * 0.5)
  l5c = (): number | undefined => ifNumber(this.l4c(), (num) => num * 0.5)

  l6a = (): number | undefined => ifNumber(this.l4a(), (num) => num * 0.25)
  l6b = (): number | undefined => ifNumber(this.l4b(), (num) => num * 0.25)
  l6c = (): number | undefined => ifNumber(this.l4c(), (num) => num * 0.25)

  /** UBIA of qualified property per K-1 (box 17 code AB) — feeds the UBIA limitation. */
  l7a = (): number | undefined =>
    ifNumber(this.l2a(), () => this.applicableK1s()[0]?.unadjustedBasis ?? 0)
  l7b = (): number | undefined =>
    ifNumber(this.l2b(), () => this.applicableK1s()[1]?.unadjustedBasis ?? 0)
  l7c = (): number | undefined =>
    ifNumber(this.l2c(), () => this.applicableK1s()[2]?.unadjustedBasis ?? 0)

  l8a = (): number | undefined => ifNumber(this.l7a(), (num) => num * 0.025)
  l8b = (): number | undefined => ifNumber(this.l7b(), (num) => num * 0.025)
  l8c = (): number | undefined => ifNumber(this.l7c(), (num) => num * 0.025)

  l9a = (): number | undefined =>
    ifNumber(this.l6a(), (num) => num + (this.l8a() ?? 0))
  l9b = (): number | undefined =>
    ifNumber(this.l6b(), (num) => num + (this.l8b() ?? 0))
  l9c = (): number | undefined =>
    ifNumber(this.l6c(), (num) => num + (this.l8c() ?? 0))

  l10a = (): number | undefined =>
    ifNumber(this.l5a(), (num) => Math.max(num, this.l9a() ?? 0))
  l10b = (): number | undefined =>
    ifNumber(this.l5b(), (num) => Math.max(num, this.l9b() ?? 0))
  l10c = (): number | undefined =>
    ifNumber(this.l5c(), (num) => Math.max(num, this.l9c() ?? 0))

  l11a = (): number | undefined =>
    ifNumber(this.l3a(), (num) => Math.min(num, this.l10a() ?? 0))
  l11b = (): number | undefined =>
    ifNumber(this.l3b(), (num) => Math.min(num, this.l10b() ?? 0))
  l11c = (): number | undefined =>
    ifNumber(this.l3c(), (num) => Math.min(num, this.l10c() ?? 0))

  l12a = (): number | undefined => ifNumber(this.l26a(), (num) => num)
  l12b = (): number | undefined => ifNumber(this.l26b(), (num) => num)
  l12c = (): number | undefined => ifNumber(this.l26c(), (num) => num)

  l13a = (): number | undefined =>
    ifNumber(this.l12a(), (num) => Math.max(num, this.l11a() ?? 0))
  l13b = (): number | undefined =>
    ifNumber(this.l12b(), (num) => Math.max(num, this.l11b() ?? 0))
  l13c = (): number | undefined =>
    ifNumber(this.l12c(), (num) => Math.max(num, this.l11c() ?? 0))

  // TODO: Patron reduction
  l14a = (): number | undefined => ifNumber(this.l2a(), () => 0)
  l14b = (): number | undefined => ifNumber(this.l2a(), () => 0)
  l14c = (): number | undefined => ifNumber(this.l2a(), () => 0)

  l15a = (): number | undefined =>
    ifNumber(this.l13a(), (num) => num - (this.l14a() ?? 0))
  l15b = (): number | undefined =>
    ifNumber(this.l13b(), (num) => num - (this.l14b() ?? 0))
  l15c = (): number | undefined =>
    ifNumber(this.l13c(), (num) => num - (this.l14c() ?? 0))

  l16 = (): number => sumFields([this.l15a(), this.l15b(), this.l15c()])

  l17a = (): number | undefined => ifNumber(this.l3a(), (num) => num)
  l17b = (): number | undefined => ifNumber(this.l3b(), (num) => num)
  l17c = (): number | undefined => ifNumber(this.l3c(), (num) => num)

  l18a = (): number | undefined => ifNumber(this.l10a(), (num) => num)
  l18b = (): number | undefined => ifNumber(this.l10b(), (num) => num)
  l18c = (): number | undefined => ifNumber(this.l10c(), (num) => num)

  l19a = (): number | undefined =>
    ifNumber(this.l17a(), (num) => num - (this.l18a() ?? 0))
  l19b = (): number | undefined =>
    ifNumber(this.l17b(), (num) => num - (this.l18b() ?? 0))
  l19c = (): number | undefined =>
    ifNumber(this.l17c(), (num) => num - (this.l18c() ?? 0))

  l20 = (): number => this.f1040.l11() - this.f1040.l12()
  l21 = (): number =>
    getF8995PhaseOutIncome(this.f1040.info.taxPayer.filingStatus)
  l22 = (): number => this.l20() - this.l21()
  l23 = (): number =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ ? 100000 : 50000
  l24 = (): number => Math.round((this.l22() / this.l23()) * 10000) / 10000 // We want xx.xx%

  l25a = (): number | undefined =>
    ifNumber(this.l19a(), (num) => num * this.l24())
  l25b = (): number | undefined =>
    ifNumber(this.l19b(), (num) => num * this.l24())
  l25c = (): number | undefined =>
    ifNumber(this.l19c(), (num) => num * this.l24())

  l26a = (): number | undefined =>
    ifNumber(this.l17a(), (num) => num - (this.l25a() ?? 0))
  l26b = (): number | undefined =>
    ifNumber(this.l17b(), (num) => num - (this.l25b() ?? 0))
  l26c = (): number | undefined =>
    ifNumber(this.l17c(), (num) => num - (this.l25c() ?? 0))

  l27 = (): number => this.l16()

  // TODO: REIT
  l28 = (): number => 0
  l29 = (): number => 0

  l30 = (): number => Math.max(0, this.l28() + this.l29())
  l31 = (): number => this.l30() * 0.2

  l32 = (): number => this.l27() + this.l31()
  l33 = (): number => this.l20()
  l34 = (): number => this.netCapitalGains()
  l35 = (): number => this.l33() - this.l34()
  l36 = (): number => this.l35() * 0.2
  l37 = (): number => Math.min(this.l32(), this.l36())

  // TODO: DPAD
  l38 = (): number => 0

  l39 = (): number => this.l37() - this.l38()
  deductions = (): number => this.l39()
  l40 = (): number => Math.min(0, this.l28() + this.l29())

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.applicableK1s()[0]?.partnershipName,
    false, // 1Ab
    false, // 1Ac
    this.applicableK1s()[0]?.partnershipEin,
    false, // 1Ae
    this.applicableK1s()[1]?.partnershipName,
    false, // 1Bb
    false, // 1Bc
    this.applicableK1s()[1]?.partnershipEin,
    false, // 1Be
    this.applicableK1s()[2]?.partnershipName,
    false, // 1Cb
    false, // 1Cc
    this.applicableK1s()[2]?.partnershipEin,
    false, // 1Ce
    this.l2a(),
    this.l2b(),
    this.l2c(),
    this.l3a(),
    this.l3b(),
    this.l3c(),
    this.l4a(),
    this.l4b(),
    this.l4c(),
    this.l5a(),
    this.l5b(),
    this.l5c(),
    this.l6a(),
    this.l6b(),
    this.l6c(),
    this.l7a(),
    this.l7b(),
    this.l7c(),
    this.l8a(),
    this.l8b(),
    this.l8c(),
    this.l9a(),
    this.l9b(),
    this.l9c(),
    this.l10a(),
    this.l10b(),
    this.l10c(),
    this.l11a(),
    this.l11b(),
    this.l11c(),
    this.l12a(),
    this.l12b(),
    this.l12c(),
    this.l13a(),
    this.l13b(),
    this.l13c(),
    this.l14a(),
    this.l14b(),
    this.l14c(),
    this.l15a(),
    this.l15b(),
    this.l15c(),
    this.l16(),
    undefined, // Gray
    undefined, // Gray
    this.l17a(),
    this.l17b(),
    this.l17c(),
    this.l18a(),
    this.l18b(),
    this.l18c(),
    this.l19a(),
    this.l19b(),
    this.l19c(),
    this.l20(),
    undefined, // Gray
    undefined, // Gray
    undefined, // Gray
    this.l21(),
    undefined, // Gray
    undefined, // Gray
    undefined, // Gray
    this.l22(),
    undefined, // Gray
    undefined, // Gray
    undefined, // Gray
    this.l23(),
    undefined, // Gray
    undefined, // Gray
    undefined, // Gray
    (this.l24() * 100).toFixed(2) + '%', // TODO: Percent sign is duplicated, but it prevents Fill.ts from rounding this
    undefined, // Gray
    undefined, // Gray
    undefined, // Gray
    this.l25a(),
    this.l25b(),
    this.l25c(),
    this.l26a(),
    this.l26b(),
    this.l26c(),
    this.l27(),
    this.l28(),
    this.l29(),
    this.l30(),
    this.l31(),
    this.l32(),
    this.l33(),
    this.l34(),
    this.l35(),
    this.l36(),
    this.l37(),
    this.l38(),
    this.l39(),
    this.l40()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 111 TS expressions, 111 PDF fields
  fillInstructions = (): FillInstructions => {
    const k1s = this.applicableK1s()
    return [
      text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_02[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowA[0].f1_03[0]',
        k1s[0]?.partnershipName
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowA[0].c1_1[0]',
        false
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowA[0].c1_2[0]',
        false
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowA[0].f1_04[0]',
        k1s[0]?.partnershipEin
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowA[0].c1_3[0]',
        false
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowB[0].f1_05[0]',
        k1s[1]?.partnershipName
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowB[0].c1_4[0]',
        false
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowB[0].c1_5[0]',
        false
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowB[0].f1_06[0]',
        k1s[1]?.partnershipEin
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowB[0].c1_6[0]',
        false
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowC[0].f1_07[0]',
        k1s[2]?.partnershipName
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowC[0].c1_7[0]',
        false
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowC[0].c1_8[0]',
        false
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowC[0].f1_08[0]',
        k1s[2]?.partnershipEin
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_PartI[0].RowC[0].c1_9[0]',
        false
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row2[0].f1_09[0]',
        this.l2a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row2[0].f1_10[0]',
        this.l2b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row2[0].f1_11[0]',
        this.l2c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row3[0].f1_12[0]',
        this.l3a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row3[0].f1_13[0]',
        this.l3b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row3[0].f1_14[0]',
        this.l3c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row4[0].f1_15[0]',
        this.l4a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row4[0].f1_16[0]',
        this.l4b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row4[0].f1_17[0]',
        this.l4c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row5[0].f1_18[0]',
        this.l5a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row5[0].f1_19[0]',
        this.l5b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row5[0].f1_20[0]',
        this.l5c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row6[0].f1_21[0]',
        this.l6a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row6[0].f1_22[0]',
        this.l6b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row6[0].f1_23[0]',
        this.l6c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row7[0].f1_24[0]',
        this.l7a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row7[0].f1_25[0]',
        this.l7b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row7[0].f1_26[0]',
        this.l7c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row8[0].f1_27[0]',
        this.l8a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row8[0].f1_28[0]',
        this.l8b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row8[0].f1_29[0]',
        this.l8c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row9[0].f1_30[0]',
        this.l9a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row9[0].f1_31[0]',
        this.l9b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row9[0].f1_32[0]',
        this.l9c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row10[0].f1_33[0]',
        this.l10a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row10[0].f1_34[0]',
        this.l10b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row10[0].f1_35[0]',
        this.l10c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row11[0].f1_36[0]',
        this.l11a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row11[0].f1_37[0]',
        this.l11b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row11[0].f1_38[0]',
        this.l11c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row12[0].f1_39[0]',
        this.l12a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row12[0].f1_40[0]',
        this.l12b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row12[0].f1_41[0]',
        this.l12c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row13[0].f1_42[0]',
        this.l13a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row13[0].f1_43[0]',
        this.l13b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row13[0].f1_44[0]',
        this.l13c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row14[0].f1_45[0]',
        this.l14a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row14[0].f1_46[0]',
        this.l14b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row14[0].f1_47[0]',
        this.l14c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row15[0].f1_48[0]',
        this.l15a()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row15[0].f1_49[0]',
        this.l15b()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row15[0].f1_50[0]',
        this.l15c()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row16[0].f1_51[0]',
        this.l16()
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row16[0].f1_52[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page1[0].Table_PartII[0].Row16[0].f1_53[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row17[0].f2_01[0]',
        this.l17a()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row17[0].f2_02[0]',
        this.l17b()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row17[0].f2_03[0]',
        this.l17c()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row18[0].f2_04[0]',
        this.l18a()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row18[0].f2_05[0]',
        this.l18b()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row18[0].f2_06[0]',
        this.l18c()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row19[0].f2_07[0]',
        this.l19a()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row19[0].f2_08[0]',
        this.l19b()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row19[0].f2_09[0]',
        this.l19c()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row20[0].Ln20[0].f2_10[0]',
        this.l20()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row20[0].f2_11_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row20[0].f2_12_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row20[0].f2_13_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row21[0].Ln21[0].f2_14[0]',
        this.l21()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row21[0].f2_15_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row21[0].f2_16_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row21[0].f2_17_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row22[0].Ln22[0].f2_18[0]',
        this.l22()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row22[0].f2_19_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row22[0].f2_20_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row22[0].f2_21_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row23[0].Ln23[0].f2_22[0]',
        this.l23()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row23[0].f2_23_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row23[0].f2_24_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row23[0].f2_25_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row24[0].Ln24[0].f2_26[0]',
        (this.l24() * 100).toFixed(2) + '%'
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row24[0].f2_27_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row24[0].f2_28_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row24[0].f2_29_RO[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row25[0].f2_30[0]',
        this.l25a()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row25[0].f2_31[0]',
        this.l25b()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row25[0].f2_32[0]',
        this.l25c()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row26[0].f2_33[0]',
        this.l26a()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row26[0].f2_34[0]',
        this.l26b()
      ),
      text(
        'topmostSubform[0].Page2[0].Table_PartIII[0].Row26[0].f2_35[0]',
        this.l26c()
      ),
      text('topmostSubform[0].Page2[0].f2_36[0]', this.l27()),
      text('topmostSubform[0].Page2[0].f2_37[0]', this.l28()),
      text('topmostSubform[0].Page2[0].f2_38[0]', this.l29()),
      text('topmostSubform[0].Page2[0].f2_39[0]', this.l30()),
      text('topmostSubform[0].Page2[0].f2_40[0]', this.l31()),
      text('topmostSubform[0].Page2[0].f2_41[0]', this.l32()),
      text('topmostSubform[0].Page2[0].f2_42[0]', this.l33()),
      text('topmostSubform[0].Page2[0].f2_43[0]', this.l34()),
      text('topmostSubform[0].Page2[0].f2_44[0]', this.l35()),
      text('topmostSubform[0].Page2[0].f2_45[0]', this.l36()),
      text('topmostSubform[0].Page2[0].f2_46[0]', this.l37()),
      text('topmostSubform[0].Page2[0].f2_47[0]', this.l38()),
      text('topmostSubform[0].Page2[0].f2_48[0]', this.l39()),
      text('topmostSubform[0].Page2[0].f2_49[0]', this.l40())
    ]
  }
}
