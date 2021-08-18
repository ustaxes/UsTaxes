import { Information } from 'usTaxes/redux/data'
import F1040 from './F1040'
import Form, { FormTag } from './Form'

export default class F1040V implements Form {
  tag: FormTag = 'f1040v'
  sequenceIndex: number = -1
  state: Information
  f1040: F1040

  constructor(info: Information, f1040: F1040) {
    this.state = info
    this.f1040 = f1040
  }

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = this.state.taxPayer

    const taxOwed = this.f1040.l37()

    if (taxOwed === undefined) {
      throw new Error('Attempted to build F1040V with no tax owed')
    }

    const result = [
      tp.primaryPerson?.ssid,
      tp.spouse?.ssid,
      Math.trunc(taxOwed), // dollars
      Math.round((taxOwed - Math.trunc(taxOwed)) * 100), // cents
      tp.primaryPerson?.firstName,
      tp.primaryPerson?.lastName,
      tp.spouse?.firstName,
      tp.spouse?.lastName,
      tp.primaryPerson?.address.address,
      tp.primaryPerson?.address.aptNo,
      tp.primaryPerson?.address.city,
      tp.primaryPerson?.address.state,
      tp.primaryPerson?.address.zip,
      tp.primaryPerson?.address.foreignCountry,
      tp.primaryPerson?.address.province,
      tp.primaryPerson?.address.postalCode
    ]

    return result
  }
}
