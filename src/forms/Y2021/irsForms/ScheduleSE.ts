import Form, { FormTag } from 'ustaxes/core/irsForms/Form'
import F1040 from './F1040'
import TaxPayer from 'ustaxes/core/data/TaxPayer'
import { sumRoundedFields } from 'ustaxes/core/irsForms/util'

export default class ScheduleSE extends Form {
  tag: FormTag = 'f1040sse'
  f1040: F1040
  sequenceIndex = 14

  constructor(f1040: F1040) {
    super()
    this.f1040 = f1040
  }

  postL4Field = (f: () => number | undefined): number | undefined => {
    if (this.l4c() < 400) {
      return undefined
    }
    return f()
  }

  l8aRelatedField = (f: () => number | undefined): number | undefined => {
    return this.postL4Field(() => {
      if (this.l8a() ?? 0 >= 142800) {
        return undefined
      }
      return f()
    })
  }

  l1a = (): number => {
    const schFL34 = 0 // TODO: Net farm profit or (loss) from Schedule F, line 34
    const k1B14 = 0 // TODO: If a farm partnership
    return schFL34 + k1B14
  }

  l1b = (): number => 0

  l2 = (): number => {
    const schFL34 = 0 // TODO: Net farm profit or (loss) from Schedule F, line 34
    const k1B14 = this.f1040.info.scheduleK1Form1065s.reduce(
      (c, k1) => c + k1.selfEmploymentEarningsA,
      0
    )
    return schFL34 + k1B14
  }

  l3 = (): number => sumRoundedFields([this.l1a(), this.l1b(), this.l2()])

  l4a = (): number => {
    const l3 = this.l3()
    if (l3 > 0) {
      return l3 * 0.9235
    }
    return l3
  }

  l4b = (): number | undefined => undefined

  l4c = (): number => sumRoundedFields([this.l4a(), this.l4b()])

  l5a = (): number | undefined => this.postL4Field(() => 0)
  l5b = (): number | undefined =>
    this.postL4Field(() => {
      const l5a = this.l5a()
      if (l5a === undefined) {
        return undefined
      }
      return l5a * 0.9235
    })

  l6 = (): number | undefined =>
    this.postL4Field((): number => sumRoundedFields([this.l4c(), this.l5b()]))

  l7 = (): number => 142800

  l8a = (): number | undefined =>
    this.postL4Field((): number =>
      this.f1040.validW2s().reduce((c, w2) => c + (w2.ssWages ?? 0), 0)
    )

  l8b = (): number | undefined =>
    this.l8aRelatedField((): number | undefined => undefined)
  l8c = (): number | undefined =>
    this.l8aRelatedField((): number | undefined => undefined)
  l8d = (): number | undefined =>
    this.l8aRelatedField((): number =>
      sumRoundedFields([this.l8a(), this.l8b(), this.l8c()])
    )

  l9 = (): number | undefined =>
    this.l8aRelatedField((): number => this.l7() - (this.l8d() ?? 0))

  l10 = (): number | undefined =>
    this.l8aRelatedField(
      (): number => Math.min(this.l6() ?? 0, this.l9() ?? 0) * 0.124
    )

  l11 = (): number | undefined =>
    this.postL4Field((): number => (this.l6() ?? 0) * 0.029)

  l12 = (): number | undefined =>
    this.postL4Field((): number => sumRoundedFields([this.l10(), this.l11()]))

  l13 = (): number | undefined =>
    this.postL4Field((): number => (this.l12() ?? 0) * 0.5)

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.f1040.info.taxPayer)

    const result = [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid ?? '',
      false, // Minister
      this.l1a(),
      this.l1b(),
      this.l2(),
      this.l3(),
      this.l4a(),
      this.l4b(),
      this.l4c(),
      this.l5a(),
      this.l5b(),
      this.l6(),
      this.l7(),
      this.l8a(),
      this.l8b(),
      this.l8c(),
      this.l8d(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13()
    ]

    return result
  }
}
