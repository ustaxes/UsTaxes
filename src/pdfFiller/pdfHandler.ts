import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile } from '@tauri-apps/api/fs'
import { PDFDocument } from 'pdf-lib'
import Fill from './Fill'
import { fillPDF } from './fillPdf'

export interface PDFDownloader {
  (url: string): Promise<PDFDocument>
}

export const makeDownloader =
  (baseUrl: string): PDFDownloader =>
  async (url: string): Promise<PDFDocument> => {
    const download = await fetch(`${baseUrl}${url}`)
    const buffer = await download.arrayBuffer()
    return await PDFDocument.load(buffer)
  }

export const combinePdfs = (pdfFiles: PDFDocument[]): Promise<PDFDocument> => {
  const [head, ...rest] = pdfFiles

  // Make sure we combine the documents from left to right and preserve order
  return rest.reduce(async (l, r) => {
    const doc = await l
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

export const buildPdf = async (
  formData: Array<[Fill, PDFDocument]>
): Promise<Uint8Array> => (await combinePdfs(await getPdfs(formData))).save()

export async function savePDF(
  contents: Uint8Array,
  defaultFilename: string
): Promise<void> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if ((window as any).__TAURI__ === undefined) {
    // To set the download file name, we create a temporary link element,
    // use download property of an anchor tag, supported for most people
    const blob = new Blob([contents], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultFilename
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
    return await Promise.resolve()
  } else {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const defaultPath = await (window as any).__TAURI__.path.documentDir()
    const path = await save({
      filters: [{ name: 'PDF Documents (.pdf)', extensions: ['pdf'] }],
      defaultPath
    })

    if (path !== null) {
      return await writeBinaryFile({ contents, path }, {})
    }

    // user canceled save.
    return await Promise.resolve()
  }
}
