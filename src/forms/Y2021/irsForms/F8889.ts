import { Information, Person, HealthSavingsAccount } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import F8853 from './F8853'
import { CURRENT_YEAR, healthSavingsAccounts } from '../data/federal'
import F1040Attachment from './F1040Attachment'
import F1040 from './F1040'
import { Field } from 'ustaxes/core/pdfFiller'

export const needsF8889 = (state: Information, person: Person): boolean => {
  return state.healthSavingsAccounts.some(
    (h) => h.personRole === person.role || h.coverageType === 'family'
  )
}

type PerMonthContributionType = {
  amount: Array<number>
  type: Array<'self-only' | 'family'>
}

export default class F8889 extends F1040Attachment {
  tag: FormTag = 'f8889'
  sequenceIndex = 52
  // these should only be the HSAs that belong to this person
  // the person can be either the primary person or the spouse
  hsas: HealthSavingsAccount<Date>[]
  f8853?: F8853
  person: Person
  state: Information
  calculatedCoverageType: 'self-only' | 'family'
  perMonthContributions: PerMonthContributionType
  readonly firstDayOfLastMonth: Date

  constructor(f1040: F1040, person: Person) {
    super(f1040)
    this.f8853 = f1040.f8853
    this.person = person
    this.state = f1040.info
    // The relevant HSAs are the ones either for this person or any that
    // have family coverage.
    this.hsas = this.state.healthSavingsAccounts
      .filter((h) => {
        if (h.personRole == person.role || h.coverageType == 'family') {
          return true
        }
        return false
      })
      .map((h) => {
        return {
          ...h,
          startDate: new Date(h.startDate),
          endDate: new Date(h.endDate)
        }
      })
    this.calculatedCoverageType = 'self-only'
    this.firstDayOfLastMonth = new Date(CURRENT_YEAR, 11, 1)
    this.perMonthContributions = {
      amount: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      type: new Array(12)
    }
  }

  calculatePerMonthLimits = (): void => {
    for (
      let index = 0;
      index < this.perMonthContributions.amount.length;
      index++
    ) {
      // for each month check each HSA to see if we are covered.
      this.hsas.forEach((h) => {
        const firstDayOfThisMonth = new Date(CURRENT_YEAR, index, 1)
        if (
          h.startDate <= firstDayOfThisMonth &&
          h.endDate >= firstDayOfThisMonth
        ) {
          // the coverage limit for that month is based on the type of coverage of the
          // HSA. If you have both types of HSA coverage for that month, then the family
          // coverage limit wins out. Since family coverage limit is higher we can just
          // take the max of the coverage limit for this month.
          if (
            this.perMonthContributions.amount[index] <
            healthSavingsAccounts.contributionLimit[h.coverageType]
          ) {
            this.perMonthContributions.amount[index] =
              healthSavingsAccounts.contributionLimit[h.coverageType]
            this.perMonthContributions.type[index] = h.coverageType
          }
        }
      })
    }
    // The calculated coverage type is whichever one was in effect for longer
    let familyMonthCount = 0
    let singleMonthCount = 0
    this.perMonthContributions.amount.forEach((m) => {
      if (m == healthSavingsAccounts.contributionLimit.family) {
        familyMonthCount += 1
      } else if (m == healthSavingsAccounts.contributionLimit['self-only']) {
        singleMonthCount += 1
      }
    })
    if (familyMonthCount >= singleMonthCount) {
      this.calculatedCoverageType = 'family'
    } else {
      this.calculatedCoverageType = 'self-only'
    }
  }

  /* If you are an eligible individual on the first day of the last month of your tax year 
     (December 1 for most taxpayers), you are considered to be an eligible individual 
     for the entire year.
    */
  lastMonthRule = (): boolean => {
    return this.hsas.some((hsa) => hsa.endDate >= this.firstDayOfLastMonth)
  }

  /*If, on the first day of the last month of your tax year (December 1 for most taxpayers), 
    you had family coverage, check the "family" box.
  */
  lastMonthCoverage = (): string | undefined => {
    let coverage = undefined
    for (const hsa of this.hsas) {
      if (hsa.endDate >= this.firstDayOfLastMonth) {
        if (hsa.coverageType == 'family') {
          coverage = 'family'
          break
        }
        coverage = 'self-only'
      }
    }
    return coverage
  }

  fullYearHsa = (): boolean => {
    return this.hsas.some(
      (hsa) =>
        hsa.startDate <= new Date(CURRENT_YEAR, 0, 1) &&
        hsa.endDate >= this.firstDayOfLastMonth
    )
  }

  contributionLimit = (): number => {
    /*If you were under age 55 at the end of 2020 and, on the first day of every month during 2020, 
    you were, or were considered, an eligible individual with the same coverage, enter $3,550 
    ($7,100 for family coverage). All others, see the instructions for the amount to enter.
    */
    /*If the last-month rule (see Last-month rule, earlier) applies, you are considered an eligible individual 
      for the entire year. You are treated as having the same HDHP coverage for the entire year as you had on 
      the first day of the last month of your tax year.
      */
    if (this.lastMonthRule()) {
      // If, on the first day of the last month of your tax year (December 1 for most taxpayers),
      // you had family coverage, check the "family" box.
      const lastMonthCoverage = this.lastMonthCoverage()
      if (lastMonthCoverage !== undefined) {
        if (lastMonthCoverage === 'family') {
          this.calculatedCoverageType = 'family'
          return healthSavingsAccounts.contributionLimit.family
        } else if (lastMonthCoverage === 'self-only') {
          this.calculatedCoverageType = 'self-only'
          return healthSavingsAccounts.contributionLimit['self-only']
        }
      }
    }
    /* If you don't have coverage in the last month, then you need to figure out
       your contribution limit. If you don't have coverage for that month then
       your contribution limit is 0. So let's initialize our per-month contribution
       limit based on that.
     */
    this.calculatePerMonthLimits()
    return Math.round(
      this.perMonthContributions.amount.reduce((a, b) => a + b) / 12
    )
  }

  splitFamilyContributionLimit = (): number | undefined => {
    /* if you and your spouse each have separate HSAs and had family coverage under an HDHP at any time during 2020*/
    /* If you are treated as having family coverage for each month, divide the amount on line 5 equally between you 
       and your spouse, unless you both agree on a different allocation (such as allocating nothing to one spouse).
       Enter your allocable share on line 6.*/
    /* Example. In 2020, you are an eligible individual and have self-only HDHP coverage. In March you marry and as
       of April 1 you have family HDHP coverage. Neither you nor your spouse qualify for the additional contribution
       amount. Your spouse has a separate HSA and is an eligible individual from April 1 to December 31, 2020. 
       Because you and your spouse are considered to have family coverage on December 1, your contribution limit is
       $7,100 (the family coverage maximum). You and your spouse can divide this amount in any allocation to which
      you agree (such as allocating nothing to one spouse).*/
    if (!this.hsas.some((h) => h.coverageType === 'family')) {
      return this.l5()
    }

    if (this.lastMonthCoverage() === 'family') {
      // TODO: This hard codes the allocation at 50% for each spouse but the
      // rules say any contribution allowcation is allowed
      return Math.round(this.l5() ?? 0 / 2)
    } else {
      // get the number of months of family coverage
      const familyMonths: number = this.perMonthContributions.type.filter(
        (t) => t === 'family'
      ).length

      // TODO: This hard codes the allocation at 50% for each spouse but the
      // rules say any contribution allowcation is allowed
      const familyContribution: number =
        (familyMonths * healthSavingsAccounts.contributionLimit['family']) /
        12 /
        2

      // Add this to the contributions of the self-only portion of the year
      const selfMonths: number = 12 - familyMonths

      const selfContribution: number =
        (selfMonths * healthSavingsAccounts.contributionLimit['self-only']) / 12

      return familyContribution + selfContribution
    }
  }

  /*Include on line 2 only those amounts you, or others on your behalf, contributed to your HSA in 2020. 
    Also, include those contributions made from January 1, 2021, through April 15, 2021, that were for 2020. 
    Do not include employer contributions (see line 9) or amounts rolled over from another HSA or Archer MSA. 
    See Rollovers, earlier. Also, do not include any qualified HSA funding distributions (see line 10). 
    Contributions to an employee's account through a cafeteria plan are treated as employer contributions 
    and are not included on line 2.
  */
  l2 = (): number =>
    this.hsas.reduce((total, hsa) => hsa.contributions + total, 0)

  l3 = (): number => this.contributionLimit()
  l4 = (): number => sumFields([this.f8853?.l1(), this.f8853?.l2()])
  l5 = (): number => (this.l3() ?? 0) - this.l4()
  l6 = (): number | undefined => this.splitFamilyContributionLimit()
  // TODO: Additional contirbution amount. Need to know the age of the user
  l7 = (): number | undefined => undefined
  l8 = (): number => sumFields([this.l6(), this.l7()])
  // Employer contributions are listed in W2 box 12 with code W
  l9 = (): number =>
    this.state.w2s
      .filter((w2) => w2.personRole == this.person.role)
      .reduce((res, w2) => res + (w2.box12?.W ?? 0), 0)
  l10 = (): number | undefined => undefined
  l11 = (): number => sumFields([this.l9(), this.l10()])
  l12 = (): number => {
    const tmp = this.l8() - this.l11()
    return tmp < 0 ? 0 : tmp
  }
  l13 = (): number | undefined =>
    this.l2() < this.l12() ? this.l2() : this.l12()
  l14a = (): number =>
    this.hsas.reduce((total, hsa) => hsa.totalDistributions + total, 0)
  l14b = (): number | undefined => undefined
  l14c = (): number => Math.max(0, this.l14a() - (this.l14b() ?? 0))
  l15 = (): number =>
    this.hsas.reduce((total, hsa) => hsa.qualifiedDistributions + total, 0)
  l16 = (): number => Math.max(0, this.l14c() - this.l15())
  l17a = (): boolean => false
  // TODO: add in logic for when line 17a is true
  l17b = (): number | undefined => Math.round(this.l16() * 0.2)

  l18 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined
  l20 = (): number => sumFields([this.l18(), this.l19()])
  l21 = (): number => Math.round(this.l20() * 0.1)

  fields = (): Field[] => [
    `${this.person.firstName} ${this.person.lastName}`,
    this.person.ssid,
    this.calculatedCoverageType === 'self-only', // line 1: self-only check box
    this.calculatedCoverageType === 'family', // line 1: family checkbox
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
    this.l14a(),
    this.l14b(),
    this.l14c(),
    this.l15(),
    this.l16(),
    this.l17a(),
    this.l17b(),
    this.l18(),
    this.l19(),
    this.l20(),
    this.l21()
  ]
}
