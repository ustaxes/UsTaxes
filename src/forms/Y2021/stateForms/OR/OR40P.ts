import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export class OR40P extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 0
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'OR-40-P'
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
   * Index 1: or-40-n-p9-1
   */
  or40np91 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.or40np91()

  /**
   * Index 2: or-40-n-p9-2
   */
  or40np92 = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.or40np92()

  /**
   * Index 3: or-40-n-p9-3
   */
  or40np93 = (): boolean | undefined => {
    return undefined
  }

  f3 = (): boolean | undefined => this.or40np93()

  /**
   * Index 4: or-40-n-p9-4
   */
  or40np94 = (): string | undefined => {
    return undefined
  }

  f4 = (): string | undefined => this.or40np94()

  /**
   * Index 5: or-40-n-p9-5
   */
  or40np95 = (): string | undefined => {
    return undefined
  }

  f5 = (): string | undefined => this.or40np95()

  /**
   * Index 6: or-40-n-p9-6
   */
  or40np96 = (): string | undefined => {
    return undefined
  }

  f6 = (): string | undefined => this.or40np96()

  /**
   * Index 7: or-40-n-p9-7
   */
  or40np97 = (): string | undefined => {
    return undefined
  }

  f7 = (): string | undefined => this.or40np97()

  /**
   * Index 8: or-40-n-p9-8
   */
  or40np98 = (): string | undefined => {
    return undefined
  }

  f8 = (): string | undefined => this.or40np98()

  /**
   * Index 9: or-40-n-p9-9
   */
  or40np99 = (): string | undefined => {
    return undefined
  }

  f9 = (): string | undefined => this.or40np99()

  /**
   * Index 10: or-40-n-p9-10
   */
  or40np910 = (): string | undefined => {
    return undefined
  }

  f10 = (): string | undefined => this.or40np910()

  /**
   * Index 11: or-40-n-p9-11
   */
  or40np911 = (): string | undefined => {
    return undefined
  }

  f11 = (): string | undefined => this.or40np911()

  /**
   * Index 12: or-40-n-p9-12
   */
  or40np912 = (): boolean | undefined => {
    return undefined
  }

  f12 = (): boolean | undefined => this.or40np912()

  /**
   * Index 13: or-40-n-p9-15
   */
  or40np915 = (): string | undefined => {
    return undefined
  }

  f13 = (): string | undefined => this.or40np915()

  /**
   * Index 14: or-40-n-p9-16
   */
  or40np916 = (): string | undefined => {
    return undefined
  }

  f14 = (): string | undefined => this.or40np916()

  /**
   * Index 15: or-40-n-p9-17
   */
  or40np917 = (): boolean | undefined => {
    return undefined
  }

  f15 = (): boolean | undefined => this.or40np917()

  /**
   * Index 16: or-40-n-p9-18
   */
  or40np918 = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.or40np918()

  /**
   * Index 17: or-40-n-p10-1
   */
  or40np101 = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.or40np101()

  /**
   * Index 18: or-40-n-p10-2
   */
  or40np102 = (): string | undefined => {
    return undefined
  }

  f18 = (): string | undefined => this.or40np102()

  /**
   * Index 19: or-40-n-p10-3
   */
  or40np103 = (): string | undefined => {
    return undefined
  }

  f19 = (): string | undefined => this.or40np103()

  /**
   * Index 20: or-40-n-p10-4
   */
  or40np104 = (): string | undefined => {
    return undefined
  }

  f20 = (): string | undefined => this.or40np104()

  /**
   * Index 21: or-40-n-p10-5
   */
  or40np105 = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.or40np105()

  /**
   * Index 22: or-40-n-p10-6
   */
  or40np106 = (): string | undefined => {
    return undefined
  }

  f22 = (): string | undefined => this.or40np106()

  /**
   * Index 23: or-40-n-p10-7
   */
  or40np107 = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.or40np107()

  /**
   * Index 24: or-40-n-p10-8
   */
  or40np108 = (): string | undefined => {
    return undefined
  }

  f24 = (): string | undefined => this.or40np108()

  /**
   * Index 25: or-40-n-p10-9
   */
  or40np109 = (): string | undefined => {
    return undefined
  }

  f25 = (): string | undefined => this.or40np109()

  /**
   * Index 26: or-40-n-p10-10
   */
  or40np1010 = (): string | undefined => {
    return undefined
  }

  f26 = (): string | undefined => this.or40np1010()

  /**
   * Index 27: or-40-n-p10-11
   */
  or40np1011 = (): string | undefined => {
    return undefined
  }

  f27 = (): string | undefined => this.or40np1011()

  /**
   * Index 28: or-40-n-p11-1
   */
  or40np111 = (): string | undefined => {
    return undefined
  }

  f28 = (): string | undefined => this.or40np111()

  /**
   * Index 29: or-40-p1-1
   */
  or40p11 = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.or40p11()

  /**
   * Index 30: or-40-p1-2
   */
  or40p12 = (): boolean | undefined => {
    return undefined
  }

  f30 = (): boolean | undefined => this.or40p12()

  /**
   * Index 31: or-40-p1-3
   */
  or40p13 = (): string | undefined => {
    return undefined
  }

  f31 = (): string | undefined => this.or40p13()

  /**
   * Index 32: or-40-p1-4
   */
  or40p14 = (): boolean | undefined => {
    return undefined
  }

  f32 = (): boolean | undefined => this.or40p14()

  /**
   * Index 33: or-40-p1-5
   */
  or40p15 = (): boolean | undefined => {
    return undefined
  }

  f33 = (): boolean | undefined => this.or40p15()

  /**
   * Index 34: or-40-p1-6
   */
  or40p16 = (): boolean | undefined => {
    return undefined
  }

  f34 = (): boolean | undefined => this.or40p16()

  /**
   * Index 35: or-40-p1-7
   */
  or40p17 = (): boolean | undefined => {
    return undefined
  }

  f35 = (): boolean | undefined => this.or40p17()

  /**
   * Index 36: or-40-p1-8
   */
  or40p18 = (): boolean | undefined => {
    return undefined
  }

  f36 = (): boolean | undefined => this.or40p18()

  /**
   * Index 37: or-40-p1-9
   */
  or40p19 = (): boolean | undefined => {
    return undefined
  }

  f37 = (): boolean | undefined => this.or40p19()

  /**
   * Index 38: or-40-p1-10
   */
  or40p110 = (): boolean | undefined => {
    return undefined
  }

  f38 = (): boolean | undefined => this.or40p110()

  /**
   * Index 39: or-40-p1-11
   */
  or40p111 = (): boolean | undefined => {
    return undefined
  }

  f39 = (): boolean | undefined => this.or40p111()

  /**
   * Index 40: or-40-p1-12
   */
  or40p112 = (): boolean | undefined => {
    return undefined
  }

  f40 = (): boolean | undefined => this.or40p112()

  /**
   * Index 41: or-40-p1-13
   */
  or40p113 = (): string | undefined => {
    return undefined
  }

  f41 = (): string | undefined => this.or40p113()

  /**
   * Index 42: or-40-p1-14
   */
  or40p114 = (): string | undefined => {
    return undefined
  }

  f42 = (): string | undefined => this.or40p114()

  /**
   * Index 43: or-40-p1-15
   */
  or40p115 = (): string | undefined => {
    return undefined
  }

  f43 = (): string | undefined => this.or40p115()

  /**
   * Index 44: or-40-p1-16
   */
  or40p116 = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.or40p116()

  /**
   * Index 45: or-40-p1-17
   */
  or40p117 = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.or40p117()

  /**
   * Index 46: or-40-p1-22
   */
  or40p122 = (): boolean | undefined => {
    return undefined
  }

  f46 = (): boolean | undefined => this.or40p122()

  /**
   * Index 47: or-40-p1-23
   */
  or40p123 = (): string | undefined => {
    return undefined
  }

  f47 = (): string | undefined => this.or40p123()

  /**
   * Index 48: or-40-p1-24
   */
  or40p124 = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.or40p124()

  /**
   * Index 49: or-40-p1-25
   */
  or40p125 = (): string | undefined => {
    return undefined
  }

  f49 = (): string | undefined => this.or40p125()

  /**
   * Index 50: or-40-p1-26
   */
  or40p126 = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.or40p126()

  /**
   * Index 51: or-40-p1-27
   */
  or40p127 = (): string | undefined => {
    return undefined
  }

  f51 = (): string | undefined => this.or40p127()

  /**
   * Index 52: or-40-p1-28
   */
  or40p128 = (): boolean | undefined => {
    return undefined
  }

  f52 = (): boolean | undefined => this.or40p128()

  /**
   * Index 53: or-40-p1-29
   */
  or40p129 = (): boolean | undefined => {
    return undefined
  }

  f53 = (): boolean | undefined => this.or40p129()

  /**
   * Index 54: or-40-p1-30
   */
  or40p130 = (): boolean | undefined => {
    return undefined
  }

  f54 = (): boolean | undefined => this.or40p130()

  /**
   * Index 55: or-40-p1-31
   */
  or40p131 = (): string | undefined => {
    return undefined
  }

  f55 = (): string | undefined => this.or40p131()

  /**
   * Index 56: or-40-p1-32
   */
  or40p132 = (): string | undefined => {
    return undefined
  }

  f56 = (): string | undefined => this.or40p132()

  /**
   * Index 57: or-40-p1-35
   */
  or40p135 = (): string | undefined => {
    return undefined
  }

  f57 = (): string | undefined => this.or40p135()

  /**
   * Index 58: or-40-p1-36
   */
  or40p136 = (): string | undefined => {
    return undefined
  }

  f58 = (): string | undefined => this.or40p136()

  /**
   * Index 59: or-40-p2-6
   */
  or40p26 = (): string | undefined => {
    return undefined
  }

  f59 = (): string | undefined => this.or40p26()

  /**
   * Index 60: or-40-p2-7
   */
  or40p27 = (): boolean | undefined => {
    return undefined
  }

  f60 = (): boolean | undefined => this.or40p27()

  /**
   * Index 61: or-40-p2-8
   */
  or40p28 = (): boolean | undefined => {
    return undefined
  }

  f61 = (): boolean | undefined => this.or40p28()

  /**
   * Index 62: or-40-p2-9
   */
  or40p29 = (): boolean | undefined => {
    return undefined
  }

  f62 = (): boolean | undefined => this.or40p29()

  /**
   * Index 63: or-40-p2-10
   */
  or40p210 = (): string | undefined => {
    return undefined
  }

  f63 = (): string | undefined => this.or40p210()

  /**
   * Index 64: or-40-p2-11
   */
  or40p211 = (): boolean | undefined => {
    return undefined
  }

  f64 = (): boolean | undefined => this.or40p211()

  /**
   * Index 65: or-40-p2-12
   */
  or40p212 = (): boolean | undefined => {
    return undefined
  }

  f65 = (): boolean | undefined => this.or40p212()

  /**
   * Index 66: or-40-p2-13
   */
  or40p213 = (): boolean | undefined => {
    return undefined
  }

  f66 = (): boolean | undefined => this.or40p213()

  /**
   * Index 67: or-40-p2-14
   */
  or40p214 = (): boolean | undefined => {
    return undefined
  }

  f67 = (): boolean | undefined => this.or40p214()

  /**
   * Index 68: or-40-p2-15
   */
  or40p215 = (): string | undefined => {
    return undefined
  }

  f68 = (): string | undefined => this.or40p215()

  /**
   * Index 69: or-40-p2-16
   */
  or40p216 = (): string | undefined => {
    return undefined
  }

  f69 = (): string | undefined => this.or40p216()

  /**
   * Index 70: or-40-p2-17
   */
  or40p217 = (): string | undefined => {
    return undefined
  }

  f70 = (): string | undefined => this.or40p217()

  /**
   * Index 71: or-40-p2-18
   */
  or40p218 = (): string | undefined => {
    return undefined
  }

  f71 = (): string | undefined => this.or40p218()

  /**
   * Index 72: or-40-p2-19
   */
  or40p219 = (): string | undefined => {
    return undefined
  }

  f72 = (): string | undefined => this.or40p219()

  /**
   * Index 73: or-40-p2-21
   */
  or40p221 = (): boolean | undefined => {
    return undefined
  }

  f73 = (): boolean | undefined => this.or40p221()

  /**
   * Index 74: or-40-p2-22
   */
  or40p222 = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.or40p222()

  /**
   * Index 75: or-40-p2-23
   */
  or40p223 = (): string | undefined => {
    return undefined
  }

  f75 = (): string | undefined => this.or40p223()

  /**
   * Index 76: or-40-p2-24
   */
  or40p224 = (): string | undefined => {
    return undefined
  }

  f76 = (): string | undefined => this.or40p224()

  /**
   * Index 77: or-40-p2-25
   */
  or40p225 = (): string | undefined => {
    return undefined
  }

  f77 = (): string | undefined => this.or40p225()

  /**
   * Index 78: or-40-p2-26
   */
  or40p226 = (): string | undefined => {
    return undefined
  }

  f78 = (): string | undefined => this.or40p226()

  /**
   * Index 79: or-40-p2-28
   */
  or40p228 = (): boolean | undefined => {
    return undefined
  }

  f79 = (): boolean | undefined => this.or40p228()

  /**
   * Index 80: or-40-p2-29
   */
  or40p229 = (): string | undefined => {
    return undefined
  }

  f80 = (): string | undefined => this.or40p229()

  /**
   * Index 81: or-40-p2-30
   */
  or40p230 = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.or40p230()

  /**
   * Index 82: or-40-p2-31
   */
  or40p231 = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.or40p231()

  /**
   * Index 83: or-40-p2-32
   */
  or40p232 = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.or40p232()

  /**
   * Index 84: or-40-p2-33
   */
  or40p233 = (): string | undefined => {
    return undefined
  }

  f84 = (): string | undefined => this.or40p233()

  /**
   * Index 85: or-40-p2-35
   */
  or40p235 = (): boolean | undefined => {
    return undefined
  }

  f85 = (): boolean | undefined => this.or40p235()

  /**
   * Index 86: or-40-p2-36
   */
  or40p236 = (): string | undefined => {
    return undefined
  }

  f86 = (): string | undefined => this.or40p236()

  /**
   * Index 87: or-40-p2-37
   */
  or40p237 = (): string | undefined => {
    return undefined
  }

  f87 = (): string | undefined => this.or40p237()

  /**
   * Index 88: or-40-p3-1
   */
  or40p31 = (): string | undefined => {
    return undefined
  }

  f88 = (): string | undefined => this.or40p31()

  /**
   * Index 89: or-40-p3-2
   */
  or40p32 = (): string | undefined => {
    return undefined
  }

  f89 = (): string | undefined => this.or40p32()

  /**
   * Index 90: or-40-p3-3
   */
  or40p33 = (): string | undefined => {
    return undefined
  }

  f90 = (): string | undefined => this.or40p33()

  /**
   * Index 91: or-40-p3-4
   */
  or40p34 = (): string | undefined => {
    return undefined
  }

  f91 = (): string | undefined => this.or40p34()

  /**
   * Index 92: or-40-p3-5
   */
  or40p35 = (): string | undefined => {
    return undefined
  }

  f92 = (): string | undefined => this.or40p35()

  /**
   * Index 93: or-40-p3-6
   */
  or40p36 = (): string | undefined => {
    return undefined
  }

  f93 = (): string | undefined => this.or40p36()

  /**
   * Index 94: or-40-p3-7
   */
  or40p37 = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.or40p37()

  /**
   * Index 95: or-40-p3-8
   */
  or40p38 = (): string | undefined => {
    return undefined
  }

  f95 = (): string | undefined => this.or40p38()

  /**
   * Index 96: or-40-p3-9
   */
  or40p39 = (): string | undefined => {
    return undefined
  }

  f96 = (): string | undefined => this.or40p39()

  /**
   * Index 97: or-40-p3-10
   */
  or40p310 = (): string | undefined => {
    return undefined
  }

  f97 = (): string | undefined => this.or40p310()

  /**
   * Index 98: or-40-p3-11
   */
  or40p311 = (): string | undefined => {
    return undefined
  }

  f98 = (): string | undefined => this.or40p311()

  /**
   * Index 99: or-40-p3-12
   */
  or40p312 = (): string | undefined => {
    return undefined
  }

  f99 = (): string | undefined => this.or40p312()

  /**
   * Index 100: or-40-p3-13
   */
  or40p313 = (): string | undefined => {
    return undefined
  }

  f100 = (): string | undefined => this.or40p313()

  /**
   * Index 101: or-40-p3-14
   */
  or40p314 = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.or40p314()

  /**
   * Index 102: or-40-p3-15
   */
  or40p315 = (): string | undefined => {
    return undefined
  }

  f102 = (): string | undefined => this.or40p315()

  /**
   * Index 103: or-40-p3-16
   */
  or40p316 = (): string | undefined => {
    return undefined
  }

  f103 = (): string | undefined => this.or40p316()

  /**
   * Index 104: or-40-p3-17
   */
  or40p317 = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.or40p317()

  /**
   * Index 105: or-40-p4-4
   */
  or40p44 = (): string | undefined => {
    return undefined
  }

  f105 = (): string | undefined => this.or40p44()

  /**
   * Index 106: or-40-p4-5
   */
  or40p45 = (): string | undefined => {
    return undefined
  }

  f106 = (): string | undefined => this.or40p45()

  /**
   * Index 107: or-40-p4-6
   */
  or40p46 = (): string | undefined => {
    return undefined
  }

  f107 = (): string | undefined => this.or40p46()

  /**
   * Index 108: or-40-p4-7
   */
  or40p47 = (): string | undefined => {
    return undefined
  }

  f108 = (): string | undefined => this.or40p47()

  /**
   * Index 109: or-40-p4-8
   */
  or40p48 = (): string | undefined => {
    return undefined
  }

  f109 = (): string | undefined => this.or40p48()

  /**
   * Index 110: or-40-p4-9
   */
  or40p49 = (): string | undefined => {
    return undefined
  }

  f110 = (): string | undefined => this.or40p49()

  /**
   * Index 111: or-40-p4-10
   */
  or40p410 = (): string | undefined => {
    return undefined
  }

  f111 = (): string | undefined => this.or40p410()

  /**
   * Index 112: or-40-p4-11
   */
  or40p411 = (): string | undefined => {
    return undefined
  }

  f112 = (): string | undefined => this.or40p411()

  /**
   * Index 113: or-40-p4-12
   */
  or40p412 = (): string | undefined => {
    return undefined
  }

  f113 = (): string | undefined => this.or40p412()

  /**
   * Index 114: or-40-p4-13
   */
  or40p413 = (): string | undefined => {
    return undefined
  }

  f114 = (): string | undefined => this.or40p413()

  /**
   * Index 115: or-40-p4-14
   */
  or40p414 = (): string | undefined => {
    return undefined
  }

  f115 = (): string | undefined => this.or40p414()

  /**
   * Index 116: or-40-p4-15
   */
  or40p415 = (): string | undefined => {
    return undefined
  }

  f116 = (): string | undefined => this.or40p415()

  /**
   * Index 117: or-40-p4-16
   */
  or40p416 = (): string | undefined => {
    return undefined
  }

  f117 = (): string | undefined => this.or40p416()

  /**
   * Index 118: or-40-p4-1
   */
  or40p41 = (): string | undefined => {
    return undefined
  }

  f118 = (): string | undefined => this.or40p41()

  /**
   * Index 119: or-40-p4-2
   */
  or40p42 = (): string | undefined => {
    return undefined
  }

  f119 = (): string | undefined => this.or40p42()

  /**
   * Index 120: or-40-p4-3
   */
  or40p43 = (): string | undefined => {
    return undefined
  }

  f120 = (): string | undefined => this.or40p43()

  /**
   * Index 121: or-40-p5-1
   */
  or40p51 = (): string | undefined => {
    return undefined
  }

  f121 = (): string | undefined => this.or40p51()

  /**
   * Index 122: or-40-p5-2
   */
  or40p52 = (): string | undefined => {
    return undefined
  }

  f122 = (): string | undefined => this.or40p52()

  /**
   * Index 123: or-40-p5-3
   */
  or40p53 = (): string | undefined => {
    return undefined
  }

  f123 = (): string | undefined => this.or40p53()

  /**
   * Index 124: or-40-p5-4
   */
  or40p54 = (): string | undefined => {
    return undefined
  }

  f124 = (): string | undefined => this.or40p54()

  /**
   * Index 125: or-40-p5-5
   */
  or40p55 = (): string | undefined => {
    return undefined
  }

  f125 = (): string | undefined => this.or40p55()

  /**
   * Index 126: or-40-p5-6
   */
  or40p56 = (): string | undefined => {
    return undefined
  }

  f126 = (): string | undefined => this.or40p56()

  /**
   * Index 127: or-40-p5-7
   */
  or40p57 = (): string | undefined => {
    return undefined
  }

  f127 = (): string | undefined => this.or40p57()

  /**
   * Index 128: or-40-p5-8
   */
  or40p58 = (): string | undefined => {
    return undefined
  }

  f128 = (): string | undefined => this.or40p58()

  /**
   * Index 129: or-40-p5-9
   */
  or40p59 = (): string | undefined => {
    return undefined
  }

  f129 = (): string | undefined => this.or40p59()

  /**
   * Index 130: or-40-p5-10
   */
  or40p510 = (): string | undefined => {
    return undefined
  }

  f130 = (): string | undefined => this.or40p510()

  /**
   * Index 131: or-40-p5-11
   */
  or40p511 = (): string | undefined => {
    return undefined
  }

  f131 = (): string | undefined => this.or40p511()

  /**
   * Index 132: or-40-p5-12
   */
  or40p512 = (): string | undefined => {
    return undefined
  }

  f132 = (): string | undefined => this.or40p512()

  /**
   * Index 133: or-40-p5-13
   */
  or40p513 = (): string | undefined => {
    return undefined
  }

  f133 = (): string | undefined => this.or40p513()

  /**
   * Index 134: or-40-p5-14
   */
  or40p514 = (): string | undefined => {
    return undefined
  }

  f134 = (): string | undefined => this.or40p514()

  /**
   * Index 135: or-40-p5-15
   */
  or40p515 = (): string | undefined => {
    return undefined
  }

  f135 = (): string | undefined => this.or40p515()

  /**
   * Index 136: or-40-p5-16
   */
  or40p516 = (): string | undefined => {
    return undefined
  }

  f136 = (): string | undefined => this.or40p516()

  /**
   * Index 137: or-40-p6-1
   */
  or40p61 = (): string | undefined => {
    return undefined
  }

  f137 = (): string | undefined => this.or40p61()

  /**
   * Index 138: or-40-p6-2
   */
  or40p62 = (): string | undefined => {
    return undefined
  }

  f138 = (): string | undefined => this.or40p62()

  /**
   * Index 139: or-40-p6-3
   */
  or40p63 = (): string | undefined => {
    return undefined
  }

  f139 = (): string | undefined => this.or40p63()

  /**
   * Index 140: or-40-p6-4
   */
  or40p64 = (): string | undefined => {
    return undefined
  }

  f140 = (): string | undefined => this.or40p64()

  /**
   * Index 141: or-40-p6-5
   */
  or40p65 = (): string | undefined => {
    return undefined
  }

  f141 = (): string | undefined => this.or40p65()

  /**
   * Index 142: or-40-p6-6
   */
  or40p66 = (): string | undefined => {
    return undefined
  }

  f142 = (): string | undefined => this.or40p66()

  /**
   * Index 143: or-40-p6-7
   */
  or40p67 = (): string | undefined => {
    return undefined
  }

  f143 = (): string | undefined => this.or40p67()

  /**
   * Index 144: or-40-p6-8
   */
  or40p68 = (): string | undefined => {
    return undefined
  }

  f144 = (): string | undefined => this.or40p68()

  /**
   * Index 145: or-40-p6-9
   */
  or40p69 = (): string | undefined => {
    return undefined
  }

  f145 = (): string | undefined => this.or40p69()

  /**
   * Index 146: or-40-p6-10
   */
  or40p610 = (): string | undefined => {
    return undefined
  }

  f146 = (): string | undefined => this.or40p610()

  /**
   * Index 147: or-40-p6-11
   */
  or40p611 = (): string | undefined => {
    return undefined
  }

  f147 = (): string | undefined => this.or40p611()

  /**
   * Index 148: or-40-p6-12
   */
  or40p612 = (): string | undefined => {
    return undefined
  }

  f148 = (): string | undefined => this.or40p612()

  /**
   * Index 149: or-40-p6-13
   */
  or40p613 = (): boolean | undefined => {
    return undefined
  }

  f149 = (): boolean | undefined => this.or40p613()

  /**
   * Index 150: or-40-p6-14
   */
  or40p614 = (): boolean | undefined => {
    return undefined
  }

  f150 = (): boolean | undefined => this.or40p614()

  /**
   * Index 151: or-40-p6-15
   */
  or40p615 = (): boolean | undefined => {
    return undefined
  }

  f151 = (): boolean | undefined => this.or40p615()

  /**
   * Index 152: or-40-p6-16
   */
  or40p616 = (): boolean | undefined => {
    return undefined
  }

  f152 = (): boolean | undefined => this.or40p616()

  /**
   * Index 153: or-40-p6-17
   */
  or40p617 = (): string | undefined => {
    return undefined
  }

  f153 = (): string | undefined => this.or40p617()

  /**
   * Index 154: or-40-p6-18
   */
  or40p618 = (): string | undefined => {
    return undefined
  }

  f154 = (): string | undefined => this.or40p618()

  /**
   * Index 155: or-40-p7-1
   */
  or40p71 = (): string | undefined => {
    return undefined
  }

  f155 = (): string | undefined => this.or40p71()

  /**
   * Index 156: or-40-p7-2
   */
  or40p72 = (): string | undefined => {
    return undefined
  }

  f156 = (): string | undefined => this.or40p72()

  /**
   * Index 157: or-40-p7-3
   */
  or40p73 = (): string | undefined => {
    return undefined
  }

  f157 = (): string | undefined => this.or40p73()

  /**
   * Index 158: or-40-p7-4
   */
  or40p74 = (): string | undefined => {
    return undefined
  }

  f158 = (): string | undefined => this.or40p74()

  /**
   * Index 159: or-40-p7-5
   */
  or40p75 = (): boolean | undefined => {
    return undefined
  }

  f159 = (): boolean | undefined => this.or40p75()

  /**
   * Index 160: or-40-p7-7
   */
  or40p77 = (): boolean | undefined => {
    return undefined
  }

  f160 = (): boolean | undefined => this.or40p77()

  /**
   * Index 161: or-40-p7-8
   */
  or40p78 = (): boolean | undefined => {
    return undefined
  }

  f161 = (): boolean | undefined => this.or40p78()

  /**
   * Index 162: or-40-p7-9
   */
  or40p79 = (): string | undefined => {
    return undefined
  }

  f162 = (): string | undefined => this.or40p79()

  /**
   * Index 163: or-40-p7-10
   */
  or40p710 = (): string | undefined => {
    return undefined
  }

  f163 = (): string | undefined => this.or40p710()

  /**
   * Index 164: or-40-p7-11
   */
  or40p711 = (): string | undefined => {
    return undefined
  }

  f164 = (): string | undefined => this.or40p711()

  /**
   * Index 165: or-40-p7-12
   */
  or40p712 = (): string | undefined => {
    return undefined
  }

  f165 = (): string | undefined => this.or40p712()

  /**
   * Index 166: or-40-p7-16
   */
  or40p716 = (): string | undefined => {
    return undefined
  }

  f166 = (): string | undefined => this.or40p716()

  /**
   * Index 167: or-40-p7-17
   */
  or40p717 = (): string | undefined => {
    return undefined
  }

  f167 = (): string | undefined => this.or40p717()

  /**
   * Index 168: or-40-p9-1
   */
  or40p91 = (): string | undefined => {
    return undefined
  }

  f168 = (): string | undefined => this.or40p91()

  /**
   * Index 169: or-40-p9-2
   */
  or40p92 = (): string | undefined => {
    return undefined
  }

  f169 = (): string | undefined => this.or40p92()

  /**
   * Index 170: or-40-p9-3
   */
  or40p93 = (): string | undefined => {
    return undefined
  }

  f170 = (): string | undefined => this.or40p93()

  /**
   * Index 171: or-40-p9-4
   */
  or40p94 = (): string | undefined => {
    return undefined
  }

  f171 = (): string | undefined => this.or40p94()

  /**
   * Index 172: or-40-p9-5
   */
  or40p95 = (): string | undefined => {
    return undefined
  }

  f172 = (): string | undefined => this.or40p95()

  /**
   * Index 173: or-40-p9-6
   */
  or40p96 = (): string | undefined => {
    return undefined
  }

  f173 = (): string | undefined => this.or40p96()

  /**
   * Index 174: or-40-p9-7
   */
  or40p97 = (): string | undefined => {
    return undefined
  }

  f174 = (): string | undefined => this.or40p97()

  /**
   * Index 175: or-40-p9-8
   */
  or40p98 = (): string | undefined => {
    return undefined
  }

  f175 = (): string | undefined => this.or40p98()

  /**
   * Index 176: or-40-p9-9
   */
  or40p99 = (): string | undefined => {
    return undefined
  }

  f176 = (): string | undefined => this.or40p99()

  /**
   * Index 177: or-40-p9-10
   */
  or40p910 = (): string | undefined => {
    return undefined
  }

  f177 = (): string | undefined => this.or40p910()

  /**
   * Index 178: or-40-p9-11
   */
  or40p911 = (): string | undefined => {
    return undefined
  }

  f178 = (): string | undefined => this.or40p911()

  /**
   * Index 179: or-40-p9-12
   */
  or40p912 = (): string | undefined => {
    return undefined
  }

  f179 = (): string | undefined => this.or40p912()

  /**
   * Index 180: or-40-p9-13
   */
  or40p913 = (): string | undefined => {
    return undefined
  }

  f180 = (): string | undefined => this.or40p913()

  /**
   * Index 181: or-40-p1-18
   */
  or40p118 = (): string | undefined => {
    return undefined
  }

  f181 = (): string | undefined => this.or40p118()

  /**
   * Index 182: or-40-p1-19
   */
  or40p119 = (): string | undefined => {
    return undefined
  }

  f182 = (): string | undefined => this.or40p119()

  /**
   * Index 183: or-40-p1-20
   */
  or40p120 = (): boolean | undefined => {
    return undefined
  }

  f183 = (): boolean | undefined => this.or40p120()

  /**
   * Index 184: or-40-p1-21
   */
  or40p121 = (): boolean | undefined => {
    return undefined
  }

  f184 = (): boolean | undefined => this.or40p121()

  /**
   * Index 185: or-40_p2_1
   */
  or40p21 = (): string | undefined => {
    return undefined
  }

  f185 = (): string | undefined => this.or40p21()

  /**
   * Index 186: or-40-p1-33
   */
  or40p133 = (): string | undefined => {
    return undefined
  }

  f186 = (): string | undefined => this.or40p133()

  /**
   * Index 187: or-40-p2-20
   */
  or40p220 = (): string | undefined => {
    return undefined
  }

  f187 = (): string | undefined => this.or40p220()

  /**
   * Index 188: or-40-p2-27
   */
  or40p227 = (): string | undefined => {
    return undefined
  }

  f188 = (): string | undefined => this.or40p227()

  /**
   * Index 189: or-40-p2-34
   */
  or40p234 = (): string | undefined => {
    return undefined
  }

  f189 = (): string | undefined => this.or40p234()

  /**
   * Index 190: or-40_n_p9_14
   */
  or40np914 = (): string | undefined => {
    return undefined
  }

  f190 = (): string | undefined => this.or40np914()

  /**
   * Index 191: or-40-p7-15
   */
  or40p715 = (): string | undefined => {
    return undefined
  }

  f191 = (): string | undefined => this.or40p715()

  /**
   * Index 192: or-40-p1-34a
   */
  or40p134a = (): string | undefined => {
    return undefined
  }

  f192 = (): string | undefined => this.or40p134a()

  /**
   * Index 193: or-40-p1-34b
   */
  or40p134b = (): string | undefined => {
    return undefined
  }

  f193 = (): string | undefined => this.or40p134b()

  /**
   * Index 194: or-40-n-p10-12a
   */
  or40np1012a = (): string | undefined => {
    return undefined
  }

  f194 = (): string | undefined => this.or40np1012a()

  /**
   * Index 195: or-40-n-p10-12b
   */
  or40np1012b = (): string | undefined => {
    return undefined
  }

  f195 = (): string | undefined => this.or40np1012b()

  /**
   * Index 196: or-40-p7-13
   */
  or40p713 = (): string | undefined => {
    return undefined
  }

  f196 = (): string | undefined => this.or40p713()

  /**
   * Index 197: or-40-p7-14
   */
  or40p714 = (): string | undefined => {
    return undefined
  }

  f197 = (): string | undefined => this.or40p714()

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
    this.f196(),
    this.f197()
  ]
}

const makeOR40P = (f1040: F1040): OR40P => new OR40P(f1040)

export default makeOR40P
