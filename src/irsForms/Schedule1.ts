import { Information } from 'ustaxes/redux/data'
import TaxPayer from 'ustaxes/redux/TaxPayer'
import Form, { FormTag } from './Form'
import ScheduleE from './ScheduleE'
import { sumFields } from './util'
import log from 'ustaxes/log'
import F1040 from './F1040'

const unimplemented = (message: string): void =>
  log.warn(`[Schedule 1] unimplemented ${message}`)

export default class Schedule1 implements Form {
  tag: FormTag = 'f1040s1'
  sequenceIndex = 1
  state: Information
  scheduleE?: ScheduleE
  f1040: F1040

  constructor(info: Information, f1040: F1040) {
    this.state = info
    this.f1040 = f1040
  }

  addScheduleE = (scheduleE: ScheduleE): void => {
    this.scheduleE = scheduleE
  }

  l1 = (): number | undefined => undefined
  l2a = (): number | undefined => undefined
  l2b = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => this.scheduleE?.l41()
  l6 = (): number | undefined => undefined
  l7 = (): number | undefined => undefined
  l8 = (): number | undefined => undefined
  l9 = (): number =>
    sumFields([
      this.l1(),
      this.l2a(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l8()
    ])

  l10 = (): number | undefined => undefined
  l11 = (): number | undefined => undefined
  l12 = (): number | undefined => undefined
  l13 = (): number | undefined => undefined
  l14 = (): number | undefined => undefined
  l15 = (): number | undefined => undefined
  l16 = (): number | undefined => undefined
  l17 = (): number | undefined => undefined
  l18 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined
  l20 = (): number | undefined => this.f1040.studentLoanInterestWorksheet?.l9()
  l21 = (): number | undefined => undefined
  // TO DO: Write in Deductions
  l22writeIn = (): number | undefined => undefined

  l22 = (): number | undefined => {
    unimplemented('Adjustments to income')
    return sumFields([
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
      this.l22writeIn()
    ])
  }

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.state.taxPayer)

    return [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
      this.l1(),
      this.l2a(),
      this.l2b(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      undefined, // Other income type
      undefined, // Other income type 2
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
      undefined, // Alimony Recipient SSN
      undefined, // Date of Divorce/Seperation
      this.l19(),
      this.l20(),
      this.l21(),
      this.l22()
    ]
  }
}
