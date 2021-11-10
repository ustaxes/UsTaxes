import { fail } from 'assert'
import { PDFCheckBox, PDFField, PDFTextField } from 'pdf-lib'
import { fillPDF } from 'ustaxes/pdfFiller/fillPdf'
import { localPDFs } from './common/LocalForms'

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  // PDF-lib creates console warning on every creation due to no XFA support
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

const expectCheckbox = (field: PDFField): jest.JestMatchers<boolean> =>
  field instanceof PDFCheckBox
    ? expect(field.isChecked())
    : fail('field had unexpected type')

const expectTextField = (
  field: PDFField
): jest.JestMatchers<string | undefined> =>
  field instanceof PDFTextField
    ? expect(field.getText())
    : fail('field had unexpected type')

describe('fillPdf', () => {
  it('should fill PDF according value array', async () => {
    const pdf = await localPDFs('forms/f1040.pdf')
    const fieldsValue = [true, false, true, true, true, 'One', 'Two']
    fillPDF(pdf, fieldsValue)

    const fields = pdf.getForm().getFields()
    expectCheckbox(fields[0]).toBe(true)
    expectCheckbox(fields[1]).toBe(false)
    expectCheckbox(fields[2]).toBe(true)
    expectCheckbox(fields[3]).toBe(true)
    expectCheckbox(fields[4]).toBe(true)
    expectTextField(fields[5]).toBe('One')
    expectTextField(fields[6]).toBe('Two')
  })

  it('should stop filling when non-boolean is passed to field type Checkbox', async () => {
    const pdf = await localPDFs('forms/f1040.pdf')
    const fieldsValue = ['Test', false, true, true, true, 'One', 'Two']
    fillPDF(pdf, fieldsValue)

    const fields = pdf.getForm().getFields()
    expectCheckbox(fields[0]).toBe(false)
    expectCheckbox(fields[1]).toBe(false)
    expectCheckbox(fields[2]).toBe(false)
    expectCheckbox(fields[3]).toBe(false)
    expectCheckbox(fields[4]).toBe(false)
    expectTextField(fields[5]).toBe(undefined)
    expectTextField(fields[6]).toBe(undefined)
  })
})
