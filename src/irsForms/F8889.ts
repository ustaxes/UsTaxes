import { Information } from 'ustaxes/redux/data'
import { computeField, sumFields } from './util'
import Form, { FormTag } from './Form'

export const needsF8889 = (state: Information): boolean => {
  return false
}

export default class F8889 extends Form {
  tag: FormTag = 'f8889'
  sequenceIndex = 52
  state: Information

  constructor(state: Information) {
    super()
    this.state = state
  }

  l2 = (): number | undefined => undefined
  l3 = (): number | undefined => undefined
  l4 = (): number | undefined => undefined
  l5 = (): number | undefined => undefined
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

