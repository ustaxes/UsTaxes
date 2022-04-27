/* eslint-disable @typescript-eslint/no-explicit-any */

import { deserializeTransform, serializeTransform, USTState } from '../store'
import Load from './Load'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const stateToString = (state: any): string =>
  JSON.stringify(serializeTransform(state))

/**
 * Reuse the same functionality as reloading the state from redux-persist,
 * to reload state from a file
 */
export const stringToState = (str: string): USTState => {
  const data = JSON.parse(str) as Record<string, unknown>
  return Object.keys(data).reduce(
    (acc, key) => ({
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      [key]: deserializeTransform(data[key])
    }),
    {}
  ) as USTState
}

export const download = (filename: string, text: string): void => {
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

export const loadFile = async (file: File): Promise<string> => {
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

export { Load }
