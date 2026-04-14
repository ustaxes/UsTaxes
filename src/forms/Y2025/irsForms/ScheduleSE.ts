import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import { fica } from '../data/federal'

export default class ScheduleSE extends F1040Attachment {
  tag: FormTag = 'f1040sse'
  sequenceIndex = 14

  isNeeded = (): boolean => {
    const k1Income = this.f1040.info.scheduleK1Form1065s
      .map(
        (k1) =>
          k1.selfEmploymentEarningsA +
          k1.selfEmploymentEarningsB +
          k1.selfEmploymentEarningsC
      )
      .reduce((a, b) => a + b, 0)
    const schedCIncome = Math.abs(this.f1040.scheduleC?.l31() ?? 0)
    return k1Income > 0 || schedCIncome > 0
  }

  postL4Field = (f: () => number | undefined): number | undefined => {
    if (this.l4c() < 400) {
      return undefined
    }
    return f()
  }

  l8aRelatedField = (f: () => number | undefined): number | undefined => {
    return this.postL4Field(() => {
      if ((this.l8a() ?? 0) >= fica.maxIncomeSSTaxApplies) {
        return undefined
      }
      return f()
    })
  }

  l1a = (): number => {
    const schFL34 = 0 // TODO: Net farm profit or (loss) from Schedule F, line 34
    const k1B14 = 0 // TODO: If a farm partnership
    return schFL34 + k1B14
  }

  l1b = (): number => 0

  l2 = (): number => {
    const schCL31 = this.f1040.scheduleC?.l31() ?? 0
    const k1B14 = this.f1040.info.scheduleK1Form1065s.reduce(
      (c, k1) => c + k1.selfEmploymentEarningsA,
      0
    )
    return schCL31 + k1B14
  }

  l3 = (): number => sumFields([this.l1a(), this.l1b(), this.l2()])

  // TODO: Handle line 4A being less than 400 due to the Conservation Reserve Program
  l4a = (): number => {
    const l3 = this.l3()
    if (l3 > 0) {
      return l3 * 0.9235
    }
    return l3
  }

  l4b = (): number | undefined => undefined

  l4c = (): number => sumFields([this.l4a(), this.l4b()])

  l5a = (): number | undefined => this.postL4Field(() => 0)
  l5b = (): number | undefined =>
    this.postL4Field(() => {
      const l5a = this.l5a()
      if (l5a === undefined) {
        return undefined
      }
      return l5a * 0.9235
    })

  l6 = (): number | undefined =>
    this.postL4Field((): number => sumFields([this.l4c(), this.l5b()]))

  l7 = (): number => fica.maxIncomeSSTaxApplies
  l7FormFill = (): number | undefined => undefined

  l8a = (): number | undefined =>
    this.postL4Field((): number =>
      this.f1040.validW2s().reduce((c, w2) => c + w2.ssWages, 0)
    )

  l8b = (): number | undefined =>
    this.l8aRelatedField((): number | undefined => undefined)
  l8c = (): number | undefined =>
    this.l8aRelatedField((): number | undefined => undefined)
  l8d = (): number | undefined =>
    this.l8aRelatedField((): number =>
      sumFields([this.l8a(), this.l8b(), this.l8c()])
    )

  l9 = (): number | undefined =>
    this.l8aRelatedField((): number =>
      Math.max(0, this.l7() - (this.l8d() ?? 0))
    )

  l10 = (): number | undefined =>
    this.l8aRelatedField(
      (): number => Math.min(this.l6() ?? 0, this.l9() ?? 0) * 0.124
    )

  l11 = (): number | undefined =>
    this.postL4Field((): number => (this.l6() ?? 0) * 0.029)

  l12 = (): number | undefined =>
    this.postL4Field((): number => sumFields([this.l10(), this.l11()]))

  l13 = (): number | undefined =>
    this.postL4Field((): number => (this.l12() ?? 0) * 0.5)

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    false, // Minister
    this.l1a(),
    this.l1b(),
    this.l2(),
    this.l3(),
    this.l4a(),
    this.l4b(),
    this.l4c(),
    this.l5a(),
    this.l5b(),
    this.l6(),
    this.l7FormFill(), // fillable section is secretly right after the printed amount and not actually fillable
    this.l8a(),
    this.l8b(),
    this.l8c(),
    this.l8d(),
    this.l9(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 23 TS expressions, 27 PDF fields
  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    checkbox('topmostSubform[0].Page1[0].c1_1[0]', false),
    text('topmostSubform[0].Page1[0].f1_3[0]', this.l1a()),
    text('topmostSubform[0].Page1[0].f1_4[0]', this.l1b()),
    text('topmostSubform[0].Page1[0].f1_5[0]', this.l2()),
    text('topmostSubform[0].Page1[0].f1_6[0]', this.l3()),
    text('topmostSubform[0].Page1[0].f1_7[0]', this.l4a()),
    text('topmostSubform[0].Page1[0].f1_8[0]', this.l4b()),
    text('topmostSubform[0].Page1[0].f1_9[0]', this.l4c()),
    text('topmostSubform[0].Page1[0].Line5a_ReadOrder[0].f1_10[0]', this.l5a()),
    text('topmostSubform[0].Page1[0].f1_11[0]', this.l5b()),
    text('topmostSubform[0].Page1[0].f1_12[0]', this.l6()),
    text('topmostSubform[0].Page1[0].f1_13[0]', this.l7()),
    text('topmostSubform[0].Page1[0].Line8a_ReadOrder[0].f1_14[0]', this.l8a()),
    text('topmostSubform[0].Page1[0].f1_15[0]', this.l8b()),
    text('topmostSubform[0].Page1[0].f1_16[0]', this.l8c()),
    text('topmostSubform[0].Page1[0].f1_17[0]', this.l8d()),
    text('topmostSubform[0].Page1[0].f1_18[0]', this.l9()),
    text('topmostSubform[0].Page1[0].f1_19[0]', this.l10()),
    text('topmostSubform[0].Page1[0].f1_20[0]', this.l11()),
    text('topmostSubform[0].Page1[0].f1_21[0]', this.l12()),
    text('topmostSubform[0].Page1[0].f1_22[0]', this.l13()),

    text('topmostSubform[0].Page2[0].f2_1[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_2[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_3[0]', undefined),
    text('topmostSubform[0].Page2[0].f2_4[0]', undefined)
  ]
}
