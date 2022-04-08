import F1040Attachment from './F1040Attachment'
import { Dependent, FilingStatus } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { CURRENT_YEAR } from '../data/federal'
import { Field } from 'ustaxes/core/pdfFiller'

const nextMultipleOf =
  (mul: number) =>
  (value: number): number =>
    value % mul === 0 ? value : (Math.floor(value / mul) + 1) * mul

const nextMultipleOf1000 = nextMultipleOf(1000)

type Part1b = Partial<{
  l14a: number
  l14b: number
  l14c: number
  l14d: number
  l14e: number
  l14f: number
  l14g: number
  l14h: number
  l14i: number
}>

type Part1c = Partial<{
  allowed: boolean
  l15a: number
  l15b: number
  l15c: number
  l15d: number
  l15e: number
  l15f: number
  l15g: number
  l15h: number
}>

type Part2a = Partial<{
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

type Part2b = Partial<{
  l21: number
  l22: number
  l23: number
  l24: number
  l25: number
  l26: number
  toLine27: number
}>

type Part3 = Partial<{
  l28a: number
  l28b: number
  l29: number
  l30: number
  l31: number
  l32: number
  l33: number
  l34: number
  l35: number
  l36: string
  l37: number
  l38: number
  l39: number
  l40: number
}>

export default class Schedule8812 extends F1040Attachment {
  tag: FormTag = 'f1040s8'
  sequenceIndex = 47

  l1 = (): number => this.f1040.l11()

  // TODO: Puerto Rico income
  l2a = (): number => 0

  l2b = (): number =>
    sumFields([this.f1040.f2555?.l45(), this.f1040.f2555?.l50()])

  l2c = (): number => this.f1040.f4563?.l15() ?? 0

  l2d = (): number => sumFields([this.l2a(), this.l2b(), this.l2c()])

  l3 = (): number => sumFields([this.l1(), this.l2d()])

  creditDependents = (): Dependent[] =>
    this.f1040.childTaxCreditWorksheet?.qualifyingChildren() ?? []

  l4a = (): number => this.creditDependents().length

  // Number of qualifying children under age 6 at EOY
  l4b = (): number =>
    this.creditDependents().filter(
      (d) =>
        d.qualifyingInfo !== undefined &&
        d.qualifyingInfo.birthYear > CURRENT_YEAR - 6
    ).length

  l4c = (): number => Math.max(0, this.l4a() - this.l4b())

  /**
   * Computed using the line 5 worksheet, Schedule 8812 instructions
   */
  l5 = (): number => {
    const fs = this.f1040.info.taxPayer.filingStatus
    if (fs === undefined) {
      throw new Error('filing status is undefined')
    }

    const wsl1 = this.l4b() * 3600
    const wsl2 = this.l4c() * 3000
    const wsl3 = wsl1 + wsl2
    const wsl4 = this.l4a() * 2000
    // Note wsl3 >= wsl4
    const wsl5 = wsl3 - wsl4
    const wsl6values: Partial<{ [key in FilingStatus]: number }> = {
      [FilingStatus.MFJ]: 12500,
      [FilingStatus.W]: 2500,
      [FilingStatus.HOH]: 4375
    }
    const wsl6 = wsl6values[fs] ?? 6250
    const wsl7 = Math.min(wsl5, wsl6)
    const wsl8values: Partial<{ [key in FilingStatus]: number }> = {
      [FilingStatus.MFJ]: 150000,
      [FilingStatus.W]: 150000,
      [FilingStatus.HOH]: 112500
    }
    const wsl8 = wsl8values[fs] ?? 75000

    const wsl9 = Math.max(0, nextMultipleOf1000(this.l3() - wsl8))
    const wsl10 = wsl9 * 0.05
    const wsl11 = Math.min(wsl7, wsl10)
    return Math.max(0, wsl3 - wsl11)
  }

  // TODO: Verify:
  // Number of other dependents, including any qualifying children, who are not under age 18 or who do not have the required SSN. Do not include yourself, your spouse,
  // or anyone who is not a US citizen/national/resident alien,
  // or do not have the required SSN.
  l6 = (): number => this.f1040.info.taxPayer.dependents.length - this.l4a()

  l7 = (): number => this.l6() * 500

  l8 = (): number => sumFields([this.l5(), this.l7()])

  l9 = (): number =>
    this.f1040.info.taxPayer.filingStatus === FilingStatus.MFJ ? 400000 : 200000

  l10 = (): number => Math.max(0, nextMultipleOf1000(this.l9() - this.l3()))

  l11 = (): number => this.l10() * 0.05

  l12 = (): number => Math.max(0, this.l8() - this.l11())

  // you and spouse have residence in US for more than half of year.
  // TODO: Assuming true
  l13a = (): boolean => true

  // Resident of puerto rico for 2021
  // TODO: assuming false
  l13b = (): boolean => false

  // Part 1 B - requires a box on line 13
  req =
    <A>(pred: boolean) =>
    (f: () => A) =>
    (): A | undefined => {
      if (pred) {
        return f()
      } else {
        return undefined
      }
    }

  req13 = this.req<number>(this.l13a() || this.l13b())

  creditLimitWorksheetB = (): number | undefined => undefined

  creditLimitWorksheetA = (): number => {
    const wsl1 = this.f1040.l18()
    const wsl2 = sumFields([
      this.f1040.schedule3?.l1(),
      this.f1040.schedule3?.l2(),
      this.f1040.schedule3?.l3(),
      this.f1040.schedule3?.l4(),
      this.f1040.schedule3?.l6l(),
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
  letter6419Payments = (): number | undefined => undefined

  part1b = (): Part1b => {
    const allowed = this.l13a() || this.l13b()
    const ifAble = <A>(f: () => A): A | undefined => {
      if (allowed) {
        return f()
      }
    }

    const l14a = ifAble(() => Math.min(this.l7(), this.l12()))
    const l14b = ifAble(() => Math.max(this.l12() - (l14a ?? 0)))
    const l14c = ifAble(() => (l14a === 0 ? 0 : this.creditLimitWorksheetA()))
    const l14d = ifAble(() => Math.min(l14a ?? 0, l14c ?? 0))
    const l14e = ifAble(() => sumFields([l14b, l14d]))
    // TODO:
    // IMPORTANT: Letter 6419 advance child tax credit payments
    const l14f = ifAble(() => this.letter6419Payments())
    const l14g = ifAble(() => Math.max(0, (l14e ?? 0) - (l14f ?? 0)))

    // Credit for other dependents
    const l14h = ifAble(() => Math.min(l14d ?? 0, l14g ?? 0))

    // Refundable child tax credit
    const l14i = ifAble(() => Math.max(0, (l14g ?? 0) - (l14h ?? 0)))

    return {
      l14a,
      l14b,
      l14c,
      l14d,
      l14e,
      l14f,
      l14g,
      l14h,
      l14i
    }
  }

  part1c = (): Part1c => {
    const allowed = !(this.l13a() || this.l13b())
    const ifAble = <A>(f: () => A): A | undefined => {
      if (allowed) {
        return f()
      }
    }

    const l15a = ifAble(() => this.creditLimitWorksheetA())
    const l15b = ifAble(() => Math.min(this.l12(), l15a ?? 0))

    //TODO - implement after 2a through 2c
    const l15c = ifAble(() => this.l27() ?? 0)
    const l15d = ifAble(() => sumFields([l15b, l15c]))
    const l15e = ifAble(() => this.letter6419Payments())
    const l15f = ifAble(() => Math.max(0, (l15d ?? 0) - (l15e ?? 0)))
    const l15g = ifAble(() => Math.min(l15b ?? 0, l15f ?? 0))
    const l15h = ifAble(() => Math.max(0, (l15f ?? 0) - (l15g ?? 0)))

    return {
      allowed,
      l15a,
      l15b,
      l15c,
      l15d,
      l15e,
      l15f,
      l15g,
      l15h
    }
  }

  // from Part 1-C, Line 15b 1 - 3
  part2AllowedBy1C = (): boolean => {
    const part1c = this.part1c()
    return (
      !part1c.allowed ||
      (this.f1040.f2555 === undefined &&
        this.l4a() > 0 &&
        this.l12() > (part1c.l15a ?? 0))
    )
  }

  to1040Line28 = (): number | undefined =>
    this.part1b().l14i ?? this.part1c().l15h

  earnedIncomeWorksheet = (): number | undefined => {
    const l1a = this.f1040.l1()
    const l1b = this.f1040.nonTaxableCombatPay()
    const l2a = this.f1040.scheduleC?.l1() ?? 0
    // Todo: 1065 Schedule K-1, box 14, code A, and other
    // data also belong here.
    const l2b = this.f1040.scheduleC?.l31() ?? 0
    // TODO: Net farm profit...
    const l2c = undefined
    // TODO: Farm optional method for self-employment net earnings
    const l2d = 0

    // Allowed to be a loss:
    const l2e = Math.min(l2c ?? 0, l2d)

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

    const l5 = this.f1040.schedule1?.l15() ?? 0

    const l6 = sumFields([l4a, l4b, l4c, l4d, l5])

    const l7 = Math.max(0, l3 - l6)

    return l7
  }

  part2Allowed = (): boolean =>
    this.part2AllowedBy1C() &&
    this.f1040.f2555 === undefined &&
    !(this.l13a() || this.l13b())

  ifAblePart2 = <A>(f: () => A): A | undefined => {
    if (this.part2Allowed()) {
      return f()
    }
  }

  part2a = (): Part2a => {
    const ifAble = this.ifAblePart2

    const l16a = ifAble(() =>
      Math.max(0, this.l12() - (this.part1c().l15b ?? 0))
    )
    const l16bdeps = ifAble(() => this.l4a())
    const l16b = ifAble(() => (l16bdeps ?? 0) * 1400)
    const ifAble2 = <A>(f: () => A): A | undefined => {
      if (this.part2Allowed() && (l16b ?? 0) > 0) {
        return f()
      }
    }
    const l17 = ifAble2(() => Math.min(l16a ?? 0, l16b ?? 0))
    const l18a = ifAble2(() => this.earnedIncomeWorksheet())
    const l18b = ifAble2(() => this.f1040.nonTaxableCombatPay())
    const l19No = ifAble2(() => (l18a ?? 0) > 2500)
    const l19Yes = ifAble2(() => (l18a ?? 0) <= 2500)
    const l19 = ifAble2(() => Math.max(0, (l18a ?? 0) - 2500))
    const l20 = ifAble2(() => (l19 ?? 0) * 0.15)
    const l20No = ifAble2(() => (l16b ?? 0) >= 4200)
    const l20Yes = ifAble2(() => (l16b ?? 0) < 4200)

    const toLine27 = (() => {
      if (l20No && (l20 ?? 0) > 0) {
        return Math.min(l17 ?? 0, l20 ?? 0)
      } else if (l20Yes && (l20 ?? 0) >= (l17 ?? 0)) {
        return l17
      }
    })()

    return {
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
    const allowed = this.part2Allowed() && this.l4a() >= 3

    const ifAble = <A>(f: () => A): A | undefined => {
      if (allowed) {
        return f()
      }
    }

    const ssWithholding = this.f1040
      .validW2s()
      .reduce((res, w2) => res + w2.ssWithholding, 0)

    const medicareWithholding = this.f1040
      .validW2s()
      .reduce((res, w2) => res + w2.medicareWithholding, 0)

    const l21 = ifAble(() => ssWithholding + medicareWithholding)

    const l22 = ifAble(() =>
      sumFields([
        this.f1040.schedule1?.l15(),
        this.f1040.schedule2?.l5(),
        this.f1040.schedule2?.l6(),
        this.f1040.schedule2?.l13()
      ])
    )

    const l23 = ifAble(() => sumFields([l21, l22]))

    const l24 = ifAble(() =>
      sumFields([this.f1040.l27a(), this.f1040.schedule3?.l11()])
    )

    const l25 = Math.max(0, (l23 ?? 0) - (l24 ?? 0))

    const l26 = Math.max(part2a.l20 ?? 0, l25)

    const toLine27 = Math.min(part2a.l17 ?? 0, l26)

    return {
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
    this.part2a().toLine27 ?? this.part2b().toLine27

  part3 = (): Part3 => {
    const fs = this.f1040.info.taxPayer.filingStatus
    const part1b = this.part1b()
    const part1c = this.part1c()

    if (fs === undefined) {
      throw new Error('filing status is undefined')
    }

    const l28a = this.part1b().l14f ?? this.part1c().l15e

    const l28b = part1b.l14e ?? part1c.l15d

    const l29 = Math.max(0, (l28a ?? 0) - (l28b ?? 0))

    // Enter the number of qualifying children taken into account in determining the annual advance amount you
    // received for 2021. See your Letter 6419 for this number. If you are missing your Letter 6419, you are filing a joint
    // return, or you received more than one Letter 6419, see the instructions before entering a number on this line
    const l30 = this.l4a()

    const l31 = Math.min(this.l4a(), l30)

    const l32 = Math.max(0, l30 - l31)

    const l33 = (() => {
      if (fs === FilingStatus.MFS || fs === FilingStatus.W) {
        return 60000
      } else if (fs === FilingStatus.HOH) {
        return 50000
      } else {
        return 40000
      }
    })()

    const l34 = Math.max(this.l3(), l33)

    const l35 = l33

    const l36 = (l34 / l35).toFixed(3)

    const l37 = l32 * 2000

    const l38 = l37 * parseFloat(l36)

    const l39 = Math.max(0, l37 - l38)

    const l40 = Math.max(0, l29 - l39)

    return {
      l28a,
      l28b,
      l29,
      l30,
      l31,
      l32,
      l33,
      l34,
      l35,
      l36,
      l37,
      l38,
      l39,
      l40
    }
  }

  l40 = (): number => this.part3().l40 ?? 0

  fields = (): Field[] => {
    const part1b = this.part1b()
    const part1c = this.part1c()
    const part2a = this.part2a()
    const part2b = this.part2b()
    const part3 = this.part3()

    return [
      this.f1040.info.namesString(),
      this.f1040.info.taxPayer.primaryPerson?.ssid,
      this.l1(),
      this.l2a(),
      this.l2b(),
      this.l2c(),
      this.l2d(),
      this.l3(),
      this.l4a(),
      this.l4b(),
      this.l4c(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13a(),
      this.l13b(),
      part1b.l14a,
      part1b.l14b,
      part1b.l14c,
      part1b.l14d,
      part1b.l14e,
      part1b.l14f,
      part1b.l14g,
      part1b.l14h,
      part1b.l14i,
      part1c.l15a,
      part1c.l15b,
      part1c.l15c,
      part1c.l15d,
      part1c.l15e,
      part1c.l15f,
      part1c.l15g,
      part1c.l15h,
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
      this.l27(),
      part3.l28a,
      part3.l28b,
      part3.l29,
      part3.l30,
      part3.l31,
      part3.l32,
      part3.l33,
      part3.l34,
      part3.l35,
      part3.l36,
      part3.l37,
      part3.l38,
      part3.l39,
      this.l40()
    ]
  }
}
