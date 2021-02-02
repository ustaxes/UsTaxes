import fetch from 'node-fetch'
import {
  PDFDocument,
  PDFCheckBox,
  PDFTextField
} from 'pdf-lib'
import fieldMappings from './1040FieldMappings'
import { store } from '../redux/store'
import { savePdf } from './pdfHandler'

// returns PDFDocument in the form of a Uint8Array
// I'm using my repo's github pages hosting as a CDN because it's free and allows cross origin requests
export async function fillPDF () {
  const information = store.getState().information

  const pdfDoc = await PDFDocument.load(await fetch('https://thegrims.github.io/UsTaxes/tax_forms/f1040.pdf').then(res => res.arrayBuffer()))
  // const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  const formFields = pdfDoc.getForm().getFields()
  // fill fields with fieldNumber
  // check all boxes
  formFields.forEach((pdfField, index) => {
    if (
      pdfField instanceof PDFCheckBox &&
      Object.prototype.hasOwnProperty.call(fieldMappings, index) &&
      fieldMappings[index](information)
    ) {
      pdfField.check()
    } else if (pdfField instanceof PDFTextField) {
      const defaultValue = index.toString()
      let addValue
      if (Object.prototype.hasOwnProperty.call(fieldMappings, index)) {
        addValue = fieldMappings[index](information)
      }
      pdfField.setText(addValue ?? defaultValue)
    }
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup () {
  const pdfBytes = await fillPDF()

  savePdf(pdfBytes)
}
