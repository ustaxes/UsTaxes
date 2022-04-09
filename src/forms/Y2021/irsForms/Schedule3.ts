import F1040Attachment from './F1040Attachment'
import { IncomeW2, PersonRole } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { fica } from '../data/federal'
import { Field } from 'ustaxes/core/pdfFiller'

export const claimableExcessSSTaxWithholding = (w2s: IncomeW2[]): number => {
  /* Excess FICA taxes are calculated per person. If an individual person
     has greater than the applicable amount then they are entitled to a refund
     of that amount
   */
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

export default class Schedule3 extends F1040Attachment {
  tag: FormTag = 'f1040s3'
  sequenceIndex = 3

  deductions = (): number => 0
  // Part I: Nonrefundable credits
  l1 = (): number | undefined => undefined
  l2 = (): number | undefined => undefined
  l3 = (): number | undefined => this.f1040.f8863?.l19()
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => undefined
  l6a = (): number | undefined => undefined // TODO: other credits
  l6b = (): number | undefined => undefined // TODO: other credits
  l6c = (): number | undefined => undefined // TODO: other credits
  l6d = (): number | undefined => undefined // TODO: other credits
  l6e = (): number | undefined => undefined // TODO: other credits
  l6f = (): number | undefined => undefined // TODO: other credits
  l6g = (): number | undefined => undefined // TODO: other credits
  l6h = (): number | undefined => undefined // TODO: other credits
  l6i = (): number | undefined => undefined // TODO: other credits
  l6j = (): number | undefined => undefined // TODO: other credits
  l6k = (): number | undefined => undefined // TODO: other credits
  l6l = (): number | undefined => undefined // TODO: other credits
  l6zDesc1 = (): string | undefined => undefined
  l6zDesc2 = (): string | undefined => undefined
  l6z = (): number | undefined => undefined // TODO: other credits

  l7 = (): number =>
    sumFields([
      this.l6a(),
      this.l6b(),
      this.l6c(),
      this.l6d(),
      this.l6e(),
      this.l6f(),
      this.l6g(),
      this.l6h(),
      this.l6i(),
      this.l6j(),
      this.l6k(),
      this.l6l(),
      this.l6z()
    ])

  l8 = (): number =>
    sumFields([
      this.l1(),
      this.l2(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l7()
    ])

  // Part II: Other payments and refundable credits
  l9 = (): number | undefined => this.f1040.f8962?.credit()

  // TODO: Amount paid with extension for time to file
  l10 = (): number | undefined => undefined

  l11 = (): number =>
    // TODO: also applies to RRTA tax
    claimableExcessSSTaxWithholding(this.f1040.validW2s())

  l12 = (): number | undefined => this.f1040.f4136?.credit()

  l13a = (): number | undefined => this.f1040.f2439?.credit()
  // TODO: qualified sick and family leave credits
  // Schedule H and form 7202 pre 4/1/21
  l13b = (): number | undefined => undefined

  // Health coverage tax credit from 8885
  l13c = (): number | undefined => undefined

  // TODO: Credit for repayment of amounts included in income from earlier years
  l13d = (): number | undefined => undefined // TODO: 'other' box

  // reserved!
  l13e = (): number | undefined => undefined

  // deferred amount of net 965 tax liability
  l13f = (): number | undefined => undefined

  l13g = (): number | undefined => this.f1040.f2441?.credit()

  // TODO: qualified sick and family leave credits
  // Schedule H and form 7202 post 3/31/21
  l13h = (): number | undefined => undefined

  l13zDesc1 = (): string | undefined => undefined
  l13zDesc2 = (): string | undefined => undefined
  l13z = (): number | undefined => undefined

  l14 = (): number =>
    sumFields([
      this.l13a(),
      this.l13b(),
      this.l13c(),
      this.l13d(),
      this.l13e(),
      this.l13f(),
      this.l13g(),
      this.l13h(),
      this.l13z()
    ])

  l15 = (): number =>
    sumFields([this.l9(), this.l10(), this.l11(), this.l12(), this.l14()])

  // Credit for child and dependent care expenses form 2441, line 10

  fields = (): Field[] => [
    this.f1040.info.namesString(),
    this.f1040.info.taxPayer.primaryPerson?.ssid,
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6a(),
    this.l6b(),
    this.l6c(),
    this.l6d(),
    this.l6e(),
    this.l6f(),
    this.l6g(),
    this.l6h(),
    this.l6i(),
    this.l6j(),
    this.l6k(),
    this.l6l(),
    this.l6zDesc1(),
    this.l6zDesc2(),
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
    //this.l13e(),  // this field is left for future use and is not fillable
    this.l13f(),
    this.l13g(),
    this.l13h(),
    this.l13zDesc1(),
    this.l13zDesc2(),
    this.l13z(),
    this.l14(),
    this.l15()
  ]
}
