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
import ScheduleD from '../irsForms/ScheduleD'
import ScheduleEIC from '../irsForms/ScheduleEIC'
import F1040V from '../irsForms/F1040v'

const downloadUrls = {
  f1040: '/forms/f1040.pdf',
  f1040sb: '/forms/f1040sb.pdf',
  f1040sd: '/forms/f1040sd.pdf',
  f1040sei: '/forms/f1040sei.pdf',
  f1040v: '/forms/f1040v.pdf'
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
      } else if (value !== false && value !== undefined) {
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
  const prepends: Array<[Form, PDFDocument]> = []

  if (state.f1099s.find((v) => v.type === Income1099Type.INT) !== undefined) {
    const schB = new ScheduleB(state)

    const schBPdf = await downloadPDF(downloadUrls.f1040sb)

    f1040.addScheduleB(schB)
    attachments = [...attachments, [schB, schBPdf]]
  }

  if (state.f1099s.find((v) => v.type === Income1099Type.B) !== undefined) {
    const schD = new ScheduleD(state)
    const schDPdf = await downloadPDF(downloadUrls.f1040sd)
    f1040.addScheduleD(schD)
    attachments = [...attachments, [schD, schDPdf]]
  }

  const eic = new ScheduleEIC(state.taxPayer)
  if (eic.allowed(f1040)) {
    const eicPdf = await downloadPDF(downloadUrls.f1040sei)
    f1040.addScheduleEIC(eic)
    attachments = [...attachments, [eic, eicPdf]]
  }

  // Attach payment voucher to front if there is a payment due
  if ((f1040.l37() ?? 0) > 0) {
    const f1040v = new F1040V(state, f1040)
    const f1040vPdf = await downloadPDF(downloadUrls.f1040v)
    prepends.push([f1040v, f1040vPdf])
  }

  const f1040pdf: PDFDocument = await downloadPDF(downloadUrls.f1040)
  return [...prepends, [f1040, f1040pdf], ...attachments]
}

// opens new with filled information in the window of the component it is called from
export async function create1040 (): Promise<Uint8Array> {
  const state = store.getState().information

  if (state.taxPayer !== undefined) {
    const f1040 = new F1040(state.taxPayer)

    if (f1040.errors().length > 0) {
      return await Promise.reject(f1040.errors())
    }

    state.w2s.forEach((w2) => f1040.addW2(w2))
    if (state.refund !== undefined) {
      f1040.addRefund(state.refund)
    }

    // Get blank pdfs applicable to the model state
    const files: Array<[Form, PDFDocument]> = await getSchedules(f1040)

    // Insert the values from each field into the PDF
    const pdfFiles: Array<Promise<PDFDocument>> = files.map(async ([formData, f]) => {
      fillPDF(f, formData)
      const pageBytes = await f.save()
      return await PDFDocument.load(pageBytes)
    })

    const [head, ...rest] = pdfFiles

    // Make sure we combine the documents from left to right and preserve order
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
