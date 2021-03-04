import { save } from 'tauri/api/dialog'
import { writeBinaryFile } from 'tauri/api/fs'

export async function savePdf (contents) {
  if (window.__TAURI_INVOKE_HANDLER__ === undefined) {
    const blob = new Blob([contents], { type: 'application/pdf' })
    const blobURL = URL.createObjectURL(blob)
    window.open(blobURL)
  } else {
    const path = await save()
    writeBinaryFile({ contents, path }, {})
  }
};
