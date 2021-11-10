import { PDFDocument } from 'pdf-lib'
import { store } from '../redux/store'
import { create1040 } from '../irsForms/Main'
import { isLeft } from '../util'
import _ from 'lodash'
import log from '../log'
import {
  combinePdfs,
  getPdfs,
  PDFDownloader,
  savePDF
} from '../pdfFiller/pdfHandler'
import { Information } from '../redux/data'

export const create1040PDFs =
  (state: Information) =>
  async (downloader: PDFDownloader): Promise<PDFDocument[]> => {
    if (state.taxPayer !== undefined) {
      const f1040Result = create1040(state)
      // Get data and pdf links applicable to the model state
      if (isLeft(f1040Result)) {
        return await Promise.reject(f1040Result.left)
      }

      const [, forms] = f1040Result.right

      const pdfs: PDFDocument[] = await Promise.all(
        forms.map(async (f) => await downloader(`/forms/${f.tag}.pdf`))
      )

      return getPdfs(_.zipWith(forms, pdfs, (a, b) => [a, b]))
    }

    log.error('Attempt to create pdf with no data, will be empty')
    return []
  }

export const create1040PDF =
  (state: Information) =>
  async (downloader: PDFDownloader): Promise<Uint8Array> =>
    (await combinePdfs(await create1040PDFs(state)(downloader))).save()

// opens new with filled information in the window of the component it is called from
export const createPDFPopup =
  (defaultFilename: string) =>
  async (downloader: PDFDownloader): Promise<void> => {
    const pdfBytes = await create1040PDF(store.getState().information)(
      downloader
    )
    return await savePDF(pdfBytes, defaultFilename)
  }
