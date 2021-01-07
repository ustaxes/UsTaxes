import fetch from 'node-fetch'
import {
  PDFDocument,
  PDFName,
  PDFString,
  PDFCheckBox,
  PDFTextField
} from 'pdf-lib'
import flatFieldMappings from './1040flatFieldMappings'
import { getAllDataFlat } from '../redux/selectors'
import { store } from '../redux/store'
import { savePdf } from './pdfHandler'

function fillPDField (
  PDField,
  text
) {
  if (PDField instanceof PDFTextField) {
    PDField.acroField.dict.dict.set(PDFName.of('DA'), PDFString.of('/HelveticaLTStd-Bold 12.00 Tf'))
    PDField.setText(text)
    // PDField.disableCombing()
    // console.log(PDField)
  } else if (PDField instanceof PDFCheckBox) {
    PDField.check()
  }
};

// returns PDFDocument in the form of a Uint8Array
// I'm using my repo's github pages hosting as a CDN because it's free and allows cross origin requests
export async function fillPDF () {
  const information = getAllDataFlat(store.getState())

  console.log(getAllDataFlat(store.getState()))

  const pdfDoc = await PDFDocument.load(await fetch('https://thegrims.github.io/UsTaxes/tax_forms/f1040.pdf').then(res => res.arrayBuffer()))
  // const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  const formFields = pdfDoc.getForm().getFields()
  // fill fields with fieldNumber
  formFields.forEach((PDField, index) => { if (PDField instanceof PDFTextField) { PDField.setText(index.toString()) } })
  // check all boxes
  formFields.forEach((PDField, index) => { if (PDField instanceof PDFCheckBox) { PDField.check() } })
  console.log(formFields)

  Object.keys(flatFieldMappings).forEach(
    key => information[key] &&
        fillPDField(
          formFields[
            flatFieldMappings[key]
          ],
          information[key]
        )
  )
  formFields.forEach(formField => formField.enableReadOnly())

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup () {
  const pdfBytes = await fillPDF()

  savePdf(pdfBytes)
}
