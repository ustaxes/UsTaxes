import { PDFDocument, PDFCheckBox, PDFTextField, PDFName } from 'pdf-lib'
import { Field, RadioSelect } from 'ustaxes/core/pdfFiller'
import { displayRound } from 'ustaxes/core/irsForms/util'
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
    if (_.isObject(value) && 'select' in value) {
      const radioValue = value as RadioSelect
      const children = pdfField.acroField.getWidgets()
      if (radioValue.select >= children.length) {
        throw new Error(
          `Error in field ${index}, expected to select child at index ${radioValue.select} but this node has only ${children.length} children.`
        )
      }
      const setValue = children[radioValue.select].getOnValue()
      if (setValue !== undefined) {
        pdfField.acroField.dict.set(PDFName.of('V'), setValue)
        children[radioValue.select].setAppearanceState(setValue)
      } else {
        console.error(children)
        throw new Error(
          `Error handling RadioGroup, could not set index ${radioValue.select}`
        )
      }
    } else if (pdfField instanceof PDFCheckBox) {
      try {
        if (value === true) {
          pdfField.check()
        } else if (value !== false && value !== undefined) {
          // Skip checkbox type mismatches instead of throwing
          console.warn(
            `Skipping checkbox ${pdfField.getName()}: expected boolean, got ${typeof value}`
          )
        }
      } catch (err) {
        console.warn(`Skipping checkbox ${pdfField.getName()}: ${err}`)
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
        // Skip text field errors instead of throwing
        console.warn(`Skipping text field ${pdfField.getName()}: ${err}`)
      }
    } else if (value !== undefined) {
      // Skip unknown field types instead of throwing
      console.warn(
        `Skipping unknown field type ${pdfField.getName()}: value=${value}, type=${typeof value}`
      )
    }
    pdfField.enableReadOnly()
  })

  return pdf
}
