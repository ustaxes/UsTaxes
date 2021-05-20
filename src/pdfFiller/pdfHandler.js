import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile } from '@tauri-apps/api/fs'

export async function savePdf (contents) {
  if (window.__TAURI__ === undefined) {
    const blob = new Blob([contents], { type: 'application/pdf' })
    const blobURL = URL.createObjectURL(blob)
    window.open(blobURL)
  } else {
    const path = await save()
    writeBinaryFile({ contents, path }, {})
  }
};
