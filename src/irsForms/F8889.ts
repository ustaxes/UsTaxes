import { Information, W2Box12Code, Person, HealthSavingsAccount } from 'ustaxes/redux/data'
import { computeField, sumFields } from './util'
import Form, { FormTag } from './Form'
import F8853 from './F8853'

export const needsF8889 = (state: Information): boolean => {
  return false
}

export default class F8889 extends Form {
  tag: FormTag = 'f8889'
  sequenceIndex = 52
  // these should only be the HSAs that belong to this person
  // the person can be either the primary person or the spouse
  hsas: HealthSavingsAccount[]
  f8853?: F8853
  person: Person
  state: Information

  constructor(state: Information, person: Person, f8853?: F8853) {
    super()
    this.f8853 = f8853
    this.person = person
    this.state = state
  }

  getHSAs = (): undefined => {
    return undefined
  }

  /* If you were covered, or considered covered, by a self-only HDHP and a family HDHP 
     at different times during the year, check the box for the plan that was in effect 
     for a longer period. If you were covered by both a self-only HDHP and a family HDHP 
     at the same time, you are treated as having family coverage during that period. 
     If, on the first day of the last month of your tax year (December 1 for most taxpayers), 
     you had family coverage, check the "family" box.
  */
  determineCoverageType = (): string => {

    return 'self-only'
  }

  /* Include on line 2 only those amounts you, or others on your behalf, contributed to your HSA in 2020. 
     Also, include those contributions made from January 1, 2021, through April 15, 2021, that were for 2020. 
     Do not include employer contributions (see line 9) or amounts rolled over from another HSA or Archer MSA. 
     See Rollovers, earlier. Also, do not include any qualified HSA funding distributions (see line 10). 
     Contributions to an employee's account through a cafeteria plan are treated as employer contributions 
     and are not included on line 2.
  */
  l2 = (): number => this.hsas.reduce((total, hsa) => hsa.contributions + total, 0)
  /* If you were under age 55 at the end of 2020 and, on the first day of every month during 2020, 
     you were, or were considered, an eligible individual with the same coverage, enter $3,550 
     ($7,100 for family coverage). All others, see the instructions for the amount to enter.

     When figuring the amount to enter on line 3, apply the following rules.

     1. Use the family coverage amount if you or your spouse had an HDHP with family coverage. 
        Disregard any plan with self-only coverage.
     2. If the last-month rule (see Last-month rule, earlier) applies, you are considered an eligible individual 
        for the entire year. You are treated as having the same HDHP coverage for the entire year as you had on 
        the first day of the last month of your tax year.
     3. If you were, or were considered, an eligible individual for the entire year and you did not change your 
        type of coverage, enter $3,550 for a self-only HDHP or $7,100 for a family HDHP on line 3. 
        (See (6) in this list.)
     4. If you were, or were considered, an eligible individual for the entire year and you changed your type of 
        coverage during the year, enter on line 3 (see (6) in this list) the greater of:
        a) The limitation shown on the last line of the Line 3 Limitation Chart and Worksheet (in these instructions);
        
        or  
        
        b) The maximum amount that can be contributed based on the type of HDHP coverage you had on the first day of 
           the last month of your tax year.

        If you had family coverage on the first day of the last month, you do not need to use the worksheet;
        enter $7,100 on line 3.

      5. If you were not an eligible individual on the first day of the last month of your tax year, use the Line 3 
         Limitation Chart and Worksheet (in these instructions) to determine the amount to enter on line 3. 
         (See (6) in this list.)
      6. If, at the end of 2020, you were age 55 or older and unmarried or married with self-only HDHP coverage for 
         the entire year, you can increase the amount determined in (3) or (4) by $1,000 (the additional contribution 
         amount). For the Line 3 Limitation Chart and Worksheet, the additional contribution amount is included for 
         each month you are an eligible individual.

    Note. If you are married and had family coverage at any time during the year, the additional contribution amount 
    is figured on line 7 and is not included on line 3.
  */
  l3 = (): number => {
    // rule 1

  }
  l4 = (): number => sumFields([this.f8853?.l1(), this.f8853?.l2()])
  l5 = (): number | undefined => this.l3() - this.l4()
  l6 = (): number | undefined => undefined
  l7 = (): number | undefined => undefined
  l8 = (): number => sumFields([this.l6(), this.l7()])
  // Employer contributions are listed in W2 box 12 with code W
  l9 = (): number => {
    this.state.w2s.reduce((res, w2) => {
      if (w2.box12 !== undefined) {
        return res + w2.box12.reduce((res2, b12) => 
          b12.code == W2Box12Code.W ? res2 + b12.amount : 0, 0)
      }
      return 0
    }, 0)
    return 0
  }
  l10 = (): number | undefined => undefined
  l11 = (): number => sumFields([this.l9(), this.l10()])
  l12 = (): number => {
    const tmp = this.l8() - this.l11()
    return tmp < 0 ? 0 : tmp
  }
  l13 = (): number | undefined => this.l2() < this.l12() ? this.l2() : this.l12()
  l14a = (): number | undefined => undefined
  l14b = (): number | undefined => undefined
  l14c = (): number | undefined => this.l14a() - this.l14b()
  l15 = (): number | undefined => undefined
  l16 = (): number | undefined => {
    const tmp = this.l14c() - this.l15()
    return tmp < 0 ? 0 : tmp
  }
  l17a = (): boolean => false
  
  // TODO: CHECK IF THIS IS CORRECT
  l17b = (): number | undefined => {
    if (this.l17a()) {
      return Math.round(this.l16() * 0.2)
    }
    return undefined
  }
  l18 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined
  l20 = (): number => sumFields([this.l18(), this.l19()])
  l21 = (): number => Math.round(this.l20() * 0.1)

  fields = (): Array<string | number | boolean | undefined> => {
    return [ 
        undefined,  // names
        undefined,  // ssn
        undefined,  // line 1: self-only check box
        undefined,  // line 1: family checkbox
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

