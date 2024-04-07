import F1040Attachment from './F1040Attachment'
import { CreditType, Dependent, FilingStatus } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'
import { nextMultipleOf1000 } from 'ustaxes/core/util'

type Part2a = { allowed: boolean } & Partial<{
  l16a: number
  l16bdeps: number
  l16b: number
  l17: number
  l18a: number
  l18b: number
  l19No: boolean
  l19Yes: boolean
  l19: number
  l20: number
  l20No: boolean
  l20Yes: boolean
  toLine27: number
}>

type Part2b = { allowed: boolean } & Partial<{
  l21: number
  l22: number
  l23: number
  l24: number
  l25: number
  l26: number
  toLine27: number
}>

export default class Schedule8812 extends F1040Attachment {
  tag: FormTag = 'f1040s8'
  sequenceIndex = 47

  isNeeded = (): boolean =>
    this.f1040.info.taxPayer.dependents.some(
      (dep) =>
        this.f1040.qualifyingDependents.qualifiesChild(dep) ||
        this.f1040.qualifyingDependents.qualifiesOther(dep)
    )

  l1 = (): number => this.f1040.l11()

  // TODO: Puerto Rico income
  l2a = (): number => 0

  l2b = (): number =>
    sumFields([this.f1040.f2555?.l45(), this.f1040.f2555?.l50()])

  l2c = (): number => this.f1040.f4563?.l15() ?? 0

  l2d = (): number => sumFields([this.l2a(), this.l2b(), this.l2c()])

  l3 = (): number => sumFields([this.l1(), this.l2d()])

  creditDependents = (): Dependent[] =>
    this.f1040.qualifyingDependents.qualifyingChildren()

  l4 = (): number => this.creditDependents().length

  l5 = (): number => this.l4() * 2000

  // TODO: Verify:
  // Number of other dependents, including any qualifying children, who are not under age 18 or who do not have the required SSN. Do not include yourself, your spouse,
  // or anyone who is not a US citizen/national/resident alien,
  // or do not have the required SSN.
  l6 = (): number => this.f1040.info.taxPayer.dependents.length - this.l4()

  l7 = (): number => this.l6() * 500

  l8 = (): number => sumFields([this.l5(), this.l7()])

  l9 = (): number =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ ? 400000 : 200000

  l10 = (): number => nextMultipleOf1000(Math.max(0, this.l3() - this.l9()))

  l11 = (): number => this.l10() * 0.05

  l12 = (): number => Math.max(0, this.l8() - this.l11())
  l12yes = (): boolean => this.l8() > this.l11()
  l12no = (): boolean => !this.l12yes()
  // you and spouse have residence in US for more than half of year.
  // TODO: Assuming true
  l13 = (): number => this.creditLimitWorksheetA()

  l14 = (): number => (this.l12no() ? 0 : Math.min(this.l12(), this.l13()))

  // Check this box if you do not want to file the additional tax credit
  // TODO: Assuming that people do right now
  l15 = (): boolean => true

  creditLimitWorksheetB = (): number | undefined => undefined

  creditLimitWorksheetA = (): number => {
    const wsl1 = this.f1040.l18()
    const schedule3Fields = this.f1040.schedule3.isNeeded()
      ? [
          this.f1040.schedule3.l1(),
          this.f1040.schedule3.l2(),
          this.f1040.schedule3.l3(),
          this.f1040.schedule3.l4(),
          this.f1040.schedule3.l6l()
        ]
      : []

    const wsl2 = sumFields([
      ...schedule3Fields,
      this.f1040.f5695?.l30(),
      this.f1040.f8936?.l15(),
      this.f1040.f8936?.l23(),
      this.f1040.scheduleR?.l22()
    ])
    const wsl3 = Math.max(0, wsl1 - wsl2)
    const wsl4 = this.creditLimitWorksheetB() ?? 0
    const wsl5 = Math.max(0, wsl3 - wsl4)
    return wsl5
  }

  // TODO: Letter 6419 advance child tax credit payments
  letter6419Payments = (): number | undefined =>
    this.f1040.info.credits
      .filter((c) => c.type === CreditType.AdvanceChildTaxCredit)
      .reduce((sum, c) => sum + c.amount, 0)

  to1040Line19 = (): number => this.l14()

  to1040Line28 = (): number | undefined => this.l27()

  earnedIncomeWorksheet = (): number => {
    const l1a = this.f1040.l1z()
    const l1b = this.f1040.nonTaxableCombatPay()
    const l2a = this.f1040.scheduleC?.l1() ?? 0
    // Todo: 1065 Schedule K-1, box 14, code A, and other
    // data also belong here.
    const l2b = this.f1040.scheduleC?.l31() ?? 0
    // TODO: Net farm profit...
    // const l2c = undefined
    // TODO: Farm optional method for self-employment net earnings
    const l2d = 0

    // TODO: min(l2c, l2d)
    // Allowed to be a loss:
    const l2e = Math.min(0, l2d)

    const l3 = sumFields([l1a, l1b, l2a, l2b, l2e])

    const allowed = l3 > 0

    // TODO: Scholarship or grant not reported on w-2
    const l4a = !allowed ? undefined : 0

    // TODO: Penal income
    const l4b = !allowed ? undefined : 0

    // TODO: nonqualified deferred comp plan or 457 plan
    const l4c = !allowed ? undefined : 0

    // TODO: Amount included on 1040 that is a medicaid
    // waiver payment excluded from income, schedule 1, line 8z
    // or choose to include in earned income, then enter 0.
    const l4d = !allowed ? undefined : 0

    const l5 = this.f1040.schedule1.l15() ?? 0

    const l6 = sumFields([l4a, l4b, l4c, l4d, l5])

    const l7 = Math.max(0, l3 - l6)

    return l7
  }

  part2a = (): Part2a => {
    const l16a = Math.max(0, this.l12() - this.l14())
    const l16bdeps = this.l4()

    const l16b = l16bdeps * 1600

    const l17 = Math.min(l16a, l16b)
    const l18a = this.earnedIncomeWorksheet()
    const l18b = this.f1040.nonTaxableCombatPay() ?? 0
    const l19No = l18a > 2500
    const l19Yes = l18a <= 2500
    const l19 = Math.max(0, l18a - 2500)
    const l20 = l19 * 0.15
    const l20No = l16b >= 4800
    const l20Yes = l16b < 4800

    // TODO: check for Puerto Rico residency
    const toLine27 = (() => {
      if (l20No && l20 > 0) {
        return Math.min(l17, l20)
      } else if (l20Yes && l20 >= l17) {
        return l17
      }
    })()

    return {
      allowed: true,
      l16a,
      l16bdeps,
      l16b,
      l17,
      l18a,
      l18b,
      l19No,
      l19Yes,
      l19,
      l20,
      l20No,
      l20Yes,
      toLine27
    }
  }

  part2b = (): Part2b => {
    const part2a = this.part2a()
    // three or more qualifying children.
    const allowed = part2a.allowed

    if (!allowed) return { allowed: false }

    const ssWithholding = this.f1040
      .validW2s()
      .reduce((res, w2) => res + w2.ssWithholding, 0)

    const medicareWithholding = this.f1040
      .validW2s()
      .reduce((res, w2) => res + w2.medicareWithholding, 0)

    const l21 = ssWithholding + medicareWithholding

    const l22 = sumFields([
      this.f1040.schedule1.l15(),
      this.f1040.schedule2.l5(),
      this.f1040.schedule2.l6(),
      this.f1040.schedule2.l13()
    ])

    const l23 = sumFields([l21, l22])

    const l24 = sumFields([this.f1040.l27(), this.f1040.schedule3.l11()])

    const l25 = Math.max(0, l23 - l24)

    const l26 = Math.max(part2a.l20 ?? 0, l25)

    const toLine27 = Math.min(part2a.l17 ?? 0, l26)

    return {
      allowed: true,
      l21,
      l22,
      l23,
      l24,
      l25,
      l26,
      toLine27
    }
  }

  l27 = (): number | undefined =>
    this.l12no() ? 0 : this.part2a().toLine27 ?? this.part2b().toLine27

  fields = (): Field[] => {
    const part2a = this.part2a()
    const part2b = this.part2b()

    return [
      this.f1040.namesString(),
      this.f1040.info.taxPayer.primaryPerson.ssid,
      this.l1(),
      this.l2a(),
      this.l2b(),
      this.l2c(),
      this.l2d(),
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
      this.l12no(),
      this.l12yes(),
      this.l13(),
      this.l14(),
      this.l15(),
      part2a.l16a,
      part2a.l16bdeps,
      part2a.l16b,
      part2a.l17,
      part2a.l18a,
      part2a.l18b,
      part2a.l19No,
      part2a.l19Yes,
      part2a.l19,
      part2a.l20,
      part2a.l20No,
      part2a.l20Yes,
      part2b.l21,
      part2b.l22,
      part2b.l23,
      part2b.l24,
      part2b.l25,
      part2b.l26,
      this.l27()
    ]
  }
}
