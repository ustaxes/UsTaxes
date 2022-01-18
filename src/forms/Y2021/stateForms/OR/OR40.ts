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
import { ORWFHDC } from './ORWFHDC'
import OR40V from './OR40V'

export class OR40 extends Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  scheduleWFHDC: ORWFHDC
  or40V: OR40V
  formOrder = 0
  methods: FormMethods

  constructor(info: Information, f1040: F1040) {
    super()
    this.info = info
    this.f1040 = f1040
    this.formName = 'OR-40'
    this.state = 'OR'
    this.scheduleWFHDC = new ORWFHDC(info, f1040)
    this.or40V = new OR40V(info, f1040, this)
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
   * Index 1: or-40-p1-1
   */
  or40p11 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.or40p11()

  /**
   * Index 2: or-40-p1-2
   */
  or40p12 = (): boolean | undefined => {
    return true
  }

  f2 = (): boolean | undefined => this.or40p12()

  /**
   * Index 3: or-40-p1-4
   */
  or40p14 = (): boolean | undefined => {
    return true
  }

  f3 = (): boolean | undefined => this.or40p14()

  /**
   * Index 4: or-40-p1-5
   */
  or40p15 = (): boolean | undefined => {
    return true
  }

  f4 = (): boolean | undefined => this.or40p15()

  /**
   * Index 5: or-40-p1-6
   */
  or40p16 = (): boolean | undefined => {
    return true
  }

  f5 = (): boolean | undefined => this.or40p16()

  /**
   * Index 6: or-40-p1-7
   */
  or40p17 = (): boolean | undefined => {
    return true
  }

  f6 = (): boolean | undefined => this.or40p17()

  /**
   * Index 7: or-40-p1-8
   */
  or40p18 = (): boolean | undefined => {
    return true
  }

  f7 = (): boolean | undefined => this.or40p18()

  /**
   * Index 8: or-40-p1-9
   */
  or40p19 = (): boolean | undefined => {
    return true
  }

  f8 = (): boolean | undefined => this.or40p19()

  /**
   * Index 9: or-40-p1-10
   */
  or40p110 = (): boolean | undefined => {
    return true
  }

  f9 = (): boolean | undefined => this.or40p110()

  /**
   * Index 10: or-40-p1-11
   */
  or40p111 = (): string | undefined => {
    return undefined
  }

  f10 = (): string | undefined => this.or40p111()

  /**
   * Index 11: or-40-p1-12
   */
  or40p112 = (): string | undefined => {
    return undefined
  }

  f11 = (): string | undefined => this.or40p112()

  /**
   * Index 12: or-40-p1-13
   */
  or40p113 = (): string | undefined => {
    return undefined
  }

  f12 = (): string | undefined => this.or40p113()

  /**
   * Index 13: or-40-p1-16
   */
  or40p116 = (): boolean | undefined => {
    return true
  }

  f13 = (): boolean | undefined => this.or40p116()

  /**
   * Index 14: or-40-p1-17
   */
  or40p117 = (): boolean | undefined => {
    return true
  }

  f14 = (): boolean | undefined => this.or40p117()

  /**
   * Index 15: or-40-p1-18
   */
  or40p118 = (): boolean | undefined => {
    return true
  }

  f15 = (): boolean | undefined => this.or40p118()

  /**
   * Index 16: or-40-p1-14
   */
  or40p114 = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.or40p114()

  /**
   * Index 17: or-40-p1-15
   */
  or40p115 = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.or40p115()

  /**
   * Index 18: or-40-p2-2
   */
  or40p22 = (): boolean | undefined => {
    return true
  }

  f18 = (): boolean | undefined => this.or40p22()

  /**
   * Index 19: or-40-p2-3
   */
  or40p23 = (): boolean | undefined => {
    return true
  }

  f19 = (): boolean | undefined => this.or40p23()

  /**
   * Index 20: or-40-p2-4
   */
  or40p24 = (): boolean | undefined => {
    return true
  }

  f20 = (): boolean | undefined => this.or40p24()

  /**
   * Index 21: or-40-p2-5
   */
  or40p25 = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.or40p25()

  /**
   * Index 22: or-40-p2-9
   */
  or40p29 = (): boolean | undefined => {
    return true
  }

  f22 = (): boolean | undefined => this.or40p29()

  /**
   * Index 23: or-40-p2-12
   */
  or40p212 = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.or40p212()

  /**
   * Index 24: or-40-p2-13
   */
  or40p213 = (): string | undefined => {
    return undefined
  }

  f24 = (): string | undefined => this.or40p213()

  /**
   * Index 25: or-40-p2-14
   */
  or40p214 = (): string | undefined => {
    return undefined
  }

  f25 = (): string | undefined => this.or40p214()

  /**
   * Index 26: or-40-p2-15
   */
  or40p215 = (): string | undefined => {
    return undefined
  }

  f26 = (): string | undefined => this.or40p215()

  /**
   * Index 27: or-40-p2-17
   */
  or40p217 = (): boolean | undefined => {
    return true
  }

  f27 = (): boolean | undefined => this.or40p217()

  /**
   * Index 28: or-40-p2-18
   */
  or40p218 = (): string | undefined => {
    return undefined
  }

  f28 = (): string | undefined => this.or40p218()

  /**
   * Index 29: or-40-p2-19
   */
  or40p219 = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.or40p219()

  /**
   * Index 30: or-40-p2-20
   */
  or40p220 = (): string | undefined => {
    return undefined
  }

  f30 = (): string | undefined => this.or40p220()

  /**
   * Index 31: or-40-p2-21
   */
  or40p221 = (): string | undefined => {
    return undefined
  }

  f31 = (): string | undefined => this.or40p221()

  /**
   * Index 32: or-40-p2-22
   */
  or40p222 = (): string | undefined => {
    return undefined
  }

  f32 = (): string | undefined => this.or40p222()

  /**
   * Index 33: or-40-p2-24
   */
  or40p224 = (): boolean | undefined => {
    return true
  }

  f33 = (): boolean | undefined => this.or40p224()

  /**
   * Index 34: or-40-p2-25
   */
  or40p225 = (): string | undefined => {
    return undefined
  }

  f34 = (): string | undefined => this.or40p225()

  /**
   * Index 35: or-40-p2-26
   */
  or40p226 = (): string | undefined => {
    return undefined
  }

  f35 = (): string | undefined => this.or40p226()

  /**
   * Index 36: or-40-p2-27
   */
  or40p227 = (): string | undefined => {
    return undefined
  }

  f36 = (): string | undefined => this.or40p227()

  /**
   * Index 37: or-40-p2-29
   */
  or40p229 = (): string | undefined => {
    return undefined
  }

  f37 = (): string | undefined => this.or40p229()

  /**
   * Index 38: or-40-p2-31
   */
  or40p231 = (): boolean | undefined => {
    return true
  }

  f38 = (): boolean | undefined => this.or40p231()

  /**
   * Index 39: or-40-p2-33
   */
  or40p233 = (): string | undefined => {
    return undefined
  }

  f39 = (): string | undefined => this.or40p233()

  /**
   * Index 40: or-40-p2-34
   */
  or40p234 = (): string | undefined => {
    return undefined
  }

  f40 = (): string | undefined => this.or40p234()

  /**
   * Index 41: or-40-p2-6
   */
  or40p26 = (): boolean | undefined => {
    return true
  }

  f41 = (): boolean | undefined => this.or40p26()

  /**
   * Index 42: or-40-p2-7
   */
  or40p27 = (): boolean | undefined => {
    return true
  }

  f42 = (): boolean | undefined => this.or40p27()

  /**
   * Index 43: or-40-p2-8
   */
  or40p28 = (): boolean | undefined => {
    return true
  }

  f43 = (): boolean | undefined => this.or40p28()

  /**
   * Index 44: or-40-p2-32
   */
  or40p232 = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.or40p232()

  /**
   * Index 45: or-40-p2-1
   */
  or40p21 = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.or40p21()

  /**
   * Index 46: or-40-p2-28
   */
  or40p228 = (): string | undefined => {
    return undefined
  }

  f46 = (): string | undefined => this.or40p228()

  /**
   * Index 47: or-40-p1-19
   */
  or40p119 = (): string | undefined => {
    return undefined
  }

  f47 = (): string | undefined => this.or40p119()

  /**
   * Index 48: or-40-p1-20
   */
  or40p120 = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.or40p120()

  /**
   * Index 49: or-40-p1-21
   */
  or40p121 = (): string | undefined => {
    return undefined
  }

  f49 = (): string | undefined => this.or40p121()

  /**
   * Index 50: or-40-p1-22
   */
  or40p122 = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.or40p122()

  /**
   * Index 51: or-40-p1-23
   */
  or40p123 = (): string | undefined => {
    return undefined
  }

  f51 = (): string | undefined => this.or40p123()

  /**
   * Index 52: or-40-p1-24
   */
  or40p124 = (): boolean | undefined => {
    return true
  }

  f52 = (): boolean | undefined => this.or40p124()

  /**
   * Index 53: or-40-p1-25
   */
  or40p125 = (): boolean | undefined => {
    return true
  }

  f53 = (): boolean | undefined => this.or40p125()

  /**
   * Index 54: or-40-p1-26
   */
  or40p126 = (): boolean | undefined => {
    return true
  }

  f54 = (): boolean | undefined => this.or40p126()

  /**
   * Index 55: or-40-p1-27
   */
  or40p127 = (): string | undefined => {
    return undefined
  }

  f55 = (): string | undefined => this.or40p127()

  /**
   * Index 56: or-40-p1-28
   */
  or40p128 = (): string | undefined => {
    return undefined
  }

  f56 = (): string | undefined => this.or40p128()

  /**
   * Index 57: or-40-p1-31
   */
  or40p131 = (): string | undefined => {
    return undefined
  }

  f57 = (): string | undefined => this.or40p131()

  /**
   * Index 58: or-40-p1-32
   */
  or40p132 = (): string | undefined => {
    return undefined
  }

  f58 = (): string | undefined => this.or40p132()

  /**
   * Index 59: or-40-p1-3
   */
  or40p13 = (): string | undefined => {
    return undefined
  }

  f59 = (): string | undefined => this.or40p13()

  /**
   * Index 60: or-40-p2-11
   */
  or40p211 = (): string | undefined => {
    return undefined
  }

  f60 = (): string | undefined => this.or40p211()

  /**
   * Index 61: or-40-p3-12
   */
  or40p312 = (): boolean | undefined => {
    return true
  }

  f61 = (): boolean | undefined => this.or40p312()

  /**
   * Index 62: or-40-p3-13
   */
  or40p313 = (): boolean | undefined => {
    return true
  }

  f62 = (): boolean | undefined => this.or40p313()

  /**
   * Index 63: or-40-p3-14
   */
  or40p314 = (): boolean | undefined => {
    return true
  }

  f63 = (): boolean | undefined => this.or40p314()

  /**
   * Index 64: or-40-p3-15
   */
  or40p315 = (): boolean | undefined => {
    return true
  }

  f64 = (): boolean | undefined => this.or40p315()

  /**
   * Index 65: or-40-p4-2
   */
  or40p42 = (): boolean | undefined => {
    return true
  }

  f65 = (): boolean | undefined => this.or40p42()

  /**
   * Index 66: or-40-p4-3
   */
  or40p43 = (): boolean | undefined => {
    return true
  }

  f66 = (): boolean | undefined => this.or40p43()

  /**
   * Index 67: or-40-p4-4
   */
  or40p44 = (): boolean | undefined => {
    return true
  }

  f67 = (): boolean | undefined => this.or40p44()

  /**
   * Index 68: or-40-p5-12
   */
  or40p512 = (): string | undefined => {
    return undefined
  }

  f68 = (): string | undefined => this.or40p512()

  /**
   * Index 69: or-40-p5-13
   */
  or40p513 = (): boolean | undefined => {
    return true
  }

  f69 = (): boolean | undefined => this.or40p513()

  /**
   * Index 70: or-40-p6-6
   */
  or40p66 = (): string | undefined => {
    return undefined
  }

  f70 = (): string | undefined => this.or40p66()

  /**
   * Index 71: or-40-p6-7
   */
  or40p67 = (): string | undefined => {
    return undefined
  }

  f71 = (): string | undefined => this.or40p67()

  /**
   * Index 72: or-40-p6-11
   */
  or40p611 = (): boolean | undefined => {
    return true
  }

  f72 = (): boolean | undefined => this.or40p611()

  /**
   * Index 73: or-40-p6-14
   */
  or40p614 = (): string | undefined => {
    return undefined
  }

  f73 = (): string | undefined => this.or40p614()

  /**
   * Index 74: or-40-p6-15
   */
  or40p615 = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.or40p615()

  /**
   * Index 75: or-40-p6-16
   */
  or40p616 = (): boolean | undefined => {
    return true
  }

  f75 = (): boolean | undefined => this.or40p616()

  /**
   * Index 76: or-40-p7-1
   */
  or40p71 = (): string | undefined => {
    return undefined
  }

  f76 = (): string | undefined => this.or40p71()

  /**
   * Index 77: or-40-p7-2
   */
  or40p72 = (): string | undefined => {
    return undefined
  }

  f77 = (): string | undefined => this.or40p72()

  /**
   * Index 78: or-40-p7-3
   */
  or40p73 = (): string | undefined => {
    return undefined
  }

  f78 = (): string | undefined => this.or40p73()

  /**
   * Index 79: or-40-p7-4
   */
  or40p74 = (): string | undefined => {
    return undefined
  }

  f79 = (): string | undefined => this.or40p74()

  /**
   * Index 80: or-40-p7-5
   */
  or40p75 = (): string | undefined => {
    return undefined
  }

  f80 = (): string | undefined => this.or40p75()

  /**
   * Index 81: or-40-p7-6
   */
  or40p76 = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.or40p76()

  /**
   * Index 82: or-40-p7-7
   */
  or40p77 = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.or40p77()

  /**
   * Index 83: or-40-p7-8
   */
  or40p78 = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.or40p78()

  /**
   * Index 84: or-40-p7-9
   */
  or40p79 = (): string | undefined => {
    return undefined
  }

  f84 = (): string | undefined => this.or40p79()

  /**
   * Index 85: or-40-p7-10
   */
  or40p710 = (): string | undefined => {
    return undefined
  }

  f85 = (): string | undefined => this.or40p710()

  /**
   * Index 86: or-40-p7-11
   */
  or40p711 = (): string | undefined => {
    return undefined
  }

  f86 = (): string | undefined => this.or40p711()

  /**
   * Index 87: or-40-p8-1
   */
  or40p81 = (): string | undefined => {
    return undefined
  }

  f87 = (): string | undefined => this.or40p81()

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
   * Index 91: or-40-p3-10
   */
  or40p310 = (): string | undefined => {
    return undefined
  }

  f91 = (): string | undefined => this.or40p310()

  /**
   * Index 92: or-40-p3-11
   */
  or40p311 = (): string | undefined => {
    return undefined
  }

  f92 = (): string | undefined => this.or40p311()

  /**
   * Index 93: or-40-p3-16
   */
  or40p316 = (): string | undefined => {
    return undefined
  }

  f93 = (): string | undefined => this.or40p316()

  /**
   * Index 94: or-40-p3-17
   */
  or40p317 = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.or40p317()

  /**
   * Index 95: or-40-p3-4
   */
  or40p34 = (): string | undefined => {
    return undefined
  }

  f95 = (): string | undefined => this.or40p34()

  /**
   * Index 96: or-40-p3-5
   */
  or40p35 = (): string | undefined => {
    return undefined
  }

  f96 = (): string | undefined => this.or40p35()

  /**
   * Index 97: or-40-p3-6
   */
  or40p36 = (): string | undefined => {
    return undefined
  }

  f97 = (): string | undefined => this.or40p36()

  /**
   * Index 98: or-40-p3-7
   */
  or40p37 = (): string | undefined => {
    return undefined
  }

  f98 = (): string | undefined => this.or40p37()

  /**
   * Index 99: or-40-p3-8
   */
  or40p38 = (): string | undefined => {
    return undefined
  }

  f99 = (): string | undefined => this.or40p38()

  /**
   * Index 100: or-40-p3-9
   */
  or40p39 = (): string | undefined => {
    return undefined
  }

  f100 = (): string | undefined => this.or40p39()

  /**
   * Index 101: or-40-p4-1
   */
  or40p41 = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.or40p41()

  /**
   * Index 102: or-40-p4-5
   */
  or40p45 = (): string | undefined => {
    return undefined
  }

  f102 = (): string | undefined => this.or40p45()

  /**
   * Index 103: or-40-p4-6
   */
  or40p46 = (): string | undefined => {
    return undefined
  }

  f103 = (): string | undefined => this.or40p46()

  /**
   * Index 104: or-40-p4-7
   */
  or40p47 = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.or40p47()

  /**
   * Index 105: or-40-p4-8
   */
  or40p48 = (): string | undefined => {
    return undefined
  }

  f105 = (): string | undefined => this.or40p48()

  /**
   * Index 106: or-40-p4-9
   */
  or40p49 = (): string | undefined => {
    return undefined
  }

  f106 = (): string | undefined => this.or40p49()

  /**
   * Index 107: or-40-p4-10
   */
  or40p410 = (): string | undefined => {
    return undefined
  }

  f107 = (): string | undefined => this.or40p410()

  /**
   * Index 108: or-40-p5-1
   */
  or40p51 = (): string | undefined => {
    return undefined
  }

  f108 = (): string | undefined => this.or40p51()

  /**
   * Index 109: or-40-p5-2
   */
  or40p52 = (): string | undefined => {
    return undefined
  }

  f109 = (): string | undefined => this.or40p52()

  /**
   * Index 110: or-40-p5-3
   */
  or40p53 = (): string | undefined => {
    return undefined
  }

  f110 = (): string | undefined => this.or40p53()

  /**
   * Index 111: or-40-p5-4
   */
  or40p54 = (): string | undefined => {
    return undefined
  }

  f111 = (): string | undefined => this.or40p54()

  /**
   * Index 112: or-40-p5-5
   */
  or40p55 = (): string | undefined => {
    return undefined
  }

  f112 = (): string | undefined => this.or40p55()

  /**
   * Index 113: or-40-p5-6
   */
  or40p56 = (): string | undefined => {
    return undefined
  }

  f113 = (): string | undefined => this.or40p56()

  /**
   * Index 114: or-40-p5-7
   */
  or40p57 = (): string | undefined => {
    return undefined
  }

  f114 = (): string | undefined => this.or40p57()

  /**
   * Index 115: or-40-p5-8
   */
  or40p58 = (): string | undefined => {
    return undefined
  }

  f115 = (): string | undefined => this.or40p58()

  /**
   * Index 116: or-40-p5-9
   */
  or40p59 = (): string | undefined => {
    return undefined
  }

  f116 = (): string | undefined => this.or40p59()

  /**
   * Index 117: or-40-p5-10
   */
  or40p510 = (): string | undefined => {
    return undefined
  }

  f117 = (): string | undefined => this.or40p510()

  /**
   * Index 118: or-40-p5-11
   */
  or40p511 = (): string | undefined => {
    return undefined
  }

  f118 = (): string | undefined => this.or40p511()

  /**
   * Index 119: or-40-p5-14
   */
  or40p514 = (): string | undefined => {
    return undefined
  }

  f119 = (): string | undefined => this.or40p514()

  /**
   * Index 120: or-40-p4-11
   */
  or40p411 = (): string | undefined => {
    return undefined
  }

  f120 = (): string | undefined => this.or40p411()

  /**
   * Index 121: or-40-p4-12
   */
  or40p412 = (): string | undefined => {
    return undefined
  }

  f121 = (): string | undefined => this.or40p412()

  /**
   * Index 122: or-40-p4-13
   */
  or40p413 = (): string | undefined => {
    return undefined
  }

  f122 = (): string | undefined => this.or40p413()

  /**
   * Index 123: or-40-p4-14
   */
  or40p414 = (): string | undefined => {
    return undefined
  }

  f123 = (): string | undefined => this.or40p414()

  /**
   * Index 124: or-40-p4-15
   */
  or40p415 = (): string | undefined => {
    return undefined
  }

  f124 = (): string | undefined => this.or40p415()

  /**
   * Index 125: or-40-p6-1
   */
  or40p61 = (): string | undefined => {
    return undefined
  }

  f125 = (): string | undefined => this.or40p61()

  /**
   * Index 126: or-40-p6-2
   */
  or40p62 = (): string | undefined => {
    return undefined
  }

  f126 = (): string | undefined => this.or40p62()

  /**
   * Index 127: or-40-p6-3
   */
  or40p63 = (): string | undefined => {
    return undefined
  }

  f127 = (): string | undefined => this.or40p63()

  /**
   * Index 128: or-40-p6-4
   */
  or40p64 = (): string | undefined => {
    return undefined
  }

  f128 = (): string | undefined => this.or40p64()

  /**
   * Index 129: or-40-p6-5
   */
  or40p65 = (): string | undefined => {
    return undefined
  }

  f129 = (): string | undefined => this.or40p65()

  /**
   * Index 130: or-40-p6-8
   */
  or40p68 = (): string | undefined => {
    return undefined
  }

  f130 = (): string | undefined => this.or40p68()

  /**
   * Index 131: or-40-p6-9
   */
  or40p69 = (): string | undefined => {
    return undefined
  }

  f131 = (): string | undefined => this.or40p69()

  /**
   * Index 132: or-40-p6-17
   */
  or40p617 = (): string | undefined => {
    return undefined
  }

  f132 = (): string | undefined => this.or40p617()

  /**
   * Index 133: or-40-p6-10
   */
  or40p610 = (): string | undefined => {
    return undefined
  }

  f133 = (): string | undefined => this.or40p610()

  /**
   * Index 134: or-40_p1_33
   */
  or40p133 = (): string | undefined => {
    return undefined
  }

  f134 = (): string | undefined => this.or40p133()

  /**
   * Index 135: or-40-p1-29
   */
  or40p129 = (): string | undefined => {
    return undefined
  }

  f135 = (): string | undefined => this.or40p129()

  /**
   * Index 136: or-40-p2-16
   */
  or40p216 = (): string | undefined => {
    return undefined
  }

  f136 = (): string | undefined => this.or40p216()

  /**
   * Index 137: or-40-p2-23
   */
  or40p223 = (): string | undefined => {
    return undefined
  }

  f137 = (): string | undefined => this.or40p223()

  /**
   * Index 138: or-40-p2-30
   */
  or40p230 = (): string | undefined => {
    return undefined
  }

  f138 = (): string | undefined => this.or40p230()

  /**
   * Index 139: or-40-p6-12
   */
  or40p612 = (): string | undefined => {
    return undefined
  }

  f139 = (): string | undefined => this.or40p612()

  /**
   * Index 140: or-40-p7-13
   */
  or40p713 = (): string | undefined => {
    return undefined
  }

  f140 = (): string | undefined => this.or40p713()

  /**
   * Index 141: or-40-p7-14
   */
  or40p714 = (): string | undefined => {
    return undefined
  }

  f141 = (): string | undefined => this.or40p714()

  /**
   * Index 142: or-40-p1-30a
   */
  or40p130a = (): string | undefined => {
    return undefined
  }

  f142 = (): string | undefined => this.or40p130a()

  /**
   * Index 143: or-40-p1-30b
   */
  or40p130b = (): string | undefined => {
    return undefined
  }

  f143 = (): string | undefined => this.or40p130b()

  fields = (): Field[] =>
    [
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
      this.f143()
    ].map((value, i) => {
      return value
        ? value
        : i === 11 ||
          i === 23 ||
          i === 29 ||
          i === 35 ||
          i === 48 ||
          i === 68 ||
          i === 82 ||
          i === 135 ||
          i === 136 ||
          i === 137 ||
          i === 138
        ? 'a'
        : i
    })
}

const makeOR40 = (info: Information, f1040: F1040): OR40 =>
  new OR40(info, f1040)

export default makeOR40
