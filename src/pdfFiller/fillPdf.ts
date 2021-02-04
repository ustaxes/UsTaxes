import fetch from 'node-fetch'
import {
  PDFDocument,
  PDFCheckBox,
  PDFTextField
} from 'pdf-lib'
import { store } from '../redux/store'
import { savePdf } from './pdfHandler'
import F1040 from '../irsForms/F1040'
import Form from '../irsForms/Form'

/**
  * Attempt to fill fields in a PDF from a Form,
  * checking one by one that each pdf field and Form value
  * Make sense by type (checkbox => boolean, textField => string / number)
  */
export function fillPDF (pdf: PDFDocument, form: Form): void {
  const fields = form.fields()
  const formFields = pdf.getForm().getFields()
  // fill fields with fieldNumber
  // check all boxes
  formFields.forEach((pdfField, index) => {
    const value: string | boolean | number = fields[index]
    if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false) {
        throw new Error(`Expected boolean value in fields, index:${index}, found ${value}`)
      }
    } else if (pdfField instanceof PDFTextField) {
      pdfField.setText(value.toString())
    }
  })
}

// opens new with filled information in the window of the component it is called from
export async function create1040 (): Promise<Uint8Array> {
  const download = await fetch('https://thegrims.github.io/UsTaxes/tax_forms/f1040.pdf')
  const buffer = await download.arrayBuffer()
  const pdf: PDFDocument = await PDFDocument.load(buffer)

  const state = store.getState().information
  if (state.taxPayer !== undefined) {
    const f1040 = new F1040(state.taxPayer)
    if (state.refund !== undefined) {
      f1040.addRefund(state.refund)
    }
    state.w2s.forEach((w2) => f1040.addW2(w2))
    fillPDF(pdf, f1040)
  } else {
    console.error('Attempt to create pdf with no data, will be empty')
  }

  const pdfBytes = await pdf.save()
  return pdfBytes
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup (): Promise<void> {
  const pdfBytes = await create1040()
  return await savePdf(pdfBytes)
}
