import F1040Attachment from './F1040Attachment'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'

export default class Schedule8812 extends F1040Attachment {
  tag: FormTag = 'f1040s8'
  sequenceIndex = 47

  isNeeded = (): boolean =>
    this.f1040.info.taxPayer.dependents.some(
      (dep) =>
        this.f1040.childTaxCreditWorksheet.qualifiesChild(dep) ||
        this.f1040.childTaxCreditWorksheet.qualifiesOther(dep)
    )

  // This can be calculated with either pub 972 or the child tax credit worksheet, but for now we're only supporting the worksheet
  // TODO: Add pub 972 support
  l1 = (): number => this.f1040.childTaxCreditWorksheet.l8() ?? 0

  l2 = (): number => this.f1040.l19() ?? 0

  l3 = (): number => Math.max(0, this.l1() - this.l2())

  l4 = (): number | undefined =>
    this.f1040.childTaxCreditWorksheet.numberQualifyingChildren() * 1400

  l5 = (): number => Math.min(this.l3(), this.l4() ?? 0)

  // This is a horrible, horrible line
  // have net earnings from self-employment and used optional methods => report pub972 Earned Income Worksheet (even if taking EIC)
  // Taking EIC => completed worksheet B? => worksheet B line 4b, plus combat pay, minus clergy housing and meals, else EIC step 5 plus combat pay
  // Not taking EIC? => pub 972 Earned Income Worksheet if self employed, or filing Schedule SE, or filing Schedule C as a "statutory employee" ,
  // else Form 1040 l1, minus fellowships, income as an inmate, deferred compensation, and Medicaid waiver, unless you chose to inclue the Medicaid waivers,
  // and add combat pay in as well
  // So for now, it's just line 1 or EIC step 5 (line 9)
  // TODO: Add other earned income definitions
  l6 = (): number =>
    this.f1040.scheduleEIC.isNeeded()
      ? this.f1040.scheduleEIC.earnedIncome()
      : this.f1040.l1()

  l7checkBox = (): boolean => this.l6() > 2500

  l7 = (): number | undefined =>
    this.l7checkBox() ? this.l6() - 2500 : undefined

  l8 = (): number | undefined => (this.l7() ?? 0) * 0.15

  ssWithholding(): number {
    if (this.f1040.validW2s().length > 0) {
      return this.f1040
        .validW2s()
        .reduce((res, w2) => res + w2.ssWithholding, 0)
    }
    return 0
  }

  medicareWithholding = (): number =>
    this.f1040.validW2s().reduce((res, w2) => res + w2.medicareWithholding, 0)

  l9checkBox = (): boolean => (this.l4() ?? 0) > 4200

  l9 = (): number | undefined =>
    this.l9checkBox()
      ? this.ssWithholding() + this.medicareWithholding()
      : undefined

  l10 = (): number | undefined =>
    this.l9checkBox()
      ? sumFields([
          this.f1040.schedule1.l14(),
          this.f1040.schedule2.l5(),
          this.f1040.schedule2.l8()
        ])
      : undefined

  l11 = (): number | undefined =>
    this.l9checkBox() ? (this.l9() ?? 0) + (this.l10() ?? 0) : undefined

  // TODO: Add 1040-NR
  l12 = (): number | undefined =>
    this.l9checkBox()
      ? sumFields([this.f1040.l27(), this.f1040.schedule3.l10()])
      : undefined

  l13 = (): number | undefined =>
    this.l9checkBox()
      ? Math.max(0, (this.l11() ?? 0) - (this.l12() ?? 0))
      : undefined

  l14 = (): number | undefined =>
    this.l9checkBox() ? Math.max(this.l8() ?? 0, this.l13() ?? 0) : undefined

  l15 = (): number | undefined =>
    this.l9checkBox() ? Math.min(this.l14() ?? 0, this.l5()) : this.l5()

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    this.l1(),
    this.l2(),
    this.l3(),
    this.f1040.childTaxCreditWorksheet.numberQualifyingChildren(),
    this.l4(),
    this.l5(),
    this.l6(),
    undefined, // Nontaxable combat pay not supported,
    !this.l7checkBox(),
    this.l7checkBox(),
    this.l7(),
    this.l8(),
    !this.l9checkBox(),
    this.l9checkBox(),
    this.l9(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15()
  ]
}
