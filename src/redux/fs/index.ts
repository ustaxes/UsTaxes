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
export const stringToState = (str: string): USTState =>
  deserializeTransform(JSON.parse(str)) as USTState

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

export { Load }
