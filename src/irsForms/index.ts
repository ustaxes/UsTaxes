import { PDFDocument } from 'pdf-lib'
import { store } from '../redux/store'
import Form from '../irsForms/Form'
import { create1040 } from '../irsForms/Main'
import { isLeft, zip } from '../util'
import log from '../log'
import { fillPDF } from '../pdfFiller/fillPdf'
import { downloadPDF, savePDF } from '../pdfFiller/pdfHandler'

// opens new with filled information in the window of the component it is called from
export async function create1040PDF(): Promise<Uint8Array> {
  const state = store.getState().information

  if (state.taxPayer !== undefined) {
    const f1040Result = create1040(state)
    // Get data and pdf links applicable to the model state
    if (isLeft(f1040Result)) {
      return await Promise.reject(f1040Result.left)
    }

    const [, forms] = f1040Result.right
    const pdfs: PDFDocument[] = await Promise.all(
      forms.map(async (f) => await downloadPDF(`/forms/${f.tag}.pdf`))
    )
    const formData: Array<[Form, PDFDocument]> = zip(forms, pdfs)

    // Insert the values from each field into the PDF
    const pdfFiles: Array<Promise<PDFDocument>> = formData.map(
      async ([data, f]) => {
        fillPDF(f, data.fields())
        const pageBytes = await f.save()
        return await PDFDocument.load(pageBytes)
      }
    )

    const [head, ...rest] = pdfFiles

    // Make sure we combine the documents from left to right and preserve order
    const res: PDFDocument = await rest.reduce(async (l, r) => {
      return await Promise.all([l, r]).then(
        async ([l, r]) =>
          await l.copyPages(r, r.getPageIndices()).then((pgs) => {
            pgs.forEach((p) => l.addPage(p))
            return l
          })
      )
    }, head)

    return await res.save()
  }

  log.error('Attempt to create pdf with no data, will be empty')
  return new Uint8Array()
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup(defaultFilename: string): Promise<void> {
  const pdfBytes = await create1040PDF()
  return await savePDF(pdfBytes, defaultFilename)
}
