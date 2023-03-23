import { PDFDocument, PDFCheckBox, PDFTextField, PDFName } from 'pdf-lib'
import { Field } from '.'
import { displayRound } from '../irsForms/util'
import _ from 'lodash'

/**
 * Attempt to fill fields in a PDF from a Form,
 * checking one by one that each pdf field and Form value
 * Make sense by type (checkbox => boolean, textField => string / number)
 * Side-effecting! Modifies the pdf document.
 */
export function fillPDF(
  pdf: PDFDocument,
  fieldValues: Field[],
  formName: string
): PDFDocument {
  const formFields = pdf.getForm().getFields()

  formFields.forEach((pdfField, index) => {
    const value: Field = fieldValues[index]

    const error = (expected: string): Error => {
      return new Error(
        `${formName} Field ${index}, ${pdfField.getName()} expected ${expected}`
      )
    }
    // First handle radio groups. If the value for this field
    // is a RadioSelect object, then assume the pdfField
    // has children, and check the correct box given the index value.
    // Idea taken from this comment:
    // https://github.com/Hopding/pdf-lib/issues/780#issuecomment-771453157
    // Note, this is for cases such as the 2021 IL-1040 where the field
    // behaves as a radio group, but the pdfField is a PDFCheckbox
    // instead of a PDFRadioGroup.
    if (_.isObject(value)) {
      const children = pdfField.acroField.getWidgets()
      if (value.select >= children.length) {
        throw new Error(
          `Error in field ${index}, expected to select child at index ${value.select} but this node has only ${children.length} children.`
        )
      }
      const setValue = children[value.select].getOnValue()
      if (setValue !== undefined) {
        pdfField.acroField.dict.set(PDFName.of('V'), setValue)
        children[value.select].setAppearanceState(setValue)
      } else {
        console.error(children)
        throw new Error(
          `Error handling RadioGroup, could not set index ${value.select}`
        )
      }
    } else if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false && value !== undefined) {
        throw error('boolean')
      }
    } else if (pdfField instanceof PDFTextField) {
      try {
        const showValue =
          !isNaN(value as number) &&
          value &&
          Array.from(value as string)[0] !== '0'
            ? displayRound(value as number)?.toString()
            : value?.toString()
        pdfField.setText(showValue)
      } catch (err) {
        throw error('text field')
      }
    } else if (value !== undefined) {
      throw error('unknown')
    }
    pdfField.enableReadOnly()
  })

  return pdf
}
