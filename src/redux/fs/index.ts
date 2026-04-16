/* eslint-disable @typescript-eslint/no-explicit-any */

import { deserializeTransform, serializeTransform, USTState } from '../store'
import { blankYearTaxesState, YearsTaxesState } from '../data'
import { TaxYear, TaxYears, Information } from 'ustaxes/core/data'
import { enumKeys } from 'ustaxes/core/util'
import Load from './Load'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
type ReturnPayload = {
  taxYear: TaxYear
  information: Information
}

type ReturnBundle = {
  version?: string
  activeYear?: TaxYear
  assets?: unknown[]
  returns: Record<string, ReturnPayload>
}

const supportedTaxYears = enumKeys(TaxYears)

const buildReturnBundle = (state: YearsTaxesState): ReturnBundle => ({
  version: '1.0.0',
  activeYear: state.activeYear,
  assets: state.assets,
  returns: Object.fromEntries(
    supportedTaxYears.map((year) => [
      year,
      { taxYear: year, information: state[year] }
    ])
  )
})

export const stateToString = (state: YearsTaxesState): string =>
  JSON.stringify(serializeTransform(buildReturnBundle(state)))

/**
 * Reuse the same functionality as reloading the state from redux-persist,
 * to reload state from a file
 */
const isTaxYear = (value: unknown): value is TaxYear =>
  typeof value === 'string' && supportedTaxYears.includes(value as TaxYear)

const isReturnPayload = (value: unknown): value is ReturnPayload => {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return isTaxYear(record.taxYear) && record.information !== undefined
}

const isReturnBundle = (value: unknown): value is ReturnBundle => {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return record.returns !== undefined
}

export const stringToImportState = (str: string): USTState => {
  const parsed = JSON.parse(str) as unknown
  const normalized = (() => {
    if (isReturnPayload(parsed)) {
      return {
        ...blankYearTaxesState,
        [parsed.taxYear]: parsed.information,
        activeYear: parsed.taxYear
      }
    }
    if (isReturnBundle(parsed)) {
      const returns = parsed.returns as Partial<Record<TaxYear, ReturnPayload>>
      const byYear = (year: TaxYear): Information =>
        returns[year]?.information ?? blankYearTaxesState[year]
      const restoredYears = Object.fromEntries(
        supportedTaxYears.map((year) => [year, byYear(year)])
      ) as Pick<YearsTaxesState, TaxYear>
      return {
        ...blankYearTaxesState,
        activeYear: parsed.activeYear ?? blankYearTaxesState.activeYear,
        assets: (parsed.assets ?? []) as any[],
        ...restoredYears
      }
    }
    return parsed
  })()
  return deserializeTransform(normalized) as USTState
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

export { Load }
