import { PDFDocument } from 'pdf-lib'
import Form from '../irsForms/Form'
import { fillPdfFromFill } from './fillPdf'

export interface FileDownloader<T> {
  (url: string): Promise<T>
}

export type PDFDownloader = FileDownloader<PDFDocument>

export const downloadPDF: PDFDownloader = async (url) => {
  const download = await fetch(url)
  if (!download.ok) {
    throw new Error(
      `Failed to download PDF from "${url}": ${download.status} ${download.statusText}`
    )
  }
  const buffer = await download.arrayBuffer()
  return await PDFDocument.load(buffer)
}

export const combinePdfs = async (
  pdfFiles: PDFDocument[]
): Promise<PDFDocument> => {
  const mergedPdf = await PDFDocument.create()

  for (const pdf of pdfFiles) {
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return mergedPdf
}

export const getPdfs = async (
  formData: Array<[Form, PDFDocument]>
): Promise<PDFDocument[]> => {
  // Insert the values from each field into the PDF
  const pdfFiles: Array<Promise<PDFDocument>> = formData.map(
    async ([data, f]) => {
      const values = data.fillInstructions ? [] : data.renderedFields()
      const { warnings } = fillPdfFromFill(f, data.tag, data, values)
      if (warnings.length > 0) {
        console.warn('PDF fill warnings:', warnings)
      }
      const pageBytes = await f.save()
      return await PDFDocument.load(pageBytes)
    }
  )

  return await Promise.all(pdfFiles)
}
