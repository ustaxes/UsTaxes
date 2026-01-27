import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'

export default class F7206 extends F1040Attachment {
  tag: FormTag = 'f7206'
  sequenceIndex = 206

  private worksheet = () =>
    this.f1040.info.adjustments?.selfEmployedHealthInsuranceWorksheet

  private hasWorksheet = (): boolean =>
    this.worksheet() !== undefined &&
    Object.values(this.worksheet() ?? {}).some((value) => value !== undefined)

  isNeeded = (): boolean =>
    this.f1040.info.adjustments?.selfEmployedHealthInsuranceDeduction !==
      undefined || this.hasWorksheet()

  l1 = (): number | undefined => this.worksheet()?.line1
  l2 = (): number | undefined => this.worksheet()?.line2
  l3 = (): number | undefined => this.worksheet()?.line3
  l4 = (): number | undefined => this.worksheet()?.line4
  l5 = (): number | undefined => this.worksheet()?.line5
  l6 = (): number | undefined => this.worksheet()?.line6
  l7 = (): number | undefined => this.worksheet()?.line7
  l8 = (): number | undefined => this.worksheet()?.line8
  l9 = (): number | undefined => this.worksheet()?.line9
  l10 = (): number | undefined => this.worksheet()?.line10
  l11 = (): number | undefined => this.worksheet()?.line11
  l12 = (): number | undefined => this.worksheet()?.line12
  l13 = (): number | undefined => this.worksheet()?.line13
  l14 = (): number | undefined =>
    this.worksheet()?.line14 ??
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
}
