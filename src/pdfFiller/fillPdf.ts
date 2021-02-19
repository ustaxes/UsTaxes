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
import ScheduleB from '../irsForms/ScheduleB'
import { Income1099Type } from '../redux/data'

const downloadUrls = {
  f1040: '/forms/f1040.pdf',
  f1040sb: '/forms/f1040sb.pdf'
}

/**
  * Attempt to fill fields in a PDF from a Form,
  * checking one by one that each pdf field and Form value
  * Make sense by type (checkbox => boolean, textField => string / number)
  */
export function fillPDF (pdf: PDFDocument, form: Form): void {
  const fieldValues = form.fields()
  const formFields = pdf.getForm().getFields()

  formFields.forEach((pdfField, index) => {
    const value: string | boolean | number | undefined = fieldValues[index]
    if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false) {
        throw new Error(`Expected boolean value in fields, index:${index}, found ${value ?? 'undefined'}`)
      }
    } else if (pdfField instanceof PDFTextField) {
      pdfField.setText(value?.toString())
    }
    pdfField.enableReadOnly()
  })
}

async function downloadPDF (url: string): Promise<PDFDocument> {
  const download = await fetch(url)
  const buffer = await download.arrayBuffer()
  return await PDFDocument.load(buffer)
}

async function getSchedules (f1040: F1040): Promise<Array<[Form, PDFDocument]>> {
  const state = store.getState().information
  let attachments: Array<[Form, PDFDocument]> = []

  if (state.f1099s.find((v) => v.formType === Income1099Type.INT) !== undefined) {
    const schB = new ScheduleB(state)

    const schBPdf = await downloadPDF(downloadUrls.f1040sb)

    f1040.addScheduleB(schB)
    attachments = [...attachments, [schB, schBPdf]]
  }

  const f1040pdf: PDFDocument = await downloadPDF(downloadUrls.f1040)
  return [[f1040, f1040pdf], ...attachments]
}

// opens new with filled information in the window of the component it is called from
export async function create1040 (): Promise<Uint8Array> {
  const state = store.getState().information

  if (state.taxPayer !== undefined) {
    const f1040 = new F1040(state.taxPayer)
    state.w2s.forEach((w2) => f1040.addW2(w2))
    if (state.refund !== undefined) {
      f1040.addRefund(state.refund)
    }

    const files: Array<[Form, PDFDocument]> = await getSchedules(f1040)

    const pdfFiles: Array<Promise<PDFDocument>> = files.map(async ([formData, f]) => {
      fillPDF(f, formData)
      const pageBytes = await f.save()
      return await PDFDocument.load(pageBytes)
    })

    const [head, ...rest] = pdfFiles

    const res: PDFDocument = await rest.reduce(
      async (l, r) => {
        return await Promise
          .all([l, r])
          .then(async ([l, r]) => await l.copyPages(r, r.getPageIndices()).then((pgs) => {
            pgs.forEach((p) => l.addPage(p))
            return l
          }))
      },
      head
    )

    return await res.save()
  }

  console.error('Attempt to create pdf with no data, will be empty')
  return new Uint8Array()
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup (): Promise<void> {
  const pdfBytes = await create1040()
  return await savePdf(pdfBytes)
}
