import { Information } from 'usTaxes/redux/data'
import { displayNumber, computeField, sumFields } from './util'
import TaxPayer from 'usTaxes/redux/TaxPayer'
import Form, { FormTag } from './Form'
import F4137 from './F4137'
import F8919 from './F8919'
import ScheduleSE from './ScheduleSE'
import { fica } from 'usTaxes/data/federal'

export const needsF8959 = (state: Information): boolean => {
  const filingStatus = state.taxPayer.filingStatus
  const totalW2Income = state.w2s
    .map((w2) => w2.income)
    .reduce((l, r) => l + r, 0)
  return (
    filingStatus !== undefined &&
    fica.additionalMedicareTaxThreshold(filingStatus) < totalW2Income
  )
}

export default class F8959 implements Form {
  tag: FormTag = 'f8959'
  sequenceIndex: number = 71
  state: Information
  f4137?: F4137
  f8919?: F8919
  scheduleSE?: ScheduleSE

  constructor(
    state: Information,
    f4137?: F4137,
    f8919?: F8919,
    scheduleSE?: ScheduleSE
  ) {
    this.state = state
    this.f4137 = f4137
    this.f8919 = f8919
    this.scheduleSE = scheduleSE
  }

  thresholdFromFilingStatus = (): number | undefined => {
    const filingStatus = this.state.taxPayer.filingStatus
    return filingStatus !== undefined
      ? fica.additionalMedicareTaxThreshold(filingStatus)
      : undefined
  }

  computeAdditionalMedicareTax = (compensation: number | undefined): number => {
    return fica.additionalMedicareTaxRate * computeField(compensation)
  }

  // Part I: Additional Medicare Tax on Medicare Wages
  l1 = (): number | undefined =>
    this.state.w2s.map((w2) => w2.income).reduce((l, r) => l + r, 0)

  l2 = (): number | undefined => this.f4137?.l6()
  l3 = (): number | undefined => this.f8919?.l6()
  l4 = (): number | undefined =>
    displayNumber(sumFields([this.l1(), this.l2(), this.l3()]))

  l5 = (): number | undefined => this.thresholdFromFilingStatus()
  l6 = (): number | undefined =>
    displayNumber(computeField(this.l4()) - computeField(this.l5()))

  l7 = (): number | undefined =>
    displayNumber(this.computeAdditionalMedicareTax(this.l6()))

  // Part II: Additional Medicare Tax on Self-Employment Income
  l8 = (): number | undefined => this.scheduleSE?.l6()
  l9 = (): number | undefined => this.thresholdFromFilingStatus()
  l10 = (): number | undefined => this.l4()
  l11 = (): number | undefined =>
    displayNumber(computeField(this.l9()) - computeField(this.l10()))

  l12 = (): number | undefined =>
    displayNumber(computeField(this.l8()) - computeField(this.l11()))

  l13 = (): number | undefined =>
    displayNumber(this.computeAdditionalMedicareTax(this.l12()))

  // Part III: Additional Medicare Tax on Railroad Retirement Tax Act
  // (RRTA) Compensation
  l14 = (): number | undefined => undefined // TODO: RRTA in W2
  l15 = (): number | undefined => this.thresholdFromFilingStatus()
  l16 = (): number | undefined =>
    displayNumber(computeField(this.l14()) - computeField(this.l15()))

  l17 = (): number | undefined =>
    displayNumber(this.computeAdditionalMedicareTax(this.l12()))

  // Part IV: Total Medicare Tax
  l18 = (): number | undefined =>
    displayNumber(
      computeField(this.l7()) +
        computeField(this.l3()) +
        computeField(this.l17())
    )

  // Part V: Withholding Reconciliation
  l19 = (): number | undefined =>
    this.state.w2s
      .map((w2) => w2.medicareWithholding)
      .reduce((l, r) => l + r, 0)

  l20 = (): number | undefined => computeField(this.l1())
  l21 = (): number | undefined =>
    displayNumber(fica.regularMedicareTaxRate * computeField(this.l20()))

  l22 = (): number | undefined =>
    displayNumber(computeField(this.l19()) - computeField(this.l21()))

  l23 = (): number | undefined => 0 // TODO: RRTA
  l24 = (): number | undefined =>
    displayNumber(computeField(this.l22()) + computeField(this.l23()))

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.state.taxPayer)
    return [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
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
      this.l14(),

      this.l15(),
      this.l16(),
      this.l17(),

      this.l18(),

      this.l19(),
      this.l20(),
      this.l21(),
      this.l22(),
      this.l23(),
      this.l24()
    ]
  }
}
