import { PDFDocument } from 'pdf-lib'
import { store } from '../redux/store'
import { create1040 } from '../irsForms/Main'
import { isLeft } from '../util'
import _ from 'lodash'
import log from '../log'
import { buildPdf, downloadPDF, savePDF } from '../pdfFiller/pdfHandler'
import { Information } from '../redux/data'
import TaxesStateMethods from 'ustaxes/redux/TaxesState'

// opens new with filled information in the window of the component it is called from
export async function create1040PDF(state: Information): Promise<Uint8Array> {
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

    return buildPdf(_.zipWith(forms, pdfs, (a, b) => [a, b]))
  }

  log.error('Attempt to create pdf with no data, will be empty')
  return new Uint8Array()
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup(defaultFilename: string): Promise<void> {
  const information = new TaxesStateMethods(store.getState()).info()
  if (information === undefined) {
    throw new Error(
      `Information was undefined for tax year: ${store.getState().activeYear}`
    )
  }
  const pdfBytes = await create1040PDF(information)
  return await savePDF(pdfBytes, defaultFilename)
}
