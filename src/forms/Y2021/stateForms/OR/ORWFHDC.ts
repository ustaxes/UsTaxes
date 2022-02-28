import Form from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import {
  // Dependent,
  Information,
  State
} from 'ustaxes/core/data'
// import parameters from './Parameters'

export class ORWFHDC extends Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  formOrder = 1
  attachments: () => Form[] = () => []

  constructor(info: Information, f1040: F1040) {
    super()
    this.info = info
    this.f1040 = f1040
    this.formName = 'OR-WFHDC'
    this.state = 'OR'
  }

  /**
   * Index 0: or-wfhdc-p1_1
   */
  orwfhdcp11 = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.orwfhdcp11()

  /**
   * Index 1: or-wfhdc-p1_2
   */
  orwfhdcp12 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.orwfhdcp12()

  /**
   * Index 2: or-wfhdc-p1_3
   */
  orwfhdcp13 = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.orwfhdcp13()

  /**
   * Index 3: or-wfhdc-p1_4
   */
  orwfhdcp14 = (): string | undefined => {
    return undefined
  }

  f3 = (): string | undefined => this.orwfhdcp14()

  /**
   * Index 4: or-wfhdc-p1_5
   */
  orwfhdcp15 = (): boolean | undefined => {
    return undefined
  }

  f4 = (): boolean | undefined => this.orwfhdcp15()

  /**
   * Index 5: or-wfhdc-p1_6
   */
  orwfhdcp16 = (): boolean | undefined => {
    return undefined
  }

  f5 = (): boolean | undefined => this.orwfhdcp16()

  /**
   * Index 6: or-wfhdc-p1_7
   */
  orwfhdcp17 = (): string | undefined => {
    return undefined
  }

  f6 = (): string | undefined => this.orwfhdcp17()

  /**
   * Index 7: or-wfhdc-p1_8
   */
  orwfhdcp18 = (): string | undefined => {
    return undefined
  }

  f7 = (): string | undefined => this.orwfhdcp18()

  /**
   * Index 8: or-wfhdc-p1_9
   */
  orwfhdcp19 = (): string | undefined => {
    return undefined
  }

  f8 = (): string | undefined => this.orwfhdcp19()

  /**
   * Index 9: or-wfhdc-p1_10
   */
  orwfhdcp110 = (): string | undefined => {
    return undefined
  }

  f9 = (): string | undefined => this.orwfhdcp110()

  /**
   * Index 10: or-wfhdc-p1_11
   */
  orwfhdcp111 = (): boolean | undefined => {
    return undefined
  }

  f10 = (): boolean | undefined => this.orwfhdcp111()

  /**
   * Index 11: or-wfhdc-p1_12
   */
  orwfhdcp112 = (): boolean | undefined => {
    return undefined
  }

  f11 = (): boolean | undefined => this.orwfhdcp112()

  /**
   * Index 12: or-wfhdc-p1_13
   */
  orwfhdcp113 = (): string | undefined => {
    return undefined
  }

  f12 = (): string | undefined => this.orwfhdcp113()

  /**
   * Index 13: or-wfhdc-p1_14
   */
  orwfhdcp114 = (): string | undefined => {
    return undefined
  }

  f13 = (): string | undefined => this.orwfhdcp114()

  /**
   * Index 14: or-wfhdc-p1_15
   */
  orwfhdcp115 = (): string | undefined => {
    return undefined
  }

  f14 = (): string | undefined => this.orwfhdcp115()

  /**
   * Index 15: or-wfhdc-p1_16
   */
  orwfhdcp116 = (): string | undefined => {
    return undefined
  }

  f15 = (): string | undefined => this.orwfhdcp116()

  /**
   * Index 16: or-wfhdc-p1_17
   */
  orwfhdcp117 = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.orwfhdcp117()

  /**
   * Index 17: or-wfhdc-p1_18
   */
  orwfhdcp118 = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.orwfhdcp118()

  /**
   * Index 18: or-wfhdc-p1_21
   */
  orwfhdcp121 = (): string | undefined => {
    return undefined
  }

  f18 = (): string | undefined => this.orwfhdcp121()

  /**
   * Index 19: or-wfhdc-p1_22
   */
  orwfhdcp122 = (): string | undefined => {
    return undefined
  }

  f19 = (): string | undefined => this.orwfhdcp122()

  /**
   * Index 20: or-wfhdc-p1_23
   */
  orwfhdcp123 = (): string | undefined => {
    return undefined
  }

  f20 = (): string | undefined => this.orwfhdcp123()

  /**
   * Index 21: or-wfhdc-p1_24
   */
  orwfhdcp124 = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.orwfhdcp124()

  /**
   * Index 22: or-wfhdc-p1_26
   */
  orwfhdcp126 = (): string | undefined => {
    return undefined
  }

  f22 = (): string | undefined => this.orwfhdcp126()

  /**
   * Index 23: or-wfhdc-p2_1
   */
  orwfhdcp21 = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.orwfhdcp21()

  /**
   * Index 24: or-wfhdc-p2_2
   */
  orwfhdcp22 = (): string | undefined => {
    return undefined
  }

  f24 = (): string | undefined => this.orwfhdcp22()

  /**
   * Index 25: or-wfhdc-p2_3
   */
  orwfhdcp23 = (): string | undefined => {
    return undefined
  }

  f25 = (): string | undefined => this.orwfhdcp23()

  /**
   * Index 26: or-wfhdc-p2_4
   */
  orwfhdcp24 = (): string | undefined => {
    return undefined
  }

  f26 = (): string | undefined => this.orwfhdcp24()

  /**
   * Index 27: or-wfhdc-p2_5
   */
  orwfhdcp25 = (): string | undefined => {
    return undefined
  }

  f27 = (): string | undefined => this.orwfhdcp25()

  /**
   * Index 28: or-wfhdc-p2_6
   */
  orwfhdcp26 = (): string | undefined => {
    return undefined
  }

  f28 = (): string | undefined => this.orwfhdcp26()

  /**
   * Index 29: or-wfhdc-p2_9
   */
  orwfhdcp29 = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.orwfhdcp29()

  /**
   * Index 30: or-wfhdc-p2_10
   */
  orwfhdcp210 = (): string | undefined => {
    return undefined
  }

  f30 = (): string | undefined => this.orwfhdcp210()

  /**
   * Index 31: or-wfhdc-p2_11
   */
  orwfhdcp211 = (): string | undefined => {
    return undefined
  }

  f31 = (): string | undefined => this.orwfhdcp211()

  /**
   * Index 32: or-wfhdc-p2_12
   */
  orwfhdcp212 = (): string | undefined => {
    return undefined
  }

  f32 = (): string | undefined => this.orwfhdcp212()

  /**
   * Index 33: or-wfhdc-p2_14
   */
  orwfhdcp214 = (): string | undefined => {
    return undefined
  }

  f33 = (): string | undefined => this.orwfhdcp214()

  /**
   * Index 34: or-wfhdc-p2_15
   */
  orwfhdcp215 = (): string | undefined => {
    return undefined
  }

  f34 = (): string | undefined => this.orwfhdcp215()

  /**
   * Index 35: or-wfhdc-p2_16
   */
  orwfhdcp216 = (): string | undefined => {
    return undefined
  }

  f35 = (): string | undefined => this.orwfhdcp216()

  /**
   * Index 36: or-wfhdc-p2_17
   */
  orwfhdcp217 = (): string | undefined => {
    return undefined
  }

  f36 = (): string | undefined => this.orwfhdcp217()

  /**
   * Index 37: or-wfhdc-p2_18
   */
  orwfhdcp218 = (): string | undefined => {
    return undefined
  }

  f37 = (): string | undefined => this.orwfhdcp218()

  /**
   * Index 38: or-wfhdc-p2_19
   */
  orwfhdcp219 = (): string | undefined => {
    return undefined
  }

  f38 = (): string | undefined => this.orwfhdcp219()

  /**
   * Index 39: or-wfhdc-p2_20
   */
  orwfhdcp220 = (): string | undefined => {
    return undefined
  }

  f39 = (): string | undefined => this.orwfhdcp220()

  /**
   * Index 40: or-wfhdc-p2_21
   */
  orwfhdcp221 = (): string | undefined => {
    return undefined
  }

  f40 = (): string | undefined => this.orwfhdcp221()

  /**
   * Index 41: or-wfhdc-p2_23
   */
  orwfhdcp223 = (): string | undefined => {
    return undefined
  }

  f41 = (): string | undefined => this.orwfhdcp223()

  /**
   * Index 42: or-wfhdc-p2_24
   */
  orwfhdcp224 = (): string | undefined => {
    return undefined
  }

  f42 = (): string | undefined => this.orwfhdcp224()

  /**
   * Index 43: or-wfhdc-p2_25
   */
  orwfhdcp225 = (): string | undefined => {
    return undefined
  }

  f43 = (): string | undefined => this.orwfhdcp225()

  /**
   * Index 44: or-wfhdc-p2_26
   */
  orwfhdcp226 = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.orwfhdcp226()

  /**
   * Index 45: or-wfhdc-p2_28
   */
  orwfhdcp228 = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.orwfhdcp228()

  /**
   * Index 46: or-wfhdc-p2_29
   */
  orwfhdcp229 = (): string | undefined => {
    return undefined
  }

  f46 = (): string | undefined => this.orwfhdcp229()

  /**
   * Index 47: or-wfhdc-p4_1
   */
  orwfhdcp41 = (): string | undefined => {
    return undefined
  }

  f47 = (): string | undefined => this.orwfhdcp41()

  /**
   * Index 48: or-wfhdc-p4_2
   */
  orwfhdcp42 = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.orwfhdcp42()

  /**
   * Index 49: or-wfhdc-p4_3
   */
  orwfhdcp43 = (): string | undefined => {
    return undefined
  }

  f49 = (): string | undefined => this.orwfhdcp43()

  /**
   * Index 50: or-wfhdc-p4_4
   */
  orwfhdcp44 = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.orwfhdcp44()

  /**
   * Index 51: or-wfhdc-p4_5
   */
  orwfhdcp45 = (): string | undefined => {
    return undefined
  }

  f51 = (): string | undefined => this.orwfhdcp45()

  /**
   * Index 52: or-wfhdc-p4_6
   */
  orwfhdcp46 = (): string | undefined => {
    return undefined
  }

  f52 = (): string | undefined => this.orwfhdcp46()

  /**
   * Index 53: or-wfhdc-p4_7
   */
  orwfhdcp47 = (): string | undefined => {
    return undefined
  }

  f53 = (): string | undefined => this.orwfhdcp47()

  /**
   * Index 54: or-wfhdc-p4_8
   */
  orwfhdcp48 = (): string | undefined => {
    return undefined
  }

  f54 = (): string | undefined => this.orwfhdcp48()

  /**
   * Index 55: or-wfhdc-p5_1
   */
  orwfhdcp51 = (): string | undefined => {
    return undefined
  }

  f55 = (): string | undefined => this.orwfhdcp51()

  /**
   * Index 56: or-wfhdc-p5_2
   */
  orwfhdcp52 = (): string | undefined => {
    return undefined
  }

  f56 = (): string | undefined => this.orwfhdcp52()

  /**
   * Index 57: or-wfhdc-p5_3
   */
  orwfhdcp53 = (): string | undefined => {
    return undefined
  }

  f57 = (): string | undefined => this.orwfhdcp53()

  /**
   * Index 58: or-wfhdc-p5_4
   */
  orwfhdcp54 = (): string | undefined => {
    return undefined
  }

  f58 = (): string | undefined => this.orwfhdcp54()

  /**
   * Index 59: or-wfhdc-p5_5
   */
  orwfhdcp55 = (): string | undefined => {
    return undefined
  }

  f59 = (): string | undefined => this.orwfhdcp55()

  /**
   * Index 60: or-wfhdc-p5_6
   */
  orwfhdcp56 = (): string | undefined => {
    return undefined
  }

  f60 = (): string | undefined => this.orwfhdcp56()

  /**
   * Index 61: or-wfhdc-p5_7
   */
  orwfhdcp57 = (): string | undefined => {
    return undefined
  }

  f61 = (): string | undefined => this.orwfhdcp57()

  /**
   * Index 62: or-wfhdc-p5_8
   */
  orwfhdcp58 = (): string | undefined => {
    return undefined
  }

  f62 = (): string | undefined => this.orwfhdcp58()

  /**
   * Index 63: or-wfhdc-p5_9
   */
  orwfhdcp59 = (): string | undefined => {
    return undefined
  }

  f63 = (): string | undefined => this.orwfhdcp59()

  /**
   * Index 64: or-wfhdc-p5_10
   */
  orwfhdcp510 = (): string | undefined => {
    return undefined
  }

  f64 = (): string | undefined => this.orwfhdcp510()

  /**
   * Index 65: or-wfhdc-p5_11
   */
  orwfhdcp511 = (): string | undefined => {
    return undefined
  }

  f65 = (): string | undefined => this.orwfhdcp511()

  /**
   * Index 66: or-wfhdc-p5_12
   */
  orwfhdcp512 = (): string | undefined => {
    return undefined
  }

  f66 = (): string | undefined => this.orwfhdcp512()

  /**
   * Index 67: or-wfhdc-p5_13
   */
  orwfhdcp513 = (): string | undefined => {
    return undefined
  }

  f67 = (): string | undefined => this.orwfhdcp513()

  /**
   * Index 68: Button - Clear form
   */
  ButtonClearform = (): string | undefined => {
    return undefined
  }

  f68 = (): string | undefined => this.ButtonClearform()

  /**
   * Index 69: or-wfhdc-p1_19
   */
  orwfhdcp119 = (): string | undefined => {
    return undefined
  }

  f69 = (): string | undefined => this.orwfhdcp119()

  /**
   * Index 70: or-wfhdc-p1_25
   */
  orwfhdcp125 = (): string | undefined => {
    return undefined
  }

  f70 = (): string | undefined => this.orwfhdcp125()

  /**
   * Index 71: or-wfhdc-p2_13
   */
  orwfhdcp213 = (): string | undefined => {
    return undefined
  }

  f71 = (): string | undefined => this.orwfhdcp213()

  /**
   * Index 72: or-wfhdc-p2_27
   */
  orwfhdcp227 = (): string | undefined => {
    return undefined
  }

  f72 = (): string | undefined => this.orwfhdcp227()

  /**
   * Index 73: or-wfhdc-p2_7
   */
  orwfhdcp27 = (): string | undefined => {
    return undefined
  }

  f73 = (): string | undefined => this.orwfhdcp27()

  /**
   * Index 74: or-wfhdc-p3_1
   */
  orwfhdcp31 = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.orwfhdcp31()

  /**
   * Index 75: or-wfhdc-p3_2
   */
  orwfhdcp32 = (): string | undefined => {
    return undefined
  }

  f75 = (): string | undefined => this.orwfhdcp32()

  /**
   * Index 76: or-wfhdc-p3_3
   */
  orwfhdcp33 = (): string | undefined => {
    return undefined
  }

  f76 = (): string | undefined => this.orwfhdcp33()

  /**
   * Index 77: or-wfhdc-p3_4
   */
  orwfhdcp34 = (): string | undefined => {
    return undefined
  }

  f77 = (): string | undefined => this.orwfhdcp34()

  /**
   * Index 78: or-wfhdc-p3_5
   */
  orwfhdcp35 = (): string | undefined => {
    return undefined
  }

  f78 = (): string | undefined => this.orwfhdcp35()

  /**
   * Index 79: or-wfhdc-p3_6
   */
  orwfhdcp36 = (): string | undefined => {
    return undefined
  }

  f79 = (): string | undefined => this.orwfhdcp36()

  /**
   * Index 80: or-wfhdc-p3_7
   */
  orwfhdcp37 = (): boolean | undefined => {
    return undefined
  }

  f80 = (): boolean | undefined => this.orwfhdcp37()

  /**
   * Index 81: or-wfhdc-p3_8
   */
  orwfhdcp38 = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.orwfhdcp38()

  /**
   * Index 82: or-wfhdc-p3_9
   */
  orwfhdcp39 = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.orwfhdcp39()

  /**
   * Index 83: or-wfhdc-p3_10
   */
  orwfhdcp310 = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.orwfhdcp310()

  /**
   * Index 84: or-wfhdc-p3_11
   */
  orwfhdcp311 = (): string | undefined => {
    return undefined
  }

  f84 = (): string | undefined => this.orwfhdcp311()

  /**
   * Index 85: or-wfhdc-p3_12
   */
  orwfhdcp312 = (): string | undefined => {
    return undefined
  }

  f85 = (): string | undefined => this.orwfhdcp312()

  /**
   * Index 86: or-wfhdc-p3_13
   */
  orwfhdcp313 = (): string | undefined => {
    return undefined
  }

  f86 = (): string | undefined => this.orwfhdcp313()

  /**
   * Index 87: or-wfhdc-p3_14
   */
  orwfhdcp314 = (): string | undefined => {
    return undefined
  }

  f87 = (): string | undefined => this.orwfhdcp314()

  /**
   * Index 88: or-wfhdc-p3_16
   */
  orwfhdcp316 = (): string | undefined => {
    return undefined
  }

  f88 = (): string | undefined => this.orwfhdcp316()

  /**
   * Index 89: or-wfhdc-p3_17
   */
  orwfhdcp317 = (): boolean | undefined => {
    return undefined
  }

  f89 = (): boolean | undefined => this.orwfhdcp317()

  /**
   * Index 90: or-wfhdc-p3_18
   */
  orwfhdcp318 = (): string | undefined => {
    return undefined
  }

  f90 = (): string | undefined => this.orwfhdcp318()

  /**
   * Index 91: or-wfhdc-p3_19
   */
  orwfhdcp319 = (): string | undefined => {
    return undefined
  }

  f91 = (): string | undefined => this.orwfhdcp319()

  /**
   * Index 92: or-wfhdc-p3_20
   */
  orwfhdcp320 = (): string | undefined => {
    return undefined
  }

  f92 = (): string | undefined => this.orwfhdcp320()

  /**
   * Index 93: or-wfhdc-p3_21
   */
  orwfhdcp321 = (): string | undefined => {
    return undefined
  }

  f93 = (): string | undefined => this.orwfhdcp321()

  /**
   * Index 94: or-wfhdc-p3_22
   */
  orwfhdcp322 = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.orwfhdcp322()

  /**
   * Index 95: or-wfhdc-p3_23
   */
  orwfhdcp323 = (): string | undefined => {
    return undefined
  }

  f95 = (): string | undefined => this.orwfhdcp323()

  /**
   * Index 96: or-wfhdc-p3_24
   */
  orwfhdcp324 = (): string | undefined => {
    return undefined
  }

  f96 = (): string | undefined => this.orwfhdcp324()

  /**
   * Index 97: or-wfhdc-p3_26
   */
  orwfhdcp326 = (): string | undefined => {
    return undefined
  }

  f97 = (): string | undefined => this.orwfhdcp326()

  /**
   * Index 98: or-wfhdc-p3_27
   */
  orwfhdcp327 = (): boolean | undefined => {
    return undefined
  }

  f98 = (): boolean | undefined => this.orwfhdcp327()

  /**
   * Index 99: or-wfhdc-p3_28
   */
  orwfhdcp328 = (): string | undefined => {
    return undefined
  }

  f99 = (): string | undefined => this.orwfhdcp328()

  /**
   * Index 100: or-wfhdc-p3_29
   */
  orwfhdcp329 = (): string | undefined => {
    return undefined
  }

  f100 = (): string | undefined => this.orwfhdcp329()

  /**
   * Index 101: or-wfhdc-p3_30
   */
  orwfhdcp330 = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.orwfhdcp330()

  /**
   * Index 102: or-wfhdc-p3_15
   */
  orwfhdcp315 = (): string | undefined => {
    return undefined
  }

  f102 = (): string | undefined => this.orwfhdcp315()

  /**
   * Index 103: or-wfhdc-p3_25
   */
  orwfhdcp325 = (): string | undefined => {
    return undefined
  }

  f103 = (): string | undefined => this.orwfhdcp325()

  /**
   * Index 104: or-wfhdc-p1_20a
   */
  orwfhdcp120a = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.orwfhdcp120a()

  /**
   * Index 105: or-wfhdc-p1_20b
   */
  orwfhdcp120b = (): string | undefined => {
    return undefined
  }

  f105 = (): string | undefined => this.orwfhdcp120b()

  /**
   * Index 106: or-wfhdc-p2_8a
   */
  orwfhdcp28a = (): string | undefined => {
    return undefined
  }

  f106 = (): string | undefined => this.orwfhdcp28a()

  /**
   * Index 107: or-wfhdc-p2_8b
   */
  orwfhdcp28b = (): string | undefined => {
    return undefined
  }

  f107 = (): string | undefined => this.orwfhdcp28b()

  /**
   * Index 108: or-wfhdc-p2_22a
   */
  orwfhdcp222a = (): string | undefined => {
    return undefined
  }

  f108 = (): string | undefined => this.orwfhdcp222a()

  /**
   * Index 109: or-wfhdc-p2_22b
   */
  orwfhdcp222b = (): string | undefined => {
    return undefined
  }

  f109 = (): string | undefined => this.orwfhdcp222b()

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
    this.f109()
  ]
}

const makeORWFHDC = (info: Information, f1040: F1040): ORWFHDC =>
  new ORWFHDC(info, f1040)

export default makeORWFHDC
