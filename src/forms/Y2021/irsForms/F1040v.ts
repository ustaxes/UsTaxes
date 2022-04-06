import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'

export default class F1040V extends F1040Attachment {
  tag: FormTag = 'f1040v'
  sequenceIndex = -1

  fields = (): Field[] => {
    const tp = this.f1040.info.taxPayer

    const taxOwed = this.f1040.l37()

    if (taxOwed === undefined) {
      throw new Error('Attempted to build F1040V with no tax owed')
    }

    const result = [
      tp.primaryPerson?.ssid,
      tp.spouse?.ssid,
      taxOwed.toFixed(2), // dollars
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
