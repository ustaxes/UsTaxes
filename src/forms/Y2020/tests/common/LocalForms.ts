import { PDFDocument } from 'pdf-lib'
import { PDFDownloader } from 'ustaxes/core/pdfFiller/pdfHandler'
import fs from 'fs/promises'
import path from 'path'

const files: { [key: string]: Uint8Array } = {}

export const localPDFs: PDFDownloader = async (
  url: string
): Promise<PDFDocument> => {
  const p = path.join(__dirname, '../../../public', url)

  if (p in files) {
    return PDFDocument.load(files[p].buffer)
  }

  const pdfBytes = await fs.readFile(p)

  const pdf = await PDFDocument.load(pdfBytes.buffer)
  files[p] = pdfBytes
  return pdf
}
