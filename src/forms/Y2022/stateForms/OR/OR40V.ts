import Form from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { OR40 } from './OR40'
import { Field } from 'ustaxes/core/pdfFiller'
import { State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export default class OR40V extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  or40: OR40
  formOrder = -1
  attachments: () => Form[] = () => []

  constructor(f1040: F1040, or40: OR40) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'OR-40-V'
    this.state = 'OR'
    this.or40 = or40
  }

  /**
   * Index 0: Button - Clear form
   */
  ButtonClearform = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.ButtonClearform()

  /**
   * Index 1: or-40-v-p1-1
   */
  or40vp11 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.or40vp11()

  /**
   * Index 2: or-40-v-p1-2
   */
  or40vp12 = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.or40vp12()

  /**
   * Index 3: or-40-v-p1-3
   */
  or40vp13 = (): string | undefined => {
    return undefined
  }

  f3 = (): string | undefined => this.or40vp13()

  /**
   * Index 4: or-40-v-p1-4
   */
  or40vp14 = (): string | undefined => {
    return undefined
  }

  f4 = (): string | undefined => this.or40vp14()

  /**
   * Index 5: or-40-v-p1-5
   */
  or40vp15 = (): string | undefined => {
    return undefined
  }

  f5 = (): string | undefined => this.or40vp15()

  /**
   * Index 6: or-40-v-p1-6
   */
  or40vp16 = (): string | undefined => {
    return undefined
  }

  f6 = (): string | undefined => this.or40vp16()

  /**
   * Index 7: or-40-v-p1-7
   */
  or40vp17 = (): string | undefined => {
    return undefined
  }

  f7 = (): string | undefined => this.or40vp17()

  /**
   * Index 8: or-40-v-p1-8
   */
  or40vp18 = (): string | undefined => {
    return undefined
  }

  f8 = (): string | undefined => this.or40vp18()

  /**
   * Index 9: or-40-v-p1-9
   */
  or40vp19 = (): string | undefined => {
    return undefined
  }

  f9 = (): string | undefined => this.or40vp19()

  /**
   * Index 10: or-40-v-p1-10
   */
  or40vp110 = (): string | undefined => {
    return undefined
  }

  f10 = (): string | undefined => this.or40vp110()

  /**
   * Index 11: or-40-v-p1-11
   */
  or40vp111 = (): string | undefined => {
    return undefined
  }

  f11 = (): string | undefined => this.or40vp111()

  /**
   * Index 12: or-40-v-p1-12
   */
  or40vp112 = (): string | undefined => {
    return undefined
  }

  f12 = (): string | undefined => this.or40vp112()

  /**
   * Index 13: or-40-v-p1-13
   */
  or40vp113 = (): string | undefined => {
    return undefined
  }

  f13 = (): string | undefined => this.or40vp113()

  /**
   * Index 14: or-40-v-p1-14
   */
  or40vp114 = (): string | undefined => {
    return undefined
  }

  f14 = (): string | undefined => this.or40vp114()

  /**
   * Index 15: or-40-v-p1-15
   */
  or40vp115 = (): string | undefined => {
    return undefined
  }

  f15 = (): string | undefined => this.or40vp115()

  /**
   * Index 16: or-40-v-p1-group1
   */
  or40vp1group1 = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.or40vp1group1()

  /**
   * Index 17: or-40-v-p1-16
   */
  or40vp116 = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.or40vp116()

  fields = (): Field[] => [
    this.f0(),
    this.f1(),
    this.f2(),
    this.f3(),
    this.f4(),
    this.f5(),
    this.f6(),
    this.f7(),
    this.f8(),
    this.f9(),
    this.f10(),
    this.f11(),
    this.f12(),
    this.f13(),
    this.f14(),
    this.f15(),
    this.f16(),
    this.f17()
  ]
}
