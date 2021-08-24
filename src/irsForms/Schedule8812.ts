import { TaxPayer as TP } from 'ustaxes/redux/data'
import TaxPayer from 'ustaxes/redux/TaxPayer'
import F1040 from './F1040'
import { computeField, sumFields } from './util'
import Form, { FormTag } from './Form'

export default class Schedule8812 implements Form {
  tp: TaxPayer
  f1040: F1040
  tag: FormTag = 'f1040s8'
  sequenceIndex: number = 47

  constructor(tp: TP, f1040: F1040) {
    this.tp = new TaxPayer(tp)
    this.f1040 = f1040
  }

  // This can be calculated with either pub 972 or the child tax credit worksheet, but for now we're only supporting the worksheet
  // TODO: Add pub 972 support
  l1 = (): number | undefined =>
    computeField(this.f1040.childTaxCreditWorksheet?.l8())

  l2 = (): number | undefined => computeField(this.f1040.l19())

  l3 = (): number | undefined =>
    computeField(this.l1()) - computeField(this.l2()) > 0
      ? computeField(this.l1()) - computeField(this.l2())
      : undefined

  l4 = (): number | undefined =>
    computeField(
      this.f1040.childTaxCreditWorksheet?.numberQualifyingChildren()
    ) > 0
      ? computeField(
          this.f1040.childTaxCreditWorksheet?.numberQualifyingChildren()
        ) * 1400
      : undefined

  l5 = (): number | undefined =>
    Math.min(computeField(this.l3()), computeField(this.l4()))

  // This is a horrible, horrible line
  // have net earnings from self-employment and used optional methods => report pub972 Earned Income Worksheet (even if taking EIC)
  // Taking EIC => completed worksheet B? => worksheet B line 4b, plus combat pay, minus clergy housing and meals, else EIC step 5 plus combat pay
  // Not taking EIC? => pub 972 Earned Income Worksheet if self employed, or filing Schedule SE, or filing Schedule C as a "statutory employee" ,
  // else Form 1040 l1, minus fellowships, income as an inmate, deferred compensation, and Medicaid waiver, unless you chose to inclue the Medicaid waivers,
  // and add combat pay in as well
  // So for now, it's just line 1 or EIC step 5 (line 9)
  // TODO: Add other earned income definitions
  l6 = (): number | undefined =>
    this.f1040.scheduleEIC !== undefined
      ? this.f1040.scheduleEIC?.earnedIncome(this.f1040)
      : this.f1040.l1()

  l7checkBox = (): boolean => computeField(this.l6()) > 2500

  l7 = (): number | undefined =>
    computeField(this.l6()) > 2500 ? computeField(this.l6()) - 2500 : undefined

  l8 = (): number | undefined => computeField(this.l7()) * 0.15

  ssWithholding(): number {
    if (this.f1040.validW2s().length > 0) {
      return this.f1040
        .validW2s()
        .reduce((res, w2) => res + computeField(w2.ssWithholding), 0)
    }
    return 0
  }

  medicareWithholding = (): number =>
    this.f1040
      .validW2s()
      .reduce((res, w2) => res + computeField(w2.medicareWithholding), 0)

  l9checkBox = (): boolean => computeField(this.l4()) > 4200

  l9 = (): number | undefined =>
    this.l9checkBox()
      ? this.ssWithholding() + this.medicareWithholding()
      : undefined

  l10 = (): number | undefined =>
    this.l9checkBox()
      ? sumFields([
          this.f1040.schedule1?.l14(),
          this.f1040.schedule2?.l5(),
          this.f1040.schedule2?.l8()
        ])
      : undefined

  l11 = (): number | undefined =>
    this.l9checkBox()
      ? computeField(this.l9()) + computeField(this.l10())
      : undefined

  // TODO: Add 1040-NR
  l12 = (): number | undefined =>
    this.l9checkBox()
      ? sumFields([this.f1040.l27(), this.f1040.schedule3?.l10()])
      : undefined

  l13 = (): number | undefined =>
    this.l9checkBox()
      ? computeField(this.l11()) - computeField(this.l12()) > 0
        ? computeField(this.l11()) - computeField(this.l12())
        : 0
      : undefined

  l14 = (): number | undefined =>
    this.l9checkBox()
      ? Math.max(computeField(this.l8()), computeField(this.l13()))
      : undefined

  l15 = (): number | undefined =>
    this.l9checkBox()
      ? Math.min(computeField(this.l14()), computeField(this.l5()))
      : computeField(this.l5())

  fields = (): Array<string | number | boolean | undefined> => {
    return [
      this.tp.namesString(),
      this.tp.tp.primaryPerson?.ssid,
      this.l1(),
      this.l2(),
      this.l3(),
      this.f1040.childTaxCreditWorksheet?.numberQualifyingChildren(),
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
}
