import { PDFDocument } from 'pdf-lib'
import { PDFDownloader } from '../../pdfFiller/pdfHandler'
import fs from 'fs'
import path from 'path'

const files: { [key: string]: Uint8Array } = {}

export const localPDFs: PDFDownloader = async (
  url: string
): Promise<PDFDocument> => {
  const p = path.join(__dirname, '../../../public', url)

  if (p in files) {
    return PDFDocument.load(files[p].buffer)
  }

  const pdfBytes: Uint8Array = await new Promise((resolve, reject) =>
    fs.readFile(p, null, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  )

  const pdf = await PDFDocument.load(pdfBytes.buffer)
  files[p] = pdfBytes
  return pdf
}
