import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'

export async function savePDF(
  contents: Uint8Array,
  defaultFilename: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
  if ((window as any).__TAURI__ === undefined) {
    // To set the download file name, we create a temporary link element,
    // use download property of an anchor tag, supported for most people
    const blob = new Blob([contents as Uint8Array & { buffer: ArrayBuffer }], {
      type: 'application/pdf'
    })
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    const defaultPath = await (window as any).__TAURI__.path.documentDir()

    // path can be null if user cancels save.
    const path: string | null = await save({
      filters: [{ name: 'PDF Documents (.pdf)', extensions: ['pdf'] }],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      defaultPath
    })

    if (path !== null) {
      return await writeFile(path, contents)
    }

    // user canceled save.
    return await Promise.resolve()
  }
}
