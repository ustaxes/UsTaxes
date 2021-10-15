import { Information } from 'ustaxes/redux/data'
import { computeField, sumFields } from './util'
import Form, { FormTag } from './Form'
import F8853 from './F8853'

export const needsF8889 = (state: Information): boolean => {
  return false
}

export default class F8889 extends Form {
  tag: FormTag = 'f8889'
  sequenceIndex = 52
  state: Information
  f8853?: F8853

  constructor(state: Information, f8853?: F8853) {
    super()
    this.state = state
    this.f8853 = f8853
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
  l2 = (): number | undefined => undefined
  l4 = (): number => sumFields([this.f8853?.l1(), this.f8853?.l2()])
  l6 = (): number | undefined => undefined
  l7 = (): number | undefined => undefined
  l8 = (): number | undefined => undefined
  l9 = (): number | undefined => undefined
  l10 = (): number | undefined => undefined
  l11 = (): number | undefined => undefined
  l12 = (): number | undefined => undefined
  l13 = (): number | undefined => undefined
  l14a = (): number | undefined => undefined
  l14b = (): number | undefined => undefined
  l14c = (): number | undefined => undefined
  l15 = (): number | undefined => undefined
  l16 = (): number | undefined => undefined
  l17a = (): boolean => false
  l17b = (): number | undefined => undefined
  l18 = (): number | undefined => undefined
  l19 = (): number | undefined => undefined
  l20 = (): number | undefined => undefined
  l21 = (): number | undefined => undefined

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

