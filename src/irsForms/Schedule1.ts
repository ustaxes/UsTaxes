import { Information } from '../redux/data'
import TaxPayer from '../redux/TaxPayer'
import { anArrayOf } from '../util'
import Form, { FormTag } from './Form'
import ScheduleE from './ScheduleE'
import { sumFields } from './util'
import log from '../log'

const unimplemented = (message: string): void =>
  log.warn(`[Schedule 1] unimplemented ${message}`)

export default class Schedule1 implements Form {
  tag: FormTag = 'f1040s1'
  state: Information
  scheduleE?: ScheduleE

  constructor (info: Information) {
    this.state = info
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
  l9 = (): number => sumFields([
    this.l1(),
    this.l2a(),
    this.l3(),
    this.l4(),
    this.l5(),
    this.l6(),
    this.l7(),
    this.l8()
  ])

  l22 = (): number | undefined => {
    unimplemented('Adjustments to income')
    return undefined
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
      ...anArrayOf(14, undefined),
      this.l22()
    ]
  }
}
