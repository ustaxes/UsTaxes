import F1040Attachment from './F1040Attachment'
import { PersonRole } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { fica } from '../data/federal'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'

export default class Schedule3 extends F1040Attachment {
  tag: FormTag = 'f1040s3'
  sequenceIndex = 3

  claimableExcessSSTaxWithholding = (): number => {
    const w2s = this.f1040.validW2s()

    // Excess FICA taxes are calculated per person. If an individual person
    //    has greater than the applicable amount then they are entitled to a refund
    //    of that amount

    let claimableExcessFica = 0
    const primaryFica = w2s
      .filter((w2) => w2.personRole == PersonRole.PRIMARY)
      .map((w2) => w2.ssWithholding)
      .reduce((l, r) => l + r, 0)
    const spouseFica = w2s
      .filter((w2) => w2.personRole == PersonRole.SPOUSE)
      .map((w2) => w2.ssWithholding)
      .reduce((l, r) => l + r, 0)

    if (
      primaryFica > fica.maxSSTax &&
      w2s
        .filter((w2) => w2.personRole == PersonRole.PRIMARY)
        .every((w2) => w2.ssWithholding <= fica.maxSSTax)
    ) {
      claimableExcessFica += primaryFica - fica.maxSSTax
    }

    if (
      spouseFica > fica.maxSSTax &&
      w2s
        .filter((w2) => w2.personRole == PersonRole.SPOUSE)
        .every((w2) => w2.ssWithholding <= fica.maxSSTax)
    ) {
      claimableExcessFica += spouseFica - fica.maxSSTax
    }

    return claimableExcessFica
  }

  isNeeded = (): boolean =>
    this.claimableExcessSSTaxWithholding() > 0 ||
    (this.f1040.info.otherIncome?.foreignTaxCredit ?? 0) > 0 ||
    (this.f1040.info.otherIncome?.extensionPayment ?? 0) > 0 ||
    (this.f1040.scheduleR?.isNeeded() ?? false)

  deductions = (): number => 0
  // Part I: Nonrefundable credits
  // Foreign tax credit: direct entry when total ≤ $300 single / $600 MFJ (no Form 1116 required).
  l1 = (): number | undefined => this.f1040.info.otherIncome?.foreignTaxCredit
  l2 = (): number | undefined => this.f1040.f2441.credit()
  l3 = (): number | undefined => this.f1040.f8863?.l19()
  l4 = (): number | undefined => this.f1040.f8880?.credit()
  l5a = (): number | undefined => this.f1040.f5695?.l15()
  l5b = (): number | undefined => this.f1040.f5695?.l30() // technically should be line 32 from f5695
  l6a = (): number | undefined => undefined // TODO: other credits
  l6b = (): number | undefined => this.f1040.scheduleR?.l22()
  l6c = (): number | undefined => undefined // TODO: other credits
  l6d = (): number | undefined => undefined // TODO: other credits
  l6e = (): number | undefined => undefined // Reserved
  l6f = (): number | undefined => this.f1040.f8936?.l15() // TODO: other credits
  l6g = (): number | undefined => undefined // TODO: other credits
  l6h = (): number | undefined => undefined // TODO: other credits
  l6i = (): number | undefined => undefined // TODO: other credits
  l6j = (): number | undefined => undefined // TODO: other credits
  l6k = (): number | undefined => this.f1040.f8910?.l15()
  l6l = (): number | undefined => undefined // TODO: other credits
  l6m = (): number | undefined => undefined // TODO: other credits

  // only one desc text are now
  l6zDesc = (): string | undefined =>
    this.f1040.info.otherIncome?.otherNonrefundableCreditDescription
  l6z = (): number | undefined =>
    this.f1040.info.otherIncome?.otherNonrefundableCredit

  l7 = (): number =>
    sumFields([
      this.l6a(),
      this.l6b(),
      this.l6c(),
      this.l6d(),
      this.l6e(), // Reserved
      this.l6f(),
      this.l6g(),
      this.l6h(),
      this.l6i(),
      this.l6j(),
      this.l6k(),
      this.l6l(),
      this.l6m(),
      this.l6z()
    ])

  l8 = (): number =>
    sumFields([
      this.l1(),
      this.l2(),
      this.l3(),
      this.l4(),
      this.l5a(),
      this.l5b(),
      this.l7()
    ])

  // Part II: Other payments and refundable credits
  l9 = (): number | undefined => this.f1040.f8962.credit()

  l10 = (): number | undefined => this.f1040.info.otherIncome?.extensionPayment

  l11 = (): number =>
    // TODO: also applies to RRTA tax
    this.claimableExcessSSTaxWithholding()

  l12 = (): number | undefined => this.f1040.f4136?.credit()

  l13a = (): number | undefined => this.f1040.f2439?.credit()
  // TODO: qualified sick and family leave credits
  // Schedule H and form 7202 pre 4/1/21
  // Section 1341 credit for repayments for earlier years (since at least 2024)
  l13b = (): number | undefined => undefined

  // Net elective payment election amount from Form 3800, Part III, line 6, column (j)
  // TODO: do the form 3800
  l13c = (): number | undefined => undefined

  // TODO: Credit for repayment of amounts included in income from earlier years
  l13d = (): number | undefined => undefined // TODO: 'other' box

  // Removed sometime before 2024
  // reserved!
  // l13e = (): number | undefined => undefined
  // // deferred amount of net 965 tax liability
  // l13f = (): number | undefined => undefined
  // // reserved!
  // l13g = (): number | undefined => undefined
  // // TODO: qualified sick and family leave credits
  // // Schedule H and form 7202 post 3/31/21
  // l13h = (): number | undefined => undefined

  // only one desc text are now
  l13zDesc = (): string | undefined =>
    this.f1040.info.otherIncome?.otherPaymentDescription
  l13z = (): number | undefined => this.f1040.info.otherIncome?.otherPayment

  l14 = (): number =>
    sumFields([this.l13a(), this.l13b(), this.l13c(), this.l13d(), this.l13z()])

  l15 = (): number =>
    sumFields([this.l9(), this.l10(), this.l11(), this.l12(), this.l14()])

  // Credit for child and dependent care expenses form 2441, line 10

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5a(),
    this.l5b(),
    this.l6a(),
    this.l6b(),
    this.l6c(),
    this.l6d(),
    this.l6e(), //Reserved
    this.l6f(),
    this.l6g(),
    this.l6h(),
    this.l6i(),
    this.l6j(),
    this.l6k(),
    this.l6l(),
    this.l6m(),
    this.l6zDesc(), // 2025 form uses one text area instead of two fields
    this.l6z(),
    this.l7(),
    this.l8(),

    this.l9(),
    this.l10(),
    this.l11(),
    this.l12(),

    this.l13a(),
    this.l13b(),
    this.l13c(),
    this.l13d(),

    this.l13zDesc(), // 2025 form uses one text area instead of two fields
    this.l13z(),
    this.l14(),
    this.l15()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 36 TS expressions, 37 PDF fields
  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_02[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    text('topmostSubform[0].Page1[0].f1_03[0]', this.l1()),
    text('topmostSubform[0].Page1[0].f1_04[0]', this.l2()),
    text('topmostSubform[0].Page1[0].f1_05[0]', this.l3()),
    text('topmostSubform[0].Page1[0].f1_06[0]', this.l4()),
    text('topmostSubform[0].Page1[0].f1_07[0]', this.l5a()),
    text('topmostSubform[0].Page1[0].f1_08[0]', this.l5b()),
    text('topmostSubform[0].Page1[0].Line6a_ReadOrder[0].f1_09[0]', this.l6a()),
    text('topmostSubform[0].Page1[0].f1_10[0]', this.l6b()),
    text('topmostSubform[0].Page1[0].f1_11[0]', this.l6c()),
    text('topmostSubform[0].Page1[0].f1_12[0]', this.l6d()),
    text('topmostSubform[0].Page1[0].f1_13[0]', this.l6e()),
    text('topmostSubform[0].Page1[0].f1_14[0]', this.l6f()),
    text('topmostSubform[0].Page1[0].f1_15[0]', this.l6g()),
    text('topmostSubform[0].Page1[0].f1_16[0]', this.l6h()),
    text('topmostSubform[0].Page1[0].f1_17[0]', this.l6i()),
    text('topmostSubform[0].Page1[0].f1_18[0]', this.l6j()),
    text('topmostSubform[0].Page1[0].f1_19[0]', this.l6k()),
    text('topmostSubform[0].Page1[0].f1_20[0]', this.l6l()),
    text('topmostSubform[0].Page1[0].f1_21[0]', this.l6m()),
    text(
      'topmostSubform[0].Page1[0].Line6z_ReadOrder[0].f2_22[0]',
      this.l6zDesc()
    ),
    text('topmostSubform[0].Page1[0].f1_23[0]', this.l6z()),
    text('topmostSubform[0].Page1[0].f1_24[0]', this.l7()),
    text('topmostSubform[0].Page1[0].f1_25[0]', this.l8()),
    text('topmostSubform[0].Page1[0].f1_26[0]', this.l9()),
    text('topmostSubform[0].Page1[0].f1_27[0]', this.l10()),
    text('topmostSubform[0].Page1[0].f1_28[0]', this.l11()),
    text('topmostSubform[0].Page1[0].f1_29[0]', this.l12()),

    text(
      'topmostSubform[0].Page1[0].Line13_ReadOrder[0].f1_30[0]',
      this.l13a()
    ),
    text('topmostSubform[0].Page1[0].f1_31[0]', this.l13b()),
    text('topmostSubform[0].Page1[0].f1_32[0]', this.l13c()),
    text('topmostSubform[0].Page1[0].f1_33[0]', this.l13d()),
    text(
      'topmostSubform[0].Page1[0].Line13z_ReadOrder[0].f1_34[0]',
      this.l13zDesc()
    ),
    text('topmostSubform[0].Page1[0].f1_35[0]', this.l13z()),
    text('topmostSubform[0].Page1[0].f1_36[0]', this.l14()),
    text('topmostSubform[0].Page1[0].f1_37[0]', this.l15())
  ]
}
