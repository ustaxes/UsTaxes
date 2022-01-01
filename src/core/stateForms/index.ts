import _ from 'lodash'
import { PDFDocument } from 'pdf-lib'
import { fillPDF } from '../pdfFiller/fillPdf'
import { combinePdfs, PDFDownloader } from '../pdfFiller/pdfHandler'
import Form from './Form'

export const createStatePDF =
  (forms: Form[]) =>
  async (downloader: PDFDownloader): Promise<PDFDocument> => {
    const filenames = forms.map(
      (form) => `/states/${form.state}/${form.formName}.pdf`
    )

    const pdfs = filenames.map(downloader)

    const filled: Array<Promise<PDFDocument>> = _.zipWith(
      pdfs,
      forms,
      async (pdf, form) => {
        fillPDF(await pdf, form.fields())
        return pdf
      }
    )

    return combinePdfs(await Promise.all(filled))
  }
