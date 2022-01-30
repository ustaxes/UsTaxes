import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import {
  AccountType,
  FilingStatus,
  Information,
  State
} from 'ustaxes/core/data'
import parameters from './Parameters'

export class OR40N extends Form {
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
    this.formName = 'OR-40-N'
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
   * Index 0: Button - Clear form
   */
  ButtonClearform = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.ButtonClearform()

  /**
   * Index 1: or-40-n-p1-1
   */
  or40np11 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.or40np11()

  /**
   * Index 2: or-40-n-p1-2
   */
  or40np12 = (): boolean | undefined => {
    return undefined
  }

  f2 = (): boolean | undefined => this.or40np12()

  /**
   * Index 3: or-40-n-p1-3
   */
  or40np13 = (): string | undefined => {
    return undefined
  }

  f3 = (): string | undefined => this.or40np13()

  /**
   * Index 4: or-40-n-p1-4
   */
  or40np14 = (): boolean | undefined => {
    return undefined
  }

  f4 = (): boolean | undefined => this.or40np14()

  /**
   * Index 5: or-40-n-p1-5
   */
  or40np15 = (): boolean | undefined => {
    return undefined
  }

  f5 = (): boolean | undefined => this.or40np15()

  /**
   * Index 6: or-40-n-p1-6
   */
  or40np16 = (): boolean | undefined => {
    return undefined
  }

  f6 = (): boolean | undefined => this.or40np16()

  /**
   * Index 7: or-40-n-p1-7
   */
  or40np17 = (): boolean | undefined => {
    return undefined
  }

  f7 = (): boolean | undefined => this.or40np17()

  /**
   * Index 8: or-40-n-p1-8
   */
  or40np18 = (): boolean | undefined => {
    return undefined
  }

  f8 = (): boolean | undefined => this.or40np18()

  /**
   * Index 9: or-40-n-p1-9
   */
  or40np19 = (): boolean | undefined => {
    return undefined
  }

  f9 = (): boolean | undefined => this.or40np19()

  /**
   * Index 10: or-40-n-p1-10
   */
  or40np110 = (): boolean | undefined => {
    return undefined
  }

  f10 = (): boolean | undefined => this.or40np110()

  /**
   * Index 11: or-40-n-p1-11
   */
  or40np111 = (): boolean | undefined => {
    return undefined
  }

  f11 = (): boolean | undefined => this.or40np111()

  /**
   * Index 12: or-40-n-p1-12
   */
  or40np112 = (): boolean | undefined => {
    return undefined
  }

  f12 = (): boolean | undefined => this.or40np112()

  /**
   * Index 13: or-40-n-p1-13
   */
  or40np113 = (): string | undefined => {
    return undefined
  }

  f13 = (): string | undefined => this.or40np113()

  /**
   * Index 14: or-40-n-p1-14
   */
  or40np114 = (): string | undefined => {
    return undefined
  }

  f14 = (): string | undefined => this.or40np114()

  /**
   * Index 15: or-40-n-p1-15
   */
  or40np115 = (): string | undefined => {
    return undefined
  }

  f15 = (): string | undefined => this.or40np115()

  /**
   * Index 16: or-40-n-p1-18
   */
  or40np118 = (): boolean | undefined => {
    return undefined
  }

  f16 = (): boolean | undefined => this.or40np118()

  /**
   * Index 17: or-40-n-p1-19
   */
  or40np119 = (): boolean | undefined => {
    return undefined
  }

  f17 = (): boolean | undefined => this.or40np119()

  /**
   * Index 18: or-40-n-p1-20
   */
  or40np120 = (): boolean | undefined => {
    return undefined
  }

  f18 = (): boolean | undefined => this.or40np120()

  /**
   * Index 19: or-40-n-p1-21
   */
  or40np121 = (): string | undefined => {
    return undefined
  }

  f19 = (): string | undefined => this.or40np121()

  /**
   * Index 20: or-40-n-p1-22
   */
  or40np122 = (): string | undefined => {
    return undefined
  }

  f20 = (): string | undefined => this.or40np122()

  /**
   * Index 21: or-40-n-p1-23
   */
  or40np123 = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.or40np123()

  /**
   * Index 22: or-40-n-p1-24
   */
  or40np124 = (): string | undefined => {
    return undefined
  }

  f22 = (): string | undefined => this.or40np124()

  /**
   * Index 23: or-40-n-p1-25
   */
  or40np125 = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.or40np125()

  /**
   * Index 24: or-40-n-p1-26
   */
  or40np126 = (): boolean | undefined => {
    return undefined
  }

  f24 = (): boolean | undefined => this.or40np126()

  /**
   * Index 25: or-40-n-p1-27
   */
  or40np127 = (): boolean | undefined => {
    return undefined
  }

  f25 = (): boolean | undefined => this.or40np127()

  /**
   * Index 26: or-40-n-p1-28
   */
  or40np128 = (): boolean | undefined => {
    return undefined
  }

  f26 = (): boolean | undefined => this.or40np128()

  /**
   * Index 27: or-40-n-p1-29
   */
  or40np129 = (): string | undefined => {
    return undefined
  }

  f27 = (): string | undefined => this.or40np129()

  /**
   * Index 28: or-40-n-p1-30
   */
  or40np130 = (): string | undefined => {
    return undefined
  }

  f28 = (): string | undefined => this.or40np130()

  /**
   * Index 29: or-40-n-p1-33
   */
  or40np133 = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.or40np133()

  /**
   * Index 30: or-40-n-p1-34
   */
  or40np134 = (): string | undefined => {
    return undefined
  }

  f30 = (): string | undefined => this.or40np134()

  /**
   * Index 31: or-40-n-p1-16
   */
  or40np116 = (): string | undefined => {
    return undefined
  }

  f31 = (): string | undefined => this.or40np116()

  /**
   * Index 32: or-40-n-p1-17
   */
  or40np117 = (): string | undefined => {
    return undefined
  }

  f32 = (): string | undefined => this.or40np117()

  /**
   * Index 33: or-40-n-p2-1
   */
  or40np21 = (): string | undefined => {
    return undefined
  }

  f33 = (): string | undefined => this.or40np21()

  /**
   * Index 34: or-40-n-p2-2
   */
  or40np22 = (): boolean | undefined => {
    return undefined
  }

  f34 = (): boolean | undefined => this.or40np22()

  /**
   * Index 35: or-40-n-p2-3
   */
  or40np23 = (): boolean | undefined => {
    return undefined
  }

  f35 = (): boolean | undefined => this.or40np23()

  /**
   * Index 36: or-40-n-p2-4
   */
  or40np24 = (): boolean | undefined => {
    return undefined
  }

  f36 = (): boolean | undefined => this.or40np24()

  /**
   * Index 37: or-40-n-p2-5
   */
  or40np25 = (): string | undefined => {
    return undefined
  }

  f37 = (): string | undefined => this.or40np25()

  /**
   * Index 38: or-40-n-p2-6
   */
  or40np26 = (): boolean | undefined => {
    return undefined
  }

  f38 = (): boolean | undefined => this.or40np26()

  /**
   * Index 39: or-40-n-p2-7
   */
  or40np27 = (): boolean | undefined => {
    return undefined
  }

  f39 = (): boolean | undefined => this.or40np27()

  /**
   * Index 40: or-40-n-p2-8
   */
  or40np28 = (): boolean | undefined => {
    return undefined
  }

  f40 = (): boolean | undefined => this.or40np28()

  /**
   * Index 41: or-40-n-p2-9
   */
  or40np29 = (): boolean | undefined => {
    return undefined
  }

  f41 = (): boolean | undefined => this.or40np29()

  /**
   * Index 42: or-40-n-p2-10
   */
  or40np210 = (): string | undefined => {
    return undefined
  }

  f42 = (): string | undefined => this.or40np210()

  /**
   * Index 43: or-40-n-p2-11
   */
  or40np211 = (): string | undefined => {
    return undefined
  }

  f43 = (): string | undefined => this.or40np211()

  /**
   * Index 44: or-40-n-p2-12
   */
  or40np212 = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.or40np212()

  /**
   * Index 45: or-40-n-p2-13
   */
  or40np213 = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.or40np213()

  /**
   * Index 46: or-40-n-p2-14
   */
  or40np214 = (): string | undefined => {
    return undefined
  }

  f46 = (): string | undefined => this.or40np214()

  /**
   * Index 47: or-40-n-p2-16
   */
  or40np216 = (): boolean | undefined => {
    return undefined
  }

  f47 = (): boolean | undefined => this.or40np216()

  /**
   * Index 48: or-40-n-p2-17
   */
  or40np217 = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.or40np217()

  /**
   * Index 49: or-40-n-p2-18
   */
  or40np218 = (): string | undefined => {
    return undefined
  }

  f49 = (): string | undefined => this.or40np218()

  /**
   * Index 50: or-40-n-p2-19
   */
  or40np219 = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.or40np219()

  /**
   * Index 51: or-40-n-p2-20
   */
  or40np220 = (): string | undefined => {
    return undefined
  }

  f51 = (): string | undefined => this.or40np220()

  /**
   * Index 52: or-40-n-p2-21
   */
  or40np221 = (): string | undefined => {
    return undefined
  }

  f52 = (): string | undefined => this.or40np221()

  /**
   * Index 53: or-40-n-p2-23
   */
  or40np223 = (): boolean | undefined => {
    return undefined
  }

  f53 = (): boolean | undefined => this.or40np223()

  /**
   * Index 54: or-40-n-p2-24
   */
  or40np224 = (): string | undefined => {
    return undefined
  }

  f54 = (): string | undefined => this.or40np224()

  /**
   * Index 55: or-40-n-p2-25
   */
  or40np225 = (): string | undefined => {
    return undefined
  }

  f55 = (): string | undefined => this.or40np225()

  /**
   * Index 56: or-40-n-p2-26
   */
  or40np226 = (): string | undefined => {
    return undefined
  }

  f56 = (): string | undefined => this.or40np226()

  /**
   * Index 57: or-40-n-p2-27
   */
  or40np227 = (): string | undefined => {
    return undefined
  }

  f57 = (): string | undefined => this.or40np227()

  /**
   * Index 58: or-40-n-p2-28
   */
  or40np228 = (): string | undefined => {
    return undefined
  }

  f58 = (): string | undefined => this.or40np228()

  /**
   * Index 59: or-40-n-p2-30
   */
  or40np230 = (): boolean | undefined => {
    return undefined
  }

  f59 = (): boolean | undefined => this.or40np230()

  /**
   * Index 60: or-40-n-p2-31
   */
  or40np231 = (): string | undefined => {
    return undefined
  }

  f60 = (): string | undefined => this.or40np231()

  /**
   * Index 61: or-40-n-p2-32
   */
  or40np232 = (): string | undefined => {
    return undefined
  }

  f61 = (): string | undefined => this.or40np232()

  /**
   * Index 62: or-40-n-p2-33
   */
  or40np233 = (): string | undefined => {
    return undefined
  }

  f62 = (): string | undefined => this.or40np233()

  /**
   * Index 63: or-40-n-p3-1
   */
  or40np31 = (): string | undefined => {
    return undefined
  }

  f63 = (): string | undefined => this.or40np31()

  /**
   * Index 64: or-40-n-p3-2
   */
  or40np32 = (): string | undefined => {
    return undefined
  }

  f64 = (): string | undefined => this.or40np32()

  /**
   * Index 65: or-40-n-p3-3
   */
  or40np33 = (): string | undefined => {
    return undefined
  }

  f65 = (): string | undefined => this.or40np33()

  /**
   * Index 66: or-40-n-p3-4
   */
  or40np34 = (): string | undefined => {
    return undefined
  }

  f66 = (): string | undefined => this.or40np34()

  /**
   * Index 67: or-40-n-p3-5
   */
  or40np35 = (): string | undefined => {
    return undefined
  }

  f67 = (): string | undefined => this.or40np35()

  /**
   * Index 68: or-40-n-p3-6
   */
  or40np36 = (): string | undefined => {
    return undefined
  }

  f68 = (): string | undefined => this.or40np36()

  /**
   * Index 69: or-40-n-p3-7
   */
  or40np37 = (): string | undefined => {
    return undefined
  }

  f69 = (): string | undefined => this.or40np37()

  /**
   * Index 70: or-40-n-p3-8
   */
  or40np38 = (): string | undefined => {
    return undefined
  }

  f70 = (): string | undefined => this.or40np38()

  /**
   * Index 71: or-40-n-p3-9
   */
  or40np39 = (): string | undefined => {
    return undefined
  }

  f71 = (): string | undefined => this.or40np39()

  /**
   * Index 72: or-40-n-p3-10
   */
  or40np310 = (): string | undefined => {
    return undefined
  }

  f72 = (): string | undefined => this.or40np310()

  /**
   * Index 73: or-40-n-p3-11
   */
  or40np311 = (): string | undefined => {
    return undefined
  }

  f73 = (): string | undefined => this.or40np311()

  /**
   * Index 74: or-40-n-p3-12
   */
  or40np312 = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.or40np312()

  /**
   * Index 75: or-40-n-p3-13
   */
  or40np313 = (): string | undefined => {
    return undefined
  }

  f75 = (): string | undefined => this.or40np313()

  /**
   * Index 76: or-40-n-p3-14
   */
  or40np314 = (): string | undefined => {
    return undefined
  }

  f76 = (): string | undefined => this.or40np314()

  /**
   * Index 77: or-40-n-p3-17
   */
  or40np317 = (): string | undefined => {
    return undefined
  }

  f77 = (): string | undefined => this.or40np317()

  /**
   * Index 78: or-40-n-p3-18
   */
  or40np318 = (): string | undefined => {
    return undefined
  }

  f78 = (): string | undefined => this.or40np318()

  /**
   * Index 79: or-40-n-p3-15
   */
  or40np315 = (): string | undefined => {
    return undefined
  }

  f79 = (): string | undefined => this.or40np315()

  /**
   * Index 80: or-40-n-p3-16
   */
  or40np316 = (): string | undefined => {
    return undefined
  }

  f80 = (): string | undefined => this.or40np316()

  /**
   * Index 81: or-40-n-p4-1
   */
  or40np41 = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.or40np41()

  /**
   * Index 82: or-40-n-p4-2
   */
  or40np42 = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.or40np42()

  /**
   * Index 83: or-40-n-p4-3
   */
  or40np43 = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.or40np43()

  /**
   * Index 84: or-40-n-p4-4
   */
  or40np44 = (): string | undefined => {
    return undefined
  }

  f84 = (): string | undefined => this.or40np44()

  /**
   * Index 85: or-40-n-p4-5
   */
  or40np45 = (): string | undefined => {
    return undefined
  }

  f85 = (): string | undefined => this.or40np45()

  /**
   * Index 86: or-40-n-p4-6
   */
  or40np46 = (): string | undefined => {
    return undefined
  }

  f86 = (): string | undefined => this.or40np46()

  /**
   * Index 87: or-40-n-p4-7
   */
  or40np47 = (): string | undefined => {
    return undefined
  }

  f87 = (): string | undefined => this.or40np47()

  /**
   * Index 88: or-40-n-p4-8
   */
  or40np48 = (): string | undefined => {
    return undefined
  }

  f88 = (): string | undefined => this.or40np48()

  /**
   * Index 89: or-40-n-p4-9
   */
  or40np49 = (): string | undefined => {
    return undefined
  }

  f89 = (): string | undefined => this.or40np49()

  /**
   * Index 90: or-40-n-p4-10
   */
  or40np410 = (): string | undefined => {
    return undefined
  }

  f90 = (): string | undefined => this.or40np410()

  /**
   * Index 91: or-40-n-p4-11
   */
  or40np411 = (): string | undefined => {
    return undefined
  }

  f91 = (): string | undefined => this.or40np411()

  /**
   * Index 92: or-40-n-p4-12
   */
  or40np412 = (): string | undefined => {
    return undefined
  }

  f92 = (): string | undefined => this.or40np412()

  /**
   * Index 93: or-40-n-p4-13
   */
  or40np413 = (): string | undefined => {
    return undefined
  }

  f93 = (): string | undefined => this.or40np413()

  /**
   * Index 94: or-40-n-p4-14
   */
  or40np414 = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.or40np414()

  /**
   * Index 95: or-40-n-p4-15
   */
  or40np415 = (): string | undefined => {
    return undefined
  }

  f95 = (): string | undefined => this.or40np415()

  /**
   * Index 96: or-40-n-p4-16
   */
  or40np416 = (): string | undefined => {
    return undefined
  }

  f96 = (): string | undefined => this.or40np416()

  /**
   * Index 97: or-40-n-p5-1
   */
  or40np51 = (): string | undefined => {
    return undefined
  }

  f97 = (): string | undefined => this.or40np51()

  /**
   * Index 98: or-40-n-p5-2
   */
  or40np52 = (): string | undefined => {
    return undefined
  }

  f98 = (): string | undefined => this.or40np52()

  /**
   * Index 99: or-40-n-p5-3
   */
  or40np53 = (): string | undefined => {
    return undefined
  }

  f99 = (): string | undefined => this.or40np53()

  /**
   * Index 100: or-40-n-p5-4
   */
  or40np54 = (): string | undefined => {
    return undefined
  }

  f100 = (): string | undefined => this.or40np54()

  /**
   * Index 101: or-40-n-p5-5
   */
  or40np55 = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.or40np55()

  /**
   * Index 102: or-40-n-p5-6
   */
  or40np56 = (): string | undefined => {
    return undefined
  }

  f102 = (): string | undefined => this.or40np56()

  /**
   * Index 103: or-40-n-p5-7
   */
  or40np57 = (): string | undefined => {
    return undefined
  }

  f103 = (): string | undefined => this.or40np57()

  /**
   * Index 104: or-40-n-p5-8
   */
  or40np58 = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.or40np58()

  /**
   * Index 105: or-40-n-p5-9
   */
  or40np59 = (): string | undefined => {
    return undefined
  }

  f105 = (): string | undefined => this.or40np59()

  /**
   * Index 106: or-40-n-p5-10
   */
  or40np510 = (): string | undefined => {
    return undefined
  }

  f106 = (): string | undefined => this.or40np510()

  /**
   * Index 107: or-40-n-p5-11
   */
  or40np511 = (): string | undefined => {
    return undefined
  }

  f107 = (): string | undefined => this.or40np511()

  /**
   * Index 108: or-40-n-p5-12
   */
  or40np512 = (): string | undefined => {
    return undefined
  }

  f108 = (): string | undefined => this.or40np512()

  /**
   * Index 109: or-40-n-p5-13
   */
  or40np513 = (): string | undefined => {
    return undefined
  }

  f109 = (): string | undefined => this.or40np513()

  /**
   * Index 110: or-40-n-p5-14
   */
  or40np514 = (): string | undefined => {
    return undefined
  }

  f110 = (): string | undefined => this.or40np514()

  /**
   * Index 111: or-40-n-p5-15
   */
  or40np515 = (): string | undefined => {
    return undefined
  }

  f111 = (): string | undefined => this.or40np515()

  /**
   * Index 112: or-40-n-p5-16
   */
  or40np516 = (): string | undefined => {
    return undefined
  }

  f112 = (): string | undefined => this.or40np516()

  /**
   * Index 113: or-40-n-p6-1
   */
  or40np61 = (): string | undefined => {
    return undefined
  }

  f113 = (): string | undefined => this.or40np61()

  /**
   * Index 114: or-40-n-p6-2
   */
  or40np62 = (): string | undefined => {
    return undefined
  }

  f114 = (): string | undefined => this.or40np62()

  /**
   * Index 115: or-40-n-p6-3
   */
  or40np63 = (): string | undefined => {
    return undefined
  }

  f115 = (): string | undefined => this.or40np63()

  /**
   * Index 116: or-40-n-p6-4
   */
  or40np64 = (): string | undefined => {
    return undefined
  }

  f116 = (): string | undefined => this.or40np64()

  /**
   * Index 117: or-40-n-p6-5
   */
  or40np65 = (): string | undefined => {
    return undefined
  }

  f117 = (): string | undefined => this.or40np65()

  /**
   * Index 118: or-40-n-p6-6
   */
  or40np66 = (): string | undefined => {
    return undefined
  }

  f118 = (): string | undefined => this.or40np66()

  /**
   * Index 119: or-40-n-p6-7
   */
  or40np67 = (): string | undefined => {
    return undefined
  }

  f119 = (): string | undefined => this.or40np67()

  /**
   * Index 120: or-40-n-p6-8
   */
  or40np68 = (): string | undefined => {
    return undefined
  }

  f120 = (): string | undefined => this.or40np68()

  /**
   * Index 121: or-40-n-p6-9
   */
  or40np69 = (): string | undefined => {
    return undefined
  }

  f121 = (): string | undefined => this.or40np69()

  /**
   * Index 122: or-40-n-p6-10
   */
  or40np610 = (): string | undefined => {
    return undefined
  }

  f122 = (): string | undefined => this.or40np610()

  /**
   * Index 123: or-40-n-p6-11
   */
  or40np611 = (): boolean | undefined => {
    return undefined
  }

  f123 = (): boolean | undefined => this.or40np611()

  /**
   * Index 124: or-40-n-p6-12
   */
  or40np612 = (): boolean | undefined => {
    return undefined
  }

  f124 = (): boolean | undefined => this.or40np612()

  /**
   * Index 125: or-40-n-p6-13
   */
  or40np613 = (): boolean | undefined => {
    return undefined
  }

  f125 = (): boolean | undefined => this.or40np613()

  /**
   * Index 126: or-40-n-p6-14
   */
  or40np614 = (): boolean | undefined => {
    return undefined
  }

  f126 = (): boolean | undefined => this.or40np614()

  /**
   * Index 127: or-40-n-p6-15
   */
  or40np615 = (): string | undefined => {
    return undefined
  }

  f127 = (): string | undefined => this.or40np615()

  /**
   * Index 128: or-40-n-p6-16
   */
  or40np616 = (): string | undefined => {
    return undefined
  }

  f128 = (): string | undefined => this.or40np616()

  /**
   * Index 129: or-40-n-p6-17
   */
  or40np617 = (): string | undefined => {
    return undefined
  }

  f129 = (): string | undefined => this.or40np617()

  /**
   * Index 130: or-40-n-p6-18
   */
  or40np618 = (): string | undefined => {
    return undefined
  }

  f130 = (): string | undefined => this.or40np618()

  /**
   * Index 131: or-40-n-p7-1
   */
  or40np71 = (): string | undefined => {
    return undefined
  }

  f131 = (): string | undefined => this.or40np71()

  /**
   * Index 132: or-40-n-p7-2
   */
  or40np72 = (): string | undefined => {
    return undefined
  }

  f132 = (): string | undefined => this.or40np72()

  /**
   * Index 133: or-40-n-p7-3
   */
  or40np73 = (): string | undefined => {
    return undefined
  }

  f133 = (): string | undefined => this.or40np73()

  /**
   * Index 134: or-40-n-p7-4
   */
  or40np74 = (): string | undefined => {
    return undefined
  }

  f134 = (): string | undefined => this.or40np74()

  /**
   * Index 135: or-40-n-p7-5
   */
  or40np75 = (): boolean | undefined => {
    return undefined
  }

  f135 = (): boolean | undefined => this.or40np75()

  /**
   * Index 136: or-40-n-p7-6
   */
  or40np76 = (): boolean | undefined => {
    return undefined
  }

  f136 = (): boolean | undefined => this.or40np76()

  /**
   * Index 137: or-40-n-p7-7
   */
  or40np77 = (): boolean | undefined => {
    return undefined
  }

  f137 = (): boolean | undefined => this.or40np77()

  /**
   * Index 138: or-40-n-p7-8
   */
  or40np78 = (): string | undefined => {
    return undefined
  }

  f138 = (): string | undefined => this.or40np78()

  /**
   * Index 139: or-40-n-p7-9
   */
  or40np79 = (): string | undefined => {
    return undefined
  }

  f139 = (): string | undefined => this.or40np79()

  /**
   * Index 140: or-40-n-p7-10
   */
  or40np710 = (): string | undefined => {
    return undefined
  }

  f140 = (): string | undefined => this.or40np710()

  /**
   * Index 141: or-40-n-p7-11
   */
  or40np711 = (): string | undefined => {
    return undefined
  }

  f141 = (): string | undefined => this.or40np711()

  /**
   * Index 142: or-40-n-p7-12
   */
  or40np712 = (): string | undefined => {
    return undefined
  }

  f142 = (): string | undefined => this.or40np712()

  /**
   * Index 143: or-40-n-p7-13
   */
  or40np713 = (): string | undefined => {
    return undefined
  }

  f143 = (): string | undefined => this.or40np713()

  /**
   * Index 144: or-40-n-p7-14
   */
  or40np714 = (): string | undefined => {
    return undefined
  }

  f144 = (): string | undefined => this.or40np714()

  /**
   * Index 145: or-40-n-p7-15
   */
  or40np715 = (): string | undefined => {
    return undefined
  }

  f145 = (): string | undefined => this.or40np715()

  /**
   * Index 146: or-40-n-p8-1
   */
  or40np81 = (): string | undefined => {
    return undefined
  }

  f146 = (): string | undefined => this.or40np81()

  /**
   * Index 147: or-40-n-p8-2
   */
  or40np82 = (): string | undefined => {
    return undefined
  }

  f147 = (): string | undefined => this.or40np82()

  /**
   * Index 148: or-40-n-p8-3
   */
  or40np83 = (): string | undefined => {
    return undefined
  }

  f148 = (): string | undefined => this.or40np83()

  /**
   * Index 149: or-40-n-p8-4
   */
  or40np84 = (): string | undefined => {
    return undefined
  }

  f149 = (): string | undefined => this.or40np84()

  /**
   * Index 150: or-40-n-p8-5
   */
  or40np85 = (): string | undefined => {
    return undefined
  }

  f150 = (): string | undefined => this.or40np85()

  /**
   * Index 151: or-40-n-p8-6
   */
  or40np86 = (): string | undefined => {
    return undefined
  }

  f151 = (): string | undefined => this.or40np86()

  /**
   * Index 152: or-40-n-p8-7
   */
  or40np87 = (): string | undefined => {
    return undefined
  }

  f152 = (): string | undefined => this.or40np87()

  /**
   * Index 153: or-40-n-p8-8
   */
  or40np88 = (): string | undefined => {
    return undefined
  }

  f153 = (): string | undefined => this.or40np88()

  /**
   * Index 154: or-40-n-p8-9
   */
  or40np89 = (): string | undefined => {
    return undefined
  }

  f154 = (): string | undefined => this.or40np89()

  /**
   * Index 155: or-40-n-p8-10
   */
  or40np810 = (): string | undefined => {
    return undefined
  }

  f155 = (): string | undefined => this.or40np810()

  /**
   * Index 156: or-40-n-p8-11
   */
  or40np811 = (): string | undefined => {
    return undefined
  }

  f156 = (): string | undefined => this.or40np811()

  /**
   * Index 157: or-40-n-p8-12
   */
  or40np812 = (): string | undefined => {
    return undefined
  }

  f157 = (): string | undefined => this.or40np812()

  /**
   * Index 158: or-40-n-p8-13
   */
  or40np813 = (): string | undefined => {
    return undefined
  }

  f158 = (): string | undefined => this.or40np813()

  /**
   * Index 159: or-40-n-p9-1
   */
  or40np91 = (): string | undefined => {
    return undefined
  }

  f159 = (): string | undefined => this.or40np91()

  /**
   * Index 160: or-40-n-p9-2
   */
  or40np92 = (): string | undefined => {
    return undefined
  }

  f160 = (): string | undefined => this.or40np92()

  /**
   * Index 161: or-40-n-p9-3
   */
  or40np93 = (): boolean | undefined => {
    return undefined
  }

  f161 = (): boolean | undefined => this.or40np93()

  /**
   * Index 162: or-40-n-p9-4
   */
  or40np94 = (): string | undefined => {
    return undefined
  }

  f162 = (): string | undefined => this.or40np94()

  /**
   * Index 163: or-40-n-p9-5
   */
  or40np95 = (): string | undefined => {
    return undefined
  }

  f163 = (): string | undefined => this.or40np95()

  /**
   * Index 164: or-40-n-p9-6
   */
  or40np96 = (): string | undefined => {
    return undefined
  }

  f164 = (): string | undefined => this.or40np96()

  /**
   * Index 165: or-40-n-p9-7
   */
  or40np97 = (): string | undefined => {
    return undefined
  }

  f165 = (): string | undefined => this.or40np97()

  /**
   * Index 166: or-40-n-p9-8
   */
  or40np98 = (): string | undefined => {
    return undefined
  }

  f166 = (): string | undefined => this.or40np98()

  /**
   * Index 167: or-40-n-p9-9
   */
  or40np99 = (): string | undefined => {
    return undefined
  }

  f167 = (): string | undefined => this.or40np99()

  /**
   * Index 168: or-40-n-p9-10
   */
  or40np910 = (): string | undefined => {
    return undefined
  }

  f168 = (): string | undefined => this.or40np910()

  /**
   * Index 169: or-40-n-p9-11
   */
  or40np911 = (): string | undefined => {
    return undefined
  }

  f169 = (): string | undefined => this.or40np911()

  /**
   * Index 170: or-40-n-p9-12
   */
  or40np912 = (): boolean | undefined => {
    return undefined
  }

  f170 = (): boolean | undefined => this.or40np912()

  /**
   * Index 171: or-40-n-p9-15
   */
  or40np915 = (): string | undefined => {
    return undefined
  }

  f171 = (): string | undefined => this.or40np915()

  /**
   * Index 172: or-40-n-p9-16
   */
  or40np916 = (): string | undefined => {
    return undefined
  }

  f172 = (): string | undefined => this.or40np916()

  /**
   * Index 173: or-40-n-p9-17
   */
  or40np917 = (): boolean | undefined => {
    return undefined
  }

  f173 = (): boolean | undefined => this.or40np917()

  /**
   * Index 174: or-40-n-p9-18
   */
  or40np918 = (): string | undefined => {
    return undefined
  }

  f174 = (): string | undefined => this.or40np918()

  /**
   * Index 175: or-40-n-p10-1
   */
  or40np101 = (): string | undefined => {
    return undefined
  }

  f175 = (): string | undefined => this.or40np101()

  /**
   * Index 176: or-40-n-p10-2
   */
  or40np102 = (): string | undefined => {
    return undefined
  }

  f176 = (): string | undefined => this.or40np102()

  /**
   * Index 177: or-40-n-p10-3
   */
  or40np103 = (): string | undefined => {
    return undefined
  }

  f177 = (): string | undefined => this.or40np103()

  /**
   * Index 178: or-40-n-p10-4
   */
  or40np104 = (): string | undefined => {
    return undefined
  }

  f178 = (): string | undefined => this.or40np104()

  /**
   * Index 179: or-40-n-p10-5
   */
  or40np105 = (): string | undefined => {
    return undefined
  }

  f179 = (): string | undefined => this.or40np105()

  /**
   * Index 180: or-40-n-p10-6
   */
  or40np106 = (): string | undefined => {
    return undefined
  }

  f180 = (): string | undefined => this.or40np106()

  /**
   * Index 181: or-40-n-p10-7
   */
  or40np107 = (): string | undefined => {
    return undefined
  }

  f181 = (): string | undefined => this.or40np107()

  /**
   * Index 182: or-40-n-p10-8
   */
  or40np108 = (): string | undefined => {
    return undefined
  }

  f182 = (): string | undefined => this.or40np108()

  /**
   * Index 183: or-40-n-p10-9
   */
  or40np109 = (): string | undefined => {
    return undefined
  }

  f183 = (): string | undefined => this.or40np109()

  /**
   * Index 184: or-40-n-p10-10
   */
  or40np1010 = (): string | undefined => {
    return undefined
  }

  f184 = (): string | undefined => this.or40np1010()

  /**
   * Index 185: or-40-n-p10-11
   */
  or40np1011 = (): string | undefined => {
    return undefined
  }

  f185 = (): string | undefined => this.or40np1011()

  /**
   * Index 186: or-40-n-p11-1
   */
  or40np11_1 = (): string | undefined => {
    return undefined
  }

  f186 = (): string | undefined => this.or40np11_1()

  /**
   * Index 187: or-40_n_p1_35
   */
  or40np135 = (): string | undefined => {
    return undefined
  }

  f187 = (): string | undefined => this.or40np135()

  /**
   * Index 188: or-40-n-p1-31
   */
  or40np131 = (): string | undefined => {
    return undefined
  }

  f188 = (): string | undefined => this.or40np131()

  /**
   * Index 189: or-40-n-p2-15
   */
  or40np215 = (): string | undefined => {
    return undefined
  }

  f189 = (): string | undefined => this.or40np215()

  /**
   * Index 190: or-40-n-p2-22
   */
  or40np222 = (): string | undefined => {
    return undefined
  }

  f190 = (): string | undefined => this.or40np222()

  /**
   * Index 191: or-40-n-p2-29
   */
  or40np229 = (): string | undefined => {
    return undefined
  }

  f191 = (): string | undefined => this.or40np229()

  /**
   * Index 192: or-40_n_p9_14
   */
  or40np914 = (): string | undefined => {
    return undefined
  }

  f192 = (): string | undefined => this.or40np914()

  /**
   * Index 193: or-40-n-p1-32a
   */
  or40np132a = (): string | undefined => {
    return undefined
  }

  f193 = (): string | undefined => this.or40np132a()

  /**
   * Index 194: or-40-n-p1-32b
   */
  or40np132b = (): string | undefined => {
    return undefined
  }

  f194 = (): string | undefined => this.or40np132b()

  /**
   * Index 195: or-40-n-p10-12a
   */
  or40np1012a = (): string | undefined => {
    return undefined
  }

  f195 = (): string | undefined => this.or40np1012a()

  /**
   * Index 196: or-40-n-p10-12b
   */
  or40np1012b = (): string | undefined => {
    return undefined
  }

  f196 = (): string | undefined => this.or40np1012b()

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
    this.f51(),
    this.f52(),
    this.f53(),
    this.f54(),
    this.f55(),
    this.f56(),
    this.f57(),
    this.f58(),
    this.f59(),
    this.f60(),
    this.f61(),
    this.f62(),
    this.f63(),
    this.f64(),
    this.f65(),
    this.f66(),
    this.f67(),
    this.f68(),
    this.f69(),
    this.f70(),
    this.f71(),
    this.f72(),
    this.f73(),
    this.f74(),
    this.f75(),
    this.f76(),
    this.f77(),
    this.f78(),
    this.f79(),
    this.f80(),
    this.f81(),
    this.f82(),
    this.f83(),
    this.f84(),
    this.f85(),
    this.f86(),
    this.f87(),
    this.f88(),
    this.f89(),
    this.f90(),
    this.f91(),
    this.f92(),
    this.f93(),
    this.f94(),
    this.f95(),
    this.f96(),
    this.f97(),
    this.f98(),
    this.f99(),
    this.f100(),
    this.f101(),
    this.f102(),
    this.f103(),
    this.f104(),
    this.f105(),
    this.f106(),
    this.f107(),
    this.f108(),
    this.f109(),
    this.f110(),
    this.f111(),
    this.f112(),
    this.f113(),
    this.f114(),
    this.f115(),
    this.f116(),
    this.f117(),
    this.f118(),
    this.f119(),
    this.f120(),
    this.f121(),
    this.f122(),
    this.f123(),
    this.f124(),
    this.f125(),
    this.f126(),
    this.f127(),
    this.f128(),
    this.f129(),
    this.f130(),
    this.f131(),
    this.f132(),
    this.f133(),
    this.f134(),
    this.f135(),
    this.f136(),
    this.f137(),
    this.f138(),
    this.f139(),
    this.f140(),
    this.f141(),
    this.f142(),
    this.f143(),
    this.f144(),
    this.f145(),
    this.f146(),
    this.f147(),
    this.f148(),
    this.f149(),
    this.f150(),
    this.f151(),
    this.f152(),
    this.f153(),
    this.f154(),
    this.f155(),
    this.f156(),
    this.f157(),
    this.f158(),
    this.f159(),
    this.f160(),
    this.f161(),
    this.f162(),
    this.f163(),
    this.f164(),
    this.f165(),
    this.f166(),
    this.f167(),
    this.f168(),
    this.f169(),
    this.f170(),
    this.f171(),
    this.f172(),
    this.f173(),
    this.f174(),
    this.f175(),
    this.f176(),
    this.f177(),
    this.f178(),
    this.f179(),
    this.f180(),
    this.f181(),
    this.f182(),
    this.f183(),
    this.f184(),
    this.f185(),
    this.f186(),
    this.f187(),
    this.f188(),
    this.f189(),
    this.f190(),
    this.f191(),
    this.f192(),
    this.f193(),
    this.f194(),
    this.f195(),
    this.f196()
  ]
}

const makeOR40N = (info: Information, f1040: F1040): OR40N =>
  new OR40N(info, f1040)

export default makeOR40N
