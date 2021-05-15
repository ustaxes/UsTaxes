import { EIC } from '../../data/federal'
import { TaxPayer } from '../../redux/data'
import { ifNegative, ifPositive } from '../../util'
import F1040 from '../F1040'
import { sumFields } from '../util'

const unimplemented = (message: string): void =>
  console.warn(`[Pub 596 Worksheet 1] unimplemented ${message}`)

export default class Pub596Worksheet1 {
  tp: TaxPayer
  f1040: F1040

  constructor (tp: TaxPayer, f1040: F1040) {
    this.tp = tp
    this.f1040 = f1040
  }

  l1 = (): number | undefined => this.f1040.l2b()
  l2 = (): number | undefined => sumFields([this.f1040.l2a(), this.f1040.f8814?.l1b()])
  l3 = (): number | undefined => this.f1040.l3b()
  l4 = (): number | undefined => {
    unimplemented('Unchecked child\'s Alaska permanent fund dividend')
    return this.f1040.schedule1?.l8()
  }

  l5 = (): number => (this.f1040.l7() ?? 0) < 0 ? 0 : (this.f1040.l7() ?? 0)
  l6 = (): number => {
    const l7 = this.f1040.f4797?.l7()
    const l9 = this.f1040.f4797?.l9()

    if (l7 !== undefined && l7 < 0) {
      return l9 ?? 0
    }

    return l7 ?? 0
  }

  l7 = (): number => {
    const diff = this.l5() - this.l6()
    return diff < 0 ? 0 : diff
  }

  l8 = (): number | undefined => sumFields([
    this.f1040.scheduleE?.l23b(),
    this.f1040.schedule1?.l8()
  ])

  l9 = (): number | undefined => sumFields([
    this.f1040.scheduleE?.royaltyExpenses(),
    this.f1040.schedule1?.l22()
  ])

  l10 = (): number => {
    const diff = (this.l9() ?? 0) - (this.l8() ?? 0)
    return diff < 0 ? 0 : diff
  }

  l11 = (): number | undefined => sumFields([
    ifPositive(this.f1040.scheduleE?.l26() ?? 0),
    this.f1040.scheduleE?.l29ah(),
    this.f1040.scheduleE?.l34ad(),
    this.f1040.scheduleE?.l40()
    // todo: FPA form 4797 line 10
  ])

  l12 = (): number | undefined => sumFields([
    this.f1040.scheduleE?.l26() ?? 0,
    this.f1040.scheduleE?.l29bg() ?? 0,
    this.f1040.scheduleE?.l34bc() ?? 0,
    this.f1040.scheduleE?.l40() ?? 0
    // TODO: PAL Loss form 4797
  ].map((x) => ifNegative(x)))

  l13 = (): number | undefined => ifPositive(sumFields([
    this.l11(), this.l12()
  ]))

  l14 = (): number | undefined => sumFields([
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    this.l7(),
    this.l10(),
    this.l13()
  ])

  l15 = (): boolean => (this.l14() ?? 0) > EIC.maxInvestmentIncome

  precludesEIC = (): boolean => this.l15()
}
