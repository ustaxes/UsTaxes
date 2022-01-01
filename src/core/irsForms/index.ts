import { PDFDocument } from 'pdf-lib'
import _ from 'lodash'
import { getPdfs, PDFDownloader } from '../pdfFiller/pdfHandler'
import Form from './Form'

export const insertFormDataToPdfs = async (
  forms: Form[],
  downloader: PDFDownloader
): Promise<PDFDocument[]> => {
  const pdfs: PDFDocument[] = await Promise.all(
    forms.map(async (f) => await downloader(`/irs/${f.tag}.pdf`))
  )

  return getPdfs(_.zipWith(forms, pdfs, (a, b) => [a, b]))
}
