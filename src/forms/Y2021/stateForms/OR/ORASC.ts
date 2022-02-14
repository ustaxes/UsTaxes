import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
// import { sumFields } from 'ustaxes/core/irsForms/util'
import {
  // AccountType,
  // FilingStatus,
  Information,
  State
} from 'ustaxes/core/data'
// import parameters from './Parameters'

export class ORASC extends Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  formOrder = 0
  methods: FormMethods

  constructor(info: Information, f1040: F1040) {
    super()
    this.info = info
    this.f1040 = f1040
    this.formName = 'OR-ASC'
    this.state = 'OR'
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => {
    // const pmt = this.payment()
    const result: Form[] = []
    // if ((pmt ?? 0) > 0) {
    //   result.push(this.il1040V)
    // }
    // if (this.scheduleEIC.isRequired()) {
    //   result.push(this.scheduleEIC)
    // }
    // if (this.methods.stateWithholding() > 0) {
    //   const ilwit = new ILWIT(this.info, this.f1040)
    //   result.push(ilwit)
    //   ilwit.attachments().forEach((f) => result.push(f))
    // }

    return result
  }

  /**
   * Index 0: or-asc-p1-2
   */
  orascp12 = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.orascp12()

  /**
   * Index 1: or-asc-p1-3
   */
  orascp13 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.orascp13()

  /**
   * Index 2: or-asc-p1-4
   */
  orascp14 = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.orascp14()

  /**
   * Index 3: or-asc-p1-5
   */
  orascp15 = (): string | undefined => {
    return undefined
  }

  f3 = (): string | undefined => this.orascp15()

  /**
   * Index 4: or-asc-p1-6
   */
  orascp16 = (): string | undefined => {
    return undefined
  }

  f4 = (): string | undefined => this.orascp16()

  /**
   * Index 5: or-asc-p1-7
   */
  orascp17 = (): string | undefined => {
    return undefined
  }

  f5 = (): string | undefined => this.orascp17()

  /**
   * Index 6: or-asc-p1-8
   */
  orascp18 = (): string | undefined => {
    return undefined
  }

  f6 = (): string | undefined => this.orascp18()

  /**
   * Index 7: or-asc-p1-12
   */
  orascp112 = (): string | undefined => {
    return undefined
  }

  f7 = (): string | undefined => this.orascp112()

  /**
   * Index 8: or-asc-p1-11
   */
  orascp111 = (): string | undefined => {
    return undefined
  }

  f8 = (): string | undefined => this.orascp111()

  /**
   * Index 9: or-asc-p1-1
   */
  orascp11 = (): string | undefined => {
    return undefined
  }

  f9 = (): string | undefined => this.orascp11()

  /**
   * Index 10: or-asc-p2-1
   */
  orascp21 = (): string | undefined => {
    return undefined
  }

  f10 = (): string | undefined => this.orascp21()

  /**
   * Index 11: or-asc-p2-3
   */
  orascp23 = (): string | undefined => {
    return undefined
  }

  f11 = (): string | undefined => this.orascp23()

  /**
   * Index 12: or-asc-p2-4
   */
  orascp24 = (): string | undefined => {
    return undefined
  }

  f12 = (): string | undefined => this.orascp24()

  /**
   * Index 13: or-asc-p2-6
   */
  orascp26 = (): string | undefined => {
    return undefined
  }

  f13 = (): string | undefined => this.orascp26()

  /**
   * Index 14: or-asc-p2-7
   */
  orascp27 = (): string | undefined => {
    return undefined
  }

  f14 = (): string | undefined => this.orascp27()

  /**
   * Index 15: or-asc-p1-1a
   */
  orascp11a = (): string | undefined => {
    return undefined
  }

  f15 = (): string | undefined => this.orascp11a()

  /**
   * Index 16: or-asc-p1-1b
   */
  orascp11b = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.orascp11b()

  /**
   * Index 17: or-asc-p1-9
   */
  orascp19 = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.orascp19()

  /**
   * Index 18: or-asc-p1-10
   */
  orascp110 = (): string | undefined => {
    return undefined
  }

  f18 = (): string | undefined => this.orascp110()

  /**
   * Index 19: or-asc-p2-9
   */
  orascp29 = (): string | undefined => {
    return undefined
  }

  f19 = (): string | undefined => this.orascp29()

  /**
   * Index 20: or-asc-p2-10
   */
  orascp210 = (): string | undefined => {
    return undefined
  }

  f20 = (): string | undefined => this.orascp210()

  /**
   * Index 21: or-asc-p2-12
   */
  orascp212 = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.orascp212()

  /**
   * Index 22: or-asc-p2-13
   */
  orascp213 = (): string | undefined => {
    return undefined
  }

  f22 = (): string | undefined => this.orascp213()

  /**
   * Index 23: or-asc-p2-15
   */
  orascp215 = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.orascp215()

  /**
   * Index 24: or-asc-p2-16
   */
  orascp216 = (): string | undefined => {
    return undefined
  }

  f24 = (): string | undefined => this.orascp216()

  /**
   * Index 25: or-asc-p2-17
   */
  orascp217 = (): string | undefined => {
    return undefined
  }

  f25 = (): string | undefined => this.orascp217()

  /**
   * Index 26: or-asc-p2-18
   */
  orascp218 = (): string | undefined => {
    return undefined
  }

  f26 = (): string | undefined => this.orascp218()

  /**
   * Index 27: or-asc-p2-19
   */
  orascp219 = (): string | undefined => {
    return undefined
  }

  f27 = (): string | undefined => this.orascp219()

  /**
   * Index 28: or-asc-p2-20
   */
  orascp220 = (): string | undefined => {
    return undefined
  }

  f28 = (): string | undefined => this.orascp220()

  /**
   * Index 29: or-asc-p2-21
   */
  orascp221 = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.orascp221()

  /**
   * Index 30: or-asc-p2-22
   */
  orascp222 = (): string | undefined => {
    return undefined
  }

  f30 = (): string | undefined => this.orascp222()

  /**
   * Index 31: or-asc-p2-23
   */
  orascp223 = (): string | undefined => {
    return undefined
  }

  f31 = (): string | undefined => this.orascp223()

  /**
   * Index 32: or-asc-p2-24
   */
  orascp224 = (): string | undefined => {
    return undefined
  }

  f32 = (): string | undefined => this.orascp224()

  /**
   * Index 33: or-asc-p2-25
   */
  orascp225 = (): string | undefined => {
    return undefined
  }

  f33 = (): string | undefined => this.orascp225()

  /**
   * Index 34: or-asc-p3-1
   */
  orascp31 = (): string | undefined => {
    return undefined
  }

  f34 = (): string | undefined => this.orascp31()

  /**
   * Index 35: or-asc-p3-2
   */
  orascp32 = (): string | undefined => {
    return undefined
  }

  f35 = (): string | undefined => this.orascp32()

  /**
   * Index 36: or-asc-p3-3
   */
  orascp33 = (): string | undefined => {
    return undefined
  }

  f36 = (): string | undefined => this.orascp33()

  /**
   * Index 37: or-asc-p3-4
   */
  orascp34 = (): string | undefined => {
    return undefined
  }

  f37 = (): string | undefined => this.orascp34()

  /**
   * Index 38: or-asc-p3-5
   */
  orascp35 = (): string | undefined => {
    return undefined
  }

  f38 = (): string | undefined => this.orascp35()

  /**
   * Index 39: or-asc-p3-6
   */
  orascp36 = (): string | undefined => {
    return undefined
  }

  f39 = (): string | undefined => this.orascp36()

  /**
   * Index 40: or-asc-p3-8
   */
  orascp38 = (): string | undefined => {
    return undefined
  }

  f40 = (): string | undefined => this.orascp38()

  /**
   * Index 41: or-asc-p3-10
   */
  orascp310 = (): string | undefined => {
    return undefined
  }

  f41 = (): string | undefined => this.orascp310()

  /**
   * Index 42: Button - Clear form
   */
  ButtonClearform = (): string | undefined => {
    return undefined
  }

  f42 = (): string | undefined => this.ButtonClearform()

  /**
   * Index 43: or-asc-p2-2
   */
  orascp22 = (): string | undefined => {
    return undefined
  }

  f43 = (): string | undefined => this.orascp22()

  /**
   * Index 44: or-asc-p2-5
   */
  orascp25 = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.orascp25()

  /**
   * Index 45: or-asc-p2-8
   */
  orascp28 = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.orascp28()

  /**
   * Index 46: or-asc-p2-11
   */
  orascp211 = (): string | undefined => {
    return undefined
  }

  f46 = (): string | undefined => this.orascp211()

  /**
   * Index 47: or-asc-p2-14
   */
  orascp214 = (): string | undefined => {
    return undefined
  }

  f47 = (): string | undefined => this.orascp214()

  /**
   * Index 48: or-asc-p3-7
   */
  orascp37 = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.orascp37()

  /**
   * Index 49: or-asc-p3-9
   */
  orascp39 = (): string | undefined => {
    return undefined
  }

  f49 = (): string | undefined => this.orascp39()

  /**
   * Index 50: or-asc-p3-11
   */
  orascp311 = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.orascp311()

  /**
   * Index 51: or-asc-p3-12
   */
  orascp312 = (): string | undefined => {
    return undefined
  }

  f51 = (): string | undefined => this.orascp312()

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
    this.f17(),
    this.f18(),
    this.f19(),
    this.f20(),
    this.f21(),
    this.f22(),
    this.f23(),
    this.f24(),
    this.f25(),
    this.f26(),
    this.f27(),
    this.f28(),
    this.f29(),
    this.f30(),
    this.f31(),
    this.f32(),
    this.f33(),
    this.f34(),
    this.f35(),
    this.f36(),
    this.f37(),
    this.f38(),
    this.f39(),
    this.f40(),
    this.f41(),
    this.f42(),
    this.f43(),
    this.f44(),
    this.f45(),
    this.f46(),
    this.f47(),
    this.f48(),
    this.f49(),
    this.f50(),
    this.f51()
  ]
}

const makeORASC = (info: Information, f1040: F1040): ORASC =>
  new ORASC(info, f1040)

export default makeORASC
