import { PDFDocument, PDFCheckBox, PDFTextField } from 'pdf-lib'
import { Field } from '.'
import { displayRound } from '../irsForms/util'

/**
 * Attempt to fill fields in a PDF from a Form,
 * checking one by one that each pdf field and Form value
 * Make sense by type (checkbox => boolean, textField => string / number)
 * Side-effecting! Modifies the pdf document.
 */
export function fillPDF(pdf: PDFDocument, fieldValues: Field[]): PDFDocument {
  const formFields = pdf.getForm().getFields()

  formFields.forEach((pdfField, index) => {
    const value: Field = fieldValues[index]

    const error = (expected: string): Error => {
      return new Error(
        `Field ${index}, ${pdfField.getName()} expected ${expected}`
      )
    }

    if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false && value !== undefined) {
        throw error('boolean')
      }
    } else if (pdfField instanceof PDFTextField) {
      try {
        const showValue = !isNaN(value as number)
          ? displayRound(value as number | undefined)?.toString()
          : value?.toString()
        pdfField.setText(showValue)
      } catch (err) {
        throw error('text field')
      }
    }
    pdfField.enableReadOnly()
  })

  return pdf
}
