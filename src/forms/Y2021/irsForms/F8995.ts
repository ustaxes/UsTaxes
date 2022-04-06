import F1040 from './F1040'
import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import { FilingStatus } from 'ustaxes/core/data'

export function getF8995PhaseOutIncome(filingStatus: FilingStatus): number {
  let formAMinAmount = 164900
  if (filingStatus === FilingStatus.MFS) {
    formAMinAmount = 164925
  } else if (filingStatus === FilingStatus.MFJ) {
    formAMinAmount = 329800
  }
  return formAMinAmount
}

function ifNumber(
  num: number | undefined,
  f: (num: number) => number | undefined
) {
  return num !== undefined ? f(num) : undefined
}

export default class F8995 extends Form {
  tag: FormTag = 'f8995'
  f1040: F1040
  sequenceIndex = 999

  constructor(f1040: F1040) {
    super()
    this.f1040 = f1040
  }

  applicableK1s = () =>
    this.f1040.info.scheduleK1Form1065s.filter((k1) => k1.section199AQBI > 0)

  netCapitalGains = (): number => {
    let rtn = this.f1040.l3a() ?? 0
    if (this.f1040.scheduleD) {
      const l15 = this.f1040.scheduleD.l15()
      const l16 = this.f1040.scheduleD.l16()
      const min = Math.min(l15, l16)
      if (min > 0) rtn += min
    } else {
      rtn += this.f1040.l7() ?? 0
    }
    return rtn
  }

  l2 = (): number | undefined =>
    this.applicableK1s()
      .map((k1) => k1.section199AQBI)
      .reduce((c, a) => c + a, 0)
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined =>
    ifNumber(this.l2(), (num) => num + (this.l3() ?? 0))
  l5 = (): number | undefined => ifNumber(this.l4(), (num) => num * 0.2)

  // TODO: REIT
  l6 = (): number => 0
  l7 = (): number => 0
  l8 = (): number | undefined =>
    ifNumber(this.l6(), (num) => num + (this.l7() ?? 0))
  l9 = (): number | undefined => ifNumber(this.l8(), (num) => num * 0.2)

  l10 = (): number | undefined =>
    ifNumber(this.l5(), (num) => num + (this.l9() ?? 0))
  l11 = (): number => this.f1040.l11() - this.f1040.l12c()
  l12 = (): number => this.netCapitalGains()
  l13 = (): number => Math.max(0, this.l11() - this.l12())
  l14 = (): number => this.l13() * 0.2
  l15 = (): number => Math.min(this.l10() ?? 0, this.l14())
  l16 = (): number => Math.min(0, (this.l2() ?? 0) + (this.l3() ?? 0))
  l17 = (): number => Math.min(0, this.l6() + this.l7())

  deductions = (): number => this.l15()

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = this.f1040.tp

    const result = [
      tp.namesString(),
      tp.primaryPerson?.ssid ?? '',
      this.applicableK1s()[0]?.partnershipName,
      this.applicableK1s()[0]?.partnershipEin,
      this.applicableK1s()[0]?.section199AQBI,
      this.applicableK1s()[1]?.partnershipName,
      this.applicableK1s()[1]?.partnershipEin,
      this.applicableK1s()[1]?.section199AQBI,
      this.applicableK1s()[2]?.partnershipName,
      this.applicableK1s()[2]?.partnershipEin,
      this.applicableK1s()[2]?.section199AQBI,
      this.applicableK1s()[3]?.partnershipName,
      this.applicableK1s()[3]?.partnershipEin,
      this.applicableK1s()[3]?.section199AQBI,
      this.applicableK1s()[4]?.partnershipName,
      this.applicableK1s()[4]?.partnershipEin,
      this.applicableK1s()[4]?.section199AQBI,
      this.l2(),
      this.l3(),
      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16(),
      this.l17()
    ]

    return result
  }
}
