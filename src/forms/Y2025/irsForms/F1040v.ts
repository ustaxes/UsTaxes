import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'

export default class F1040V extends F1040Attachment {
  tag: FormTag = 'f1040v'
  sequenceIndex = -1

  fields = (): Field[] => {
    const tp = this.f1040.info.taxPayer

    const taxOwed = this.f1040.l37()

    const result = [
      tp.primaryPerson.ssid,
      tp.spouse?.ssid,
      taxOwed.toFixed(2), // dollars
      tp.primaryPerson.firstName,
      tp.primaryPerson.lastName,
      tp.spouse?.firstName,
      tp.spouse?.lastName,
      tp.primaryPerson.address.address,
      tp.primaryPerson.address.aptNo,
      tp.primaryPerson.address.city,
      tp.primaryPerson.address.state,
      tp.primaryPerson.address.zip,
      tp.primaryPerson.address.foreignCountry,
      tp.primaryPerson.address.province,
      tp.primaryPerson.address.postalCode
    ]

    return result
  }

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  fillInstructions = (): FillInstructions => {
    const tp = this.f1040.info.taxPayer
    return [
      text('topmostSubform[0].Page1[0].f1_1[0]', tp.primaryPerson.ssid),
      text('topmostSubform[0].Page1[0].f1_2[0]', tp.spouse?.ssid),
      text('topmostSubform[0].Page1[0].f1_3[0]', this.f1040.l37().toFixed(2)),
      text('topmostSubform[0].Page1[0].f1_5[0]', tp.primaryPerson.firstName),
      text('topmostSubform[0].Page1[0].f1_6[0]', tp.primaryPerson.lastName),
      text('topmostSubform[0].Page1[0].f1_7[0]', tp.spouse?.firstName),
      text('topmostSubform[0].Page1[0].f1_8[0]', tp.spouse?.lastName),
      text(
        'topmostSubform[0].Page1[0].f1_9[0]',
        tp.primaryPerson.address.address
      ),
      text(
        'topmostSubform[0].Page1[0].f1_10[0]',
        tp.primaryPerson.address.aptNo
      ),
      text(
        'topmostSubform[0].Page1[0].f1_11[0]',
        tp.primaryPerson.address.city
      ),
      text(
        'topmostSubform[0].Page1[0].f1_12[0]',
        tp.primaryPerson.address.state
      ),
      text('topmostSubform[0].Page1[0].f1_13[0]', tp.primaryPerson.address.zip),
      text(
        'topmostSubform[0].Page1[0].f1_14[0]',
        tp.primaryPerson.address.foreignCountry
      ),
      text(
        'topmostSubform[0].Page1[0].f1_15[0]',
        tp.primaryPerson.address.province
      ),
      text(
        'topmostSubform[0].Page1[0].f1_16[0]',
        tp.primaryPerson.address.postalCode
      )
    ]
  }
}
