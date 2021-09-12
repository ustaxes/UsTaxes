import { PDFDocument, PDFCheckBox, PDFTextField } from 'pdf-lib'
import { Field } from '.'

/**
 * Attempt to fill fields in a PDF from a Form,
 * checking one by one that each pdf field and Form value
 * Make sense by type (checkbox => boolean, textField => string / number)
 */
export function fillPDF(pdf: PDFDocument, fieldValues: Field[]): void {
  const formFields = pdf.getForm().getFields()

  let stop = false

  formFields.forEach((pdfField, index) => {
    const value: Field = fieldValues[index]

    if (stop) {
      return
    } else if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false && value !== undefined) {
        console.error(
          `Expected boolean value in fields, index:${index}, found ${
            value ?? 'undefined'
          }`
        )
        console.error(pdfField.getName())
        stop = true
      }
    } else if (pdfField instanceof PDFTextField) {
      try {
        pdfField.setText(value?.toString())
      } catch (error) {
        console.error(`Error at index ${index}`)
        console.error(`Field: ${pdfField.getName()}`)
        console.error(error)
        stop = true
      }
    }
    pdfField.enableReadOnly()
  })
}
