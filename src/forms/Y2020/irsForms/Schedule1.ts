import { Information } from 'ustaxes/core/data'
import TaxPayer from 'ustaxes/core/data/TaxPayer'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import ScheduleE from './ScheduleE'
import { sumFields } from 'ustaxes/core/irsForms/util'
import log from 'ustaxes/core/log'
import F1040 from './F1040'
import F8889 from './F8889'

const unimplemented = (message: string): void =>
  log.warn(`[Schedule 1] unimplemented ${message}`)

export default class Schedule1 extends Form {
  tag: FormTag = 'f1040s1'
  sequenceIndex = 1
  state: Information
  scheduleE?: ScheduleE
  f1040: F1040
  f8889?: F8889
  f8889Spouse?: F8889
  otherIncomeStrings: Set<string>

  constructor(info: Information, f1040: F1040) {
    super()
    this.state = info
    this.f1040 = f1040
    this.otherIncomeStrings = new Set<string>()
  }

  addScheduleE = (scheduleE: ScheduleE): void => {
    this.scheduleE = scheduleE
  }

  addF8889 = (f8889: F8889): void => {
    this.f8889 = f8889
  }
  addF8889Spouse = (f8889: F8889): void => {
    this.f8889Spouse = f8889
  }

  l1 = (): number | undefined => undefined
  l2a = (): number | undefined => undefined
  l2b = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => this.scheduleE?.l41()
  l6 = (): number | undefined => undefined
  l7 = (): number | undefined => undefined
  l8 = (): number => {
    if (
      this.f8889?.l16() !== undefined ||
      this.f8889?.l20() !== undefined ||
      this.f8889Spouse?.l16() !== undefined ||
      this.f8889Spouse?.l20() !== undefined
    ) {
      this.otherIncomeStrings.add('HSA')
    }
    return sumFields([
      this.f8889?.l16(),
      this.f8889?.l20(),
      this.f8889Spouse?.l16(),
      this.f8889Spouse?.l20()
    ])
  }
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
  l12 = (): number | undefined =>
    sumFields([this.f8889?.l13(), this.f8889Spouse?.l13()])
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
      Array.from(this.otherIncomeStrings).join(' '), // Other income type textbox
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
