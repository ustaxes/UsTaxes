import F1040Attachment from './F1040Attachment'
import { SelfEmployedHealthInsuranceWorksheet } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
import { toFiniteNumber } from 'ustaxes/core/util'
import {
  estimateHealthInsurancePremiums,
  estimateProfitableSelfEmploymentIncome
} from 'ustaxes/core/selfEmployment'
import {
  computeForm7206DerivedLines,
  formatForm7206Ratio
} from 'ustaxes/core/form7206'

export default class F7206 extends F1040Attachment {
  tag: FormTag = 'f7206'
  sequenceIndex = 206

  private worksheet = () =>
    this.f1040.info.adjustments?.selfEmployedHealthInsuranceWorksheet

  private worksheetLine = (
    line: keyof SelfEmployedHealthInsuranceWorksheet
  ): number | undefined => toFiniteNumber(this.worksheet()?.[line] as unknown)

  private hasWorksheet = (): boolean =>
    this.worksheet() !== undefined &&
    Object.values(this.worksheet() ?? {}).some(
      (value) => toFiniteNumber(value) !== undefined
    )

  isNeeded = (): boolean =>
    this.f1040.info.adjustments?.selfEmployedHealthInsuranceDeduction !==
      undefined || this.hasWorksheet()

  l1 = (): number | undefined =>
    this.worksheetLine('line1') ??
    estimateHealthInsurancePremiums(this.f1040.info)
  l2 = (): number | undefined => this.worksheetLine('line2')
  l3 = (): number | undefined =>
    this.worksheetLine('line3') ??
    computeForm7206DerivedLines({
      line1: this.l1(),
      line2: this.l2()
    }).line3
  l4 = (): number | undefined =>
    this.worksheetLine('line4') ?? this.f1040.scheduleC?.l31()
  l5 = (): number | undefined =>
    this.worksheetLine('line5') ??
    estimateProfitableSelfEmploymentIncome(this.f1040.info)
  l6 = (): number | undefined =>
    this.worksheetLine('line6') ??
    computeForm7206DerivedLines({
      line4: this.l4(),
      line5: this.l5()
    }).line6
  l7 = (): number | undefined =>
    this.worksheetLine('line7') ??
    computeForm7206DerivedLines({
      line4: this.l4(),
      line5: this.l5(),
      deductibleSelfEmploymentTax: this.f1040.scheduleSE.l13()
    }).line7
  l8 = (): number | undefined =>
    this.worksheetLine('line8') ??
    computeForm7206DerivedLines({
      line4: this.l4(),
      line5: this.l5(),
      deductibleSelfEmploymentTax: this.f1040.scheduleSE.l13()
    }).line8
  l9 = (): number | undefined =>
    this.worksheetLine('line9') ?? this.f1040.schedule1.l16()
  l10 = (): number | undefined =>
    this.worksheetLine('line10') ??
    computeForm7206DerivedLines({
      line4: this.l4(),
      line5: this.l5(),
      line9: this.l9(),
      deductibleSelfEmploymentTax: this.f1040.scheduleSE.l13()
    }).line10
  l11 = (): number | undefined => this.worksheetLine('line11')
  l12 = (): number | undefined =>
    this.worksheetLine('line12') ?? this.f1040.f2555?.l45()
  l13 = (): number | undefined =>
    this.worksheetLine('line13') ??
    computeForm7206DerivedLines({
      line4: this.l4(),
      line5: this.l5(),
      line9: this.l9(),
      line11: this.l11(),
      line12: this.l12(),
      deductibleSelfEmploymentTax: this.f1040.scheduleSE.l13()
    }).line13
  l14 = (): number | undefined =>
    this.worksheetLine('line14') ??
    computeForm7206DerivedLines({
      line1: this.l1(),
      line2: this.l2(),
      line4: this.l4(),
      line5: this.l5(),
      line9: this.l9(),
      line11: this.l11(),
      line12: this.l12(),
      deductibleSelfEmploymentTax: this.f1040.scheduleSE.l13()
    }).line14 ??
    this.f1040.info.adjustments?.selfEmployedHealthInsuranceDeduction

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
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
    this.l14()
  ]

  fillInstructions = (): FillInstructions => [
    text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
    text(
      'topmostSubform[0].Page1[0].f1_2[0]',
      this.f1040.info.taxPayer.primaryPerson.ssid
    ),
    text('topmostSubform[0].Page1[0].f1_3[0]', this.l1()),
    text('topmostSubform[0].Page1[0].f1_4[0]', this.l2()),
    text('topmostSubform[0].Page1[0].f1_5[0]', this.l3()),
    text('topmostSubform[0].Page1[0].f1_6[0]', this.l4()),
    text('topmostSubform[0].Page1[0].f1_7[0]', this.l5()),
    text('topmostSubform[0].Page1[0].f1_8[0]', formatForm7206Ratio(this.l6())),
    text('topmostSubform[0].Page1[0].f1_9[0]', this.l7()),
    text('topmostSubform[0].Page1[0].f1_10[0]', this.l8()),
    text('topmostSubform[0].Page1[0].f1_11[0]', this.l9()),
    text('topmostSubform[0].Page1[0].f1_12[0]', this.l10()),
    text('topmostSubform[0].Page1[0].f1_13[0]', this.l11()),
    text('topmostSubform[0].Page1[0].f1_14[0]', this.l12()),
    text('topmostSubform[0].Page1[0].f1_15[0]', this.l13()),
    text('topmostSubform[0].Page1[0].f1_16[0]', this.l14())
  ]
}
