import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { FilingStatus } from 'ustaxes/core/data'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'

export function getF8995PhaseOutIncome(filingStatus: FilingStatus): number {
  let formAMinAmount = 197300
  if (filingStatus === FilingStatus.MFJ) {
    formAMinAmount = 394600
  }
  return formAMinAmount
}

function ifNumber(
  num: number | undefined,
  f: (num: number) => number | undefined
) {
  return num !== undefined ? f(num) : undefined
}

export default class F8995 extends F1040Attachment {
  tag: FormTag = 'f8995'
  sequenceIndex = 55

  applicableK1s = () =>
    this.f1040.info.scheduleK1Form1065s.filter((k1) => k1.section199AQBI > 0)

  netCapitalGains = (): number => {
    let rtn = this.f1040.l3a() ?? 0
    if (this.f1040.scheduleD.isNeeded()) {
      const l15 = this.f1040.scheduleD.l15()
      const l16 = this.f1040.scheduleD.l16()
      const min = Math.min(l15, l16)
      if (min > 0) rtn += min
    } else {
      rtn += this.f1040.l7a() ?? 0
    }
    return rtn
  }

  l2 = (): number | undefined =>
    this.applicableK1s()
      .map((k1) => k1.section199AQBI)
      .reduce((c, a) => c + a, 0)
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined =>
    ifNumber(this.l2(), (num) => num + (this.l3() ?? 0))
  l5 = (): number | undefined => ifNumber(this.l4(), (num) => num * 0.2)

  // TODO: REIT
  l6 = (): number => 0
  l7 = (): number => 0
  l8 = (): number | undefined => ifNumber(this.l6(), (num) => num + this.l7())
  l9 = (): number | undefined => ifNumber(this.l8(), (num) => num * 0.2)

  l10 = (): number | undefined =>
    ifNumber(this.l5(), (num) => num + (this.l9() ?? 0))
  l11 = (): number => this.f1040.l11b() - this.f1040.l12e()
  l12 = (): number => this.netCapitalGains()
  l13 = (): number => Math.max(0, this.l11() - this.l12())
  l14 = (): number => this.l13() * 0.2
  l15 = (): number => Math.min(this.l10() ?? 0, this.l14())
  l16 = (): number => Math.min(0, (this.l2() ?? 0) + (this.l3() ?? 0))
  l17 = (): number => Math.min(0, this.l6() + this.l7())

  deductions = (): number => this.l15()

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.applicableK1s()[0]?.partnershipName,
    this.applicableK1s()[0]?.partnershipEin,
    this.applicableK1s()[0]?.section199AQBI,
    this.applicableK1s()[1]?.partnershipName,
    this.applicableK1s()[1]?.partnershipEin,
    this.applicableK1s()[1]?.section199AQBI,
    this.applicableK1s()[2]?.partnershipName,
    this.applicableK1s()[2]?.partnershipEin,
    this.applicableK1s()[2]?.section199AQBI,
    this.applicableK1s()[3]?.partnershipName,
    this.applicableK1s()[3]?.partnershipEin,
    this.applicableK1s()[3]?.section199AQBI,
    this.applicableK1s()[4]?.partnershipName,
    this.applicableK1s()[4]?.partnershipEin,
    this.applicableK1s()[4]?.section199AQBI,
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.l8(),
    this.l9(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 33 TS expressions, 33 PDF fields
  fillInstructions = (): FillInstructions => {
    const k1s = this.applicableK1s()
    return [
      text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_02[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1i[0].f1_03[0]',
        k1s[0]?.partnershipName
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1i[0].f1_04[0]',
        k1s[0]?.partnershipEin
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1i[0].f1_05[0]',
        k1s[0]?.section199AQBI
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1ii[0].f1_06[0]',
        k1s[1]?.partnershipName
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1ii[0].f1_07[0]',
        k1s[1]?.partnershipEin
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1ii[0].f1_08[0]',
        k1s[1]?.section199AQBI
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1iii[0].f1_09[0]',
        k1s[2]?.partnershipName
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1iii[0].f1_10[0]',
        k1s[2]?.partnershipEin
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1iii[0].f1_11[0]',
        k1s[2]?.section199AQBI
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1iv[0].f1_12[0]',
        k1s[3]?.partnershipName
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1iv[0].f1_13[0]',
        k1s[3]?.partnershipEin
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1iv[0].f1_14[0]',
        k1s[3]?.section199AQBI
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1v[0].f1_15[0]',
        k1s[4]?.partnershipName
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1v[0].f1_16[0]',
        k1s[4]?.partnershipEin
      ),
      text(
        'topmostSubform[0].Page1[0].Table[0].Row1v[0].f1_17[0]',
        k1s[4]?.section199AQBI
      ),
      text('topmostSubform[0].Page1[0].Line2_ReadOrder[0].f1_18[0]', this.l2()),
      text('topmostSubform[0].Page1[0].f1_19[0]', this.l3()),
      text('topmostSubform[0].Page1[0].f1_20[0]', this.l4()),
      text('topmostSubform[0].Page1[0].f1_21[0]', this.l5()),
      text('topmostSubform[0].Page1[0].Line6_ReadOrder[0].f1_22[0]', this.l6()),
      text('topmostSubform[0].Page1[0].f1_23[0]', this.l7()),
      text('topmostSubform[0].Page1[0].f1_24[0]', this.l8()),
      text('topmostSubform[0].Page1[0].f1_25[0]', this.l9()),
      text('topmostSubform[0].Page1[0].f1_26[0]', this.l10()),
      text('topmostSubform[0].Page1[0].f1_27[0]', this.l11()),
      text('topmostSubform[0].Page1[0].f1_28[0]', this.l12()),
      text('topmostSubform[0].Page1[0].f1_29[0]', this.l13()),
      text('topmostSubform[0].Page1[0].f1_30[0]', this.l14()),
      text('topmostSubform[0].Page1[0].f1_31[0]', this.l15()),
      text('topmostSubform[0].Page1[0].f1_32[0]', this.l16()),
      text('topmostSubform[0].Page1[0].f1_33[0]', this.l17())
    ]
  }
}
