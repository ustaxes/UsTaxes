import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'
import { FilingStatus } from 'ustaxes/core/data'

export default class F1040V extends F1040Attachment {
  tag: FormTag = 'f1040v'
  sequenceIndex = -1

  fields = (): Field[] => {
    const tp = this.f1040.info.taxPayer
    const address = tp.primaryPerson.address
    const includeSpouse = tp.filingStatus === FilingStatus.MFJ
    const taxOwed = this.f1040.l37()

    const result = [
      tp.primaryPerson.ssid,
      includeSpouse ? tp.spouse?.ssid : undefined,
      Math.trunc(taxOwed), // dollars
      Math.round((taxOwed - Math.trunc(taxOwed)) * 100), // cents
      tp.primaryPerson.firstName,
      tp.primaryPerson.lastName,
      includeSpouse ? tp.spouse?.firstName : undefined,
      includeSpouse ? tp.spouse?.lastName : undefined,
      address?.address,
      address?.aptNo,
      address?.city,
      address?.state,
      address?.zip,
      address?.foreignCountry,
      address?.province,
      address?.postalCode
    ]

    return result
  }
}
