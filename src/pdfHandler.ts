import { PDFDocument } from 'pdf-lib'
import { combinePdfs } from 'ustaxes/forms/Y2020/pdfFiller/pdfHandler'
import { getPdfs } from 'ustaxes/forms/Y2020/pdfFiller/pdfHandler'
import Fill from 'ustaxes/forms/Y2020/pdfFiller/Fill'
import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile } from '@tauri-apps/api/fs'

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
