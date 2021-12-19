import { PDFDocument } from 'pdf-lib'
import {
  FileDownloader,
  PDFDownloader
} from 'ustaxes/core/pdfFiller/pdfHandler'
import fs from 'fs/promises'
import path from 'path'
import { TaxYear } from 'ustaxes/data'

const localPath = (url: string) => path.join(__dirname, '../../../public', url)

export const localFiles: FileDownloader<Uint8Array> = (
  url: string
): Promise<Uint8Array> => fs.readFile(localPath(url))

const compiledPDFs: { [key: string]: PDFDocument } = {}

export const localPDFs =
  (y: TaxYear): PDFDownloader =>
  async (url: string): Promise<PDFDocument> => {
    const fileUrl = `/forms/${y}/${url}`

    const lookedUpAt = localPath(fileUrl)

    if (lookedUpAt in compiledPDFs) {
      return compiledPDFs[lookedUpAt]
    }

    const bytes = await localFiles(fileUrl)

    const pdf = await PDFDocument.load(bytes.buffer)

    compiledPDFs[lookedUpAt] = pdf

    return pdf
  }
