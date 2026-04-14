import { sumFields } from 'ustaxes/core/irsForms/util'
import F8814 from 'ustaxes/forms/Y2025/irsForms/F8814'

// Worksheet for Line 4 of Worksheet 1
export default class Pub596Worksheet2 {
  f8814: F8814

  constructor(f8814: F8814) {
    this.f8814 = f8814
  }

  l1 = (): number | undefined => this.f8814.l2a()
  l2 = (): number | undefined => this.f8814.l2b()

  l3 = (): number | undefined => (this.l1() ?? 0) - (this.l2() ?? 0)
  l4 = (): number | undefined => this.f8814.l1a()

  l5 = (): number => sumFields([this.l3(), this.l4()])

  // TODO child’s Alaska Permanent Fund dividend
  l6 = (): number | undefined => undefined

  l7 = (): number =>
    Math.round(((this.l6() ?? 0) / this.l5()) * 100000) / 100000 // We want xx.xxx%

  l8 = (): number | undefined => this.f8814.l12()

  l9 = (): number | undefined => this.l7() * (this.l8() ?? 0)

  l10 = (): number => (this.l8() ?? 0) - (this.l9() ?? 0)

  result = (): number => this.l10()
}
