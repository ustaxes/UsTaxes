import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile } from '@tauri-apps/api/fs'
import fetch from 'node-fetch'
import { PDFDocument } from 'pdf-lib'
import { Fill } from '.'
import { fillPDF } from './fillPdf'

export async function downloadPDF(url: string): Promise<PDFDocument> {
  const download = await fetch(url)
  const buffer = await download.arrayBuffer()
  return await PDFDocument.load(buffer)
}

export const combinePdfs = (
  pdfFiles: Array<Promise<PDFDocument>>
): Promise<PDFDocument> => {
  const [head, ...rest] = pdfFiles

  // Make sure we combine the documents from left to right and preserve order
  return rest.reduce(async (l, r) => {
    return await Promise.all([l, r]).then(
      async ([l, r]) =>
        await l.copyPages(r, r.getPageIndices()).then((pgs) => {
          pgs.forEach((p) => l.addPage(p))
          return l
        })
    )
  }, head)
}

export const buildPdf = async (
  formData: Array<[Fill, PDFDocument]>
): Promise<Uint8Array> => {
  // Insert the values from each field into the PDF
  const pdfFiles: Array<Promise<PDFDocument>> = formData.map(
    async ([data, f]) => {
      fillPDF(f, data.fields())
      const pageBytes = await f.save()
      return await PDFDocument.load(pageBytes)
    }
  )

  return (await combinePdfs(pdfFiles)).save()
}

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
