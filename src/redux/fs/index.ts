/* eslint-disable @typescript-eslint/no-explicit-any */

import Load from './Load'

const download = (filename: string, text: string): void => {
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/json;charset=utf-8,' + encodeURIComponent(text)
  )
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

const loadFile = async (file: File): Promise<string> => {
  const fileReader: FileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = function (
      this: FileReader,
      e: ProgressEvent<FileReader>
    ): any {
      e.preventDefault()
      // type known here because of readAsText
      const contents: string | null = fileReader.result as string | null
      if (contents === null) {
        reject('file contents were null')
      } else {
        resolve(contents)
      }
    }
    fileReader.readAsText(file)
  })
}

export { download, loadFile, Load }
