/* eslint-disable @typescript-eslint/no-explicit-any */

import { deserializeTransform, serializeTransform, USTState } from '../store'
import { blankYearTaxesState, YearsTaxesState } from '../data'
import { TaxYear, Information } from 'ustaxes/core/data'
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

const buildReturnBundle = (state: YearsTaxesState): ReturnBundle => ({
  version: '1.0.0',
  activeYear: state.activeYear,
  assets: state.assets,
  returns: {
    Y2019: { taxYear: 'Y2019', information: state.Y2019 },
    Y2020: { taxYear: 'Y2020', information: state.Y2020 },
    Y2021: { taxYear: 'Y2021', information: state.Y2021 },
    Y2022: { taxYear: 'Y2022', information: state.Y2022 },
    Y2023: { taxYear: 'Y2023', information: state.Y2023 },
    Y2024: { taxYear: 'Y2024', information: state.Y2024 }
  }
})

export const stateToString = (state: any): string =>
  JSON.stringify(serializeTransform(buildReturnBundle(state)))

/**
 * Reuse the same functionality as reloading the state from redux-persist,
 * to reload state from a file
 */
const isTaxYear = (value: unknown): value is TaxYear =>
  typeof value === 'string' &&
  (value === 'Y2019' ||
    value === 'Y2020' ||
    value === 'Y2021' ||
    value === 'Y2022' ||
    value === 'Y2023' ||
    value === 'Y2024')

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
      const returns = parsed.returns ?? {}
      const byYear = (year: TaxYear): Information =>
        (returns[year]?.information ?? blankYearTaxesState[year]) as Information
      return {
        ...blankYearTaxesState,
        activeYear: parsed.activeYear ?? blankYearTaxesState.activeYear,
        assets: (parsed.assets ?? []) as any[],
        Y2019: byYear('Y2019'),
        Y2020: byYear('Y2020'),
        Y2021: byYear('Y2021'),
        Y2022: byYear('Y2022'),
        Y2023: byYear('Y2023'),
        Y2024: byYear('Y2024')
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
