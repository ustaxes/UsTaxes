import { PDFDocument } from 'pdf-lib'
import { PDFDownloader } from 'ustaxes/core/pdfFiller/pdfHandler'
import fs from 'fs'
import path from 'path'
import { TaxYear } from 'ustaxes/core/data'

const localPath = (url: string) => path.join(__dirname, '../../../public', url)

const compiledPDFs: { [key: string]: PDFDocument } = {}

export const localPDFs =
  (y: TaxYear): PDFDownloader =>
  async (url: string): Promise<PDFDocument> => {
    const fileUrl = `/forms/${y}/${url}`

    const lookedUpAt = localPath(fileUrl)

    if (lookedUpAt in compiledPDFs) {
      return compiledPDFs[lookedUpAt]
    }

    // Async method can't be used here, hitting error
    // described in https://github.com/Hopding/pdf-lib/issues/1186
    const bytes = fs.readFileSync(lookedUpAt).toString('base64')

    const pdf = await PDFDocument.load(bytes)

    compiledPDFs[lookedUpAt] = pdf

    return pdf
  }
