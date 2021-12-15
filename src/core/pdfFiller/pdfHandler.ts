import { PDFDocument } from 'pdf-lib'
import Fill from './Fill'
import { fillPDF } from './fillPdf'

export interface PDFDownloader {
  (url: string): Promise<PDFDocument>
}

export const downloadPDF: PDFDownloader = async (url) => {
  const download = await fetch(url)
  const buffer = await download.arrayBuffer()
  return await PDFDocument.load(buffer)
}

export const combinePdfs = async (
  pdfFiles: PDFDocument[]
): Promise<PDFDocument> => {
  const [head, ...rest] = await Promise.all(
    pdfFiles.map(async (pdf) => PDFDocument.load(await pdf.save()))
  )

  // Make sure we combine the documents from left to right and preserve order
  return rest.reduce(async (l, r) => {
    const doc = await PDFDocument.load(await (await l).save())
    return await doc.copyPages(r, r.getPageIndices()).then((pgs) => {
      pgs.forEach((p) => doc.addPage(p))
      return doc
    })
  }, Promise.resolve(head))
}

export const getPdfs = async (
  formData: Array<[Fill, PDFDocument]>
): Promise<PDFDocument[]> => {
  // Insert the values from each field into the PDF
  const pdfFiles: Array<Promise<PDFDocument>> = formData.map(
    async ([data, f]) => {
      fillPDF(f, data.renderedFields())
      const pageBytes = await f.save()
      return await PDFDocument.load(pageBytes)
    }
  )

  return await Promise.all(pdfFiles)
}
